/**
 * LLM Cost Calculation
 * Pricing table and cost calculation utilities
 */
/**
 * Pricing table for OpenAI models
 * Updated as of January 2025
 * Source: https://openai.com/pricing
 */
export const MODEL_PRICING = {
    'gpt-4o-mini': {
        inputCentsPer1k: 0.015, // $0.150 per 1M tokens = $0.00015 per 1k = 0.015 cents per 1k
        outputCentsPer1k: 0.06, // $0.600 per 1M tokens = $0.00060 per 1k = 0.06 cents per 1k
        cachedInputCentsPer1k: 0.0075, // 50% discount for cached
    },
    'gpt-4o': {
        inputCentsPer1k: 0.25, // $2.50 per 1M tokens
        outputCentsPer1k: 1.0, // $10.00 per 1M tokens
        cachedInputCentsPer1k: 0.125, // 50% discount for cached
    },
    'gpt-4o-2024-08-06': {
        inputCentsPer1k: 0.25,
        outputCentsPer1k: 1.0,
        cachedInputCentsPer1k: 0.125,
    },
    'gpt-4-turbo': {
        inputCentsPer1k: 1.0, // $10 per 1M tokens
        outputCentsPer1k: 3.0, // $30 per 1M tokens
    },
    'gpt-3.5-turbo': {
        inputCentsPer1k: 0.05, // $0.50 per 1M tokens
        outputCentsPer1k: 0.15, // $1.50 per 1M tokens
    },
};
/**
 * Get pricing for a model
 * @param modelId - Model identifier
 * @returns Pricing information
 * @throws Error if model not found
 */
export function getModelPricing(modelId) {
    const pricing = MODEL_PRICING[modelId];
    if (!pricing) {
        throw new Error(`No pricing information for model: ${modelId}`);
    }
    return pricing;
}
/**
 * Calculate cost in cents for a completion
 * @param params - Cost calculation parameters
 * @returns Cost in cents (rounded to 2 decimal places)
 */
export function getCostCents(params) {
    const { model, tokensIn, tokensOut, cachedInputTokens = 0 } = params;
    const pricing = getModelPricing(model);
    // Calculate regular input tokens (excluding cached)
    const regularInputTokens = Math.max(0, tokensIn - cachedInputTokens);
    // Calculate costs
    const regularInputCost = (regularInputTokens / 1000) * pricing.inputCentsPer1k;
    const cachedInputCost = pricing.cachedInputCentsPer1k
        ? (cachedInputTokens / 1000) * pricing.cachedInputCentsPer1k
        : (cachedInputTokens / 1000) * pricing.inputCentsPer1k;
    const outputCost = (tokensOut / 1000) * pricing.outputCentsPer1k;
    const totalCost = regularInputCost + cachedInputCost + outputCost;
    // Round to 2 decimal places (hundredths of a cent)
    return Math.round(totalCost * 100) / 100;
}
/**
 * Estimate cost for a potential completion
 * @param params - Estimation parameters
 * @returns Estimated cost in cents
 */
export function estimateCostCents(params) {
    const { model, estimatedInputTokens, estimatedOutputTokens, useCaching = false } = params;
    return getCostCents({
        model,
        tokensIn: estimatedInputTokens,
        tokensOut: estimatedOutputTokens,
        cachedInputTokens: useCaching ? Math.floor(estimatedInputTokens * 0.8) : 0, // Assume 80% cache hit
    });
}
/**
 * Format cost for display
 * @param cents - Cost in cents
 * @returns Formatted string (e.g., "$0.0012")
 */
export function formatCost(cents) {
    const dollars = cents / 100;
    return `$${dollars.toFixed(4)}`;
}
/**
 * Check if cost exceeds a threshold
 * @param cents - Cost in cents
 * @param maxCents - Maximum allowed cost in cents
 * @returns True if cost exceeds threshold
 */
export function exceedsMaxCost(cents, maxCents) {
    return cents > maxCents;
}
//# sourceMappingURL=costs.js.map