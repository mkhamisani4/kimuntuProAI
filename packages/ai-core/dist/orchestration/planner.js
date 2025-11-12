/**
 * Stage A Planner for Business Track AI Assistant
 * Cost-conscious structured planning using OpenAI mini model with Zod validation
 */
import { PlannerOutputSchema, PlannerInputSchema } from '@kimuntupro/shared';
import { OpenAIClient } from '../llm/client.js';
import { getPlannerSystemPrompt, getPlannerDeveloperPrompt, buildPlannerUserMessage } from './prompts.js';
import { preflightPlannerCheck } from './middleware.js';
/**
 * Extract heuristics from input before calling LLM
 * Reduces token usage and provides fallback if LLM fails
 *
 * @param input - Planner input
 * @returns Derived heuristics
 */
export function deriveHeuristics(input) {
    const { assistant, input: userInput } = input;
    // Initialize heuristics
    const heuristics = {
        suggested_query_terms: [],
        suggested_requires_retrieval: false,
        suggested_requires_web_search: false,
        suggested_sections: [],
        suggested_metrics_needed: [],
    };
    // === RETRIEVAL HEURISTICS ===
    // Check for references to internal docs/reports
    const retrievalTriggers = [
        /\b(according to|from|in) (our|the|my) (doc|document|report|pdf|file|presentation|deck)\b/i,
        /\b(last|previous|recent) (sprint|quarter|meeting|review)\b/i,
        /\b(internal|company|proprietary) (data|research|analysis)\b/i,
        /\buploaded\b/i,
        /\bingested\b/i,
    ];
    for (const pattern of retrievalTriggers) {
        if (pattern.test(userInput)) {
            heuristics.suggested_requires_retrieval = true;
            break;
        }
    }
    // === WEB SEARCH HEURISTICS ===
    // Market analysis always needs web search
    if (assistant === 'market_analysis') {
        heuristics.suggested_requires_web_search = true;
    }
    // Check for market/competitor references
    const webSearchTriggers = [
        /\b(market|industry|competitor|competitive|pricing|trend|forecast)\b/i,
        /\b(latest|current|recent|up-to-date) (data|information|news|report)\b/i,
        /\bTAM\b|\bSAM\b|\bSOM\b/i,
        /\b(market size|market share|growth rate)\b/i,
    ];
    for (const pattern of webSearchTriggers) {
        if (pattern.test(userInput)) {
            heuristics.suggested_requires_web_search = true;
            break;
        }
    }
    // === QUERY TERMS EXTRACTION ===
    // Simple noun phrase extraction (not perfect, but cheap)
    const words = userInput
        .replace(/[^\w\s-]/g, ' ') // Remove punctuation except hyphens
        .split(/\s+/)
        .filter((w) => w.length > 2); // Filter short words
    // Common stopwords to skip
    const stopwords = new Set([
        'the',
        'and',
        'for',
        'are',
        'but',
        'not',
        'you',
        'all',
        'can',
        'her',
        'was',
        'one',
        'our',
        'out',
        'day',
        'get',
        'has',
        'him',
        'his',
        'how',
        'man',
        'new',
        'now',
        'old',
        'see',
        'two',
        'way',
        'who',
        'boy',
        'did',
        'its',
        'let',
        'put',
        'say',
        'she',
        'too',
        'use',
        'what',
        'when',
        'where',
        'which',
        'with',
        'about',
        'would',
        'there',
        'their',
        'these',
        'those',
        'could',
        'should',
    ]);
    // Extract potential query terms (nouns, multi-word phrases)
    const queryTerms = new Set();
    for (let i = 0; i < words.length; i++) {
        const word = words[i].toLowerCase();
        if (stopwords.has(word))
            continue;
        // Single meaningful word (>4 chars)
        if (word.length > 4) {
            queryTerms.add(word);
        }
        // Bigram
        if (i < words.length - 1) {
            const word2 = words[i + 1].toLowerCase();
            if (!stopwords.has(word2) && word2.length > 2) {
                queryTerms.add(`${word} ${word2}`);
            }
        }
    }
    // Limit to top 10
    heuristics.suggested_query_terms = Array.from(queryTerms).slice(0, 10);
    // === SECTIONS BY ASSISTANT TYPE ===
    switch (assistant) {
        case 'streamlined_plan':
            heuristics.suggested_sections = [
                'Problem',
                'Solution',
                'ICP',
                'GTM',
                '90-day Milestones',
                'Risks & Mitigations',
                'KPIs',
                'Next Actions',
            ];
            break;
        case 'exec_summary':
            heuristics.suggested_sections = [
                'Executive Summary',
                'Business Model',
                'Unit Economics',
                'Financial Projections',
                'Key Risks',
                'Recommendations',
            ];
            heuristics.suggested_metrics_needed = ['unit_economics', 'twelve_month_projection'];
            break;
        case 'financial_overview':
            heuristics.suggested_sections = [
                'Financial Overview',
                'Revenue Model',
                'Unit Economics',
                'Projections (12-24 Months)',
                'Cost Structure',
                'Key Metrics & Ratios',
                'Financial Risks',
            ];
            heuristics.suggested_metrics_needed = ['unit_economics', 'twelve_month_projection'];
            break;
        case 'market_analysis':
            heuristics.suggested_sections = [
                'Market Definition',
                'Sizing (TAM/SAM/SOM)',
                'Target Segments',
                'Competitors',
                'Pricing Bands',
                'GTM Angles',
                'Assumptions & Data Freshness',
            ];
            break;
    }
    // Always add Sources if retrieval or web search
    if (heuristics.suggested_requires_retrieval || heuristics.suggested_requires_web_search) {
        if (!heuristics.suggested_sections.includes('Sources')) {
            heuristics.suggested_sections.push('Sources');
        }
    }
    return heuristics;
}
/**
 * Build fallback plan from heuristics
 * Used when LLM fails or returns invalid output
 *
 * @param input - Planner input
 * @param heuristics - Derived heuristics
 * @returns Fallback plan
 */
