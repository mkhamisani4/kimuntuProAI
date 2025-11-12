/**
 * Quota Enforcement Module
 * Enforces per-user, per-tenant, and per-request quotas
 */
import { QuotaError } from '@kimuntupro/shared';
import { sumTokensByUser, sumTokensByTenant } from '@kimuntupro/db';
/**
 * Get start of day in UTC
 *
 * @param date - Date to get start of day for
 * @returns Date representing midnight UTC
 */
function startOfDayUTC(date = new Date()) {
    const utc = new Date(date.toISOString());
    utc.setUTCHours(0, 0, 0, 0);
    return utc;
}
/**
 * Get next midnight UTC (quota reset time)
 *
 * @returns ISO string of next midnight UTC
 */
function getNextMidnightUTC() {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.toISOString();
}
/**
 * Load quota configuration from environment
 *
 * @returns Quota configuration
 */
function loadQuotaConfig() {
    return {
        dailyTokenQuotaPerUser: Number(process.env.DAILY_TOKEN_QUOTA_PER_USER ?? 100000),
        dailyTokenQuotaPerTenant: Number(process.env.DAILY_TOKEN_QUOTA_PER_TENANT ?? 2000000),
        maxCostPerRequestCents: Number(process.env.MAX_COST_PER_REQUEST_CENTS ?? 50),
        maxTokensPerRequest: Number(process.env.MAX_TOKENS_PER_REQUEST ?? 16000),
    };
}
/**
 * Check if user and tenant are within daily quotas
 * Queries database for usage since midnight UTC
 *
 * @param params - Quota check parameters
 * @returns Quota check result
 */
export async function checkQuotas(params) {
    const { tenantId, userId, plannedTokens, plannedCostCents } = params;
    const config = loadQuotaConfig();
    // Get start of current day in UTC
    const since = startOfDayUTC();
    const resetsAtISO = getNextMidnightUTC();
    try {
        // Check user quota
        const userTokens = await sumTokensByUser({ userId, since });
        const projectedUserTokens = userTokens + plannedTokens;
        if (projectedUserTokens > config.dailyTokenQuotaPerUser) {
            return {
                ok: false,
                reason: `User daily token quota exceeded. Used ${userTokens} of ${config.dailyTokenQuotaPerUser} tokens today. Request would add ${plannedTokens} tokens.`,
                resetsAtISO,
                currentUsage: {
                    tokens: userTokens,
                    costCents: 0, // Could fetch if needed
                },
            };
        }
        // Check tenant quota
        const tenantTokens = await sumTokensByTenant({ tenantId, since });
        const projectedTenantTokens = tenantTokens + plannedTokens;
        if (projectedTenantTokens > config.dailyTokenQuotaPerTenant) {
            return {
                ok: false,
                reason: `Tenant daily token quota exceeded. Used ${tenantTokens} of ${config.dailyTokenQuotaPerTenant} tokens today. Request would add ${plannedTokens} tokens.`,
                resetsAtISO,
                currentUsage: {
                    tokens: tenantTokens,
                    costCents: 0, // Could fetch if needed
                },
            };
        }
        // Check per-request token cap
        if (plannedTokens > config.maxTokensPerRequest) {
            return {
                ok: false,
                reason: `Request exceeds maximum tokens per request. Planned ${plannedTokens} tokens, limit is ${config.maxTokensPerRequest}.`,
            };
        }
        // Check per-request cost cap
        if (plannedCostCents > config.maxCostPerRequestCents) {
            return {
                ok: false,
                reason: `Request exceeds maximum cost per request. Planned cost is ${plannedCostCents} cents, limit is ${config.maxCostPerRequestCents} cents.`,
            };
        }
        // All checks passed
        return {
            ok: true,
            currentUsage: {
                tokens: userTokens,
                costCents: 0, // Could fetch if needed
            },
        };
    }
    catch (error) {
        console.error('Quota check failed:', error);
        // On database error, fail closed (deny request)
        return {
            ok: false,
            reason: `Quota check failed due to system error: ${error.message}`,
        };
    }
}
/**
 * Enforce per-request caps (tokens and cost)
 * Used for immediate validation without database queries
 *
 * @param params - Enforcement parameters
 * @returns Check result
 */
export function enforcePerRequestCaps(params) {
    const { tokens, costCents } = params;
    const config = loadQuotaConfig();
    // Check token cap
    if (tokens > config.maxTokensPerRequest) {
        return {
            ok: false,
            reason: `Request exceeds maximum tokens per request. Used ${tokens} tokens, limit is ${config.maxTokensPerRequest}.`,
        };
    }
    // Check cost cap
    if (costCents > config.maxCostPerRequestCents) {
        return {
            ok: false,
            reason: `Request exceeds maximum cost per request. Cost is ${costCents} cents, limit is ${config.maxCostPerRequestCents} cents.`,
        };
    }
    return {
        ok: true,
    };
}
/**
 * Throw a QuotaError if quota check fails
 * Convenience wrapper for checkQuotas that throws on failure
 *
 * @param params - Quota check parameters
 * @throws QuotaError if quota exceeded
 */
export async function assertQuotasOk(params) {
    const result = await checkQuotas(params);
    if (!result.ok) {
        throw new QuotaError(result.reason || 'Quota exceeded', result.resetsAtISO, result.currentUsage);
    }
}
/**
 * Throw error if per-request caps exceeded
 * Convenience wrapper for enforcePerRequestCaps that throws on failure
 *
 * @param params - Enforcement parameters
 * @throws QuotaError if caps exceeded
 */
export function assertPerRequestCapsOk(params) {
    const result = enforcePerRequestCaps(params);
    if (!result.ok) {
        throw new QuotaError(result.reason || 'Request caps exceeded');
    }
}
/**
 * Get current quota usage for a user
 * Useful for displaying usage in UI
 *
 * @param params - Query parameters
 * @returns Current usage stats
 */
export async function getCurrentQuotaUsage(params) {
    const { tenantId, userId } = params;
    const config = loadQuotaConfig();
    const since = startOfDayUTC();
    const resetsAtISO = getNextMidnightUTC();
    const [userTokens, tenantTokens] = await Promise.all([
        sumTokensByUser({ userId, since }),
        sumTokensByTenant({ tenantId, since }),
    ]);
    return {
        user: {
            tokensUsed: userTokens,
            tokensRemaining: Math.max(0, config.dailyTokenQuotaPerUser - userTokens),
            quotaLimit: config.dailyTokenQuotaPerUser,
        },
        tenant: {
            tokensUsed: tenantTokens,
            tokensRemaining: Math.max(0, config.dailyTokenQuotaPerTenant - tenantTokens),
            quotaLimit: config.dailyTokenQuotaPerTenant,
        },
        resetsAtISO,
    };
}
//# sourceMappingURL=quota.js.map