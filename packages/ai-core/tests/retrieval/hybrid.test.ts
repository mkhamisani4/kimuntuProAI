/**
 * Tests for hybrid retrieval orchestration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  retrieveHybrid,
  retrieveVectorOnly,
  validateRetrievalOptions,
  type HybridRetrievalOptions,
  type BM25QueryFn,
  type VectorQueryFn,
  type EmbeddingFn,
  type SearchResult,
} from '../../src/retrieval/hybrid.js';

describe('retrieveHybrid', () => {
  let mockBM25Query: BM25QueryFn;
  let mockVectorQuery: VectorQueryFn;
  let mockEmbed: EmbeddingFn;

  beforeEach(() => {
    mockBM25Query = vi.fn(async (tenantId, query, limit) => {
      return [
        {
          id: 'chunk-1',
          content: 'BM25 result',
          score: 10.0,
          metadata: {
            document_id: 'doc-1',
            document_name: 'Doc 1',
            chunk_index: 0,
          },
        },
      ];
    });

    mockVectorQuery = vi.fn(async (tenantId, embedding, limit) => {
      return [
        {
          id: 'chunk-2',
          content: 'Vector result',
          score: 0.9,
          metadata: {
            document_id: 'doc-2',
            document_name: 'Doc 2',
            chunk_index: 0,
          },
        },
      ];
    });

    mockEmbed = vi.fn(async (text) => {
      return new Array(1536).fill(0.1);
    });
  });

  it('should retrieve and fuse results', async () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: 'business plan',
      topK: 10,
      scoreThreshold: 0.001, // Low threshold to allow RRF scores through
    };

    const result = await retrieveHybrid(options, mockBM25Query, mockVectorQuery, mockEmbed);

    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.context.context).toBeTruthy();
    expect(result.context.citations.length).toBeGreaterThan(0);
    expect(result.stats.bm25_results).toBeGreaterThan(0);
    expect(result.stats.vector_results).toBeGreaterThan(0);
    expect(result.stats.latency_ms).toBeGreaterThanOrEqual(0);
  });

  it('should call embedding function with query', async () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: 'business plan',
    };

    await retrieveHybrid(options, mockBM25Query, mockVectorQuery, mockEmbed);

    expect(mockEmbed).toHaveBeenCalledWith('business plan');
  });

  it('should call BM25 and vector queries in parallel', async () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: 'business plan',
    };

    await retrieveHybrid(options, mockBM25Query, mockVectorQuery, mockEmbed);

    expect(mockBM25Query).toHaveBeenCalledWith('tenant-123', 'business plan', 50);
    expect(mockVectorQuery).toHaveBeenCalled();
  });

  it('should throw error for missing tenantId', async () => {
    const options: HybridRetrievalOptions = {
      tenantId: '',
      query: 'business plan',
    };

    await expect(
      retrieveHybrid(options, mockBM25Query, mockVectorQuery, mockEmbed)
    ).rejects.toThrow('tenantId is required');
  });

  it('should throw error for missing query', async () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: '',
    };

    await expect(
      retrieveHybrid(options, mockBM25Query, mockVectorQuery, mockEmbed)
    ).rejects.toThrow('query is required');
  });

  it('should respect topK parameter', async () => {
    const mockBM25WithMany: BM25QueryFn = vi.fn(async () => {
      return Array.from({ length: 100 }, (_, i) => ({
        id: `chunk-${i}`,
        content: `Content ${i}`,
        score: 100 - i,
        metadata: {
          document_id: `doc-${i}`,
          document_name: `Doc ${i}`,
          chunk_index: 0,
        },
      }));
    });

    const mockVectorWithMany: VectorQueryFn = vi.fn(async () => {
      return Array.from({ length: 100 }, (_, i) => ({
        id: `chunk-v-${i}`,
        content: `Vector content ${i}`,
        score: (100 - i) / 100,
        metadata: {
          document_id: `doc-v-${i}`,
          document_name: `Doc V ${i}`,
          chunk_index: 0,
        },
      }));
    });

    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: 'business plan',
      topK: 5,
    };

    const result = await retrieveHybrid(options, mockBM25WithMany, mockVectorWithMany, mockEmbed);

    expect(result.chunks.length).toBeLessThanOrEqual(5);
  });

  it('should respect context token budget', async () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: 'business plan',
      contextMaxTokens: 100, // Very small budget
    };

    const result = await retrieveHybrid(options, mockBM25Query, mockVectorQuery, mockEmbed);

    expect(result.context.token_count).toBeLessThanOrEqual(100);
  });

  it('should use RRF fusion by default', async () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: 'business plan',
    };

    const result = await retrieveHybrid(options, mockBM25Query, mockVectorQuery, mockEmbed);

    // RRF should produce ranked results
    expect(result.chunks.every((c) => c.rank > 0)).toBe(true);
    expect(result.chunks.every((c) => c.score > 0)).toBe(true);
  });

  it('should support weighted fusion', async () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: 'business plan',
      rerankMethod: 'weighted',
      bm25Weight: 0.3,
      vectorWeight: 0.7,
    };

    const result = await retrieveHybrid(options, mockBM25Query, mockVectorQuery, mockEmbed);

    expect(result.chunks.length).toBeGreaterThan(0);
  });

  it('should track stats correctly', async () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: 'business plan',
    };

    const result = await retrieveHybrid(options, mockBM25Query, mockVectorQuery, mockEmbed);

    expect(result.stats).toMatchObject({
      bm25_results: expect.any(Number),
      vector_results: expect.any(Number),
      fused_results: expect.any(Number),
      chunks_used: expect.any(Number),
      chunks_truncated: expect.any(Number),
      total_tokens: expect.any(Number),
      latency_ms: expect.any(Number),
    });
  });
});

describe('retrieveVectorOnly', () => {
  const mockVectorQuery: VectorQueryFn = vi.fn(async (tenantId, embedding, limit) => {
    return [
      {
        id: 'chunk-1',
        content: 'Vector result 1',
        score: 0.95,
        metadata: {
          document_id: 'doc-1',
          document_name: 'Doc 1',
          chunk_index: 0,
        },
      },
      {
        id: 'chunk-2',
        content: 'Vector result 2',
        score: 0.85,
        metadata: {
          document_id: 'doc-2',
          document_name: 'Doc 2',
          chunk_index: 0,
        },
      },
    ];
  });

  const mockEmbed: EmbeddingFn = vi.fn(async (text) => {
    return new Array(1536).fill(0.1);
  });

  it('should retrieve vector results only', async () => {
    const options = {
      tenantId: 'tenant-123',
      query: 'business plan',
    };

    const result = await retrieveVectorOnly(options, mockVectorQuery, mockEmbed);

    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.stats.bm25_results).toBe(0); // No BM25
    expect(result.stats.vector_results).toBeGreaterThan(0);
  });

  it('should throw error for missing tenantId', async () => {
    const options = {
      tenantId: '',
      query: 'business plan',
    };

    await expect(retrieveVectorOnly(options, mockVectorQuery, mockEmbed)).rejects.toThrow(
      'tenantId is required'
    );
  });

  it('should throw error for missing query', async () => {
    const options = {
      tenantId: 'tenant-123',
      query: '',
    };

    await expect(retrieveVectorOnly(options, mockVectorQuery, mockEmbed)).rejects.toThrow(
      'query is required'
    );
  });

  it('should filter by score threshold', async () => {
    const mockVectorWithLowScores: VectorQueryFn = vi.fn(async () => {
      return [
        {
          id: 'chunk-1',
          content: 'High score',
          score: 0.9,
          metadata: {
            document_id: 'doc-1',
            document_name: 'Doc 1',
            chunk_index: 0,
          },
        },
        {
          id: 'chunk-2',
          content: 'Low score',
          score: 0.001,
          metadata: {
            document_id: 'doc-2',
            document_name: 'Doc 2',
            chunk_index: 0,
          },
        },
      ];
    });

    const options = {
      tenantId: 'tenant-123',
      query: 'business plan',
      scoreThreshold: 0.5,
    };

    const result = await retrieveVectorOnly(options, mockVectorWithLowScores, mockEmbed);

    expect(result.chunks.length).toBe(1);
    expect(result.chunks[0].id).toBe('chunk-1');
  });

  it('should respect topK limit', async () => {
    const mockVectorWithMany: VectorQueryFn = vi.fn(async () => {
      return Array.from({ length: 50 }, (_, i) => ({
        id: `chunk-${i}`,
        content: `Content ${i}`,
        score: (50 - i) / 50,
        metadata: {
          document_id: `doc-${i}`,
          document_name: `Doc ${i}`,
          chunk_index: 0,
        },
      }));
    });

    const options = {
      tenantId: 'tenant-123',
      query: 'business plan',
      topK: 10,
    };

    const result = await retrieveVectorOnly(options, mockVectorWithMany, mockEmbed);

    expect(result.chunks.length).toBeLessThanOrEqual(10);
  });
});

describe('validateRetrievalOptions', () => {
  it('should validate correct options', () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: 'business plan',
      topK: 10,
      contextMaxTokens: 4000,
    };

    const result = validateRetrievalOptions(options);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing tenantId', () => {
    const options: HybridRetrievalOptions = {
      tenantId: '',
      query: 'business plan',
    };

    const result = validateRetrievalOptions(options);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('tenantId is required and cannot be empty');
  });

  it('should detect missing query', () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: '',
    };

    const result = validateRetrievalOptions(options);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('query is required and cannot be empty');
  });

  it('should detect invalid topK', () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: 'business plan',
      topK: -5,
    };

    const result = validateRetrievalOptions(options);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('topK must be positive');
  });

  it('should detect invalid weights', () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: 'business plan',
      bm25Weight: 1.5, // > 1
      vectorWeight: -0.1, // < 0
    };

    const result = validateRetrievalOptions(options);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should detect invalid score threshold', () => {
    const options: HybridRetrievalOptions = {
      tenantId: 'tenant-123',
      query: 'business plan',
      scoreThreshold: -0.1,
    };

    const result = validateRetrievalOptions(options);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('scoreThreshold must be non-negative');
  });
});
