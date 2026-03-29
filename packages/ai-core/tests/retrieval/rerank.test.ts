/**
 * Tests for reranking and fusion
 */

import { describe, it, expect } from 'vitest';
import {
  fuseRRF,
  fuseWeighted,
  deduplicateChunks,
  applyScoreThreshold,
  truncateTopK,
  normalizeScores,
  rerankPipeline,
  DEFAULT_RRF_CONFIG,
  type SearchResult,
  type RetrievedChunk,
} from '../../src/retrieval/rerank.js';

describe('fuseRRF', () => {
  const createSearchResult = (id: string, score: number): SearchResult => ({
    id,
    score,
    content: `Content ${id}`,
    metadata: {
      document_id: `doc-${id}`,
      document_name: `Document ${id}`,
      chunk_index: 0,
    },
  });

  it('should fuse results using RRF formula', () => {
    const bm25Results = [
      createSearchResult('1', 10.0),
      createSearchResult('2', 8.0),
      createSearchResult('3', 6.0),
    ];

    const vectorResults = [
      createSearchResult('2', 0.95),
      createSearchResult('1', 0.90),
      createSearchResult('4', 0.85),
    ];

    const fused = fuseRRF(bm25Results, vectorResults);

    expect(fused).toHaveLength(4); // 1, 2, 3, 4
    // Both 1 and 2 appear in both results, so they should rank highest
    const topTwoIds = new Set([fused[0].id, fused[1].id]);
    expect(topTwoIds.has('1')).toBe(true);
    expect(topTwoIds.has('2')).toBe(true);
    expect(fused.every((chunk) => chunk.rank > 0)).toBe(true);
    expect(fused.every((chunk) => chunk.score > 0)).toBe(true);
  });

  it('should handle empty BM25 results', () => {
    const bm25Results: SearchResult[] = [];
    const vectorResults = [createSearchResult('1', 0.9)];

    const fused = fuseRRF(bm25Results, vectorResults);

    expect(fused).toHaveLength(1);
    expect(fused[0].id).toBe('1');
  });

  it('should handle empty vector results', () => {
    const bm25Results = [createSearchResult('1', 10.0)];
    const vectorResults: SearchResult[] = [];

    const fused = fuseRRF(bm25Results, vectorResults);

    expect(fused).toHaveLength(1);
    expect(fused[0].id).toBe('1');
  });

  it('should handle both empty', () => {
    const fused = fuseRRF([], []);
    expect(fused).toHaveLength(0);
  });

  it('should respect RRF weights', () => {
    const bm25Results = [createSearchResult('1', 10.0)];
    const vectorResults = [createSearchResult('2', 0.9)];

    // Favor BM25
    const fusedBM25 = fuseRRF(bm25Results, vectorResults, {
      k: 60,
      bm25_weight: 0.9,
      vector_weight: 0.1,
    });

    expect(fusedBM25[0].id).toBe('1'); // BM25 result should rank higher

    // Favor vector
    const fusedVector = fuseRRF(bm25Results, vectorResults, {
      k: 60,
      bm25_weight: 0.1,
      vector_weight: 0.9,
    });

    expect(fusedVector[0].id).toBe('2'); // Vector result should rank higher
  });

  it('should assign sequential ranks', () => {
    const bm25Results = [
      createSearchResult('1', 10.0),
      createSearchResult('2', 8.0),
    ];
    const vectorResults = [createSearchResult('3', 0.9)];

    const fused = fuseRRF(bm25Results, vectorResults);

    expect(fused[0].rank).toBe(1);
    expect(fused[1].rank).toBe(2);
    expect(fused[2].rank).toBe(3);
  });
});

