/**
 * @kimuntupro/db
 * Database layer with Prisma and pgvector for KimuntuPro AI
 */

import { PrismaClient } from '@prisma/client';

// Re-export Prisma client and types
export { PrismaClient } from '@prisma/client';
export type * from '@prisma/client';

// Global Prisma instance for Next.js hot reload
// Prevents multiple instances during development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

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
export async function connectDatabase(): Promise<PrismaClient> {
  try {
    await prisma.$connect();
    console.log('✓ Database connected');
    return prisma;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('✓ Database disconnected');
}

// Export embedding and retrieval functions
export {
  bm25Search,
  vectorSearch,
  upsertEmbedding,
  bulkInsertEmbeddings,
  getChunk,
  countEmbeddings,
  type SearchResult,
} from './embeddings.js';

// Export usage tracking functions
export {
  recordUsage,
  sumTokensByUser,
  sumTokensByTenant,
  recentUsageByAssistant,
  purgeOldUsage,
  getUserUsageStats,
  getTenantUsageStats,
  type UsageRow,
} from './usage.js';
