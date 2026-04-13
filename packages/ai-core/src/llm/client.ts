/**
 * Anthropic Client Wrapper
 * Robust LLM client with retries, caching, structured outputs, and tool support
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getModelConfig, getModelFromEnv, DEFAULT_MODEL_MINI, DEFAULT_MODEL_ESCALATION, type ModelId } from './models';
import { getCostCents } from './costs';
import { buildStructuredPromptInstructions, parseStructured, extractJsonFromMarkdown } from './structured';
import { emitUsage, buildUsageFromClientEvent } from '../usage/meter';
import type { AssistantType } from '@kimuntupro/shared';

/**
 * Chat message type compatible with Anthropic Messages API
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'developer';
  content: string | any[];
}

/**
 * Chat response with metrics
 */
export interface ChatResponse {
  text: string;
  raw: any;
  tokensIn: number;
  tokensOut: number;
  model: string;
  latencyMs: number;
  cachedInputApplied: boolean;
  costCents: number;
}

/**
 * Structured chat response
 */
export interface StructuredChatResponse<T> {
  data: T;
  raw: any;
  tokensIn: number;
  tokensOut: number;
  model: string;
  latencyMs: number;
  cachedInputApplied: boolean;
  costCents: number;
}

/**
 * Tool call result
 */
export interface ToolCallResult {
  name: string;
  arguments: Record<string, any>;
  result: any;
}

/**
 * Chat with tools response
 */
export interface ChatWithToolsResponse {
  text: string;
  toolCalls: ToolCallResult[];
  toolInvocations: Record<string, number>;
  raw: any;
  tokensIn: number;
  tokensOut: number;
  model: string;
  latencyMs: number;
  costCents: number;
}

/**
 * Anthropic tool spec format
 */
export interface ToolSpec {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

/**
 * Tool handler function
 */
export type ToolHandler = (args: Record<string, any>) => Promise<any> | any;

/**
 * Usage callback
 */
export type UsageCallback = (metrics: {
  model: string;
  tokensIn: number;
  tokensOut: number;
  costCents: number;
  latencyMs: number;
  toolInvocations?: Record<string, number>;
}) => void | Promise<void>;

/**
 * Telemetry metadata for usage tracking
 */
export interface TelemetryMetadata {
  tenantId: string;
  userId: string;
  assistant: AssistantType;
  requestId?: string;
  meta?: Record<string, any>;
}

/**
 * Logger interface
 */
export interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

/**
 * Circuit breaker state
 */
interface CircuitBreakerState {
  failureCount: number;
  lastFailureTime: number;
  isOpen: boolean;
}

/**
 * Anthropic client configuration
 */
export interface AnthropicClientConfig {
  apiKey?: string;
  modelMini?: ModelId;
  modelEscalation?: ModelId;
  maxTokensPlanner?: number;
  maxTokensExecutor?: number;
  enablePromptCaching?: boolean;
  maxRetries?: number;
  timeoutMs?: number;
  logger?: Logger;
  onUsage?: UsageCallback;
  circuitBreakerThreshold?: number;
  circuitBreakerResetMs?: number;
}

/** @deprecated Use AnthropicClientConfig instead */
export type OpenAIClientConfig = AnthropicClientConfig;

/**
 * Default console logger
 */
const defaultLogger: Logger = {
  debug: () => {},
  info: (msg, ...args) => console.log(msg, ...args),
  warn: (msg, ...args) => console.warn(msg, ...args),
  error: (msg, ...args) => console.error(msg, ...args),
};

/**
 * Extract system prompt from messages array.
 * Anthropic requires system prompt as a separate parameter, not in messages.
 */
function extractSystemPrompt(messages: ChatMessage[]): { system: string; filtered: ChatMessage[] } {
  let system = '';
  const filtered: ChatMessage[] = [];

  for (const msg of messages) {
    if (msg.role === 'system' || msg.role === 'developer') {
      // Concatenate system/developer messages
      const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
      system += (system ? '\n\n' : '') + content;
    } else {
      filtered.push(msg);
    }
  }

  return { system, filtered };
}

/**
 * Convert our ChatMessage array to Anthropic message format
 */
function toAnthropicMessages(messages: ChatMessage[]): Anthropic.MessageParam[] {
  return messages.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: typeof msg.content === 'string' ? msg.content : msg.content,
  }));
}

