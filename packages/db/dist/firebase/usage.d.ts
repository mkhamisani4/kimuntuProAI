/**
 * Firestore Usage Tracking Functions
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
 * Record a usage event in Firestore
 *
 * @param row - Usage row to record
 * @returns Promise resolving when recorded
 */
export declare function recordUsage(row: UsageRow): Promise<void>;
/**
 * Sum tokens by user since a given time
 *
 * @param options - Object with userId and since date
 * @returns Total tokens (in + out)
 */
export declare function sumTokensByUser(options: {
    userId: string;
    since: Date;
}): Promise<number>;
/**
 * Sum tokens by tenant since a given time
 *
 * @param options - Object with tenantId and since date
 * @returns Total tokens (in + out)
 */
export declare function sumTokensByTenant(options: {
    tenantId: string;
    since: Date;
}): Promise<number>;
/**
 * Get usage aggregations for metrics
 *
 * @param options - Filter options
 * @returns Aggregated metrics
 */
export declare function getUsageMetrics(options?: {
    tenantId?: string;
    userId?: string;
    since?: Date;
}): Promise<{
    totalRequests: number;
    totalCostCents: number;
    totalTokensIn: number;
    totalTokensOut: number;
    byAssistant: Record<string, {
        requests: number;
        costCents: number;
        tokens: number;
    }>;
}>;
//# sourceMappingURL=usage.d.ts.map