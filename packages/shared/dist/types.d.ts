/**
 * Shared TypeScript Types for KimuntuPro AI
 * Used across ai-core, Business Track UI, and API routes
 */
/**
 * Available AI assistant types for Business Track
 * All assistants are integrated into /app/dashboard/business/ai-assistant/
 */
export type AssistantType = 'streamlined_plan' | 'exec_summary' | 'financial_overview' | 'market_analysis';
/**
 * Request payload for AI assistant from Business Track UI
 * Sent to /app/api/ai/answer
 */
export interface AssistantRequest {
    assistant: AssistantType;
    input: string;
    tenantId: string;
    userId: string;
    extra?: Record<string, any>;
}
/**
 * Source citation for assistant response
 * Distinguishes RAG vs web search sources
 */
export interface AssistantSource {
    type: 'rag' | 'web';
    title?: string;
    url?: string;
    docId?: string;
    snippet: string;
}
/**
 * Response from AI assistant to Business Track UI
 */
export interface AssistantResponse {
    assistant: AssistantType;
    sections: Record<string, string>;
    sources: AssistantSource[];
    rawModelOutput: string;
    metadata?: {
        model: string;
        tokensUsed: number;
        latencyMs: number;
        cost: number;
    };
}
/**
 * Input to Stage A Planner
 */
export interface PlannerInput {
    assistant: AssistantType;
    input: string;
    tenantId: string;
    userId: string;
    extra?: Record<string, any>;
}
/**
 * Structured output from Stage A Planner
 * Used by executor to determine retrieval and tool usage
 */
export interface PlannerOutput {
    task: AssistantType;
    requires_retrieval: boolean;
    requires_web_search: boolean;
    query_terms: string[];
    sections: string[];
    metrics_needed: string[];
    escalate_model: boolean;
}
/**
 * Tool invocation counts for a single request
 */
export interface ToolInvocations {
    retrieval: number;
    webSearch: number;
    finance: number;
}
/**
 * Usage metrics for cost tracking and metering
 * Logged to database after each assistant call
 */
export interface UsageMetric {
    model: string;
    tokensIn: number;
    tokensOut: number;
    costCents: number;
    latencyMs: number;
    toolInvocations: ToolInvocations;
}
/**
 * Complete usage log entry (matches database schema)
 */
export interface UsageLogEntry extends UsageMetric {
    id: string;
    tenantId: string;
    userId: string;
    assistantType: AssistantType | null;
    createdAt: Date;
}
/**
 * Quota check result
 */
export interface QuotaCheckResult {
    ok: boolean;
    reason?: string;
    resetsAtISO?: string;
    currentUsage?: {
        tokens: number;
        costCents: number;
    };
}
/**
 * Usage analytics summary
 */
export interface UsageAnalyticsSummary {
    assistant: string;
    calls: number;
    tokens: number;
    costCents: number;
}
/**
 * Quota error (thrown when quota exceeded)
 */
export declare class QuotaError extends Error {
    resetsAtISO?: string | undefined;
    currentUsage?: {
        tokens: number;
        costCents: number;
    } | undefined;
    constructor(message: string, resetsAtISO?: string | undefined, currentUsage?: {
        tokens: number;
        costCents: number;
    } | undefined);
}
/**
 * Single web search result
 */
export interface WebSearchResultItem {
    title: string;
    snippet: string;
    url: string;
}
/**
 * Web search tool response
 * Normalized across providers (Tavily, SerpAPI, Bing, MCP)
 */
export interface WebSearchResult {
    query: string;
    results: WebSearchResultItem[];
}
/**
 * Web search provider configuration
 */
export type WebSearchProvider = 'tavily' | 'serpapi' | 'bing' | 'mcp';
export interface WebSearchConfig {
    provider: WebSearchProvider;
    apiKey: string;
    rateLimit: number;
    maxResults: number;
}
/**
 * Unit economics calculations (legacy)
 * @deprecated Use BusinessTrackUnitEconomics for comprehensive metrics
 */