/**
 * Extract text from Anthropic response content blocks
 */
function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

/**
 * Anthropic Client wrapper with advanced features
 */
export class AnthropicClient {
  private client: Anthropic;
  private modelMini: ModelId;
  private modelEscalation: ModelId;
  private maxTokensPlanner: number;
  private maxTokensExecutor: number;
  private enablePromptCaching: boolean;
  private maxRetries: number;
  private timeoutMs: number;
  private logger: Logger;
  private onUsage?: UsageCallback;
  private circuitBreaker: CircuitBreakerState;
  private circuitBreakerThreshold: number;
  private circuitBreakerResetMs: number;
  private recentIdempotencyKeys: Set<string>;

  constructor(config: AnthropicClientConfig = {}) {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }

    this.client = new Anthropic({
      apiKey,
      timeout: config.timeoutMs || Number(process.env.TIMEOUT_MS) || 120000,
    });

    this.modelMini = config.modelMini || getModelFromEnv('MODEL_MINI', DEFAULT_MODEL_MINI);
    this.modelEscalation =
      config.modelEscalation || getModelFromEnv('MODEL_ESCALATION', DEFAULT_MODEL_ESCALATION);
    this.maxTokensPlanner = config.maxTokensPlanner || Number(process.env.MAX_TOKENS_PLANNER) || 4000;
    this.maxTokensExecutor = config.maxTokensExecutor || Number(process.env.MAX_TOKENS_EXECUTOR) || 8000;
    this.enablePromptCaching =
      config.enablePromptCaching ?? process.env.ENABLE_PROMPT_CACHING === 'true';
    this.maxRetries = config.maxRetries ?? 3;
    this.timeoutMs = config.timeoutMs || 120000;
    this.logger = config.logger || defaultLogger;
    this.onUsage = config.onUsage;

    // Circuit breaker
    this.circuitBreakerThreshold = config.circuitBreakerThreshold ?? 5;
    this.circuitBreakerResetMs = config.circuitBreakerResetMs ?? 60000;
    this.circuitBreaker = {
      failureCount: 0,
      lastFailureTime: 0,
      isOpen: false,
    };

