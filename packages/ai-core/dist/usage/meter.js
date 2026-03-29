/**
 * Usage Metering Module
 * Handles cost calculation, usage tracking, and persistence
 */
import { getCostCents } from '../llm/costs.js';
import { recordUsage } from '@kimuntupro/db';
/**
 * Calculate cost in cents for a completion
 * Wrapper around costs.ts with conservative rounding
 *
 * @param params - Cost calculation parameters
 * @returns Cost in cents (rounded up to nearest cent)
 */
export function calcCostCents(params) {
    const costCents = getCostCents(params);
    // Round UP to nearest cent to be conservative
    return Math.ceil(costCents);
}
/**
 * Build usage metrics from OpenAI client response
 * Normalizes the response into UsageMetric format
 *
 * @param params - Client response parameters
 * @returns Usage metrics object
 */
export function buildUsageFromClientEvent(params) {
    const { model, tokensIn, tokensOut, latencyMs, cachedInputTokens = 0, toolInvocations = {}, } = params;
    const costCents = calcCostCents({
        model,
        tokensIn,
        tokensOut,
        cachedInputTokens,
    });
    return {
        model,
        tokensIn,
        tokensOut,
        costCents,
        latencyMs,
        toolInvocations: {
            retrieval: toolInvocations.retrieval || 0,
            webSearch: toolInvocations.webSearch || 0,
            finance: toolInvocations.finance || 0,
        },
    };
}
/**
 * Emit usage metrics with sampling and persistence
 * Respects USAGE_SAMPLING_RATE and USAGE_SOFT_FAIL environment variables
 *
 * @param params - Usage emission parameters
 * @returns Promise resolving when persisted (or void if sampled out)
 */
export async function emitUsage(params) {
    const { tenantId, userId, assistant, metrics, requestId, meta, onPersist } = params;
    // Check if usage tracking is enabled
    if (process.env.ENABLE_USAGE_TRACKING === 'false') {
        return;
    }
    // Apply sampling rate
    const samplingRate = Number(process.env.USAGE_SAMPLING_RATE ?? 1.0);
    if (samplingRate < 1.0 && Math.random() > samplingRate) {
        // Sample out - don't record
        return;
    }
    // Build usage row
    const row = {
        tenantId,
        userId,
        assistant,
        model: metrics.model,
        tokensIn: metrics.tokensIn,
        tokensOut: metrics.tokensOut,
        totalTokens: metrics.tokensIn + metrics.tokensOut,
        costCents: metrics.costCents,
        latencyMs: metrics.latencyMs,
        toolInvocations: metrics.toolInvocations,
        requestId,
        meta,
    };
    // Persist to database
    const softFail = process.env.USAGE_SOFT_FAIL === 'true';
    try {
        await recordUsage(row);
        if (onPersist) {
            onPersist(null);
        }
    }
    catch (error) {
        console.error('Failed to record usage:', error);
        if (onPersist) {
            onPersist(error);
        }
        if (!softFail) {
            throw error;
        }
        // If soft fail is enabled, log warning but don't throw
        console.warn('Usage tracking failed but continuing due to USAGE_SOFT_FAIL=true');
    }
}
/**
 * Calculate total tokens from separate in/out counts
 *
 * @param tokensIn - Input tokens
 * @param tokensOut - Output tokens
 * @returns Total tokens
 */
export function calcTotalTokens(tokensIn, tokensOut) {
    return tokensIn + tokensOut;
}
/**
 * Estimate usage for preflight quota checks
 * Used before actual LLM call to predict resource usage
 *
 * @param params - Estimation parameters
 * @returns Estimated usage metrics
 */
export function estimateUsage(params) {
    const { model, inputLength, contextTokens, maxOutputTokens } = params;
    // Conservative estimate:
    // - Input = input length * 1.5 (for tokenization overhead) + context
    // - Output = max output tokens (worst case)
    const estimatedInputTokens = Math.ceil(inputLength * 1.5) + contextTokens;
    const estimatedOutputTokens = maxOutputTokens;
    const estimatedTokens = estimatedInputTokens + estimatedOutputTokens;
    const estimatedCostCents = calcCostCents({
        model,
        tokensIn: estimatedInputTokens,
        tokensOut: estimatedOutputTokens,
    });
    return {
        estimatedTokens,
        estimatedCostCents,
    };
}
/**
 * Format usage metrics for logging/display
 *
 * @param metrics - Usage metrics
 * @returns Formatted string
 */
export function formatUsageMetrics(metrics) {
    const totalTokens = metrics.tokensIn + metrics.tokensOut;
    const costDollars = (metrics.costCents / 100).toFixed(4);
    return `${metrics.model}: ${totalTokens} tokens ($${costDollars}, ${metrics.latencyMs}ms)`;
}
/**
 * Aggregate multiple usage metrics
 * Useful for summarizing a batch of requests
 *
 * @param metricsList - Array of usage metrics
 * @returns Aggregated metrics
 */
export function aggregateUsageMetrics(metricsList) {
    return metricsList.reduce((acc, metrics) => ({
        totalTokensIn: acc.totalTokensIn + metrics.tokensIn,
        totalTokensOut: acc.totalTokensOut + metrics.tokensOut,
        totalCostCents: acc.totalCostCents + metrics.costCents,
        totalLatencyMs: acc.totalLatencyMs + metrics.latencyMs,
        callCount: acc.callCount + 1,
    }), {
        totalTokensIn: 0,
        totalTokensOut: 0,
        totalCostCents: 0,
        totalLatencyMs: 0,
        callCount: 0,
    });
}
//# sourceMappingURL=meter.js.map