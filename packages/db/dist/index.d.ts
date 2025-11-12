/**
 * @kimuntupro/db
 * Database layer with Prisma and pgvector for KimuntuPro AI
 */
import { PrismaClient } from '@prisma/client';
export { PrismaClient } from '@prisma/client';
export type * from '@prisma/client';
declare global {
    var prisma: PrismaClient | undefined;
}
/**
 * Create or return existing Prisma client instance
 * Uses singleton pattern to prevent connection pool exhaustion
 */
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
/**
 * Database configuration type
 */
export type DatabaseConfig = {
    url: string;
    poolSize?: number;
};
/**
 * Initialize database connection
 * @returns Prisma client instance
 */
export declare function connectDatabase(): Promise<PrismaClient>;
/**
 * Disconnect from database
 */
export declare function disconnectDatabase(): Promise<void>;
export { bm25Search, vectorSearch, upsertEmbedding, bulkInsertEmbeddings, getChunk, countEmbeddings, type SearchResult, } from './embeddings.js';
export { recordUsage, sumTokensByUser, sumTokensByTenant, recentUsageByAssistant, purgeOldUsage, getUserUsageStats, getTenantUsageStats, type UsageRow, } from './usage.js';
//# sourceMappingURL=index.d.ts.map