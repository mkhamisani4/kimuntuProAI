/**
 * Hybrid Retrieval Orchestration
 * Combines BM25 (Postgres FTS) and pgvector for optimal recall
 */
import type { SearchResult } from './rerank.js';
import { type RRFConfig } from './rerank.js';
import { type PackedContext, type RetrievedChunk } from './context.js';
/**
 * Hybrid retrieval options
 */
export interface HybridRetrievalOptions {
    tenantId: string;
    query: string;
    topK?: number;
    bm25Limit?: number;
    vectorLimit?: number;
    contextMaxTokens?: number;
    rerankMethod?: 'rrf' | 'weighted';
    rrfConfig?: RRFConfig;
    bm25Weight?: number;
    vectorWeight?: number;
    scoreThreshold?: number;
}
/**
 * Hybrid retrieval result
 */
export interface HybridRetrievalResult {
    context: PackedContext;
    chunks: RetrievedChunk[];
    stats: {
        bm25_results: number;
        vector_results: number;
        fused_results: number;
        chunks_used: number;
        chunks_truncated: number;
        total_tokens: number;
        latency_ms: number;
    };
}
/**
 * Query interface for BM25 search (to be implemented by DB layer)
 */
export interface BM25QueryFn {
    (tenantId: string, query: string, limit: number): Promise<SearchResult[]>;
}
/**
 * Query interface for vector search (to be implemented by DB layer)
 */
export interface VectorQueryFn {
    (tenantId: string, queryEmbedding: number[], limit: number): Promise<SearchResult[]>;
}
/**
 * Embedding interface (to be implemented by LLM layer)
 */
export interface EmbeddingFn {
    (text: string): Promise<number[]>;
}
/**
 * Hybrid retrieval with dependency injection
 * Allows testing without database
 *
 * @param options - Retrieval options
 * @param bm25Query - BM25 query function
 * @param vectorQuery - Vector query function
 * @param embed - Embedding function
 * @returns Hybrid retrieval result
 */
export declare function retrieveHybrid(options: HybridRetrievalOptions, bm25Query: BM25QueryFn, vectorQuery: VectorQueryFn, embed: EmbeddingFn): Promise<HybridRetrievalResult>;
/**
 * Simple retrieval without hybrid fusion (vector-only)
 * Useful for simpler use cases or when BM25 is not needed
 *
 * @param options - Retrieval options (subset)
 * @param vectorQuery - Vector query function
 * @param embed - Embedding function
 * @returns Retrieval result
 */
export declare function retrieveVectorOnly(options: {
    tenantId: string;
    query: string;
    topK?: number;
    contextMaxTokens?: number;
    scoreThreshold?: number;
}, vectorQuery: VectorQueryFn, embed: EmbeddingFn): Promise<HybridRetrievalResult>;
/**
 * Validate retrieval options
 *
 * @param options - Options to validate
 * @returns Validation result
 */
export declare function validateRetrievalOptions(options: HybridRetrievalOptions): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=hybrid.d.ts.map