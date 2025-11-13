/**
 * Environment variable loader with validation
 * NOTE: Does NOT load .env files - expects runtime (Next.js/Node) to handle that
 */
import { z } from 'zod';
/**
 * Environment schema with all required and optional variables
 */
declare const EnvSchema: z.ZodObject<{
    DATABASE_URL: z.ZodString;
    OPENAI_API_KEY: z.ZodString;
    OPENAI_ORG_ID: z.ZodOptional<z.ZodString>;
    MODEL_MINI: z.ZodDefault<z.ZodString>;
    MODEL_ESCALATION: z.ZodDefault<z.ZodString>;
    EMBEDDING_MODEL: z.ZodDefault<z.ZodString>;
    MAX_TOKENS_PLANNER: z.ZodDefault<z.ZodNumber>;
    MAX_TOKENS_EXECUTOR: z.ZodDefault<z.ZodNumber>;
    DAILY_TOKEN_QUOTA_PER_USER: z.ZodDefault<z.ZodNumber>;
    MAX_COST_PER_REQUEST: z.ZodDefault<z.ZodNumber>;
    WEBSEARCH_PROVIDER: z.ZodDefault<z.ZodEnum<["tavily", "serpapi", "bing", "mcp"]>>;
    WEBSEARCH_API_KEY: z.ZodString;
    WEBSEARCH_RATE_LIMIT: z.ZodDefault<z.ZodNumber>;
    WEBSEARCH_MAX_RESULTS: z.ZodDefault<z.ZodNumber>;
    RETRIEVAL_TOP_K: z.ZodDefault<z.ZodNumber>;
    RETRIEVAL_FINAL_K: z.ZodDefault<z.ZodNumber>;
    CHUNK_SIZE: z.ZodDefault<z.ZodNumber>;
    CHUNK_OVERLAP: z.ZodDefault<z.ZodNumber>;
    CONTEXT_TOKEN_LIMIT: z.ZodDefault<z.ZodNumber>;
    FEATURE_AI_ASSISTANT_ENABLED: z.ZodDefault<z.ZodBoolean>;
    FEATURE_STREAMLINED_PLAN_ENABLED: z.ZodDefault<z.ZodBoolean>;
    FEATURE_EXEC_SUMMARY_ENABLED: z.ZodDefault<z.ZodBoolean>;
    FEATURE_MARKET_ANALYSIS_ENABLED: z.ZodDefault<z.ZodBoolean>;
    BATCH_ENABLED: z.ZodDefault<z.ZodBoolean>;
    BATCH_CHECK_INTERVAL_MS: z.ZodDefault<z.ZodNumber>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    ENABLE_USAGE_TRACKING: z.ZodDefault<z.ZodBoolean>;
    ENABLE_POLICY_VALIDATION: z.ZodDefault<z.ZodBoolean>;
    ENABLE_PROMPT_CACHING: z.ZodDefault<z.ZodBoolean>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
}, "strip", z.ZodTypeAny, {
    DATABASE_URL: string;
    OPENAI_API_KEY: string;
    MODEL_MINI: string;
    MODEL_ESCALATION: string;
    EMBEDDING_MODEL: string;
    MAX_TOKENS_PLANNER: number;
    MAX_TOKENS_EXECUTOR: number;
    DAILY_TOKEN_QUOTA_PER_USER: number;
    MAX_COST_PER_REQUEST: number;
    WEBSEARCH_PROVIDER: "tavily" | "serpapi" | "bing" | "mcp";
    WEBSEARCH_API_KEY: string;
    WEBSEARCH_RATE_LIMIT: number;
    WEBSEARCH_MAX_RESULTS: number;
    RETRIEVAL_TOP_K: number;
    RETRIEVAL_FINAL_K: number;
    CHUNK_SIZE: number;
    CHUNK_OVERLAP: number;
    CONTEXT_TOKEN_LIMIT: number;
    FEATURE_AI_ASSISTANT_ENABLED: boolean;
    FEATURE_STREAMLINED_PLAN_ENABLED: boolean;
    FEATURE_EXEC_SUMMARY_ENABLED: boolean;
    FEATURE_MARKET_ANALYSIS_ENABLED: boolean;
    BATCH_ENABLED: boolean;
    BATCH_CHECK_INTERVAL_MS: number;
    LOG_LEVEL: "error" | "debug" | "info" | "warn";
    ENABLE_USAGE_TRACKING: boolean;
    ENABLE_POLICY_VALIDATION: boolean;
    ENABLE_PROMPT_CACHING: boolean;
    NODE_ENV: "development" | "production" | "test";
    OPENAI_ORG_ID?: string | undefined;
}, {
    DATABASE_URL: string;
    OPENAI_API_KEY: string;
    WEBSEARCH_API_KEY: string;
    OPENAI_ORG_ID?: string | undefined;
    MODEL_MINI?: string | undefined;
    MODEL_ESCALATION?: string | undefined;
    EMBEDDING_MODEL?: string | undefined;
    MAX_TOKENS_PLANNER?: number | undefined;
    MAX_TOKENS_EXECUTOR?: number | undefined;
    DAILY_TOKEN_QUOTA_PER_USER?: number | undefined;
    MAX_COST_PER_REQUEST?: number | undefined;
    WEBSEARCH_PROVIDER?: "tavily" | "serpapi" | "bing" | "mcp" | undefined;
    WEBSEARCH_RATE_LIMIT?: number | undefined;
    WEBSEARCH_MAX_RESULTS?: number | undefined;
    RETRIEVAL_TOP_K?: number | undefined;
    RETRIEVAL_FINAL_K?: number | undefined;
    CHUNK_SIZE?: number | undefined;
    CHUNK_OVERLAP?: number | undefined;
    CONTEXT_TOKEN_LIMIT?: number | undefined;
    FEATURE_AI_ASSISTANT_ENABLED?: boolean | undefined;
    FEATURE_STREAMLINED_PLAN_ENABLED?: boolean | undefined;
    FEATURE_EXEC_SUMMARY_ENABLED?: boolean | undefined;
    FEATURE_MARKET_ANALYSIS_ENABLED?: boolean | undefined;
    BATCH_ENABLED?: boolean | undefined;
    BATCH_CHECK_INTERVAL_MS?: number | undefined;
    LOG_LEVEL?: "error" | "debug" | "info" | "warn" | undefined;
    ENABLE_USAGE_TRACKING?: boolean | undefined;
    ENABLE_POLICY_VALIDATION?: boolean | undefined;
    ENABLE_PROMPT_CACHING?: boolean | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
}>;
export type Env = z.infer<typeof EnvSchema>;
/**
 * Get validated environment variables
 * @throws {Error} If validation fails
 */
export declare function getEnv(): Env;
/**
 * Get environment variable safely without throwing
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 */
export declare function getEnvVar(key: string, defaultValue?: string): string | undefined;
/**
 * Check if running in production
 */
export declare function isProduction(): boolean;
/**
 * Check if running in development
 */
export declare function isDevelopment(): boolean;
/**
 * Check if running in test
 */
export declare function isTest(): boolean;
export {};
//# sourceMappingURL=env.d.ts.map