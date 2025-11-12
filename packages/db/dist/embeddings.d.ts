/**
 * Embedding and Retrieval Queries for RAG
 * Implements BM25 (Postgres FTS) and pgvector search with multi-tenant support
 */
/**
 * Search result from database
 */
export interface SearchResult {
    id: string;
    content: string;
    score: number;
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
 * BM25 search using Postgres full-text search
 * Uses to_tsquery for query parsing and ts_rank for scoring
 *
 * @param tenantId - Tenant ID for multi-tenant scoping
 * @param query - Search query
 * @param limit - Maximum results to return (default: 50)
 * @returns Search results sorted by BM25 score (desc)
 */
export declare function bm25Search(tenantId: string, query: string, limit?: number): Promise<SearchResult[]>;
/**
 * Vector search using pgvector cosine similarity
 * Uses <=> operator for cosine distance (1 - cosine similarity)
 *
 * @param tenantId - Tenant ID for multi-tenant scoping
 * @param queryEmbedding - Query embedding vector (1536 dimensions for OpenAI)
 * @param limit - Maximum results to return (default: 50)
 * @returns Search results sorted by similarity (desc)
 */
export declare function vectorSearch(tenantId: string, queryEmbedding: number[], limit?: number): Promise<SearchResult[]>;
/**
 * Insert or update embedding for a chunk
 * Upserts embedding vector for a chunk in multi-tenant context
 *
 * @param chunkId - Chunk ID
 * @param tenantId - Tenant ID
 * @param embedding - Embedding vector (1536 dimensions)
 * @returns Embedding ID
 */
export declare function upsertEmbedding(chunkId: string, tenantId: string, embedding: number[]): Promise<string>;
/**
 * Bulk insert embeddings for multiple chunks
 * More efficient than individual upserts
 *
 * @param embeddings - Array of chunk-embedding pairs
 * @returns Number of embeddings inserted
 */
export declare function bulkInsertEmbeddings(embeddings: Array<{
    chunkId: string;
    tenantId: string;
    embedding: number[];
}>): Promise<number>;
/**
 * Get chunk by ID with tenant validation
 *
 * @param chunkId - Chunk ID
 * @param tenantId - Tenant ID
 * @returns Chunk with document metadata or null
 */
export declare function getChunk(chunkId: string, tenantId: string): Promise<SearchResult | null>;
/**
 * Count total embeddings for a tenant
 * Useful for usage tracking and limits
 *
 * @param tenantId - Tenant ID
 * @returns Number of embeddings
 */
export declare function countEmbeddings(tenantId: string): Promise<number>;
//# sourceMappingURL=embeddings.d.ts.map