/**
 * @kimuntupro/db
 * Database layer with Prisma and pgvector for KimuntuPro AI
 */
import { PrismaClient } from '@prisma/client';
// Re-export Prisma client and types
export { PrismaClient } from '@prisma/client';
/**
 * Create or return existing Prisma client instance
 * Uses singleton pattern to prevent connection pool exhaustion
 */
export const prisma = global.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
/**
 * Initialize database connection
 * @returns Prisma client instance
 */
export async function connectDatabase() {
    try {
        await prisma.$connect();
        console.log('✓ Database connected');
        return prisma;
    }
    catch (error) {
        console.error('✗ Database connection failed:', error);
        throw error;
    }
}
/**
 * Disconnect from database
 */
export async function disconnectDatabase() {
    await prisma.$disconnect();
    console.log('✓ Database disconnected');
}
// Export embedding and retrieval functions
export { bm25Search, vectorSearch, upsertEmbedding, bulkInsertEmbeddings, getChunk, countEmbeddings, } from './embeddings.js';
// Export usage tracking functions
export { recordUsage, sumTokensByUser, sumTokensByTenant, recentUsageByAssistant, purgeOldUsage, getUserUsageStats, getTenantUsageStats, } from './usage.js';
//# sourceMappingURL=index.js.map