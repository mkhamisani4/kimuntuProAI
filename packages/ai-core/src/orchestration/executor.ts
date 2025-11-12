/**
 * Executor (Stage B) for Business Track AI Assistant
 * Orchestrates RAG, web search, finance tools, and final answer generation
 */

import type {
  AssistantRequest,
  AssistantResponse,
  PlannerOutput,
  UsageMetric,
  BusinessTrackFinancialModel,
  FinancialInputs,
} from '@kimuntupro/shared';
import { OpenAIClient } from '../llm/client.js';
import { DEFAULT_MODEL_MINI, DEFAULT_MODEL_ESCALATION } from '../llm/models.js';
import {
  retrieveHybrid,
  type HybridRetrievalResult,
  type BM25QueryFn,
  type VectorQueryFn,
  type EmbeddingFn,
} from '../retrieval/hybrid.js';
import {
  webSearchWithOpenAI,
  buildOpenAIWebSearchTools,
  type WebSearchResult,
} from '../tools/openaiWebSearch.js';
import {
  buildFinancialModel,
  validateFinancialInputs,
} from '../tools/finance.js';
import {
  buildFinanceTools,
  getFinanceToolHandler,
} from '../tools/financeTool.js';
import {
  buildExecutorMessages,
  parseExecutorResponse,
  validateSections,
  type ExecutorContext,
} from './answerFormatter.js';
import { validateOutput } from '../policy/validator.js';
import { preflightQuotaGuard } from './middleware.js';

/**
 * Executor options
 */
export interface ExecuteOptions {
  plan: PlannerOutput;
  request: AssistantRequest;
  tenantId: string;
  userId: string;
  onUsage?: (metrics: UsageMetric) => void;
  // Dependency injection for testing
  client?: OpenAIClient;
  bm25Query?: BM25QueryFn;
  vectorQuery?: VectorQueryFn;
  embed?: EmbeddingFn;
}

/**
 * Executor result with internal stats
 */
export interface ExecuteResult {
  response: AssistantResponse;
  stats: {
    retrievalLatencyMs?: number;
    webSearchLatencyMs?: number;
    financeLatencyMs?: number;
    modelLatencyMs: number;
    totalLatencyMs: number;
  };
}

/**
 * Prepare RAG retrieval if needed
 *
 * @param plan - Planner output
 * @param request - Assistant request
 * @param options - Execute options
 * @returns Retrieval result or undefined
 */
async function prepareRetrieval(
  plan: PlannerOutput,
  request: AssistantRequest,
  options: ExecuteOptions
): Promise<HybridRetrievalResult | undefined> {
  if (!plan.requires_retrieval) {
    return undefined;
  }

  if (!options.bm25Query || !options.vectorQuery || !options.embed) {
    console.warn('RAG retrieval required but query functions not provided');
    return undefined;
  }

  const retrievalStartTime = Date.now();

  try {
    const result = await retrieveHybrid(
      {
        tenantId: options.tenantId,
        query: request.input,
        topK: Number(process.env.RETRIEVAL_FINAL_K ?? 8),
        contextMaxTokens: Number(process.env.CONTEXT_TOKEN_LIMIT ?? 4000),
        scoreThreshold: 0.001, // Low threshold for RRF scores
      },
      options.bm25Query,
      options.vectorQuery,
      options.embed
    );

    console.log(`RAG retrieval completed in ${Date.now() - retrievalStartTime}ms - ${result.chunks.length} chunks`);

    return result;
  } catch (error: any) {
    console.error('RAG retrieval failed:', error);
    return undefined;
  }
}

/**
 * Prepare web search if needed
 *
 * @param plan - Planner output
 * @param request - Assistant request
 * @param options - Execute options
 * @returns Web search results or undefined
 */
