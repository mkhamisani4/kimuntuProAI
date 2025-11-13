/**
 * Quota Enforcement Module
 * Enforces per-user, per-tenant, and per-request quotas
 */
import type { QuotaCheckResult } from '@kimuntupro/shared';
/**
 * Check if user and tenant are within daily quotas
 * Queries database for usage since midnight UTC
 *
 * @param params - Quota check parameters
 * @returns Quota check result
 */
export declare function checkQuotas(params: {
    tenantId: string;
    userId: string;
    plannedTokens: number;
    plannedCostCents: number;
}): Promise<QuotaCheckResult>;
/**
 * Enforce per-request caps (tokens and cost)
 * Used for immediate validation without database queries
 *
 * @param params - Enforcement parameters
 * @returns Check result
 */
export declare function enforcePerRequestCaps(params: {
    tokens: number;
    costCents: number;
}): QuotaCheckResult;
/**
 * Throw a QuotaError if quota check fails
 * Convenience wrapper for checkQuotas that throws on failure
 *
 * @param params - Quota check parameters
 * @throws QuotaError if quota exceeded
 */
export declare function assertQuotasOk(params: {
    tenantId: string;
    userId: string;
    plannedTokens: number;
    plannedCostCents: number;
}): Promise<void>;
/**
 * Throw error if per-request caps exceeded
 * Convenience wrapper for enforcePerRequestCaps that throws on failure
 *
 * @param params - Enforcement parameters
 * @throws QuotaError if caps exceeded
 */
export declare function assertPerRequestCapsOk(params: {
    tokens: number;
    costCents: number;
}): void;
/**
 * Get current quota usage for a user
 * Useful for displaying usage in UI
 *
 * @param params - Query parameters
 * @returns Current usage stats
 */
export declare function getCurrentQuotaUsage(params: {
    tenantId: string;
    userId: string;
}): Promise<{
    user: {
        tokensUsed: number;
        tokensRemaining: number;
        quotaLimit: number;
    };
    tenant: {
        tokensUsed: number;
        tokensRemaining: number;
        quotaLimit: number;
    };
    resetsAtISO: string;
}>;
/**
 * Log usage after a successful request (Phase 5)
 * Records usage to database for tracking and analytics
 *
 * @param params - Usage parameters
 * @returns Promise resolving when logged
 */
export declare function logRequestUsage(params: {
    tenantId: string;
    userId: string;
    assistant: string;
    model: string;
    tokensIn: number;
    tokensOut: number;
    costCents: number;
    latencyMs: number;
    toolInvocations?: {
        retrieval?: number;
        webSearch?: number;
        finance?: number;
    };
    requestId?: string;
}): Promise<void>;
//# sourceMappingURL=quota.d.ts.map