/**
 * Orchestration Middleware
 * Preflight checks for quota enforcement before expensive operations
 */
import type { PlannerOutput } from '@kimuntupro/shared';
/**
 * Preflight quota guard
 * Checks quotas before executing planner or executor
 * Conservative estimation to prevent quota breaches
 *
 * @param params - Guard parameters
 * @throws QuotaError if quota would be exceeded
 */
export declare function preflightQuotaGuard(params: {
    plan: PlannerOutput;
    tenantId: string;
    userId: string;
    inputLength: number;
}): Promise<void>;
/**
 * Preflight check for planner
 * Simpler check before planning stage
 *
 * @param params - Check parameters
 * @throws QuotaError if quota would be exceeded
 */
export declare function preflightPlannerCheck(params: {
    tenantId: string;
    userId: string;
    inputLength: number;
}): Promise<void>;
/**
 * Check if quota enforcement is enabled
 *
 * @returns True if quota enforcement is enabled
 */
export declare function isQuotaEnforcementEnabled(): boolean;
/**
 * Middleware wrapper for quota checks
 * Returns null if check passes, error message if fails
 *
 * @param params - Check parameters
 * @returns Null if ok, error message if quota exceeded
 */
export declare function checkQuotaMiddleware(params: {
    plan: PlannerOutput;
    tenantId: string;
    userId: string;
    inputLength: number;
}): Promise<{
    ok: true;
} | {
    ok: false;
    error: string;
    resetsAtISO?: string;
}>;
//# sourceMappingURL=middleware.d.ts.map