async function prepareWebSearch(
  plan: PlannerOutput,
  request: AssistantRequest,
  options: ExecuteOptions
): Promise<WebSearchResult[] | undefined> {
  if (!plan.requires_web_search) {
    return undefined;
  }

  const webSearchStartTime = Date.now();

  try {
    // Build query from query_terms or fallback to input
    const query = plan.query_terms.length > 0
      ? plan.query_terms.join(' ')
      : request.input;

    const client = new OpenAIClient();
    const result = await webSearchWithOpenAI(client, {
      query,
      n: Number(process.env.OPENAI_WEB_SEARCH_MAX_RESULTS ?? 8),
      tenantId: options.tenantId,
      userId: options.userId,
    });

    console.log(`Web search completed in ${Date.now() - webSearchStartTime}ms - ${result.results.length} results`);

    return result.results;
  } catch (error: any) {
    console.error('Web search failed:', error);
    return undefined;
  }
}

/**
 * Prepare finance model if needed
 *
 * @param plan - Planner output
 * @param request - Assistant request
 * @returns Finance model or undefined
 */
async function prepareFinance(
  plan: PlannerOutput,
  request: AssistantRequest
): Promise<BusinessTrackFinancialModel | undefined> {
  const needsFinance =
    request.assistant === 'exec_summary' ||
    request.assistant === 'financial_overview' ||
    (plan.metrics_needed && plan.metrics_needed.length > 0);

  if (!needsFinance) {
    return undefined;
  }

  const financeStartTime = Date.now();

  try {
    // Extract financial inputs from request.extra
    const inputs: Partial<FinancialInputs> = request.extra || {};

    // Validate inputs
    const validation = validateFinancialInputs(inputs);
    if (!validation.success) {
      console.warn('Invalid financial inputs:', validation.errors);
      return undefined;
    }

    // Build financial model
    const model = buildFinancialModel(validation.data!);

    console.log(`Finance model computed in ${Date.now() - financeStartTime}ms`);

    return model;
  } catch (error: any) {
    console.error('Finance computation failed:', error);
    return undefined;
  }
}

/**
 * Execute Business Track assistant request
 * Orchestrates RAG, web search, finance, and final answer generation
 *
 * @param options - Execute options
 * @returns Assistant response
 */
