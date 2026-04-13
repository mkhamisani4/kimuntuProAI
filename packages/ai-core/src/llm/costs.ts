/**
 * LLM Cost Calculation
 * Pricing table and cost calculation utilities
 * Anthropic Claude models
 */

import type { ModelId } from './models';

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
 * Pricing table for Anthropic Claude models
 * Source: https://docs.anthropic.com/en/docs/about-claude/models
 */
export const MODEL_PRICING: Record<ModelId, ModelPricing> = {
  'claude-haiku-4-5-20251001': {
    inputCentsPer1k: 0.08,   // $0.80 per 1M tokens = $0.0008 per 1k = 0.08 cents per 1k
    outputCentsPer1k: 0.4,   // $4.00 per 1M tokens = $0.004 per 1k = 0.4 cents per 1k
    cachedInputCentsPer1k: 0.016, // 80% discount on cached input
  },
  'claude-sonnet-4-5-20250929': {
    inputCentsPer1k: 0.3,    // $3.00 per 1M tokens
    outputCentsPer1k: 1.5,   // $15.00 per 1M tokens
    cachedInputCentsPer1k: 0.03, // 90% discount on cached input
  },
  'claude-opus-4-20250514': {
    inputCentsPer1k: 1.5,    // $15.00 per 1M tokens
    outputCentsPer1k: 7.5,   // $75.00 per 1M tokens
    cachedInputCentsPer1k: 0.15, // 90% discount on cached input
  },
};

/**
 * Get pricing for a model
 * @param modelId - Model identifier
 * @returns Pricing information
 * @throws Error if model not found
 */
export function getModelPricing(modelId: string): ModelPricing {
  const pricing = MODEL_PRICING[modelId as ModelId];
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
export function getCostCents(params: {
  model: string;
  tokensIn: number;
  tokensOut: number;
  cachedInputTokens?: number;
}): number {
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
export function estimateCostCents(params: {
  model: string;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  useCaching?: boolean;
}): number {
  const { model, estimatedInputTokens, estimatedOutputTokens, useCaching = false } = params;

  return getCostCents({
    model,
    tokensIn: estimatedInputTokens,
    tokensOut: estimatedOutputTokens,
    cachedInputTokens: useCaching ? Math.floor(estimatedInputTokens * 0.8) : 0,
  });
}

/**
 * Format cost for display
 * @param cents - Cost in cents
 * @returns Formatted string (e.g., "$0.0012")
 */
export function formatCost(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(4)}`;
}

/**
 * Check if cost exceeds a threshold
 * @param cents - Cost in cents
 * @param maxCents - Maximum allowed cost in cents
 * @returns True if cost exceeds threshold
 */
export function exceedsMaxCost(cents: number, maxCents: number): boolean {
  return cents > maxCents;
}
