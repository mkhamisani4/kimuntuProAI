/**
 * Tests for context packing and token estimation
 */

import { describe, it, expect } from 'vitest';
import {
  estimateTokens,
  packContext,
  buildCitation,
  validateChunks,
  type RetrievedChunk,
} from '../../src/retrieval/context.js';

describe('estimateTokens', () => {
  it('should estimate tokens for simple text', () => {
    const text = 'Hello world';
    const tokens = estimateTokens(text);
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(10); // Rough estimate
  });

  it('should return 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('should estimate tokens for text with punctuation', () => {
    const text = 'Hello, world! How are you?';
    const tokens = estimateTokens(text);
    expect(tokens).toBeGreaterThan(5);
    expect(tokens).toBeLessThan(15);
  });

  it('should estimate more tokens for longer text', () => {
    const short = 'Hello world';
    const long = 'Hello world '.repeat(10);
    expect(estimateTokens(long)).toBeGreaterThan(estimateTokens(short));
  });
});

describe('buildCitation', () => {
  it('should build citation with all metadata', () => {
    const chunk: RetrievedChunk = {
      id: 'chunk-1',
      content: 'This is some content about business planning.',
      score: 0.95,
      rank: 1,
      metadata: {
        document_id: 'doc-1',
        document_name: 'Business Plan.pdf',
        chunk_index: 0,
        page: 5,
        section: 'Executive Summary',
      },
    };

    const citation = buildCitation(chunk, 1);

    expect(citation.id).toBe('[1]');
    expect(citation.source).toBe('Business Plan.pdf');
    expect(citation.page).toBe(5);
    expect(citation.section).toBe('Executive Summary');
    expect(citation.excerpt).toContain('This is some content');
  });

  it('should truncate long excerpts', () => {
    const chunk: RetrievedChunk = {
      id: 'chunk-1',
      content: 'x'.repeat(200),
      score: 0.95,
      rank: 1,
      metadata: {
        document_id: 'doc-1',
        document_name: 'Test.pdf',
        chunk_index: 0,
      },
    };

    const citation = buildCitation(chunk, 1);

    expect(citation.excerpt).toHaveLength(103); // 100 chars + '...'
    expect(citation.excerpt?.endsWith('...')).toBe(true);
  });

  it('should handle missing optional metadata', () => {
    const chunk: RetrievedChunk = {
      id: 'chunk-1',
      content: 'Content',
      score: 0.95,
      rank: 1,
      metadata: {
        document_id: 'doc-1',
        document_name: 'Test.pdf',
        chunk_index: 0,
      },
    };

    const citation = buildCitation(chunk, 1);

    expect(citation.id).toBe('[1]');
    expect(citation.source).toBe('Test.pdf');
    expect(citation.page).toBeUndefined();
    expect(citation.section).toBeUndefined();
  });
});

