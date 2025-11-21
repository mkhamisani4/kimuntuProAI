/**
 * Simple Text Chunker (MVP)
 * Character-based splitting with overlap
 */

import type { ChunkResult } from './types.js';

export interface ChunkOptions {
  chunkSize: number;
  chunkOverlap: number;
}

export const DEFAULT_CHUNK_OPTIONS: ChunkOptions = {
  chunkSize: 800,
  chunkOverlap: 160,
};

/**
 * Split text into chunks with overlap
 */
export function chunkText(text: string, options: ChunkOptions = DEFAULT_CHUNK_OPTIONS): ChunkResult[] {
  const { chunkSize, chunkOverlap } = options;
  const chunks: ChunkResult[] = [];

  if (!text || text.trim().length === 0) {
    return chunks;
  }

  const cleanText = text.trim();

  // If text is smaller than chunk size, return as single chunk
  if (cleanText.length <= chunkSize) {
    chunks.push({
      text: cleanText,
      order: 0,
    });
    return chunks;
  }

  let start = 0;
  let order = 0;

  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length);
    let chunkText = cleanText.slice(start, end);

    // Try to break at word boundary if not at end
    if (end < cleanText.length) {
      const lastSpace = chunkText.lastIndexOf(' ');
      if (lastSpace > chunkSize / 2) {
        // Only break at space if it's in the latter half of the chunk
        chunkText = chunkText.slice(0, lastSpace);
      }
    }

    chunks.push({
      text: chunkText.trim(),
      order,
    });

    // Move start position with overlap
    start += chunkText.length - chunkOverlap;
    order++;
  }

  console.log(`[Chunker] Split into ${chunks.length} chunks`);
  return chunks;
}
