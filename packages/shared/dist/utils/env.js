/**
 * Environment variable loader with validation
 * NOTE: Does NOT load .env files - expects runtime (Next.js/Node) to handle that
 */
import { z } from 'zod';
/**
 * Environment schema with all required and optional variables
 */
const EnvSchema = z.object({
    // Database
    DATABASE_URL: z.string().url(),
    // OpenAI
    OPENAI_API_KEY: z.string().min(1),
    OPENAI_ORG_ID: z.string().optional(),
    // Models
    MODEL_MINI: z.string().default('gpt-4o-mini'),
    MODEL_ESCALATION: z.string().default('gpt-4o'),
    EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
    // Cost Controls
    MAX_TOKENS_PLANNER: z.coerce.number().int().positive().default(4000),
    MAX_TOKENS_EXECUTOR: z.coerce.number().int().positive().default(8000),
    DAILY_TOKEN_QUOTA_PER_USER: z.coerce.number().int().positive().default(100000),
    MAX_COST_PER_REQUEST: z.coerce.number().positive().default(0.5),
    // Web Search
    WEBSEARCH_PROVIDER: z.enum(['tavily', 'serpapi', 'bing', 'mcp']).default('tavily'),
    WEBSEARCH_API_KEY: z.string().min(1),
    WEBSEARCH_RATE_LIMIT: z.coerce.number().int().positive().default(100),
    WEBSEARCH_MAX_RESULTS: z.coerce.number().int().positive().default(10),
    // RAG Configuration
    RETRIEVAL_TOP_K: z.coerce.number().int().positive().default(20),
    RETRIEVAL_FINAL_K: z.coerce.number().int().positive().default(8),
    CHUNK_SIZE: z.coerce.number().int().positive().default(500),
    CHUNK_OVERLAP: z.coerce.number().int().nonnegative().default(50),
    CONTEXT_TOKEN_LIMIT: z.coerce.number().int().positive().default(2000),
    // Feature Flags (defaults)
    FEATURE_AI_ASSISTANT_ENABLED: z.coerce.boolean().default(true),
    FEATURE_STREAMLINED_PLAN_ENABLED: z.coerce.boolean().default(true),
    FEATURE_EXEC_SUMMARY_ENABLED: z.coerce.boolean().default(true),
    FEATURE_MARKET_ANALYSIS_ENABLED: z.coerce.boolean().default(true),
    // Batch API
    BATCH_ENABLED: z.coerce.boolean().default(false),
    BATCH_CHECK_INTERVAL_MS: z.coerce.number().int().positive().default(60000),
    // Monitoring
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    ENABLE_USAGE_TRACKING: z.coerce.boolean().default(true),
    ENABLE_POLICY_VALIDATION: z.coerce.boolean().default(true),
    ENABLE_PROMPT_CACHING: z.coerce.boolean().default(true),
    // Node environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});
/**
 * Validated environment variables
 * Throws error if validation fails
 */
let cachedEnv = null;
/**
 * Get validated environment variables
 * @throws {Error} If validation fails
 */
export function getEnv() {
    if (cachedEnv) {
        return cachedEnv;
    }
    try {
        cachedEnv = EnvSchema.parse(process.env);
        return cachedEnv;
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
            throw new Error(`Environment validation failed:\n${issues.join('\n')}`);
        }
        throw error;
    }
}
/**
 * Get environment variable safely without throwing
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 */
export function getEnvVar(key, defaultValue) {
    return process.env[key] ?? defaultValue;
}
/**
 * Check if running in production
 */
export function isProduction() {
    return process.env.NODE_ENV === 'production';
}
/**
 * Check if running in development
 */
export function isDevelopment() {
    return process.env.NODE_ENV === 'development';
}
/**
 * Check if running in test
 */
export function isTest() {
    return process.env.NODE_ENV === 'test';
}
//# sourceMappingURL=env.js.map