/**
 * Hybrid Retrieval Orchestration
 * Combines BM25 (Postgres FTS) and pgvector for optimal recall
 */
import { rerankPipeline } from './rerank.js';
import { packContext } from './context.js';
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
export async function retrieveHybrid(options, bm25Query, vectorQuery, embed) {
    const startTime = Date.now();
    const { tenantId, query, topK = 20, bm25Limit = 50, vectorLimit = 50, contextMaxTokens = 4000, rerankMethod = 'rrf', rrfConfig, bm25Weight, vectorWeight, scoreThreshold, } = options;
    // Validate inputs
    if (!tenantId || tenantId.trim().length === 0) {
        throw new Error('tenantId is required');
    }
    if (!query || query.trim().length === 0) {
        throw new Error('query is required');
    }
    // Execute BM25 and vector search in parallel
    const queryEmbedding = await embed(query);
    const [bm25Results, vectorResults] = await Promise.all([
        bm25Query(tenantId, query, bm25Limit),
        vectorQuery(tenantId, queryEmbedding, vectorLimit),
    ]);
    // Fuse and rerank
    const fusedChunks = rerankPipeline(bm25Results, vectorResults, {
        method: rerankMethod,
        rrfConfig,
        bm25Weight,
        vectorWeight,
        scoreThreshold,
        topK,
    });
    // Pack context under token budget
    const context = packContext(fusedChunks, contextMaxTokens);
    const latencyMs = Date.now() - startTime;
    return {
        context,
        chunks: fusedChunks,
        stats: {
            bm25_results: bm25Results.length,
            vector_results: vectorResults.length,
            fused_results: fusedChunks.length,
            chunks_used: context.chunks_used,
            chunks_truncated: context.chunks_truncated,
            total_tokens: context.token_count,
            latency_ms: latencyMs,
        },
    };
}
/**
 * Simple retrieval without hybrid fusion (vector-only)
 * Useful for simpler use cases or when BM25 is not needed
 *
 * @param options - Retrieval options (subset)
 * @param vectorQuery - Vector query function
 * @param embed - Embedding function
 * @returns Retrieval result
 */
export async function retrieveVectorOnly(options, vectorQuery, embed) {
    const startTime = Date.now();
    const { tenantId, query, topK = 20, contextMaxTokens = 4000, scoreThreshold = 0.01, } = options;
    // Validate inputs
    if (!tenantId || tenantId.trim().length === 0) {
        throw new Error('tenantId is required');
    }
    if (!query || query.trim().length === 0) {
        throw new Error('query is required');
    }
    // Vector search only
    const queryEmbedding = await embed(query);
    const vectorResults = await vectorQuery(tenantId, queryEmbedding, topK);
    // Filter by threshold and convert to RetrievedChunk
    const chunks = vectorResults
        .filter((r) => r.score >= scoreThreshold)
        .slice(0, topK)
        .map((r, i) => ({
        id: r.id,
        content: r.content,
        metadata: r.metadata,
        score: r.score,
        rank: i + 1,
    }));
    // Pack context
    const context = packContext(chunks, contextMaxTokens);
    const latencyMs = Date.now() - startTime;
    return {
        context,
        chunks,
        stats: {
            bm25_results: 0,
            vector_results: vectorResults.length,
            fused_results: chunks.length,
            chunks_used: context.chunks_used,
            chunks_truncated: context.chunks_truncated,
            total_tokens: context.token_count,
            latency_ms: latencyMs,
        },
    };
}
/**
 * Validate retrieval options
 *
 * @param options - Options to validate
 * @returns Validation result
 */
export function validateRetrievalOptions(options) {
    const errors = [];
    if (!options.tenantId || options.tenantId.trim().length === 0) {
        errors.push('tenantId is required and cannot be empty');
    }
    if (!options.query || options.query.trim().length === 0) {
        errors.push('query is required and cannot be empty');
    }
    if (options.topK !== undefined && options.topK <= 0) {
        errors.push('topK must be positive');
    }
    if (options.bm25Limit !== undefined && options.bm25Limit <= 0) {
        errors.push('bm25Limit must be positive');
    }
    if (options.vectorLimit !== undefined && options.vectorLimit <= 0) {
        errors.push('vectorLimit must be positive');
    }
    if (options.contextMaxTokens !== undefined && options.contextMaxTokens <= 0) {
        errors.push('contextMaxTokens must be positive');
    }
    if (options.bm25Weight !== undefined && (options.bm25Weight < 0 || options.bm25Weight > 1)) {
        errors.push('bm25Weight must be between 0 and 1');
    }
    if (options.vectorWeight !== undefined && (options.vectorWeight < 0 || options.vectorWeight > 1)) {
        errors.push('vectorWeight must be between 0 and 1');
    }
    if (options.scoreThreshold !== undefined && options.scoreThreshold < 0) {
        errors.push('scoreThreshold must be non-negative');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
//# sourceMappingURL=hybrid.js.map