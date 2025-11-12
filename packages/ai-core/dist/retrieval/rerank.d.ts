/**
 * Reranking and Fusion for Hybrid Retrieval
 * Implements Reciprocal Rank Fusion (RRF) for combining BM25 and vector results
 */
import type { RetrievedChunk } from './context.js';
/**
 * Search result from a single retrieval method
 */
export interface SearchResult {
    id: string;
    score: number;
    content: string;
    metadata: {
        document_id: string;
        document_name: string;
        chunk_index: number;
        page?: number;
        section?: string;
        timestamp?: string;
    };
}
/**
 * RRF configuration
 */
export interface RRFConfig {
    k: number;
    bm25_weight: number;
    vector_weight: number;
}
/**
 * Default RRF configuration
 */
export declare const DEFAULT_RRF_CONFIG: RRFConfig;
/**
 * Reciprocal Rank Fusion (RRF)
 * Combines rankings from multiple retrieval methods
 *
 * Formula: RRF_score = sum(weight / (k + rank))
 *
 * @param bm25Results - BM25 search results (sorted by score desc)
 * @param vectorResults - Vector search results (sorted by score desc)
 * @param config - RRF configuration
 * @returns Fused results sorted by RRF score (desc)
 */
export declare function fuseRRF(bm25Results: SearchResult[], vectorResults: SearchResult[], config?: RRFConfig): RetrievedChunk[];
/**
 * Simple weighted fusion (no rank-based fusion)
 * Combines raw scores from BM25 and vector search
 *
 * Formula: score = bm25_weight * bm25_score + vector_weight * vector_score
 *
 * @param bm25Results - BM25 search results
 * @param vectorResults - Vector search results
 * @param bm25Weight - Weight for BM25 scores (default: 0.3)
 * @param vectorWeight - Weight for vector scores (default: 0.7)
 * @returns Fused results sorted by weighted score (desc)
 */
export declare function fuseWeighted(bm25Results: SearchResult[], vectorResults: SearchResult[], bm25Weight?: number, vectorWeight?: number): RetrievedChunk[];
/**
 * Deduplicate results by ID, keeping highest-ranked occurrence
 *
 * @param chunks - Retrieved chunks (may have duplicates)
 * @returns Deduplicated chunks
 */
export declare function deduplicateChunks(chunks: RetrievedChunk[]): RetrievedChunk[];
/**
 * Apply minimum score threshold
 * Filters out chunks below threshold
 *
 * @param chunks - Retrieved chunks
 * @param threshold - Minimum score (default: 0.01)
 * @returns Filtered chunks
 */
export declare function applyScoreThreshold(chunks: RetrievedChunk[], threshold?: number): RetrievedChunk[];
/**
 * Truncate results to top K
 *
 * @param chunks - Retrieved chunks (must be sorted by rank)
 * @param topK - Maximum number of chunks to return
 * @returns Top K chunks
 */
export declare function truncateTopK(chunks: RetrievedChunk[], topK: number): RetrievedChunk[];
/**
 * Normalize scores to [0, 1] range using min-max normalization
 *
 * @param results - Search results
 * @returns Results with normalized scores
 */
export declare function normalizeScores(results: SearchResult[]): SearchResult[];
/**
 * Rerank pipeline: fuse, deduplicate, threshold, truncate
 *
 * @param bm25Results - BM25 search results
 * @param vectorResults - Vector search results
 * @param options - Pipeline options
 * @returns Processed chunks ready for packing
 */
export declare function rerankPipeline(bm25Results: SearchResult[], vectorResults: SearchResult[], options?: {
    method?: 'rrf' | 'weighted';
    rrfConfig?: RRFConfig;
    bm25Weight?: number;
    vectorWeight?: number;
    scoreThreshold?: number;
    topK?: number;
}): RetrievedChunk[];
//# sourceMappingURL=rerank.d.ts.map