describe('packContext', () => {
  const createChunk = (id: string, content: string, rank: number): RetrievedChunk => ({
    id,
    content,
    score: 1.0 / rank,
    rank,
    metadata: {
      document_id: `doc-${id}`,
      document_name: `Document ${id}`,
      chunk_index: 0,
    },
  });

  it('should pack single chunk under budget', () => {
    const chunks = [createChunk('1', 'Short content', 1)];

    const packed = packContext(chunks, 1000);

    expect(packed.chunks_used).toBe(1);
    expect(packed.chunks_truncated).toBe(0);
    expect(packed.citations).toHaveLength(1);
    expect(packed.token_count).toBeGreaterThan(0);
    expect(packed.token_count).toBeLessThan(1000);
    expect(packed.context).toContain('Short content');
    expect(packed.context).toContain('[1]');
  });

  it('should pack multiple chunks under budget', () => {
    const chunks = [
      createChunk('1', 'First chunk', 1),
      createChunk('2', 'Second chunk', 2),
      createChunk('3', 'Third chunk', 3),
    ];

    const packed = packContext(chunks, 1000);

    expect(packed.chunks_used).toBe(3);
    expect(packed.citations).toHaveLength(3);
    expect(packed.context).toContain('First chunk');
    expect(packed.context).toContain('Second chunk');
    expect(packed.context).toContain('Third chunk');
  });

  it('should respect token budget', () => {
    const chunks = [
      createChunk('1', 'x'.repeat(1000), 1),
      createChunk('2', 'x'.repeat(1000), 2),
      createChunk('3', 'x'.repeat(1000), 3),
    ];

    const packed = packContext(chunks, 500);

    expect(packed.token_count).toBeLessThanOrEqual(500);
    expect(packed.chunks_used).toBeLessThanOrEqual(3); // May truncate some chunks
  });

  it('should return empty context for empty chunks', () => {
    const packed = packContext([], 1000);

    expect(packed.chunks_used).toBe(0);
    expect(packed.chunks_truncated).toBe(0);
    expect(packed.citations).toHaveLength(0);
    expect(packed.context).toBe('');
    expect(packed.token_count).toBe(0);
  });

  it('should include sources section', () => {
    const chunks = [createChunk('1', 'Content', 1)];

    const packed = packContext(chunks, 1000);

    expect(packed.context).toContain('=== Sources ===');
    expect(packed.context).toContain('[1] Document 1');
  });

  it('should truncate chunk if partial fit available', () => {
    const chunks = [
      createChunk('1', 'Small chunk', 1),
      createChunk('2', 'x'.repeat(10000), 2), // Very large chunk
    ];

    // Budget enough for first chunk + partial second
    const packed = packContext(chunks, 300);

    expect(packed.chunks_used).toBeGreaterThan(0);
    // May truncate second chunk if space available
  });

  it('should maintain citation indices', () => {
    const chunks = [
      createChunk('1', 'First', 1),
      createChunk('2', 'Second', 2),
    ];

    const packed = packContext(chunks, 1000);

    expect(packed.context).toContain('[1] Document 1');
    expect(packed.context).toContain('[2] Document 2');
  });
});

describe('validateChunks', () => {
  it('should validate correct chunks', () => {
    const chunks: RetrievedChunk[] = [
      {
        id: 'chunk-1',
        content: 'Content 1',
        score: 0.9,
        rank: 1,
        metadata: {
          document_id: 'doc-1',
          document_name: 'Doc 1',
          chunk_index: 0,
        },
      },
      {
        id: 'chunk-2',
        content: 'Content 2',
        score: 0.8,
        rank: 2,
        metadata: {
          document_id: 'doc-2',
          document_name: 'Doc 2',
          chunk_index: 0,
        },
      },
    ];

    const result = validateChunks(chunks);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing required fields', () => {
    const chunks: any[] = [
      {
        // Missing id
        content: 'Content',
        score: 0.9,
        rank: 1,
        metadata: {
          document_id: 'doc-1',
          document_name: 'Doc 1',
          chunk_index: 0,
        },
      },
    ];

    const result = validateChunks(chunks);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Chunk 0: missing id');
  });

  it('should detect missing metadata fields', () => {
    const chunks: any[] = [
      {
        id: 'chunk-1',
        content: 'Content',
        score: 0.9,
        rank: 1,
        metadata: {
          // Missing document_id and document_name
          chunk_index: 0,
        },
      },
    ];

    const result = validateChunks(chunks);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should detect incorrect rank ordering', () => {
    const chunks: RetrievedChunk[] = [
      {
        id: 'chunk-1',
        content: 'Content 1',
        score: 0.9,
        rank: 2, // Wrong order
        metadata: {
          document_id: 'doc-1',
          document_name: 'Doc 1',
          chunk_index: 0,
        },
      },
      {
        id: 'chunk-2',
        content: 'Content 2',
        score: 0.8,
        rank: 1, // Wrong order
        metadata: {
          document_id: 'doc-2',
          document_name: 'Doc 2',
          chunk_index: 0,
        },
      },
    ];

    const result = validateChunks(chunks);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('not sorted by rank'))).toBe(true);
  });

  it('should reject non-array input', () => {
    const result = validateChunks(null as any);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Chunks must be an array');
  });
});
