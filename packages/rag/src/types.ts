/**
 * RAG Types
 * Core types for document retrieval and vector search
 */

/**
 * Raw document metadata stored in Firestore
 */
export interface RawDoc {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  mime: string;
  storagePath: string;
  size: number;
  status: 'uploaded' | 'ingested' | 'error';
  pages?: number;
  errorMessage?: string;
  uploadedAt: Date;
  ingestedAt?: Date;
}

/**
 * Document chunk metadata (stored in Firestore)
 * Text content lives in vector DB only
 */
export interface Chunk {
  id: string;
  docId: string;
  tenantId: string;
  order: number;
  hash: string;
  length: number;
  page?: number;
  createdAt: Date;
}

/**
 * Retrieval result item with citation info
 */
export interface RetrievalItem {
  chunkId: string;
  docId: string;
  score: number;
  text: string;
  source: {
    title: string;
    url?: string;
    storagePath: string;
    page?: number;
  };
}

/**
 * Vector database client interface
 * Implementations: Weaviate, Pinecone
 */
export interface VectorClient {
  /**
   * Initialize the vector DB (create schema/index if needed)
   */
  initialize(): Promise<void>;

  /**
   * Upsert chunks with embeddings to vector DB
   */
  upsert(chunks: Array<{
    id: string;
    text: string;
    docId: string;
    tenantId: string;
    page?: number;
    embedding: number[];
  }>): Promise<void>;

  /**
   * Query vector DB for similar chunks
   */
  query(tenantId: string, queryEmbedding: number[], topK: number): Promise<RetrievalItem[]>;

  /**
   * Delete all chunks for a document
   */
  deleteDocument(docId: string): Promise<void>;

  /**
   * Health check
   */
  ping(): Promise<boolean>;
}

/**
 * Chunking options
 */
export interface ChunkOptions {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

/**
 * Document with extracted text
 */
export interface ProcessedDoc {
  text: string;
  pages?: Array<{ pageNum: number; text: string }>;
  metadata: {
    name: string;
    mime: string;
    size: number;
  };
}