export interface UnitEconomics {
    grossMargin: number;
    contributionMargin: number;
    breakEvenUnits: number;
}
/**
 * Monthly financial projection (legacy)
 * @deprecated Use BusinessTrackProjection for comprehensive metrics
 */
export interface FinancialProjection {
    month: number;
    revenue: number;
    cogs: number;
    grossMargin: number;
}
/**
 * Complete financial model output (legacy)
 * @deprecated Use BusinessTrackFinancialModel for comprehensive metrics
 */
export interface FinancialModel {
    unitEconomics: UnitEconomics;
    projections: FinancialProjection[];
}
/**
 * Input for unit economics calculation (legacy)
 */
export interface UnitEconomicsInput {
    pricePerUnit: number;
    cogsPerUnit: number;
    fixedCosts: number;
}
/**
 * Input for revenue projection (legacy)
 */
export interface RevenueProjectionInput {
    initialRevenue: number;
    growthRate: number;
    months: number;
    cogsPercentage: number;
}
/**
 * Comprehensive unit economics for Business Track
 */
export interface BusinessTrackUnitEconomics {
    arpuMonthly: number;
    grossMarginPct: number;
    cac: number;
    ltv: number;
    paybackMonths: number | 'Infinity';
    ltvCacRatio?: number;
}
/**
 * Monthly projection row for Business Track
 */
export interface BusinessTrackProjection {
    month: number;
    customersEnd: number;
    newCustomers: number;
    churnedCustomers: number;
    revenue: number;
    cogs: number;
    grossMargin: number;
    grossMarginPct: number;
    cac: number;
}
/**
 * Complete Business Track financial model output
 */
export interface BusinessTrackFinancialModel {
    unitEconomics: BusinessTrackUnitEconomics;
    projections: BusinessTrackProjection[];
    assumptions: Record<string, string | number>;
}
/**
 * Financial inputs for Business Track model
 */
export interface FinancialInputs {
    arpuMonthly?: number;
    acv?: number;
    cogsPct: number;
    variableCostPerUser?: number;
    startingCustomers: number;
    newCustomersPerMonth: number;
    churnRateMonthly: number;
    expansionPctMonthly?: number;
    salesMarketingSpendMonthly: number;
    customersAcquiredPerMonth?: number;
    assumedCAC?: number;
    months: number;
}
/**
 * Retrieved chunk from vector/BM25 search
 */
export interface RetrievedChunk {
    chunkId: string;
    documentId: string;
    content: string;
    score: number;
    metadata?: {
        title?: string;
        url?: string;
        tags?: string[];
    };
}
/**
 * Retrieval request parameters
 */
export interface RetrievalRequest {
    query: string;
    tenantId: string;
    topK?: number;
    minScore?: number;
}
/**
 * Retrieval response
 */
export interface RetrievalResult {
    chunks: RetrievedChunk[];
    totalTokens: number;
}
/**
 * Feature flag names
 */
export type FeatureFlagName = 'ai_assistant_enabled' | 'streamlined_plan_enabled' | 'exec_summary_enabled' | 'market_analysis_enabled';
/**
 * Feature flag entry
 */
export interface FeatureFlag {
    flagName: FeatureFlagName;
    enabled: boolean;
    tenantId: string | null;
}
/**
 * API error response
 */
export interface ApiError {
    error: string;
    code: string;
    details?: Record<string, any>;
}
/**
 * Error codes
 */
export declare enum ErrorCode {
    UNAUTHORIZED = "UNAUTHORIZED",
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
    FEATURE_DISABLED = "FEATURE_DISABLED",
    INVALID_INPUT = "INVALID_INPUT",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    DATABASE_ERROR = "DATABASE_ERROR",
    LLM_ERROR = "LLM_ERROR"
}
//# sourceMappingURL=types.d.ts.map