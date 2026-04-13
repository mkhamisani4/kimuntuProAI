/**
 * Assistant Results Persistence
 * Stores completed assistant outputs for Recent Activity
 */
/**
 * Assistant result document
 */
export interface AssistantResult {
    id?: string;
    tenantId: string;
    userId: string;
    assistant: 'streamlined_plan' | 'exec_summary' | 'market_analysis' | 'financial_overview';
    title: string;
    summary: string;
    sections: Record<string, string>;
    sources: Array<{
        type: 'rag' | 'web';
        title: string;
        snippet: string;
        url?: string;
        docId?: string;
    }>;
    metadata?: {
        model?: string;
        tokensUsed?: number;
        latencyMs?: number;
        cost?: number;
    };
    createdAt?: Date;
}
/**
 * Save assistant result to Firestore
 *
 * @param result - Assistant result to save
 * @returns Document ID
 */
export declare function saveAssistantResult(result: Omit<AssistantResult, 'id' | 'createdAt'>): Promise<string>;
/**
 * Get recent assistant results for a tenant
 *
 * @param tenantId - Tenant ID
 * @param limitCount - Number of results to fetch (default 5)
 * @returns Array of assistant results
 */
export declare function getRecentResults(tenantId: string, limitCount?: number): Promise<AssistantResult[]>;
/**
 * Get a specific assistant result by ID
 *
 * @param resultId - Document ID
 * @returns Assistant result or null
 */
export declare function getAssistantResult(resultId: string): Promise<AssistantResult | null>;
/**
 * Generate title from input or result
 *
 * @param input - User input
 * @param assistant - Assistant type
 * @returns Generated title
 */
export declare function generateTitle(input: string, assistant: string): string;
/**
 * Generate summary from sections
 *
 * @param sections - Response sections
 * @returns 1-3 sentence summary
 */
export declare function generateSummary(sections: Record<string, string>): string;
/**
 * Delete assistant result by ID
 *
 * @param resultId - Result document ID
 */
export declare function deleteAssistantResult(resultId: string): Promise<void>;
//# sourceMappingURL=assistantResults.d.ts.map