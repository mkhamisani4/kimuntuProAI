/**
 * @kimuntupro/shared
 * Shared types and utilities for KimuntuPro AI
 *
 * Provides shared TypeScript types, Zod schemas, and utilities
 * for use across ai-core, Business Track UI, and API routes
 */
// Export all types
export * from './types.js';
// Export all schemas
export * from './schemas.js';
// Export all utilities
export * from './utils/index.js';
export function getAppInfo() {
    return {
        version: '0.0.1',
        name: 'KimuntuPro AI',
    };
}
//# sourceMappingURL=index.js.map