describe('fuseWeighted', () => {
  const createSearchResult = (id: string, score: number): SearchResult => ({
    id,
    score,
    content: `Content ${id}`,
    metadata: {
      document_id: `doc-${id}`,
      document_name: `Document ${id}`,
      chunk_index: 0,
    },
  });

  it('should fuse using weighted scores', () => {
    const bm25Results = [createSearchResult('1', 10.0)];
    const vectorResults = [createSearchResult('1', 0.9)];

    const fused = fuseWeighted(bm25Results, vectorResults, 0.3, 0.7);

    expect(fused).toHaveLength(1);
    expect(fused[0].id).toBe('1');
    // Weighted score = 0.3 * 10.0 + 0.7 * 0.9 = 3.63
    expect(fused[0].score).toBeCloseTo(3.63, 2);
  });

  it('should handle results in only one method', () => {
    const bm25Results = [createSearchResult('1', 10.0)];
    const vectorResults = [createSearchResult('2', 0.9)];

    const fused = fuseWeighted(bm25Results, vectorResults, 0.5, 0.5);

    expect(fused).toHaveLength(2);
    // Result 1: 0.5 * 10.0 + 0.5 * 0 = 5.0
    // Result 2: 0.5 * 0 + 0.5 * 0.9 = 0.45
    expect(fused[0].score).toBe(5.0);
    expect(fused[1].score).toBe(0.45);
  });

  it('should sort by weighted score descending', () => {
    const bm25Results = [
      createSearchResult('1', 5.0),
      createSearchResult('2', 10.0),
    ];
    const vectorResults = [
      createSearchResult('1', 0.9),
      createSearchResult('2', 0.5),
    ];

    const fused = fuseWeighted(bm25Results, vectorResults, 0.3, 0.7);

    // Result 1: 0.3 * 5.0 + 0.7 * 0.9 = 2.13
    // Result 2: 0.3 * 10.0 + 0.7 * 0.5 = 3.35
    expect(fused[0].id).toBe('2'); // Higher weighted score
    expect(fused[1].id).toBe('1');
  });
});

describe('deduplicateChunks', () => {
  const createChunk = (id: string, rank: number): RetrievedChunk => ({
    id,
    content: `Content ${id}`,
    score: 1.0 / rank,
    rank,
    metadata: {
      document_id: `doc-${id}`,
      document_name: `Document ${id}`,
      chunk_index: 0,
    },
  });

  it('should remove duplicate IDs', () => {
    const chunks = [
      createChunk('1', 1),
      createChunk('2', 2),
      createChunk('1', 3), // Duplicate
    ];

    const deduplicated = deduplicateChunks(chunks);

    expect(deduplicated).toHaveLength(2);
    expect(deduplicated.map((c) => c.id)).toEqual(['1', '2']);
  });

  it('should keep first occurrence', () => {
    const chunks = [
      createChunk('1', 1), // Keep this
      createChunk('1', 2), // Remove
    ];

    const deduplicated = deduplicateChunks(chunks);

    expect(deduplicated).toHaveLength(1);
    expect(deduplicated[0].rank).toBe(1); // First occurrence
  });

  it('should handle no duplicates', () => {
    const chunks = [createChunk('1', 1), createChunk('2', 2)];

    const deduplicated = deduplicateChunks(chunks);

    expect(deduplicated).toHaveLength(2);
  });

  it('should handle empty array', () => {
    const deduplicated = deduplicateChunks([]);
    expect(deduplicated).toHaveLength(0);
  });
});

describe('applyScoreThreshold', () => {
  const createChunk = (id: string, score: number): RetrievedChunk => ({
    id,
    content: `Content ${id}`,
    score,
    rank: 1,
    metadata: {
      document_id: `doc-${id}`,
      document_name: `Document ${id}`,
      chunk_index: 0,
    },
  });

  it('should filter chunks below threshold', () => {
    const chunks = [
      createChunk('1', 0.9),
      createChunk('2', 0.05),
      createChunk('3', 0.001),
    ];

    const filtered = applyScoreThreshold(chunks, 0.1);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should keep chunks at or above threshold', () => {
    const chunks = [
      createChunk('1', 0.1),
      createChunk('2', 0.11),
    ];

    const filtered = applyScoreThreshold(chunks, 0.1);

    expect(filtered).toHaveLength(2);
  });

  it('should handle empty array', () => {
    const filtered = applyScoreThreshold([], 0.1);
    expect(filtered).toHaveLength(0);
  });
});

