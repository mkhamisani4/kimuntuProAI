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
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) return 0;

  // Heuristic: ~1.3 tokens per word (based on GPT tokenizer stats)
  // Words are split by whitespace and punctuation
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordTokens = words.length * 1.3;

  // Add tokens for punctuation (rough estimate)
  const punctuation = text.match(/[.,;:!?(){}[\]"'`]/g)?.length || 0;
  const punctuationTokens = punctuation * 0.5;

  return Math.ceil(wordTokens + punctuationTokens);
}

/**
 * Build citation from chunk metadata
 *
 * @param chunk - Retrieved chunk
 * @param index - Citation index (1-based)
 * @returns Formatted citation
 */
export function buildCitation(chunk: RetrievedChunk, index: number): Citation {
  const citation: Citation = {
    id: `[${index}]`,
    source: chunk.metadata.document_name,
  };

  if (chunk.metadata.page !== undefined) {
    citation.page = chunk.metadata.page;
  }

  if (chunk.metadata.section) {
    citation.section = chunk.metadata.section;
  }

  // Include short excerpt (first 100 chars)
  if (chunk.content.length > 0) {
    citation.excerpt = chunk.content.slice(0, 100);
    if (chunk.content.length > 100) {
      citation.excerpt += '...';
    }
  }

  return citation;
}

/**
 * Format chunk with citation marker
 *
 * @param chunk - Retrieved chunk
 * @param citationIndex - Citation index (1-based)
 * @returns Formatted chunk text
 */
function formatChunkWithCitation(chunk: RetrievedChunk, citationIndex: number): string {
  const citation = `[${citationIndex}]`;
  const source = chunk.metadata.document_name;
  const page = chunk.metadata.page ? ` (p. ${chunk.metadata.page})` : '';

  return `${citation} ${source}${page}:\n${chunk.content}\n`;
}

/**
 * Pack chunks into context under token budget
 * Uses greedy packing: highest-ranked chunks first until budget exhausted
 *
 * @param chunks - Retrieved chunks (must be pre-sorted by rank)
 * @param maxTokens - Maximum token budget for context
 * @param reserveTokens - Tokens to reserve for formatting (default: 100)
 * @returns Packed context with citations
 */
export function packContext(
  chunks: RetrievedChunk[],
  maxTokens: number,
  reserveTokens: number = 100
): PackedContext {
  if (chunks.length === 0) {
    return {
      context: '',
      citations: [],
      token_count: 0,
      chunks_used: 0,
      chunks_truncated: 0,
    };
  }

  const budget = maxTokens - reserveTokens;
  const packed: string[] = [];
  const citations: Citation[] = [];
  let tokenCount = 0;
  let chunksUsed = 0;
  let chunksTruncated = 0;

  // Header
  const header = '=== Retrieved Context ===\n\n';
  const headerTokens = estimateTokens(header);
  packed.push(header);
  tokenCount += headerTokens;

  // Pack chunks greedily
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const citationIndex = i + 1;
    const formatted = formatChunkWithCitation(chunk, citationIndex);
    const chunkTokens = estimateTokens(formatted);

    // Check if chunk fits
    if (tokenCount + chunkTokens <= budget) {
      packed.push(formatted);
      citations.push(buildCitation(chunk, citationIndex));
      tokenCount += chunkTokens;
      chunksUsed++;
    } else {
      // Try to fit partial chunk if space remains
      const remainingTokens = budget - tokenCount;

      if (remainingTokens > 50) {
        // Enough space for partial chunk
        const chunkHeader = `[${citationIndex}] ${chunk.metadata.document_name}:\n`;
        const headerTokenEstimate = estimateTokens(chunkHeader);

        if (headerTokenEstimate < remainingTokens) {
          // Estimate how much content we can fit
          const contentBudget = remainingTokens - headerTokenEstimate - 10; // 10 token buffer
          const approxChars = Math.floor(contentBudget / 1.3 * 4); // Inverse of token estimation

          if (approxChars > 100) {
            const truncatedContent = chunk.content.slice(0, approxChars) + '...';
            const partial = `${chunkHeader}${truncatedContent}\n`;

            packed.push(partial);
            citations.push(buildCitation(chunk, citationIndex));
            tokenCount += estimateTokens(partial);
            chunksUsed++;
            chunksTruncated++;
          }
        }
      }

      // Budget exhausted
      break;
    }
  }

  // Footer with citation list
  if (citations.length > 0) {
    const footer = '\n=== Sources ===\n' + citations.map((c) => formatCitationLine(c)).join('\n');
    const footerTokens = estimateTokens(footer);

    // Only add footer if it fits
    if (tokenCount + footerTokens <= maxTokens) {
      packed.push(footer);
      tokenCount += footerTokens;
    }
  }

  return {
    context: packed.join('\n'),
    citations,
    token_count: tokenCount,
    chunks_used: chunksUsed,
    chunks_truncated: chunksTruncated,
  };
}

/**
 * Format citation as a single line for sources section
 *
 * @param citation - Citation to format
 * @returns Formatted citation line
 */
function formatCitationLine(citation: Citation): string {
  let line = `${citation.id} ${citation.source}`;

  if (citation.page !== undefined) {
    line += `, p. ${citation.page}`;
  }

  if (citation.section) {
    line += `, §${citation.section}`;
  }

  if (citation.url) {
    line += ` - ${citation.url}`;
  }

  return line;
}

/**
 * Validate chunks before packing
 * Ensures chunks have required fields and are properly sorted
 *
 * @param chunks - Chunks to validate
 * @returns Validation result with errors
 */
export function validateChunks(chunks: RetrievedChunk[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(chunks)) {
    errors.push('Chunks must be an array');
    return { valid: false, errors };
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    if (!chunk.id) {
      errors.push(`Chunk ${i}: missing id`);
    }

    if (!chunk.content || typeof chunk.content !== 'string') {
      errors.push(`Chunk ${i}: missing or invalid content`);
    }

    if (!chunk.metadata) {
      errors.push(`Chunk ${i}: missing metadata`);
    } else {
      if (!chunk.metadata.document_id) {
        errors.push(`Chunk ${i}: missing metadata.document_id`);
      }
      if (!chunk.metadata.document_name) {
        errors.push(`Chunk ${i}: missing metadata.document_name`);
      }
      if (chunk.metadata.chunk_index === undefined) {
        errors.push(`Chunk ${i}: missing metadata.chunk_index`);
      }
    }

    if (typeof chunk.score !== 'number') {
      errors.push(`Chunk ${i}: missing or invalid score`);
    }

    if (typeof chunk.rank !== 'number') {
      errors.push(`Chunk ${i}: missing or invalid rank`);
    }
  }

  // Check if sorted by rank (ascending)
  for (let i = 1; i < chunks.length; i++) {
    if (chunks[i].rank < chunks[i - 1].rank) {
      errors.push(`Chunks not sorted by rank: chunk ${i} has rank ${chunks[i].rank} < chunk ${i - 1} rank ${chunks[i - 1].rank}`);
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
