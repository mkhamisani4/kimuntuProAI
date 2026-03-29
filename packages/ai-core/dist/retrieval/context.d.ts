/**
 * Context Building and Token Packing for RAG
 * Handles token estimation, packing, and citation formatting
 */
/**
 * Retrieved chunk from database with metadata
 */
export interface RetrievedChunk {
    id: string;
    content: string;
    metadata: {
        document_id: string;
        document_name: string;
        chunk_index: number;
        page?: number;
        section?: string;
        timestamp?: string;
    };
    score: number;
    rank: number;
}
/**
 * Packed context ready for LLM injection
 */
export interface PackedContext {
    context: string;
    citations: Citation[];
    token_count: number;
    chunks_used: number;
    chunks_truncated: number;
}
/**
 * Citation with source attribution
 */
export interface Citation {
    id: string;
    source: string;
    page?: number;
    section?: string;
    url?: string;
    excerpt?: string;
}
/**
 * Approximate token count using simple heuristic
 * More accurate than char/4, less expensive than tiktoken
 *
 * @param text - Text to estimate
 * @returns Approximate token count
 */
export declare function estimateTokens(text: string): number;
/**
 * Build citation from chunk metadata
 *
 * @param chunk - Retrieved chunk
 * @param index - Citation index (1-based)
 * @returns Formatted citation
 */
export declare function buildCitation(chunk: RetrievedChunk, index: number): Citation;
/**
 * Pack chunks into context under token budget
 * Uses greedy packing: highest-ranked chunks first until budget exhausted
 *
 * @param chunks - Retrieved chunks (must be pre-sorted by rank)
 * @param maxTokens - Maximum token budget for context
 * @param reserveTokens - Tokens to reserve for formatting (default: 100)
 * @returns Packed context with citations
 */
export declare function packContext(chunks: RetrievedChunk[], maxTokens: number, reserveTokens?: number): PackedContext;
/**
 * Validate chunks before packing
 * Ensures chunks have required fields and are properly sorted
 *
 * @param chunks - Chunks to validate
 * @returns Validation result with errors
 */
export declare function validateChunks(chunks: RetrievedChunk[]): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=context.d.ts.map