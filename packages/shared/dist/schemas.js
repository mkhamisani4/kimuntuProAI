/**
 * Zod Validation Schemas for KimuntuPro AI
 * Provides runtime validation for all shared types
 */
import { z } from 'zod';
// ============================================================================
// ASSISTANT SCHEMAS
// ============================================================================
export const AssistantTypeSchema = z.enum([
    'streamlined_plan',
    'exec_summary',
    'financial_overview',
    'market_analysis',
]);
export const AssistantRequestSchema = z.object({
    assistant: AssistantTypeSchema,
    input: z.string().min(1, 'Input is required').max(10000, 'Input too long'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    extra: z.record(z.any()).optional(),
});
export const AssistantSourceSchema = z.object({
    type: z.enum(['rag', 'web']),
    title: z.string().optional(),
    url: z.string().url().optional(),
    docId: z.string().optional(),
    snippet: z.string(),
});
export const AssistantResponseSchema = z.object({
    assistant: AssistantTypeSchema,
    sections: z.record(z.string()),
    sources: z.array(AssistantSourceSchema),
    rawModelOutput: z.string(),
    metadata: z
        .object({
        model: z.string(),
        tokensUsed: z.number().int().nonnegative(),
        latencyMs: z.number().int().nonnegative(),
        cost: z.number().nonnegative(),
        toolInvocations: z
            .object({
            retrieval: z.number().int().nonnegative().optional(),
            webSearch: z.number().int().nonnegative().optional(),
            finance: z.number().int().nonnegative().optional(),
        })
            .optional(),
    })
        .optional(),
});
// ============================================================================
// PLANNER SCHEMAS (Stage A)
// ============================================================================
export const PlannerInputSchema = z.object({
    assistant: AssistantTypeSchema,
    input: z.string().min(1, 'Input is required').max(10000, 'Input too long'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    extra: z.record(z.any()).optional(),
});
export const PlannerOutputSchema = z.object({
    task: AssistantTypeSchema,
    requires_retrieval: z.boolean(),
    requires_web_search: z.boolean(),
    query_terms: z.array(z.string()).min(0).max(20, 'Too many query terms'),
    sections: z.array(z.string()).min(1, 'At least one section required').max(15, 'Too many sections'),
    metrics_needed: z.array(z.string()).min(0).max(10, 'Too many metrics'),
    escalate_model: z.boolean(),
});
// ============================================================================
// USAGE LOGGING SCHEMAS
// ============================================================================
export const ToolInvocationsSchema = z.object({
    retrieval: z.number().int().nonnegative(),
    webSearch: z.number().int().nonnegative(),
    finance: z.number().int().nonnegative(),
});
export const UsageMetricSchema = z.object({
    model: z.string(),
    tokensIn: z.number().int().nonnegative(),
    tokensOut: z.number().int().nonnegative(),
    costCents: z.number().int().nonnegative(),
    latencyMs: z.number().int().nonnegative(),
    toolInvocations: ToolInvocationsSchema,
});
export const UsageLogEntrySchema = UsageMetricSchema.extend({
    id: z.string(),
    tenantId: z.string(),
    userId: z.string(),
    assistantType: AssistantTypeSchema.nullable(),
    createdAt: z.date(),
});
// ============================================================================
// WEB SEARCH SCHEMAS
// ============================================================================
export const WebSearchResultItemSchema = z.object({
    title: z.string(),
    snippet: z.string(),
    url: z.string().url(),
});
export const WebSearchResultSchema = z.object({
    query: z.string(),
    results: z.array(WebSearchResultItemSchema),
});
export const WebSearchProviderSchema = z.enum(['tavily', 'serpapi', 'bing', 'mcp']);
export const WebSearchConfigSchema = z.object({
    provider: WebSearchProviderSchema,
    apiKey: z.string().min(1, 'API key is required'),
    rateLimit: z.number().int().positive(),
    maxResults: z.number().int().positive().max(100),
});
// ============================================================================
// FINANCE TOOL SCHEMAS (Legacy)
// ============================================================================
export const UnitEconomicsSchema = z.object({
    grossMargin: z.number(),
    contributionMargin: z.number(),
    breakEvenUnits: z.number().nonnegative(),
});
export const FinancialProjectionSchema = z.object({
    month: z.number().int().positive(),
    revenue: z.number().nonnegative(),
    cogs: z.number().nonnegative(),
    grossMargin: z.number(),
});
export const FinancialModelSchema = z.object({
    unitEconomics: UnitEconomicsSchema,
    projections: z.array(FinancialProjectionSchema).min(1),
});
export const UnitEconomicsInputSchema = z.object({
    pricePerUnit: z.number().positive('Price per unit must be positive'),
    cogsPerUnit: z.number().nonnegative('COGS per unit cannot be negative'),
    fixedCosts: z.number().nonnegative('Fixed costs cannot be negative'),
});
export const RevenueProjectionInputSchema = z.object({
    initialRevenue: z.number().nonnegative('Initial revenue cannot be negative'),
    growthRate: z.number().min(-1, 'Growth rate must be >= -1').max(10, 'Growth rate unrealistic'),
    months: z.number().int().positive().max(120, 'Max 120 months'),
    cogsPercentage: z.number().min(0, 'COGS % must be >= 0').max(1, 'COGS % must be <= 1'),
});
// ============================================================================
// BUSINESS TRACK FINANCE SCHEMAS (Step 6)
// ============================================================================
/**
 * Financial inputs schema for Business Track
 */
export const FinancialInputsSchema = z.object({
    // Pricing & costs
    arpuMonthly: z.number().nonnegative().optional(),
    acv: z.number().nonnegative().optional(),
    cogsPct: z.number().min(0, 'COGS % must be >= 0').max(1, 'COGS % must be <= 1'),
    variableCostPerUser: z.number().nonnegative().optional(),
    // Funnel & growth
    startingCustomers: z.number().int().nonnegative('Starting customers cannot be negative'),
    newCustomersPerMonth: z.number().nonnegative('New customers per month cannot be negative'),
    churnRateMonthly: z
        .number()
        .min(0, 'Churn rate must be >= 0')
        .max(0.99, 'Churn rate must be < 1'),
    expansionPctMonthly: z
        .number()
        .min(0, 'Expansion % must be >= 0')
        .max(1, 'Expansion % must be <= 1')
        .optional()
        .default(0),
    // Sales/marketing & CAC
    salesMarketingSpendMonthly: z.number().nonnegative('Sales/marketing spend cannot be negative'),
    customersAcquiredPerMonth: z.number().nonnegative().optional(),
    assumedCAC: z.number().nonnegative().optional(),
    // Horizon
    months: z
        .number()
        .int()
        .min(1, 'Months must be >= 1')
        .max(24, 'Max 24 months allowed')
        .default(12),
})
    .refine((data) => data.arpuMonthly || data.acv, {
    message: 'Either arpuMonthly or acv must be provided',
    path: ['arpuMonthly'],
});
/**
 * Business Track unit economics schema
 */
export const BusinessTrackUnitEconomicsSchema = z.object({
    arpuMonthly: z.number().nonnegative(),
    grossMarginPct: z.number(),
    cac: z.number().nonnegative(),
    ltv: z.number().nonnegative(),
    paybackMonths: z.union([z.number().nonnegative(), z.literal('Infinity')]),
    ltvCacRatio: z.number().nonnegative().optional(),
});
/**
 * Business Track projection row schema
 */
export const BusinessTrackProjectionSchema = z.object({
    month: z.number().int().positive(),
    customersEnd: z.number().nonnegative(),
    newCustomers: z.number().nonnegative(),
    churnedCustomers: z.number().nonnegative(),
    revenue: z.number().nonnegative(),
    cogs: z.number().nonnegative(),
    grossMargin: z.number(),
    grossMarginPct: z.number(),
    cac: z.number().nonnegative(),
});
/**
 * Business Track financial model schema
 */
export const BusinessTrackFinancialModelSchema = z.object({
    unitEconomics: BusinessTrackUnitEconomicsSchema,
    projections: z.array(BusinessTrackProjectionSchema).min(1).max(24),
    assumptions: z.record(z.union([z.string(), z.number()])),
});
// ============================================================================
// RETRIEVAL SCHEMAS
// ============================================================================
export const RetrievedChunkSchema = z.object({
    chunkId: z.string(),
    documentId: z.string(),
    content: z.string(),
    score: z.number(),
    metadata: z
        .object({
        title: z.string().optional(),
        url: z.string().url().optional(),
        tags: z.array(z.string()).optional(),
    })
        .optional(),
});
export const RetrievalRequestSchema = z.object({
    query: z.string().min(1, 'Query is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    topK: z.number().int().positive().max(100).optional(),
    minScore: z.number().min(0).max(1).optional(),
});
export const RetrievalResultSchema = z.object({
    chunks: z.array(RetrievedChunkSchema),
    totalTokens: z.number().int().nonnegative(),
});
// ============================================================================
// FEATURE FLAG SCHEMAS
// ============================================================================
export const FeatureFlagNameSchema = z.enum([
    'ai_assistant_enabled',
    'streamlined_plan_enabled',
    'exec_summary_enabled',
    'market_analysis_enabled',
]);
export const FeatureFlagSchema = z.object({
    flagName: FeatureFlagNameSchema,
    enabled: z.boolean(),
    tenantId: z.string().nullable(),
});
// ============================================================================
// ERROR SCHEMAS
// ============================================================================
export const ApiErrorSchema = z.object({
    error: z.string(),
    code: z.string(),
    details: z.record(z.any()).optional(),
});
export const ErrorCodeSchema = z.enum([
    'UNAUTHORIZED',
    'QUOTA_EXCEEDED',
    'FEATURE_DISABLED',
    'INVALID_INPUT',
    'INTERNAL_ERROR',
    'DATABASE_ERROR',
    'LLM_ERROR',
]);
//# sourceMappingURL=schemas.js.map