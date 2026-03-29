/**
 * RAG Core Types (MVP)
 */

export interface RawDoc {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  mime: string;
  storagePath: string;
  size: number;
  uploadedAt: Date;
}

export interface RetrievalItem {
  chunkId: string;
  docId: string;
  score: number;
  text: string;
  source: {
    title: string;
    storagePath: string;
    page?: number;
  };
}

export interface VectorClient {
  upsert(items: Array<{
    id: string;
    text: string;
    docId: string;
    tenantId: string;
    embedding: number[];
    page?: number;
  }>): Promise<void>;

  query(tenantId: string, queryEmbedding: number[], topK: number): Promise<RetrievalItem[]>;
}

export interface ChunkResult {
  text: string;
  order: number;
  page?: number;
}
