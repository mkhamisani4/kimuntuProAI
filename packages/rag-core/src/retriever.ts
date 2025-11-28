/**
 * RAG Retriever (MVP)
 * Query vector DB and return relevant chunks
 */

import { WeaviateClient } from './vector/weaviate.js';
import { generateQueryEmbedding } from './embeddings.js';
import type { RetrievalItem } from './types.js';

let vectorClient: WeaviateClient | null = null;

/**
 * Get or create vector client singleton
 */
function getVectorClient(): WeaviateClient {
  if (!vectorClient) {
    vectorClient = new WeaviateClient();
  }
  return vectorClient;
}

/**
 * Retrieve relevant chunks for a query
 */
export async function retrieve(options: {
  tenantId: string;
  query: string;
  topK?: number;
}): Promise<RetrievalItem[]> {
  const { tenantId, query, topK = 8 } = options;

  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    // Generate query embedding
    console.log(`[Retriever] Generating embedding for query: "${query.slice(0, 50)}..."`);
    const queryEmbedding = await generateQueryEmbedding(query);

    // Query vector DB
    const client = getVectorClient();
    const results = await client.query(tenantId, queryEmbedding, topK);

    console.log(`[Retriever] Retrieved ${results.length} chunks for tenant ${tenantId}`);
    return results;
  } catch (error: any) {
    console.error('[Retriever] Failed:', error);
    throw new Error(`Retrieval failed: ${error.message}`);
  }
}

/**
 * Test vector DB connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = getVectorClient();
    return await client.ping();
  } catch {
    return false;
  }
}
