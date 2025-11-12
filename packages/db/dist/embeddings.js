/**
 * Embedding and Retrieval Queries for RAG
 * Implements BM25 (Postgres FTS) and pgvector search with multi-tenant support
 */
import { prisma } from './index.js';
import { Prisma } from '@prisma/client';
/**
 * BM25 search using Postgres full-text search
 * Uses to_tsquery for query parsing and ts_rank for scoring
 *
 * @param tenantId - Tenant ID for multi-tenant scoping
 * @param query - Search query
 * @param limit - Maximum results to return (default: 50)
 * @returns Search results sorted by BM25 score (desc)
 */
export async function bm25Search(tenantId, query, limit = 50) {
    // Validate inputs
    if (!tenantId || tenantId.trim().length === 0) {
        throw new Error('tenantId is required');
    }
    if (!query || query.trim().length === 0) {
        throw new Error('query is required');
    }
    if (limit <= 0) {
        throw new Error('limit must be positive');
    }
    // Sanitize query for to_tsquery (replace spaces with &)
    const sanitizedQuery = query
        .trim()
        .replace(/[^\w\s-]/g, ' ') // Remove special chars except hyphens
        .split(/\s+/)
        .filter((w) => w.length > 0)
        .join(' & ');
    if (sanitizedQuery.length === 0) {
        return [];
    }
    try {
        // Use Prisma raw query with parameterization
        const results = await prisma.$queryRaw(Prisma.sql `
        SELECT
          c.id as chunk_id,
          c.content,
          ts_rank(to_tsvector('english', c.content), query) as score,
          d.id as document_id,
          d.title as document_title,
          c."createdAt" as chunk_created_at
        FROM chunks c
        INNER JOIN documents d ON c."documentId" = d.id
        CROSS JOIN to_tsquery('english', ${sanitizedQuery}) query
        WHERE
          c."tenantId" = ${tenantId}::text
          AND to_tsvector('english', c.content) @@ query
        ORDER BY score DESC
        LIMIT ${limit}
      `);
        // Map to SearchResult format
        return results.map((row, index) => ({
            id: row.chunk_id,
            content: row.content,
            score: row.score,
            metadata: {
                document_id: row.document_id,
                document_name: row.document_title,
                chunk_index: index, // Rank-based index
                timestamp: row.chunk_created_at.toISOString(),
            },
        }));
    }
    catch (error) {
        console.error('BM25 search error:', error);
        throw new Error(`BM25 search failed: ${error.message}`);
    }
}
/**
 * Vector search using pgvector cosine similarity
 * Uses <=> operator for cosine distance (1 - cosine similarity)
 *
 * @param tenantId - Tenant ID for multi-tenant scoping
 * @param queryEmbedding - Query embedding vector (1536 dimensions for OpenAI)
 * @param limit - Maximum results to return (default: 50)
 * @returns Search results sorted by similarity (desc)
 */
export async function vectorSearch(tenantId, queryEmbedding, limit = 50) {
    // Validate inputs
    if (!tenantId || tenantId.trim().length === 0) {
        throw new Error('tenantId is required');
    }
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
        throw new Error('queryEmbedding must be a non-empty array');
    }
    if (limit <= 0) {
        throw new Error('limit must be positive');
    }
    try {
        // Convert embedding to Postgres vector format: '[1.0, 2.0, ...]'
        const vectorStr = `[${queryEmbedding.join(',')}]`;
        // Use Prisma raw query with cosine distance operator
        const results = await prisma.$queryRaw(Prisma.sql `
        SELECT
          c.id as chunk_id,
          c.content,
          (e.vector <=> ${vectorStr}::vector) as distance,
          d.id as document_id,
          d.title as document_title,
          c."createdAt" as chunk_created_at
        FROM embeddings e
        INNER JOIN chunks c ON e."chunkId" = c.id
        INNER JOIN documents d ON c."documentId" = d.id
        WHERE
          e."tenantId" = ${tenantId}::text
        ORDER BY distance ASC
        LIMIT ${limit}
      `);
        // Convert distance to similarity score (1 - distance)
        // pgvector <=> returns cosine distance [0, 2], where 0 = identical
        return results.map((row, index) => ({
            id: row.chunk_id,
            content: row.content,
            score: 1 - row.distance, // Convert to similarity
            metadata: {
                document_id: row.document_id,
                document_name: row.document_title,
                chunk_index: index,
                timestamp: row.chunk_created_at.toISOString(),
            },
        }));
    }
    catch (error) {
        console.error('Vector search error:', error);
        throw new Error(`Vector search failed: ${error.message}`);
    }
}
/**
 * Insert or update embedding for a chunk
 * Upserts embedding vector for a chunk in multi-tenant context
 *
 * @param chunkId - Chunk ID
 * @param tenantId - Tenant ID
 * @param embedding - Embedding vector (1536 dimensions)
 * @returns Embedding ID
 */
