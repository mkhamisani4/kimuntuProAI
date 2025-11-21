/**
 * LLM Cost Calculation
 * Pricing table and cost calculation utilities
 */
import type { ModelId } from './models.js';
/**
 * Pricing information per model
 * Prices in cents per 1,000 tokens
 */
export interface ModelPricing {
    inputCentsPer1k: number;
    outputCentsPer1k: number;
    cachedInputCentsPer1k?: number;
}
/**
 * Pricing table for OpenAI models
 * Updated as of January 2025
 * Source: https://openai.com/pricing
 */
export declare const MODEL_PRICING: Record<ModelId, ModelPricing>;
/**
 * Get pricing for a model
 * @param modelId - Model identifier
 * @returns Pricing information
 * @throws Error if model not found
 */
export declare function getModelPricing(modelId: string): ModelPricing;
/**
 * Calculate cost in cents for a completion
 * @param params - Cost calculation parameters
 * @returns Cost in cents (rounded to 2 decimal places)
 */
export declare function getCostCents(params: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    cachedInputTokens?: number;
}): number;
/**
 * Estimate cost for a potential completion
 * @param params - Estimation parameters
 * @returns Estimated cost in cents
 */
export declare function estimateCostCents(params: {
    model: string;
    estimatedInputTokens: number;
    estimatedOutputTokens: number;
    useCaching?: boolean;
}): number;
/**
 * Format cost for display
 * @param cents - Cost in cents
 * @returns Formatted string (e.g., "$0.0012")
 */
export declare function formatCost(cents: number): string;
/**
 * Check if cost exceeds a threshold
 * @param cents - Cost in cents
 * @param maxCents - Maximum allowed cost in cents
 * @returns True if cost exceeds threshold
 */
export declare function exceedsMaxCost(cents: number, maxCents: number): boolean;
//# sourceMappingURL=costs.d.ts.map