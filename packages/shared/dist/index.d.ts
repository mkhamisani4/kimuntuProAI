/**
 * @kimuntupro/shared
 * Shared types and utilities for KimuntuPro AI
 *
 * Provides shared TypeScript types, Zod schemas, and utilities
 * for use across ai-core, Business Track UI, and API routes
 */
export * from './types.js';
export * from './schemas.js';
export * from './utils/index.js';
export type AppMetadata = {
    version: string;
    name: string;
};
export declare function getAppInfo(): AppMetadata;
//# sourceMappingURL=index.d.ts.map