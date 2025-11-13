/**
 * Weaviate Vector Client (MVP)
 * Single collection for all tenant documents
 */

import weaviate, { WeaviateClient as WeaviateSDK, ApiKey } from 'weaviate-ts-client';
import type { VectorClient, RetrievalItem } from '../types.js';

const COLLECTION_NAME = 'KimuntuDocs';

export class WeaviateClient implements VectorClient {
  private client: WeaviateSDK;
  private initialized: boolean = false;

  constructor() {
    const host = process.env.WEAVIATE_HOST || 'http://localhost:8080';
    const apiKey = process.env.WEAVIATE_API_KEY;

    this.client = weaviate.client({
      scheme: host.startsWith('https') ? 'https' : 'http',
      host: host.replace(/^https?:\/\//, ''),
      apiKey: apiKey ? new ApiKey(apiKey) : undefined,
    });

    console.log(`[Weaviate] Client initialized for ${host}`);
  }

  /**
   * Initialize schema (create collection if doesn't exist)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if class exists
      const schema = await this.client.schema.getter().do();
      const classExists = schema.classes?.some((c: any) => c.class === COLLECTION_NAME);

      if (!classExists) {
        // Create class
        await this.client.schema
          .classCreator()
          .withClass({
            class: COLLECTION_NAME,
            description: 'KimuntuPro document chunks for RAG',
            vectorizer: 'none', // We provide embeddings
            properties: [
              {
                name: 'text',
                dataType: ['text'],
                description: 'Chunk text content',
              },
              {
                name: 'docId',
                dataType: ['string'],
                description: 'Parent document ID',
              },
              {
                name: 'tenantId',
                dataType: ['string'],
                description: 'Tenant ID for multi-tenancy',
              },
              {
                name: 'docTitle',
                dataType: ['string'],
                description: 'Document title',
              },
              {
                name: 'storagePath',
                dataType: ['string'],
                description: 'Firebase Storage path',
              },
              {
                name: 'page',
                dataType: ['int'],
                description: 'Page number (optional)',
              },
            ],
          })
          .do();

        console.log(`[Weaviate] Created class: ${COLLECTION_NAME}`);
      }

      this.initialized = true;
    } catch (error: any) {
      console.error('[Weaviate] Initialization failed:', error);
      throw new Error(`Weaviate initialization failed: ${error.message}`);
    }
  }

  /**
   * Upsert chunks with embeddings
   */
  async upsert(
    items: Array<{
      id: string;
      text: string;
      docId: string;
      tenantId: string;
      embedding: number[];
      page?: number;
      docTitle?: string;
      storagePath?: string;
    }>
  ): Promise<void> {
    await this.initialize();

    if (items.length === 0) {
      return;
    }

    try {
      // Batch upsert
      let batcher = this.client.batch.objectsBatcher();

      for (const item of items) {
        batcher = batcher.withObject({
          class: COLLECTION_NAME,
          id: item.id,
          properties: {
            text: item.text,
            docId: item.docId,
            tenantId: item.tenantId,
            docTitle: item.docTitle || '',
            storagePath: item.storagePath || '',
            page: item.page || null,
          },
          vector: item.embedding,
        });
      }

      const result = await batcher.do();

      // Check for errors
      if (result && Array.isArray(result)) {
        const errors = result.filter((r: any) => r.result?.errors);
        if (errors.length > 0) {
          console.error('[Weaviate] Upsert errors:', errors);
          throw new Error(`Failed to upsert ${errors.length} items`);
        }
      }

      console.log(`[Weaviate] Upserted ${items.length} chunks`);
    } catch (error: any) {
      console.error('[Weaviate] Upsert failed:', error);
      throw new Error(`Weaviate upsert failed: ${error.message}`);
    }
  }

  /**
   * Query for similar chunks (tenant-scoped)
   */
  async query(tenantId: string, queryEmbedding: number[], topK: number): Promise<RetrievalItem[]> {
    await this.initialize();

    try {
      const result = await this.client.graphql
        .get()
        .withClassName(COLLECTION_NAME)
        .withFields('text docId docTitle storagePath page _additional { id distance }')
        .withNearVector({ vector: queryEmbedding })
        .withWhere({
          path: ['tenantId'],
          operator: 'Equal',
          valueString: tenantId,
        })
        .withLimit(topK)
        .do();

      const items = result?.data?.Get?.[COLLECTION_NAME] || [];

      const retrievalItems: RetrievalItem[] = items.map((item: any) => ({
        chunkId: item._additional.id,
        docId: item.docId,
        score: 1 - (item._additional.distance || 0), // Convert distance to similarity
        text: item.text,
        source: {
          title: item.docTitle || 'Untitled Document',
          storagePath: item.storagePath,
          page: item.page || undefined,
        },
      }));

      console.log(`[Weaviate] Retrieved ${retrievalItems.length} chunks for tenant ${tenantId}`);
      return retrievalItems;
    } catch (error: any) {
      console.error('[Weaviate] Query failed:', error);
      throw new Error(`Weaviate query failed: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.misc.metaGetter().do();
      return !!result;
    } catch {
      return false;
    }
  }
}