export async function execute(options: ExecuteOptions): Promise<AssistantResponse> {
  const totalStartTime = Date.now();
  const { plan, request, onUsage } = options;

  // Create or use provided client
  const client = options.client || new OpenAIClient();

  // Determine model
  const modelId = plan.escalate_model ? DEFAULT_MODEL_ESCALATION : DEFAULT_MODEL_MINI;

  console.log(`Executing ${request.assistant} with model ${modelId}`);

  // === Quota Preflight Check (Step 11) ===

  try {
    await preflightQuotaGuard({
      plan,
      tenantId: options.tenantId,
      userId: options.userId,
      inputLength: request.input.length,
    });
  } catch (error: any) {
    // QuotaError will bubble up to API layer for 429 response
    console.error('Quota preflight failed:', error.message);
    throw error;
  }

  // === Preparation Phase ===

  const [retrievalResult, webSearchResults, financeModel] = await Promise.all([
    prepareRetrieval(plan, request, options),
    prepareWebSearch(plan, request, options),
    prepareFinance(plan, request),
  ]);

  // Build executor context
  const context: ExecutorContext = {
    ragContext: retrievalResult?.context,
    webSearchResults,
    financeModel,
  };

  // === Message Assembly ===

  const messages = buildExecutorMessages(request, plan, context);

  // === Tool Setup ===

  const tools: any[] = [];
  const toolHandlers: Record<string, any> = {};

  // Web search tool
  if (plan.requires_web_search) {
    const webTools = buildOpenAIWebSearchTools();
    tools.push(...webTools.map((t: any) => t.spec));

    // Web search is handled by OpenAI's built-in tool
    // No need for manual handler
  }

  // Finance tool
  if (financeModel) {
    const financeTools = buildFinanceTools();
    tools.push(...financeTools.map((t: any) => t.spec));

    // Add finance handler
    toolHandlers['finance_calc'] = getFinanceToolHandler();
  }

  // === Model Call ===

  const modelStartTime = Date.now();

  try {
    const response = await client.chatWithTools({
      model: modelId,
      messages,
      tools: (tools.length > 0 ? tools : undefined) as any,
      toolHandlers: (Object.keys(toolHandlers).length > 0 ? toolHandlers : undefined) as any,
      temperature: 0.4, // Slightly creative but still focused
      maxOutputTokens: Number(process.env.MAX_TOKENS_EXECUTOR ?? 8000),
      telemetry: {
        tenantId: options.tenantId,
        userId: options.userId,
        assistant: request.assistant,
        meta: {
          escalated: plan.escalate_model,
          hasRetrieval: plan.requires_retrieval,
          hasWebSearch: plan.requires_web_search,
          hasFinance: !!financeModel,
        },
      },
    });

    const modelLatencyMs = Date.now() - modelStartTime;

    console.log(`Model call completed in ${modelLatencyMs}ms`);

    // === Response Parsing ===

    const parsed = parseExecutorResponse(response.text, context);

    // Validate sections
    const sectionValidation = validateSections(parsed.sections, plan.sections);
    if (!sectionValidation.valid) {
      console.warn('Missing required sections:', sectionValidation.missing);
    }

    // Build assistant response
    const assistantResponse: AssistantResponse = {
      assistant: request.assistant,
      sections: parsed.sections,
      sources: parsed.sources,
      rawModelOutput: parsed.rawOutput,
      metadata: {
        model: response.model,
        tokensUsed: response.tokensIn + response.tokensOut,
        latencyMs: response.latencyMs,
        cost: response.costCents / 100,
      },
    };

    // === Policy Validation ===

    const policyContext = {
      ...context,
      assistant: request.assistant,
      question: request.input,
      plannerJson: plan,
      modelName: modelId,
      requiresWebSearch: plan.requires_web_search,
      requiredSections: plan.sections,
    };

    const policyResult = validateOutput(assistantResponse, policyContext);

    if (!policyResult.valid) {
      console.warn('Policy validation issues:', policyResult.issues);
    }

    // Append disclaimer if present
    if (policyResult.appendedDisclaimer) {
      assistantResponse.sections['Disclaimer'] = policyResult.appendedDisclaimer;
    }

    // Prepend warning if validation failed
    if (!policyResult.valid && policyResult.issues.some((i) => i.severity === 'error')) {
      const firstSection = Object.keys(assistantResponse.sections)[0];
      if (firstSection) {
        assistantResponse.sections[firstSection] =
          '⚠️ **Note**: This response has validation issues. Please review carefully.\n\n' +
          assistantResponse.sections[firstSection];
      }
    }

    // === Usage Tracking ===

    const totalLatencyMs = Date.now() - totalStartTime;

    if (onUsage) {
      const usageMetric: UsageMetric = {
        model: response.model,
        tokensIn: response.tokensIn,
        tokensOut: response.tokensOut,
        costCents: response.costCents,
        latencyMs: totalLatencyMs,
        toolInvocations: {
          retrieval: retrievalResult ? 1 : 0,
          webSearch: response.toolCalls?.filter((t) => t.name === 'web_search').length ?? 0,
          finance: response.toolCalls?.filter((t) => t.name === 'finance_calc').length ?? 0,
        },
      };

      onUsage(usageMetric);
    }

    return assistantResponse;
  } catch (error: any) {
    console.error('Executor failed:', error);

    // Return error response
    return {
      assistant: request.assistant,
      sections: {
        Error: `Failed to generate response: ${error.message}`,
      },
      sources: [],
      rawModelOutput: '',
      metadata: {
        model: modelId,
        tokensUsed: 0,
        latencyMs: Date.now() - totalStartTime,
        cost: 0,
      },
    };
  }
}

/**
 * Validate execute options
 *
 * @param options - Options to validate
 * @returns Validation result
 */
export function validateExecuteOptions(options: ExecuteOptions): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!options.plan) {
    errors.push('plan is required');
  }

  if (!options.request) {
    errors.push('request is required');
  }

  if (!options.tenantId || options.tenantId.trim().length === 0) {
    errors.push('tenantId is required and cannot be empty');
  }

  if (!options.userId || options.userId.trim().length === 0) {
    errors.push('userId is required and cannot be empty');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