    // Idempotency key deduplication
    this.recentIdempotencyKeys = new Set();
  }

  /**
   * Chat completion
   */
  async chat(opts: {
    model?: string;
    messages: ChatMessage[];
    maxOutputTokens?: number;
    temperature?: number;
    cacheTag?: string;
    idempotencyKey?: string;
    timeoutMs?: number;
    telemetry?: TelemetryMetadata;
  }): Promise<ChatResponse> {
    const startTime = Date.now();
    const model = opts.model || this.modelMini;
    const modelConfig = getModelConfig(model);

    const requestId = opts.telemetry?.requestId || (opts.telemetry ? randomUUID() : undefined);

    this.checkCircuitBreaker();

    if (opts.idempotencyKey && this.recentIdempotencyKeys.has(opts.idempotencyKey)) {
      throw new Error(`Duplicate request with idempotency key: ${opts.idempotencyKey}`);
    }

    const maxTokens = Math.min(
      opts.maxOutputTokens || this.maxTokensExecutor,
      modelConfig.maxOutputTokens
    );

    // Extract system prompt from messages
    const { system, filtered } = extractSystemPrompt(opts.messages);
    const anthropicMessages = toAnthropicMessages(filtered);

    try {
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          const response = await this.client.messages.create({
            model,
            max_tokens: maxTokens,
            temperature: opts.temperature ?? modelConfig.defaultTemperature,
            ...(system ? { system } : {}),
            messages: anthropicMessages,
          });

          const latencyMs = Date.now() - startTime;
          const text = extractText(response.content);
          const tokensIn = response.usage.input_tokens;
          const tokensOut = response.usage.output_tokens;
          const cachedInputTokens = (response.usage as any).cache_read_input_tokens || 0;
          const cachedInputApplied = cachedInputTokens > 0;
          const costCents = getCostCents({
            model,
            tokensIn,
            tokensOut,
            cachedInputTokens,
          });

          this.recordSuccess();
          if (opts.idempotencyKey) {
            this.addIdempotencyKey(opts.idempotencyKey);
          }

          if (this.onUsage) {
            await this.onUsage({
              model,
              tokensIn,
              tokensOut,
              costCents,
              latencyMs,
            });
          }

          if (opts.telemetry) {
            const metrics = buildUsageFromClientEvent({
              model,
              tokensIn,
              tokensOut,
              latencyMs,
              cachedInputTokens,
            });

            await emitUsage({
              tenantId: opts.telemetry.tenantId,
              userId: opts.telemetry.userId,
              assistant: opts.telemetry.assistant,
              metrics,
              requestId,
              meta: opts.telemetry.meta,
            }).catch((err) => {
              this.logger.error('Failed to emit usage:', err);
            });
          }

          return {
            text,
            raw: response,
            tokensIn,
            tokensOut,
            model,
            latencyMs,
            cachedInputApplied,
            costCents,
          };
        } catch (error: any) {
          lastError = error;

          if (this.isRetryableError(error) && attempt < this.maxRetries - 1) {
            const delayMs = this.getRetryDelayMs(attempt);
            this.logger.warn(
              `Retry attempt ${attempt + 1}/${this.maxRetries} after ${delayMs}ms: ${error.message}`
            );
            await this.sleep(delayMs);
            continue;
          }

          break;
        }
      }

      this.recordFailure();
      throw lastError || new Error('Chat completion failed');
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Chat with structured output
   * Uses prompt-based JSON schema instructions since Anthropic doesn't have native JSON mode
   */
  async chatStructured<T>(opts: {
    schema: z.ZodType<T>;
    schemaName: string;
    schemaDescription?: string;
    model?: string;
    messages: ChatMessage[];
    maxOutputTokens?: number;
    temperature?: number;
    cacheTag?: string;
    idempotencyKey?: string;
    telemetry?: TelemetryMetadata;
  }): Promise<StructuredChatResponse<T>> {
    const model = opts.model || this.modelMini;
    const startTime = Date.now();

    const requestId = opts.telemetry?.requestId || (opts.telemetry ? randomUUID() : undefined);

    this.checkCircuitBreaker();

    if (opts.idempotencyKey && this.recentIdempotencyKeys.has(opts.idempotencyKey)) {
      throw new Error(`Duplicate request with idempotency key: ${opts.idempotencyKey}`);
    }

    // Build structured prompt instructions and append to system prompt
    const structuredInstructions = buildStructuredPromptInstructions(
      opts.schema,
      opts.schemaName,
      opts.schemaDescription
    );

    // Extract system prompt and append structured instructions
    const { system: originalSystem, filtered } = extractSystemPrompt(opts.messages);
    const system = originalSystem + structuredInstructions;
    const anthropicMessages = toAnthropicMessages(filtered);

    try {
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          const response = await this.client.messages.create({
            model,
            max_tokens: opts.maxOutputTokens || this.maxTokensExecutor,
            temperature: opts.temperature ?? getModelConfig(model).defaultTemperature,
            system,
            messages: anthropicMessages,
          });

          const latencyMs = Date.now() - startTime;
          const rawText = extractText(response.content) || '{}';

          // Extract JSON from markdown if needed
          const jsonText = extractJsonFromMarkdown(rawText);

          // Parse and validate
          const data = parseStructured<T>(jsonText, opts.schema);

          const tokensIn = response.usage.input_tokens;
          const tokensOut = response.usage.output_tokens;
          const cachedInputTokens = (response.usage as any).cache_read_input_tokens || 0;
          const cachedInputApplied = cachedInputTokens > 0;
          const costCents = getCostCents({ model, tokensIn, tokensOut, cachedInputTokens });

          this.recordSuccess();
          if (opts.idempotencyKey) {
            this.addIdempotencyKey(opts.idempotencyKey);
          }

          if (this.onUsage) {
            await this.onUsage({
              model,
              tokensIn,
              tokensOut,
              costCents,
              latencyMs,
            });
          }

          if (opts.telemetry) {
            const metrics = buildUsageFromClientEvent({
              model,
              tokensIn,
              tokensOut,
              latencyMs,
              cachedInputTokens,
            });

            await emitUsage({
              tenantId: opts.telemetry.tenantId,
              userId: opts.telemetry.userId,
              assistant: opts.telemetry.assistant,
              metrics,
              requestId,
              meta: opts.telemetry.meta,
            }).catch((err) => {
              this.logger.error('Failed to emit usage:', err);
            });
          }

          return {
            data,
            raw: response,
            tokensIn,
            tokensOut,
            model,
            latencyMs,
            cachedInputApplied,
            costCents,
          };
        } catch (error: any) {
          lastError = error;

          if (this.isRetryableError(error) && attempt < this.maxRetries - 1) {
            const delayMs = this.getRetryDelayMs(attempt);
            this.logger.warn(`Structured output retry ${attempt + 1}: ${error.message}`);
            await this.sleep(delayMs);
            continue;
          }

          break;
        }
      }

      this.recordFailure();
      throw lastError || new Error('Structured chat failed');
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Chat with tools
   */
  async chatWithTools(opts: {
    model?: string;
    messages: ChatMessage[];
    tools: ToolSpec[];
    toolHandlers: Record<string, ToolHandler>;
    maxOutputTokens?: number;
    temperature?: number;
    maxToolCalls?: number;
    telemetry?: TelemetryMetadata;
  }): Promise<ChatWithToolsResponse> {
    const model = opts.model || this.modelMini;
    const modelConfig = getModelConfig(model);

    const maxToolCalls = opts.maxToolCalls ?? 3;
    const toolInvocations: Record<string, number> = {};
    const toolCalls: ToolCallResult[] = [];
    const startTime = Date.now();
    let totalTokensIn = 0;
    let totalTokensOut = 0;

    const requestId = opts.telemetry?.requestId || (opts.telemetry ? randomUUID() : undefined);

    this.checkCircuitBreaker();

    // Extract system prompt
    const { system, filtered } = extractSystemPrompt(opts.messages);
    let messages: Anthropic.MessageParam[] = toAnthropicMessages(filtered);

    // Convert tools to Anthropic format (if they're in OpenAI format, convert them)
    const anthropicTools: Anthropic.Tool[] = (opts.tools || []).map((tool: any) => {
      // Handle OpenAI format: { type: 'function', function: { name, description, parameters } }
      if (tool.type === 'function' && tool.function) {
        return {
          name: tool.function.name,
          description: tool.function.description || '',
          input_schema: tool.function.parameters || { type: 'object', properties: {} },
        };
      }
      // Already in Anthropic format: { name, description, input_schema }
      return {
        name: tool.name,
        description: tool.description || '',
        input_schema: tool.input_schema || { type: 'object', properties: {} },
      };
    });

    try {
      for (let iteration = 0; iteration < maxToolCalls; iteration++) {
        const response = await this.client.messages.create({
          model,
          max_tokens: opts.maxOutputTokens || this.maxTokensExecutor,
          temperature: opts.temperature ?? modelConfig.defaultTemperature,
          ...(system ? { system } : {}),
          messages,
          ...(anthropicTools.length > 0 ? { tools: anthropicTools } : {}),
        });

        const tokensIn = response.usage.input_tokens;
        const tokensOut = response.usage.output_tokens;
        totalTokensIn += tokensIn;
        totalTokensOut += tokensOut;

        // Check for tool_use blocks in response
        const toolUseBlocks = response.content.filter(
          (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
        );
        const textContent = extractText(response.content);

        if (toolUseBlocks.length === 0 || response.stop_reason !== 'tool_use') {
          // No tool calls, return final response
          const latencyMs = Date.now() - startTime;
          const costCents = getCostCents({ model, tokensIn: totalTokensIn, tokensOut: totalTokensOut });

          this.recordSuccess();

          if (this.onUsage) {
            await this.onUsage({
              model,
              tokensIn: totalTokensIn,
              tokensOut: totalTokensOut,
              costCents,
              latencyMs,
              toolInvocations,
            });
          }

          if (opts.telemetry) {
            const metrics = buildUsageFromClientEvent({
              model,
              tokensIn: totalTokensIn,
              tokensOut: totalTokensOut,
              latencyMs,
              toolInvocations,
            });

            await emitUsage({
              tenantId: opts.telemetry.tenantId,
              userId: opts.telemetry.userId,
              assistant: opts.telemetry.assistant,
              metrics,
              requestId,
              meta: opts.telemetry.meta,
            }).catch((err) => {
              this.logger.error('Failed to emit usage:', err);
            });
          }

          return {
            text: textContent,
            toolCalls,
            toolInvocations,
            raw: response,
            tokensIn: totalTokensIn,
            tokensOut: totalTokensOut,
            model,
            latencyMs,
            costCents,
          };
        }

        // Add assistant message with tool_use blocks
        messages.push({
          role: 'assistant',
          content: response.content,
        });

        // Execute tool calls and build tool_result blocks
        const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];

        for (const toolUse of toolUseBlocks) {
          const handler = opts.toolHandlers[toolUse.name];

          if (!handler) {
            this.logger.warn(`No handler for tool: ${toolUse.name}`);
            toolResultBlocks.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify({ error: `No handler for tool: ${toolUse.name}` }),
              is_error: true,
            });
            continue;
          }

          try {
            const args = toolUse.input as Record<string, any>;
            const result = await handler(args);

            toolInvocations[toolUse.name] = (toolInvocations[toolUse.name] || 0) + 1;

            toolCalls.push({
              name: toolUse.name,
              arguments: args,
              result,
            });

            toolResultBlocks.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify(result),
            });
          } catch (error) {
            this.logger.error(`Tool execution failed: ${toolUse.name}`, error);
            toolResultBlocks.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify({ error: 'Tool execution failed' }),
              is_error: true,
            });
          }
        }

        // Add tool results as user message
        messages.push({
          role: 'user',
          content: toolResultBlocks,
        });
      }

      // Max tool calls reached
      this.logger.warn(`Max tool calls (${maxToolCalls}) reached`);
      const latencyMs = Date.now() - startTime;
      const costCents = getCostCents({ model, tokensIn: totalTokensIn, tokensOut: totalTokensOut });

      this.recordSuccess();

      return {
        text: 'Max tool calls reached',
        toolCalls,
        toolInvocations,
        raw: {},
        tokensIn: totalTokensIn,
        tokensOut: totalTokensOut,
        model,
        latencyMs,
        costCents,
      };
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Check if circuit breaker is open
   */
  private checkCircuitBreaker(): void {
    if (this.circuitBreaker.isOpen) {
      const timeSinceFailure = Date.now() - this.circuitBreaker.lastFailureTime;
      if (timeSinceFailure < this.circuitBreakerResetMs) {
        throw new Error('Circuit breaker is open. Too many recent failures.');
      }
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failureCount = 0;
      this.logger.info('Circuit breaker reset');
    }
  }

  /**
   * Record successful request
   */
  private recordSuccess(): void {
    if (this.circuitBreaker.failureCount > 0) {
      this.circuitBreaker.failureCount = Math.max(0, this.circuitBreaker.failureCount - 1);
    }
  }

  /**
   * Record failed request
   */
  private recordFailure(): void {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.failureCount >= this.circuitBreakerThreshold) {
      this.circuitBreaker.isOpen = true;
      this.logger.error('Circuit breaker opened due to consecutive failures');
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error.status === 429) return true;
    if (error.status >= 500 && error.status < 600) return true;
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') return true;
    return false;
  }

  /**
   * Get retry delay with exponential backoff
   */
  private getRetryDelayMs(attempt: number): number {
    const baseDelay = 1000;
    const maxDelay = 32000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    return delay + Math.random() * 1000;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Add idempotency key to recent set (with TTL cleanup)
   */
  private addIdempotencyKey(key: string): void {
    this.recentIdempotencyKeys.add(key);
    setTimeout(() => {
      this.recentIdempotencyKeys.delete(key);
    }, 300000);
  }

  /**
   * Get configuration (useful for testing/inspection)
   */
  public getConfig() {
    return {
      modelMini: this.modelMini,
      modelEscalation: this.modelEscalation,
      maxTokensPlanner: this.maxTokensPlanner,
      maxTokensExecutor: this.maxTokensExecutor,
      enablePromptCaching: this.enablePromptCaching,
      maxRetries: this.maxRetries,
      timeoutMs: this.timeoutMs,
    };
  }
}

/** @deprecated Use AnthropicClient instead */
export const OpenAIClient = AnthropicClient;
