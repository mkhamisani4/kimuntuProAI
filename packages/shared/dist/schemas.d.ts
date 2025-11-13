/**
 * Zod Validation Schemas for KimuntuPro AI
 * Provides runtime validation for all shared types
 */
import { z } from 'zod';
export declare const AssistantTypeSchema: z.ZodEnum<["streamlined_plan", "exec_summary", "financial_overview", "market_analysis"]>;
export declare const AssistantRequestSchema: z.ZodObject<{
    assistant: z.ZodEnum<["streamlined_plan", "exec_summary", "financial_overview", "market_analysis"]>;
    input: z.ZodString;
    tenantId: z.ZodString;
    userId: z.ZodString;
    extra: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    assistant: "streamlined_plan" | "exec_summary" | "financial_overview" | "market_analysis";
    input: string;
    tenantId: string;
    userId: string;
    extra?: Record<string, any> | undefined;
}, {
    assistant: "streamlined_plan" | "exec_summary" | "financial_overview" | "market_analysis";
    input: string;
    tenantId: string;
    userId: string;
    extra?: Record<string, any> | undefined;
}>;
export declare const AssistantSourceSchema: z.ZodObject<{
    type: z.ZodEnum<["rag", "web"]>;
    title: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    docId: z.ZodOptional<z.ZodString>;
    snippet: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "rag" | "web";
    snippet: string;
    title?: string | undefined;
    url?: string | undefined;
    docId?: string | undefined;
}, {
    type: "rag" | "web";
    snippet: string;
    title?: string | undefined;
    url?: string | undefined;
    docId?: string | undefined;
}>;
export declare const AssistantResponseSchema: z.ZodObject<{
    assistant: z.ZodEnum<["streamlined_plan", "exec_summary", "financial_overview", "market_analysis"]>;
    sections: z.ZodRecord<z.ZodString, z.ZodString>;
    sources: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["rag", "web"]>;
        title: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        docId: z.ZodOptional<z.ZodString>;
        snippet: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "rag" | "web";
        snippet: string;
        title?: string | undefined;
        url?: string | undefined;
        docId?: string | undefined;
    }, {
        type: "rag" | "web";
        snippet: string;
        title?: string | undefined;
        url?: string | undefined;
        docId?: string | undefined;
    }>, "many">;
    rawModelOutput: z.ZodString;
    metadata: z.ZodOptional<z.ZodObject<{
        model: z.ZodString;
        tokensUsed: z.ZodNumber;
        latencyMs: z.ZodNumber;
        cost: z.ZodNumber;
        toolInvocations: z.ZodOptional<z.ZodObject<{
            retrieval: z.ZodOptional<z.ZodNumber>;
            webSearch: z.ZodOptional<z.ZodNumber>;
            finance: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            retrieval?: number | undefined;
            webSearch?: number | undefined;
            finance?: number | undefined;
        }, {
            retrieval?: number | undefined;
            webSearch?: number | undefined;
            finance?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        tokensUsed: number;
        latencyMs: number;
        cost: number;
        toolInvocations?: {
            retrieval?: number | undefined;
            webSearch?: number | undefined;
            finance?: number | undefined;
        } | undefined;
    }, {
        model: string;
        tokensUsed: number;
        latencyMs: number;
        cost: number;
        toolInvocations?: {
            retrieval?: number | undefined;
            webSearch?: number | undefined;
            finance?: number | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    assistant: "streamlined_plan" | "exec_summary" | "financial_overview" | "market_analysis";
    sections: Record<string, string>;
    sources: {
        type: "rag" | "web";
        snippet: string;
        title?: string | undefined;
        url?: string | undefined;
        docId?: string | undefined;
    }[];
    rawModelOutput: string;
    metadata?: {
        model: string;
        tokensUsed: number;
        latencyMs: number;
        cost: number;
        toolInvocations?: {
            retrieval?: number | undefined;
            webSearch?: number | undefined;
            finance?: number | undefined;
        } | undefined;
    } | undefined;
}, {
    assistant: "streamlined_plan" | "exec_summary" | "financial_overview" | "market_analysis";
    sections: Record<string, string>;
    sources: {
        type: "rag" | "web";
        snippet: string;
        title?: string | undefined;
        url?: string | undefined;
        docId?: string | undefined;
    }[];
    rawModelOutput: string;
    metadata?: {
        model: string;
        tokensUsed: number;
        latencyMs: number;
        cost: number;
        toolInvocations?: {
            retrieval?: number | undefined;
            webSearch?: number | undefined;
            finance?: number | undefined;
        } | undefined;
    } | undefined;
}>;
export declare const PlannerInputSchema: z.ZodObject<{
    assistant: z.ZodEnum<["streamlined_plan", "exec_summary", "financial_overview", "market_analysis"]>;
    input: z.ZodString;
    tenantId: z.ZodString;
    userId: z.ZodString;
    extra: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    assistant: "streamlined_plan" | "exec_summary" | "financial_overview" | "market_analysis";
    input: string;
    tenantId: string;
    userId: string;
    extra?: Record<string, any> | undefined;
}, {
    assistant: "streamlined_plan" | "exec_summary" | "financial_overview" | "market_analysis";
    input: string;
    tenantId: string;
    userId: string;
    extra?: Record<string, any> | undefined;
}>;
export declare const PlannerOutputSchema: z.ZodObject<{
    task: z.ZodEnum<["streamlined_plan", "exec_summary", "financial_overview", "market_analysis"]>;
    requires_retrieval: z.ZodBoolean;
    requires_web_search: z.ZodBoolean;
    query_terms: z.ZodArray<z.ZodString, "many">;
    sections: z.ZodArray<z.ZodString, "many">;
    metrics_needed: z.ZodArray<z.ZodString, "many">;
    escalate_model: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    sections: string[];
    task: "streamlined_plan" | "exec_summary" | "financial_overview" | "market_analysis";
    requires_retrieval: boolean;
    requires_web_search: boolean;
    query_terms: string[];
    metrics_needed: string[];
    escalate_model: boolean;
}, {
    sections: string[];
    task: "streamlined_plan" | "exec_summary" | "financial_overview" | "market_analysis";
    requires_retrieval: boolean;
    requires_web_search: boolean;
    query_terms: string[];
    metrics_needed: string[];
    escalate_model: boolean;
}>;
export declare const ToolInvocationsSchema: z.ZodObject<{
    retrieval: z.ZodNumber;
    webSearch: z.ZodNumber;
    finance: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    retrieval: number;
    webSearch: number;
    finance: number;
}, {
    retrieval: number;
    webSearch: number;
    finance: number;
}>;
export declare const UsageMetricSchema: z.ZodObject<{
    model: z.ZodString;
    tokensIn: z.ZodNumber;
    tokensOut: z.ZodNumber;
    costCents: z.ZodNumber;
    latencyMs: z.ZodNumber;
    toolInvocations: z.ZodObject<{
        retrieval: z.ZodNumber;
        webSearch: z.ZodNumber;
        finance: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        retrieval: number;
        webSearch: number;
        finance: number;
    }, {
        retrieval: number;
        webSearch: number;
        finance: number;
    }>;
}, "strip", z.ZodTypeAny, {
    model: string;
    latencyMs: number;
    toolInvocations: {
        retrieval: number;
        webSearch: number;
        finance: number;
    };
    tokensIn: number;
    tokensOut: number;
    costCents: number;
}, {
    model: string;
    latencyMs: number;
    toolInvocations: {
        retrieval: number;
        webSearch: number;
        finance: number;
    };
    tokensIn: number;
    tokensOut: number;
    costCents: number;
}>;
export declare const UsageLogEntrySchema: z.ZodObject<{
    model: z.ZodString;
    tokensIn: z.ZodNumber;
    tokensOut: z.ZodNumber;
    costCents: z.ZodNumber;
    latencyMs: z.ZodNumber;
    toolInvocations: z.ZodObject<{
        retrieval: z.ZodNumber;
        webSearch: z.ZodNumber;
        finance: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        retrieval: number;
        webSearch: number;
        finance: number;
    }, {
        retrieval: number;
        webSearch: number;
        finance: number;
    }>;
} & {
    id: z.ZodString;
    tenantId: z.ZodString;
    userId: z.ZodString;
    assistantType: z.ZodNullable<z.ZodEnum<["streamlined_plan", "exec_summary", "financial_overview", "market_analysis"]>>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    userId: string;
    model: string;
    latencyMs: number;
    toolInvocations: {
        retrieval: number;
        webSearch: number;
        finance: number;
    };
    tokensIn: number;
    tokensOut: number;
    costCents: number;
    id: string;
    assistantType: "streamlined_plan" | "exec_summary" | "financial_overview" | "market_analysis" | null;
    createdAt: Date;
}, {
    tenantId: string;
    userId: string;
    model: string;
    latencyMs: number;
    toolInvocations: {
        retrieval: number;
        webSearch: number;
        finance: number;
    };
    tokensIn: number;
    tokensOut: number;
    costCents: number;
    id: string;
    assistantType: "streamlined_plan" | "exec_summary" | "financial_overview" | "market_analysis" | null;
    createdAt: Date;
}>;
export declare const WebSearchResultItemSchema: z.ZodObject<{
    title: z.ZodString;
    snippet: z.ZodString;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    url: string;
    snippet: string;
}, {
    title: string;
    url: string;
    snippet: string;
}>;
export declare const WebSearchResultSchema: z.ZodObject<{
    query: z.ZodString;
    results: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        snippet: z.ZodString;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        url: string;
        snippet: string;
    }, {
        title: string;
        url: string;
        snippet: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    query: string;
    results: {
        title: string;
        url: string;
        snippet: string;
    }[];
}, {
    query: string;
    results: {
        title: string;
        url: string;
        snippet: string;
    }[];
}>;
export declare const WebSearchProviderSchema: z.ZodEnum<["tavily", "serpapi", "bing", "mcp"]>;
export declare const WebSearchConfigSchema: z.ZodObject<{
    provider: z.ZodEnum<["tavily", "serpapi", "bing", "mcp"]>;
    apiKey: z.ZodString;
    rateLimit: z.ZodNumber;
    maxResults: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    provider: "tavily" | "serpapi" | "bing" | "mcp";
    apiKey: string;
    rateLimit: number;
    maxResults: number;
}, {
    provider: "tavily" | "serpapi" | "bing" | "mcp";
    apiKey: string;
    rateLimit: number;
    maxResults: number;
}>;
export declare const UnitEconomicsSchema: z.ZodObject<{
    grossMargin: z.ZodNumber;
    contributionMargin: z.ZodNumber;
    breakEvenUnits: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    grossMargin: number;
    contributionMargin: number;
    breakEvenUnits: number;
}, {
    grossMargin: number;
    contributionMargin: number;
    breakEvenUnits: number;
}>;
export declare const FinancialProjectionSchema: z.ZodObject<{
    month: z.ZodNumber;
    revenue: z.ZodNumber;
    cogs: z.ZodNumber;
    grossMargin: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    grossMargin: number;
    month: number;
    revenue: number;
    cogs: number;
}, {
    grossMargin: number;
    month: number;
    revenue: number;
    cogs: number;
}>;
export declare const FinancialModelSchema: z.ZodObject<{
    unitEconomics: z.ZodObject<{
        grossMargin: z.ZodNumber;
        contributionMargin: z.ZodNumber;
        breakEvenUnits: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        grossMargin: number;
        contributionMargin: number;
        breakEvenUnits: number;
    }, {
        grossMargin: number;
        contributionMargin: number;
        breakEvenUnits: number;
    }>;
    projections: z.ZodArray<z.ZodObject<{
        month: z.ZodNumber;
        revenue: z.ZodNumber;
        cogs: z.ZodNumber;
        grossMargin: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        grossMargin: number;
        month: number;
        revenue: number;
        cogs: number;
    }, {
        grossMargin: number;
        month: number;
        revenue: number;
        cogs: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    unitEconomics: {
        grossMargin: number;
        contributionMargin: number;
        breakEvenUnits: number;
    };
    projections: {
        grossMargin: number;
        month: number;
        revenue: number;
        cogs: number;
    }[];
}, {
    unitEconomics: {
        grossMargin: number;
        contributionMargin: number;
        breakEvenUnits: number;
    };
    projections: {
        grossMargin: number;
        month: number;
        revenue: number;
        cogs: number;
    }[];
}>;
export declare const UnitEconomicsInputSchema: z.ZodObject<{
    pricePerUnit: z.ZodNumber;
    cogsPerUnit: z.ZodNumber;
    fixedCosts: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    pricePerUnit: number;
    cogsPerUnit: number;
    fixedCosts: number;
}, {
    pricePerUnit: number;
    cogsPerUnit: number;
    fixedCosts: number;
}>;
export declare const RevenueProjectionInputSchema: z.ZodObject<{
    initialRevenue: z.ZodNumber;
    growthRate: z.ZodNumber;
    months: z.ZodNumber;
    cogsPercentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    initialRevenue: number;
    growthRate: number;
    months: number;
    cogsPercentage: number;
}, {
    initialRevenue: number;
    growthRate: number;
    months: number;
    cogsPercentage: number;
}>;
/**
 * Financial inputs schema for Business Track
 */
export declare const FinancialInputsSchema: z.ZodEffects<z.ZodObject<{
    arpuMonthly: z.ZodOptional<z.ZodNumber>;
    acv: z.ZodOptional<z.ZodNumber>;
    cogsPct: z.ZodNumber;
    variableCostPerUser: z.ZodOptional<z.ZodNumber>;
    startingCustomers: z.ZodNumber;
    newCustomersPerMonth: z.ZodNumber;
    churnRateMonthly: z.ZodNumber;
    expansionPctMonthly: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    salesMarketingSpendMonthly: z.ZodNumber;
    customersAcquiredPerMonth: z.ZodOptional<z.ZodNumber>;
    assumedCAC: z.ZodOptional<z.ZodNumber>;
    months: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    months: number;
    cogsPct: number;
    startingCustomers: number;
    newCustomersPerMonth: number;
    churnRateMonthly: number;
    expansionPctMonthly: number;
    salesMarketingSpendMonthly: number;
    arpuMonthly?: number | undefined;
    acv?: number | undefined;
    variableCostPerUser?: number | undefined;
    customersAcquiredPerMonth?: number | undefined;
    assumedCAC?: number | undefined;
}, {
    cogsPct: number;
    startingCustomers: number;
    newCustomersPerMonth: number;
    churnRateMonthly: number;
    salesMarketingSpendMonthly: number;
    months?: number | undefined;
    arpuMonthly?: number | undefined;
    acv?: number | undefined;
    variableCostPerUser?: number | undefined;
    expansionPctMonthly?: number | undefined;
    customersAcquiredPerMonth?: number | undefined;
    assumedCAC?: number | undefined;
}>, {
    months: number;
    cogsPct: number;
    startingCustomers: number;
    newCustomersPerMonth: number;
    churnRateMonthly: number;
    expansionPctMonthly: number;
    salesMarketingSpendMonthly: number;
    arpuMonthly?: number | undefined;
    acv?: number | undefined;
    variableCostPerUser?: number | undefined;
    customersAcquiredPerMonth?: number | undefined;
    assumedCAC?: number | undefined;
}, {
    cogsPct: number;
    startingCustomers: number;
    newCustomersPerMonth: number;
    churnRateMonthly: number;
    salesMarketingSpendMonthly: number;
    months?: number | undefined;
    arpuMonthly?: number | undefined;
    acv?: number | undefined;
    variableCostPerUser?: number | undefined;
    expansionPctMonthly?: number | undefined;
    customersAcquiredPerMonth?: number | undefined;
    assumedCAC?: number | undefined;
}>;
/**
 * Business Track unit economics schema
 */
export declare const BusinessTrackUnitEconomicsSchema: z.ZodObject<{
    arpuMonthly: z.ZodNumber;
    grossMarginPct: z.ZodNumber;
    cac: z.ZodNumber;
    ltv: z.ZodNumber;
    paybackMonths: z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"Infinity">]>;
    ltvCacRatio: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    arpuMonthly: number;
    grossMarginPct: number;
    cac: number;
    ltv: number;
    paybackMonths: number | "Infinity";
    ltvCacRatio?: number | undefined;
}, {
    arpuMonthly: number;
    grossMarginPct: number;
    cac: number;
    ltv: number;
    paybackMonths: number | "Infinity";
    ltvCacRatio?: number | undefined;
}>;
/**
 * Business Track projection row schema
 */
export declare const BusinessTrackProjectionSchema: z.ZodObject<{
    month: z.ZodNumber;
    customersEnd: z.ZodNumber;
    newCustomers: z.ZodNumber;
    churnedCustomers: z.ZodNumber;
    revenue: z.ZodNumber;
    cogs: z.ZodNumber;
    grossMargin: z.ZodNumber;
    grossMarginPct: z.ZodNumber;
    cac: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    grossMargin: number;
    month: number;
    revenue: number;
    cogs: number;
    grossMarginPct: number;
    cac: number;
    customersEnd: number;
    newCustomers: number;
    churnedCustomers: number;
}, {
    grossMargin: number;
    month: number;
    revenue: number;
    cogs: number;
    grossMarginPct: number;
    cac: number;
    customersEnd: number;
    newCustomers: number;
    churnedCustomers: number;
}>;
/**
 * Business Track financial model schema
 */
export declare const BusinessTrackFinancialModelSchema: z.ZodObject<{
    unitEconomics: z.ZodObject<{
        arpuMonthly: z.ZodNumber;
        grossMarginPct: z.ZodNumber;
        cac: z.ZodNumber;
        ltv: z.ZodNumber;
        paybackMonths: z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"Infinity">]>;
        ltvCacRatio: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        arpuMonthly: number;
        grossMarginPct: number;
        cac: number;
        ltv: number;
        paybackMonths: number | "Infinity";
        ltvCacRatio?: number | undefined;
    }, {
        arpuMonthly: number;
        grossMarginPct: number;
        cac: number;
        ltv: number;
        paybackMonths: number | "Infinity";
        ltvCacRatio?: number | undefined;
    }>;
    projections: z.ZodArray<z.ZodObject<{
        month: z.ZodNumber;
        customersEnd: z.ZodNumber;
        newCustomers: z.ZodNumber;
        churnedCustomers: z.ZodNumber;
        revenue: z.ZodNumber;
        cogs: z.ZodNumber;
        grossMargin: z.ZodNumber;
        grossMarginPct: z.ZodNumber;
        cac: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        grossMargin: number;
        month: number;
        revenue: number;
        cogs: number;
        grossMarginPct: number;
        cac: number;
        customersEnd: number;
        newCustomers: number;
        churnedCustomers: number;
    }, {
        grossMargin: number;
        month: number;
        revenue: number;
        cogs: number;
        grossMarginPct: number;
        cac: number;
        customersEnd: number;
        newCustomers: number;
        churnedCustomers: number;
    }>, "many">;
    assumptions: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
}, "strip", z.ZodTypeAny, {
    unitEconomics: {
        arpuMonthly: number;
        grossMarginPct: number;
        cac: number;
        ltv: number;
        paybackMonths: number | "Infinity";
        ltvCacRatio?: number | undefined;
    };
    projections: {
        grossMargin: number;
        month: number;
        revenue: number;
        cogs: number;
        grossMarginPct: number;
        cac: number;
        customersEnd: number;
        newCustomers: number;
        churnedCustomers: number;
    }[];
    assumptions: Record<string, string | number>;
}, {
    unitEconomics: {
        arpuMonthly: number;
        grossMarginPct: number;
        cac: number;
        ltv: number;
        paybackMonths: number | "Infinity";
        ltvCacRatio?: number | undefined;
    };
    projections: {
        grossMargin: number;
        month: number;
        revenue: number;
        cogs: number;
        grossMarginPct: number;
        cac: number;
        customersEnd: number;
        newCustomers: number;
        churnedCustomers: number;
    }[];
    assumptions: Record<string, string | number>;
}>;
export declare const RetrievedChunkSchema: z.ZodObject<{
    chunkId: z.ZodString;
    documentId: z.ZodString;
    content: z.ZodString;
    score: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        url?: string | undefined;
        tags?: string[] | undefined;
    }, {
        title?: string | undefined;
        url?: string | undefined;
        tags?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    chunkId: string;
    documentId: string;
    content: string;
    score: number;
    metadata?: {
        title?: string | undefined;
        url?: string | undefined;
        tags?: string[] | undefined;
    } | undefined;
}, {
    chunkId: string;
    documentId: string;
    content: string;
    score: number;
    metadata?: {
        title?: string | undefined;
        url?: string | undefined;
        tags?: string[] | undefined;
    } | undefined;
}>;
export declare const RetrievalRequestSchema: z.ZodObject<{
    query: z.ZodString;
    tenantId: z.ZodString;
    topK: z.ZodOptional<z.ZodNumber>;
    minScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    query: string;
    topK?: number | undefined;
    minScore?: number | undefined;
}, {
    tenantId: string;
    query: string;
    topK?: number | undefined;
    minScore?: number | undefined;
}>;
export declare const RetrievalResultSchema: z.ZodObject<{
    chunks: z.ZodArray<z.ZodObject<{
        chunkId: z.ZodString;
        documentId: z.ZodString;
        content: z.ZodString;
        score: z.ZodNumber;
        metadata: z.ZodOptional<z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            url: z.ZodOptional<z.ZodString>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            title?: string | undefined;
            url?: string | undefined;
            tags?: string[] | undefined;
        }, {
            title?: string | undefined;
            url?: string | undefined;
            tags?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        chunkId: string;
        documentId: string;
        content: string;
        score: number;
        metadata?: {
            title?: string | undefined;
            url?: string | undefined;
            tags?: string[] | undefined;
        } | undefined;
    }, {
        chunkId: string;
        documentId: string;
        content: string;
        score: number;
        metadata?: {
            title?: string | undefined;
            url?: string | undefined;
            tags?: string[] | undefined;
        } | undefined;
    }>, "many">;
    totalTokens: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    chunks: {
        chunkId: string;
        documentId: string;
        content: string;
        score: number;
        metadata?: {
            title?: string | undefined;
            url?: string | undefined;
            tags?: string[] | undefined;
        } | undefined;
    }[];
    totalTokens: number;
}, {
    chunks: {
        chunkId: string;
        documentId: string;
        content: string;
        score: number;
        metadata?: {
            title?: string | undefined;
            url?: string | undefined;
            tags?: string[] | undefined;
        } | undefined;
    }[];
    totalTokens: number;
}>;
export declare const FeatureFlagNameSchema: z.ZodEnum<["ai_assistant_enabled", "streamlined_plan_enabled", "exec_summary_enabled", "market_analysis_enabled"]>;
export declare const FeatureFlagSchema: z.ZodObject<{
    flagName: z.ZodEnum<["ai_assistant_enabled", "streamlined_plan_enabled", "exec_summary_enabled", "market_analysis_enabled"]>;
    enabled: z.ZodBoolean;
    tenantId: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tenantId: string | null;
    flagName: "ai_assistant_enabled" | "streamlined_plan_enabled" | "exec_summary_enabled" | "market_analysis_enabled";
    enabled: boolean;
}, {
    tenantId: string | null;
    flagName: "ai_assistant_enabled" | "streamlined_plan_enabled" | "exec_summary_enabled" | "market_analysis_enabled";
    enabled: boolean;
}>;
export declare const ApiErrorSchema: z.ZodObject<{
    error: z.ZodString;
    code: z.ZodString;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    error: string;
    details?: Record<string, any> | undefined;
}, {
    code: string;
    error: string;
    details?: Record<string, any> | undefined;
}>;
export declare const ErrorCodeSchema: z.ZodEnum<["UNAUTHORIZED", "QUOTA_EXCEEDED", "FEATURE_DISABLED", "INVALID_INPUT", "INTERNAL_ERROR", "DATABASE_ERROR", "LLM_ERROR"]>;
//# sourceMappingURL=schemas.d.ts.map