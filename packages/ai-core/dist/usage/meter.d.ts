/**
 * Usage Metering Module
 * Handles cost calculation, usage tracking, and persistence
 */
import type { AssistantType, UsageMetric, ToolInvocations } from '@kimuntupro/shared';
/**
 * Calculate cost in cents for a completion
 * Wrapper around costs.ts with conservative rounding
 *
 * @param params - Cost calculation parameters
 * @returns Cost in cents (rounded up to nearest cent)
 */
export declare function calcCostCents(params: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    cachedInputTokens?: number;
}): number;
/**
 * Build usage metrics from OpenAI client response
 * Normalizes the response into UsageMetric format
 *
 * @param params - Client response parameters
 * @returns Usage metrics object
 */
export declare function buildUsageFromClientEvent(params: {
    model: string;
    tokensIn: number;
    tokensOut: number;
    latencyMs: number;
    cachedInputTokens?: number;
    toolInvocations?: Partial<ToolInvocations>;
}): UsageMetric;
/**
 * Emit usage metrics with sampling and persistence
 * Respects USAGE_SAMPLING_RATE and USAGE_SOFT_FAIL environment variables
 *
 * @param params - Usage emission parameters
 * @returns Promise resolving when persisted (or void if sampled out)
 */
export declare function emitUsage(params: {
    tenantId: string;
    userId: string;
    assistant: AssistantType;
    metrics: UsageMetric;
    requestId?: string;
    meta?: Record<string, any>;
    onPersist?: (error: Error | null) => void;
}): Promise<void>;
/**
 * Calculate total tokens from separate in/out counts
 *
 * @param tokensIn - Input tokens
 * @param tokensOut - Output tokens
 * @returns Total tokens
 */
export declare function calcTotalTokens(tokensIn: number, tokensOut: number): number;
/**
 * Estimate usage for preflight quota checks
 * Used before actual LLM call to predict resource usage
 *
 * @param params - Estimation parameters
 * @returns Estimated usage metrics
 */
export declare function estimateUsage(params: {
    model: string;
    inputLength: number;
    contextTokens: number;
    maxOutputTokens: number;
}): {
    estimatedTokens: number;
    estimatedCostCents: number;
};
/**
 * Format usage metrics for logging/display
 *
 * @param metrics - Usage metrics
 * @returns Formatted string
 */
export declare function formatUsageMetrics(metrics: UsageMetric): string;
/**
 * Aggregate multiple usage metrics
 * Useful for summarizing a batch of requests
 *
 * @param metricsList - Array of usage metrics
 * @returns Aggregated metrics
 */
export declare function aggregateUsageMetrics(metricsList: UsageMetric[]): {
    totalTokensIn: number;
    totalTokensOut: number;
    totalCostCents: number;
    totalLatencyMs: number;
    callCount: number;
};
//# sourceMappingURL=meter.d.ts.map