describe('truncateTopK', () => {
  const createChunk = (id: string, rank: number): RetrievedChunk => ({
    id,
    content: `Content ${id}`,
    score: 1.0 / rank,
    rank,
    metadata: {
      document_id: `doc-${id}`,
      document_name: `Document ${id}`,
      chunk_index: 0,
    },
  });

  it('should truncate to top K', () => {
    const chunks = [
      createChunk('1', 1),
      createChunk('2', 2),
      createChunk('3', 3),
      createChunk('4', 4),
    ];

    const truncated = truncateTopK(chunks, 2);

    expect(truncated).toHaveLength(2);
    expect(truncated.map((c) => c.id)).toEqual(['1', '2']);
  });

  it('should return all if K >= length', () => {
    const chunks = [createChunk('1', 1), createChunk('2', 2)];

    const truncated = truncateTopK(chunks, 5);

    expect(truncated).toHaveLength(2);
  });

  it('should handle empty array', () => {
    const truncated = truncateTopK([], 5);
    expect(truncated).toHaveLength(0);
  });
});

describe('normalizeScores', () => {
  const createSearchResult = (id: string, score: number): SearchResult => ({
    id,
    score,
    content: `Content ${id}`,
    metadata: {
      document_id: `doc-${id}`,
      document_name: `Document ${id}`,
      chunk_index: 0,
    },
  });

  it('should normalize scores to [0, 1]', () => {
    const results = [
      createSearchResult('1', 10.0),
      createSearchResult('2', 5.0),
      createSearchResult('3', 0.0),
    ];

    const normalized = normalizeScores(results);

    expect(normalized[0].score).toBe(1.0); // Max
    expect(normalized[1].score).toBe(0.5); // Middle
    expect(normalized[2].score).toBe(0.0); // Min
  });

  it('should handle all same scores', () => {
    const results = [
      createSearchResult('1', 5.0),
      createSearchResult('2', 5.0),
    ];

    const normalized = normalizeScores(results);

    expect(normalized[0].score).toBe(1.0);
    expect(normalized[1].score).toBe(1.0);
  });

  it('should handle empty array', () => {
    const normalized = normalizeScores([]);
    expect(normalized).toHaveLength(0);
  });
});

describe('rerankPipeline', () => {
  const createSearchResult = (id: string, score: number): SearchResult => ({
    id,
    score,
    content: `Content ${id}`,
    metadata: {
      document_id: `doc-${id}`,
      document_name: `Document ${id}`,
      chunk_index: 0,
    },
  });

  it('should apply full pipeline with RRF', () => {
    const bm25Results = [
      createSearchResult('1', 10.0),
      createSearchResult('2', 8.0),
    ];

    const vectorResults = [
      createSearchResult('2', 0.9),
      createSearchResult('3', 0.8),
    ];

    const reranked = rerankPipeline(bm25Results, vectorResults, {
      method: 'rrf',
      topK: 2,
      scoreThreshold: 0.001,
    });

    expect(reranked.length).toBeLessThanOrEqual(2);
    expect(reranked.every((c) => c.score >= 0.001)).toBe(true);
  });

  it('should apply full pipeline with weighted fusion', () => {
    const bm25Results = [createSearchResult('1', 10.0)];
    const vectorResults = [createSearchResult('1', 0.9)];

    const reranked = rerankPipeline(bm25Results, vectorResults, {
      method: 'weighted',
      bm25Weight: 0.3,
      vectorWeight: 0.7,
      topK: 10,
    });

    expect(reranked).toHaveLength(1);
    expect(reranked[0].id).toBe('1');
  });

  it('should handle empty inputs', () => {
    const reranked = rerankPipeline([], [], {});
    expect(reranked).toHaveLength(0);
  });

  it('should respect topK limit', () => {
    const bm25Results = Array.from({ length: 50 }, (_, i) =>
      createSearchResult(`${i}`, 50 - i)
    );

    const vectorResults = Array.from({ length: 50 }, (_, i) =>
      createSearchResult(`${i}`, (50 - i) / 50)
    );

    const reranked = rerankPipeline(bm25Results, vectorResults, {
      topK: 10,
    });

    expect(reranked.length).toBeLessThanOrEqual(10);
  });

  it('should filter by score threshold', () => {
    const bm25Results = [createSearchResult('1', 0.001)];
    const vectorResults = [createSearchResult('1', 0.001)];

    const reranked = rerankPipeline(bm25Results, vectorResults, {
      scoreThreshold: 0.1, // High threshold
    });

    // Should filter out low-scoring result
    expect(reranked.length).toBeLessThanOrEqual(1);
  });
});
