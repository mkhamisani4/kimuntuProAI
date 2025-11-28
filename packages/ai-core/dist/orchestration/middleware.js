/**
 * Orchestration Middleware
 * Preflight checks for quota enforcement before expensive operations
 */
import { assertQuotasOk } from '../usage/quota.js';
import { estimateUsage } from '../usage/meter.js';
import { DEFAULT_MODEL_MINI, DEFAULT_MODEL_ESCALATION } from '../llm/models.js';
/**
 * Preflight quota guard
 * Checks quotas before executing planner or executor
 * Conservative estimation to prevent quota breaches
 *
 * @param params - Guard parameters
 * @throws QuotaError if quota would be exceeded
 */
export async function preflightQuotaGuard(params) {
    // Skip if quota enforcement is disabled
    if (!isQuotaEnforcementEnabled()) {
        return;
    }
    const { plan, tenantId, userId, inputLength } = params;
    // Determine model to use
    const modelId = plan.escalate_model ? DEFAULT_MODEL_ESCALATION : DEFAULT_MODEL_MINI;
    // Conservative estimate of context size
    const contextTokenLimit = Number(process.env.CONTEXT_TOKEN_LIMIT ?? 2000);
    const maxTokensExecutor = Number(process.env.MAX_TOKENS_EXECUTOR ?? 8000);
    // Estimate usage
    const { estimatedTokens, estimatedCostCents } = estimateUsage({
        model: modelId,
        inputLength,
        contextTokens: plan.requires_retrieval ? contextTokenLimit : 0,
        maxOutputTokens: maxTokensExecutor,
    });
    // Check quotas (will throw QuotaError if exceeded)
    await assertQuotasOk({
        tenantId,
        userId,
        plannedTokens: estimatedTokens,
        plannedCostCents: estimatedCostCents,
    });
}
/**
 * Preflight check for planner
 * Simpler check before planning stage
 *
 * @param params - Check parameters
 * @throws QuotaError if quota would be exceeded
 */
export async function preflightPlannerCheck(params) {
    // Skip if quota enforcement is disabled
    if (!isQuotaEnforcementEnabled()) {
        return;
    }
    const { tenantId, userId, inputLength } = params;
    // Use mini model for planning
    const modelId = DEFAULT_MODEL_MINI;
    const maxTokensPlanner = Number(process.env.MAX_TOKENS_PLANNER ?? 4000);
    // Estimate planner usage
    const { estimatedTokens, estimatedCostCents } = estimateUsage({
        model: modelId,
        inputLength,
        contextTokens: 0, // Planner doesn't use RAG
        maxOutputTokens: maxTokensPlanner,
    });
    // Check quotas
    await assertQuotasOk({
        tenantId,
        userId,
        plannedTokens: estimatedTokens,
        plannedCostCents: estimatedCostCents,
    });
}
/**
 * Check if quota enforcement is enabled
 *
 * @returns True if quota enforcement is enabled
 */
export function isQuotaEnforcementEnabled() {
    // Quota enforcement can be disabled for testing/development
    return process.env.DISABLE_QUOTA_ENFORCEMENT !== 'true';
}
/**
 * Middleware wrapper for quota checks
 * Returns null if check passes, error message if fails
 *
 * @param params - Check parameters
 * @returns Null if ok, error message if quota exceeded
 */
export async function checkQuotaMiddleware(params) {
    // Skip if enforcement disabled
    if (!isQuotaEnforcementEnabled()) {
        return { ok: true };
    }
    try {
        await preflightQuotaGuard(params);
        return { ok: true };
    }
    catch (error) {
        if (error.name === 'QuotaError') {
            return {
                ok: false,
                error: error.message,
                resetsAtISO: error.resetsAtISO,
            };
        }
        // Unexpected error (e.g., database unavailable)
        // Check if soft-fail is enabled
        const softFail = process.env.USAGE_SOFT_FAIL === 'true';
        if (softFail) {
            console.warn('Quota check failed (soft-fail enabled):', error.message);
            return { ok: true }; // Allow request to proceed
        }
        // Hard fail if soft-fail is disabled
        return {
            ok: false,
            error: `Quota check failed due to system error: ${error.message}`,
        };
    }
}
//# sourceMappingURL=middleware.js.map