export async function upsertEmbedding(chunkId, tenantId, embedding) {
    // Validate inputs
    if (!chunkId || chunkId.trim().length === 0) {
        throw new Error('chunkId is required');
    }
    if (!tenantId || tenantId.trim().length === 0) {
        throw new Error('tenantId is required');
    }
    if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('embedding must be a non-empty array');
    }
    try {
        // Convert to vector string format
        const vectorStr = `[${embedding.join(',')}]`;
        // Upsert using raw SQL (Prisma doesn't support vector type directly)
        await prisma.$executeRaw(Prisma.sql `
        INSERT INTO embeddings (id, "chunkId", "tenantId", vector, "createdAt")
        VALUES (
          gen_random_uuid()::text,
          ${chunkId}::text,
          ${tenantId}::text,
          ${vectorStr}::vector,
          NOW()
        )
        ON CONFLICT ("chunkId")
        DO UPDATE SET
          vector = EXCLUDED.vector,
          "createdAt" = NOW()
      `);
        return chunkId; // Return chunk ID as reference
    }
    catch (error) {
        console.error('Upsert embedding error:', error);
        throw new Error(`Upsert embedding failed: ${error.message}`);
    }
}
/**
 * Bulk insert embeddings for multiple chunks
 * More efficient than individual upserts
 *
 * @param embeddings - Array of chunk-embedding pairs
 * @returns Number of embeddings inserted
 */
export async function bulkInsertEmbeddings(embeddings) {
    if (!Array.isArray(embeddings) || embeddings.length === 0) {
        return 0;
    }
    try {
        // Build VALUES clause
        const values = embeddings
            .map(({ chunkId, tenantId, embedding }) => {
            const vectorStr = `[${embedding.join(',')}]`;
            return `(gen_random_uuid()::text, '${chunkId}', '${tenantId}', '${vectorStr}'::vector, NOW())`;
        })
            .join(',');
        // Execute bulk insert
        await prisma.$executeRawUnsafe(`
      INSERT INTO embeddings (id, "chunkId", "tenantId", vector, "createdAt")
      VALUES ${values}
      ON CONFLICT ("chunkId")
      DO UPDATE SET
        vector = EXCLUDED.vector,
        "createdAt" = NOW()
    `);
        return embeddings.length;
    }
    catch (error) {
        console.error('Bulk insert embeddings error:', error);
        throw new Error(`Bulk insert embeddings failed: ${error.message}`);
    }
}
/**
 * Get chunk by ID with tenant validation
 *
 * @param chunkId - Chunk ID
 * @param tenantId - Tenant ID
 * @returns Chunk with document metadata or null
 */
export async function getChunk(chunkId, tenantId) {
    try {
        const chunk = await prisma.chunk.findFirst({
            where: {
                id: chunkId,
                tenantId: tenantId,
            },
            include: {
                document: true,
            },
        });
        if (!chunk) {
            return null;
        }
        return {
            id: chunk.id,
            content: chunk.content,
            score: 1.0, // Perfect score for direct lookup
            metadata: {
                document_id: chunk.documentId,
                document_name: chunk.document.title,
                chunk_index: 0,
                timestamp: chunk.createdAt.toISOString(),
            },
        };
    }
    catch (error) {
        console.error('Get chunk error:', error);
        throw new Error(`Get chunk failed: ${error.message}`);
    }
}
/**
 * Count total embeddings for a tenant
 * Useful for usage tracking and limits
 *
 * @param tenantId - Tenant ID
 * @returns Number of embeddings
 */
export async function countEmbeddings(tenantId) {
    try {
        return await prisma.embedding.count({
            where: {
                tenantId: tenantId,
            },
        });
    }
    catch (error) {
        console.error('Count embeddings error:', error);
        throw new Error(`Count embeddings failed: ${error.message}`);
    }
}
//# sourceMappingURL=embeddings.js.map