function buildFallbackPlan(input, heuristics) {
    return {
        task: input.assistant,
        requires_retrieval: heuristics.suggested_requires_retrieval,
        requires_web_search: heuristics.suggested_requires_web_search,
        query_terms: heuristics.suggested_query_terms,
        sections: heuristics.suggested_sections,
        metrics_needed: heuristics.suggested_metrics_needed,
        escalate_model: false, // Always false in fallback (safe default)
    };
}
/**
 * Plan a Business Track AI assistant request (Stage A)
 * Uses structured output from OpenAI mini model
 *
 * @param input - Planner input
 * @param client - Optional OpenAI client (creates new if not provided)
 * @returns Structured plan for executor
 */
export async function plan(input, client) {
    // Create client if not provided (defaults to mini model)
    const aiClient = client || new OpenAIClient();
    // Derive heuristics first (cheap, fast)
    const heuristics = deriveHeuristics(input);
    // Build messages
    const systemPrompt = getPlannerSystemPrompt(1);
    const developerPrompt = getPlannerDeveloperPrompt(1);
    const userMessage = buildPlannerUserMessage({
        assistant: input.assistant,
        input: input.input,
        tenantId: input.tenantId,
        userId: input.userId,
        extra: input.extra,
        heuristics: {
            suggested_query_terms: heuristics.suggested_query_terms,
            suggested_requires_retrieval: heuristics.suggested_requires_retrieval,
            suggested_requires_web_search: heuristics.suggested_requires_web_search,
        },
    });
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'developer', content: developerPrompt },
        { role: 'user', content: userMessage },
    ];
    // Attempt structured output with retry
    const maxAttempts = 2;
    let lastError = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const response = await aiClient.chatStructured({
                schema: PlannerOutputSchema,
                schemaName: 'PlannerOutput',
                schemaDescription: 'Structured plan for Business Track AI executor',
                messages,
                maxOutputTokens: 1500, // Plan is short
                temperature: 0.3, // Low temperature for consistency
                cacheTag: 'planner:v1', // Enable prompt caching
            });
            // Validate output
            const validated = PlannerOutputSchema.parse(response.data);
            // Post-process: ensure Sources section if needed
            if ((validated.requires_retrieval || validated.requires_web_search) &&
                !validated.sections.includes('Sources')) {
                validated.sections.push('Sources');
            }
            return validated;
        }
        catch (error) {
            lastError = error;
            // If schema validation failed on first attempt, retry with corrective message
            if (attempt === 0 && error.name === 'ZodError') {
                messages.push({
                    role: 'user',
                    content: 'Schema violation detected. Please output ONLY valid JSON matching PlannerOutput schema with no extra fields or markdown.',
                });
                continue;
            }
            // Otherwise, fail fast and use fallback
            break;
        }
    }
    // If all attempts failed, log error and use heuristic fallback
    console.warn(`Planner LLM failed after ${maxAttempts} attempts:`, lastError?.message || 'Unknown error');
    console.warn('Using heuristic fallback plan');
    return buildFallbackPlan(input, heuristics);
}
/**
 * Validate planner input
 * @param input - Input to validate
 * @returns Validation result
 */
export function validatePlannerInput(input) {
    try {
        const validated = PlannerInputSchema.parse(input);
        return {
            success: true,
            data: validated,
        };
    }
    catch (error) {
        const errors = [];
        if (error.errors) {
            for (const err of error.errors) {
                errors.push(`${err.path.join('.')}: ${err.message}`);
            }
        }
        else {
            errors.push(error.message || 'Validation failed');
        }
        return {
            success: false,
            errors,
        };
    }
}
/**
 * Plan with quota preflight check (Step 11)
 * Wrapper for API routes that enforces quotas before planning
 * Keeps core plan() function pure while adding quota enforcement
 *
 * @param input - Planner input
 * @param client - Optional OpenAI client
 * @returns Structured plan for executor
 * @throws QuotaError if quota would be exceeded
 */
export async function planWithQuotaCheck(input, client) {
    // === Quota Preflight Check (Step 11) ===
    try {
        await preflightPlannerCheck({
            tenantId: input.tenantId,
            userId: input.userId,
            inputLength: input.input.length,
        });
    }
    catch (error) {
        // QuotaError will bubble up to API layer for 429 response
        console.error('Planner quota preflight failed:', error.message);
        throw error;
    }
    // Quota check passed - proceed with planning
    return plan(input, client);
}
//# sourceMappingURL=planner.js.map