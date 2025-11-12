/**
 * Retrieval System (RAG) Exports
 * Hybrid BM25 + vector retrieval with RRF fusion
 */

// Context packing
export {
  estimateTokens,
  packContext,
  buildCitation,
  validateChunks,
  type RetrievedChunk,
  type PackedContext,
  type Citation,
} from './context.js';

// Reranking and fusion
export {
  fuseRRF,
  fuseWeighted,
  deduplicateChunks,
  applyScoreThreshold,
  truncateTopK,
  normalizeScores,
  rerankPipeline,
  type SearchResult,
  type RRFConfig,
  DEFAULT_RRF_CONFIG,
} from './rerank.js';

// Hybrid retrieval orchestration
export {
  retrieveHybrid,
  retrieveVectorOnly,
  validateRetrievalOptions,
  type HybridRetrievalOptions,
  type HybridRetrievalResult,
  type BM25QueryFn,
  type VectorQueryFn,
  type EmbeddingFn,
} from './hybrid.js';
