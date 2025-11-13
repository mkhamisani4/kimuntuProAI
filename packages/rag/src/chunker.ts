/**
 * Text Chunker
 * Recursive character splitting with overlap and page awareness
 */

import type { ChunkOptions, ProcessedDoc } from './types.js';
import crypto from 'crypto';

/**
 * Default chunking configuration
 */
export const DEFAULT_CHUNK_OPTIONS: ChunkOptions = {
  chunkSize: 800,
  chunkOverlap: 160,
  separators: ['\n\n', '\n', '. ', ' ', ''],
};

/**
 * Chunk result with metadata
 */
export interface ChunkResult {
  text: string;
  order: number;
  hash: string;
  page?: number;
}

/**
 * Recursive character text splitter
 * Splits text by separators while respecting chunk size and overlap
 */
export function splitTextRecursive(
  text: string,
  options: ChunkOptions = DEFAULT_CHUNK_OPTIONS
): string[] {
  const { chunkSize, chunkOverlap, separators = DEFAULT_CHUNK_OPTIONS.separators! } = options;

  if (!text || text.length === 0) {
    return [];
  }

  // If text is small enough, return as single chunk
  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';

  // Try each separator in order
  for (const separator of separators) {
    if (separator === '') {
      // Last resort: character-level splitting
      for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
        chunks.push(text.slice(i, i + chunkSize));
      }
      return chunks;
    }

    const splits = text.split(separator);

    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];

      // If adding this split exceeds chunk size, finalize current chunk
      if (currentChunk.length + split.length + separator.length > chunkSize) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          // Start new chunk with overlap from previous
          const overlapText = currentChunk.slice(-chunkOverlap);
          currentChunk = overlapText + separator + split;
        } else {
          // Split is too large, recursively split it
          const subChunks = splitTextRecursive(split, {
            ...options,
            separators: separators.slice(1),
          });
          chunks.push(...subChunks);
          currentChunk = '';
        }
      } else {
        // Add to current chunk
        if (currentChunk.length > 0) {
          currentChunk += separator;
        }
        currentChunk += split;
      }
    }

    // If we successfully chunked, return
    if (chunks.length > 0 || currentChunk.length > 0) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
      }
      return chunks;
    }
  }

  return chunks;
}

/**
 * Chunk a processed document with page awareness
 */
export function chunkDocument(
  doc: ProcessedDoc,
  options: ChunkOptions = DEFAULT_CHUNK_OPTIONS
): ChunkResult[] {
  const chunks: ChunkResult[] = [];

  if (doc.pages && doc.pages.length > 0) {
    // Page-aware chunking
    let order = 0;

    for (const page of doc.pages) {
      const pageChunks = splitTextRecursive(page.text, options);

      for (const chunkText of pageChunks) {
        chunks.push({
          text: chunkText,
          order,
          hash: hashText(chunkText),
          page: page.pageNum,
        });
        order++;
      }
    }
  } else {
    // Simple text chunking
    const textChunks = splitTextRecursive(doc.text, options);

    for (let i = 0; i < textChunks.length; i++) {
      chunks.push({
        text: textChunks[i],
        order: i,
        hash: hashText(textChunks[i]),
      });
    }
  }

  console.log(`[Chunker] Split document into ${chunks.length} chunks`);
  return chunks;
}

/**
 * Generate hash for chunk deduplication
 */
export function hashText(text: string): string {
  return crypto.createHash('sha256').update(text.trim()).digest('hex').slice(0, 16);
}

/**
 * Merge small chunks to reach minimum size
 */
export function mergeSmallChunks(chunks: string[], minSize: number): string[] {
  if (chunks.length === 0) return [];

  const merged: string[] = [];
  let current = chunks[0];

  for (let i = 1; i < chunks.length; i++) {
    if (current.length < minSize) {
      current += ' ' + chunks[i];
    } else {
      merged.push(current);
      current = chunks[i];
    }
  }

  if (current.length > 0) {
    merged.push(current);
  }

  return merged;
}
