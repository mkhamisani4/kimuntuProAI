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
  k: number; // Constant for RRF formula (default: 60)
  bm25_weight: number; // Weight for BM25 results (default: 0.5)
  vector_weight: number; // Weight for vector results (default: 0.5)
}

/**
 * Default RRF configuration
 */
export const DEFAULT_RRF_CONFIG: RRFConfig = {
  k: 60,
  bm25_weight: 0.5,
  vector_weight: 0.5,
};

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
export function fuseRRF(
  bm25Results: SearchResult[],
  vectorResults: SearchResult[],
  config: RRFConfig = DEFAULT_RRF_CONFIG
): RetrievedChunk[] {
  const { k, bm25_weight, vector_weight } = config;

  // Build rank maps
  const bm25Ranks = new Map<string, number>();
  const vectorRanks = new Map<string, number>();
  const allResults = new Map<string, SearchResult>();

  // BM25 ranks (1-indexed)
  for (let i = 0; i < bm25Results.length; i++) {
    const result = bm25Results[i];
    bm25Ranks.set(result.id, i + 1);
    allResults.set(result.id, result);
  }

  // Vector ranks (1-indexed)
  for (let i = 0; i < vectorResults.length; i++) {
    const result = vectorResults[i];
    vectorRanks.set(result.id, i + 1);

    // If not already in map from BM25, add it
    if (!allResults.has(result.id)) {
      allResults.set(result.id, result);
    }
  }

  // Compute RRF scores
  const rrfScores: Array<{ id: string; score: number }> = [];

  for (const [id] of allResults.entries()) {
    let rrfScore = 0;

    // BM25 contribution
    const bm25Rank = bm25Ranks.get(id);
    if (bm25Rank !== undefined) {
      rrfScore += bm25_weight / (k + bm25Rank);
    }

    // Vector contribution
    const vectorRank = vectorRanks.get(id);
    if (vectorRank !== undefined) {
      rrfScore += vector_weight / (k + vectorRank);
    }

    rrfScores.push({ id, score: rrfScore });
  }

  // Sort by RRF score descending
  rrfScores.sort((a, b) => b.score - a.score);

  // Build final RetrievedChunk array
  const fused: RetrievedChunk[] = [];

  for (let i = 0; i < rrfScores.length; i++) {
    const { id, score } = rrfScores[i];
    const result = allResults.get(id)!;

    fused.push({
      id: result.id,
      content: result.content,
      metadata: result.metadata,
      score, // RRF score
      rank: i + 1, // Final rank (1-indexed)
    });
  }

  return fused;
}

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
export function fuseWeighted(
  bm25Results: SearchResult[],
  vectorResults: SearchResult[],
  bm25Weight: number = 0.3,
  vectorWeight: number = 0.7
): RetrievedChunk[] {
  const allResults = new Map<string, SearchResult>();
  const bm25Scores = new Map<string, number>();
  const vectorScores = new Map<string, number>();

  // Collect BM25 results
  for (const result of bm25Results) {
    bm25Scores.set(result.id, result.score);
    allResults.set(result.id, result);
  }

  // Collect vector results
  for (const result of vectorResults) {
    vectorScores.set(result.id, result.score);

    if (!allResults.has(result.id)) {
      allResults.set(result.id, result);
    }
  }

  // Compute weighted scores
  const weightedScores: Array<{ id: string; score: number }> = [];

  for (const [id] of allResults.entries()) {
    const bm25Score = bm25Scores.get(id) || 0;
    const vectorScore = vectorScores.get(id) || 0;

    const weightedScore = bm25Weight * bm25Score + vectorWeight * vectorScore;

    weightedScores.push({ id, score: weightedScore });
  }

  // Sort by weighted score descending
  weightedScores.sort((a, b) => b.score - a.score);

  // Build final RetrievedChunk array
  const fused: RetrievedChunk[] = [];

  for (let i = 0; i < weightedScores.length; i++) {
    const { id, score } = weightedScores[i];
    const result = allResults.get(id)!;

    fused.push({
      id: result.id,
      content: result.content,
      metadata: result.metadata,
      score,
      rank: i + 1,
    });
  }

  return fused;
}

/**
 * Deduplicate results by ID, keeping highest-ranked occurrence
 *
 * @param chunks - Retrieved chunks (may have duplicates)
 * @returns Deduplicated chunks
 */
export function deduplicateChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
  const seen = new Set<string>();
  const deduplicated: RetrievedChunk[] = [];

  for (const chunk of chunks) {
    if (!seen.has(chunk.id)) {
      deduplicated.push(chunk);
      seen.add(chunk.id);
    }
  }

  return deduplicated;
}

/**
 * Apply minimum score threshold
 * Filters out chunks below threshold
 *
 * @param chunks - Retrieved chunks
 * @param threshold - Minimum score (default: 0.01)
 * @returns Filtered chunks
 */
export function applyScoreThreshold(
  chunks: RetrievedChunk[],
  threshold: number = 0.01
): RetrievedChunk[] {
  return chunks.filter((chunk) => chunk.score >= threshold);
}

/**
 * Truncate results to top K
 *
 * @param chunks - Retrieved chunks (must be sorted by rank)
 * @param topK - Maximum number of chunks to return
 * @returns Top K chunks
 */
export function truncateTopK(chunks: RetrievedChunk[], topK: number): RetrievedChunk[] {
  if (chunks.length <= topK) {
    return chunks;
  }

  return chunks.slice(0, topK);
}

/**
 * Normalize scores to [0, 1] range using min-max normalization
 *
 * @param results - Search results
 * @returns Results with normalized scores
 */
export function normalizeScores(results: SearchResult[]): SearchResult[] {
  if (results.length === 0) return [];

  const scores = results.map((r) => r.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  // If all scores are the same, return as-is
  if (maxScore === minScore) {
    return results.map((r) => ({ ...r, score: 1.0 }));
  }

  // Min-max normalization
  return results.map((r) => ({
    ...r,
    score: (r.score - minScore) / (maxScore - minScore),
  }));
}

/**
 * Rerank pipeline: fuse, deduplicate, threshold, truncate
 *
 * @param bm25Results - BM25 search results
 * @param vectorResults - Vector search results
 * @param options - Pipeline options
 * @returns Processed chunks ready for packing
 */
export function rerankPipeline(
  bm25Results: SearchResult[],
  vectorResults: SearchResult[],
  options: {
    method?: 'rrf' | 'weighted';
    rrfConfig?: RRFConfig;
    bm25Weight?: number;
    vectorWeight?: number;
    scoreThreshold?: number;
    topK?: number;
  } = {}
): RetrievedChunk[] {
  const {
    method = 'rrf',
    rrfConfig = DEFAULT_RRF_CONFIG,
    bm25Weight = 0.3,
    vectorWeight = 0.7,
    scoreThreshold = 0.01,
    topK = 20,
  } = options;

  // Fusion
  let fused: RetrievedChunk[];
  if (method === 'rrf') {
    fused = fuseRRF(bm25Results, vectorResults, rrfConfig);
  } else {
    fused = fuseWeighted(bm25Results, vectorResults, bm25Weight, vectorWeight);
  }

  // Deduplicate (should be unnecessary after fusion, but safe)
  let processed = deduplicateChunks(fused);

  // Apply score threshold
  processed = applyScoreThreshold(processed, scoreThreshold);

  // Truncate to top K
  processed = truncateTopK(processed, topK);

  return processed;
}
