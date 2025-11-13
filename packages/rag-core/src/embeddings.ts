/**
 * OpenAI Embeddings Wrapper (MVP)
 * Batching + retry logic
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const BATCH_SIZE = 100; // OpenAI allows up to 2048
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Generate embeddings for a batch of texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const allEmbeddings: number[][] = [];

  // Process in batches
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const batchEmbeddings = await generateBatchWithRetry(batch);
    allEmbeddings.push(...batchEmbeddings);

    console.log(`[Embeddings] Generated ${allEmbeddings.length}/${texts.length} embeddings`);
  }

  return allEmbeddings;
}

/**
 * Generate embeddings for a single batch with retry logic
 */
async function generateBatchWithRetry(texts: string[], retries = 0): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  } catch (error: any) {
    if (retries < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, retries);
      console.warn(`[Embeddings] Error, retrying in ${delay}ms...`, error.message);
      await sleep(delay);
      return generateBatchWithRetry(texts, retries + 1);
    }

    console.error('[Embeddings] Failed after retries:', error);
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
}

/**
 * Generate embedding for a single query
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const embeddings = await generateEmbeddings([query]);
  return embeddings[0];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
