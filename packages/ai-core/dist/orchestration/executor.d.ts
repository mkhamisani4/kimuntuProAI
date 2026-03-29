/**
 * Executor (Stage B) for Business Track AI Assistant
 * Orchestrates RAG, web search, finance tools, and final answer generation
 */
import type { AssistantRequest, AssistantResponse, PlannerOutput, UsageMetric } from '@kimuntupro/shared';
import { OpenAIClient } from '../llm/client.js';
import { type BM25QueryFn, type VectorQueryFn, type EmbeddingFn } from '../retrieval/hybrid.js';
/**
 * Executor options
 */
export interface ExecuteOptions {
    plan: PlannerOutput;
    request: AssistantRequest;
    tenantId: string;
    userId: string;
    onUsage?: (metrics: UsageMetric) => void;
    client?: OpenAIClient;
    bm25Query?: BM25QueryFn;
    vectorQuery?: VectorQueryFn;
    embed?: EmbeddingFn;
}
/**
 * Executor result with internal stats
 */
export interface ExecuteResult {
    response: AssistantResponse;
    stats: {
        retrievalLatencyMs?: number;
        webSearchLatencyMs?: number;
        financeLatencyMs?: number;
        modelLatencyMs: number;
        totalLatencyMs: number;
    };
}
/**
 * Execute Business Track assistant request
 * Orchestrates RAG, web search, finance, and final answer generation
 *
 * @param options - Execute options
 * @returns Assistant response
 */
export declare function execute(options: ExecuteOptions): Promise<AssistantResponse>;
/**
 * Validate execute options
 *
 * @param options - Options to validate
 * @returns Validation result
 */
export declare function validateExecuteOptions(options: ExecuteOptions): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=executor.d.ts.map