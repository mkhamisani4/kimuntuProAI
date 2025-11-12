/**
 * Usage Tracking Database Functions
 * Handles usage log persistence and aggregations for quotas and analytics
 */
/**
 * Usage row for insertion
 */
export interface UsageRow {
    tenantId: string;
    userId: string;
    assistant: string;
    model: string;
    tokensIn: number;
    tokensOut: number;
    totalTokens: number;
    costCents: number;
    latencyMs: number;
    toolInvocations: {
        retrieval?: number;
        webSearch?: number;
        finance?: number;
    };
    requestId?: string;
    meta?: Record<string, any>;
}
/**
 * Record a usage event in the database
 *
 * @param row - Usage row to record
 * @returns Promise resolving when recorded
 */
export declare function recordUsage(row: UsageRow): Promise<void>;
/**
 * Sum tokens by user since a given time
 *
 * @param params - Query parameters
 * @returns Total tokens used by user
 */
export declare function sumTokensByUser(params: {
    userId: string;
    since: Date;
}): Promise<number>;
/**
 * Sum tokens by tenant since a given time
 *
 * @param params - Query parameters
 * @returns Total tokens used by tenant
 */
export declare function sumTokensByTenant(params: {
    tenantId: string;
    since: Date;
}): Promise<number>;
/**
 * Aggregate stats by assistant type for analytics
 *
 * @param params - Query parameters
 * @returns Array of assistant stats
 */
export declare function recentUsageByAssistant(params: {
    tenantId: string;
    days: number;
}): Promise<Array<{
    assistant: string;
    calls: number;
    tokens: number;
    cost_cents: number;
}>>;
/**
 * Delete old usage logs before a given date
 * Used for data retention policies
 *
 * @param params - Query parameters
 * @returns Number of rows deleted
 */
export declare function purgeOldUsage(params: {
    before: Date;
}): Promise<number>;
/**
 * Get usage stats for a specific user
 *
 * @param params - Query parameters
 * @returns Usage stats
 */
export declare function getUserUsageStats(params: {
    userId: string;
    since: Date;
}): Promise<{
    totalTokens: number;
    totalCostCents: number;
    callCount: number;
}>;
/**
 * Get usage stats for a specific tenant
 *
 * @param params - Query parameters
 * @returns Usage stats
 */
export declare function getTenantUsageStats(params: {
    tenantId: string;
    since: Date;
}): Promise<{
    totalTokens: number;
    totalCostCents: number;
    callCount: number;
}>;
//# sourceMappingURL=usage.d.ts.map