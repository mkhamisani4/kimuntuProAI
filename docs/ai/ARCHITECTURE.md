# Business Track AI - Architecture Documentation

## Overview

This document describes the architecture of the Business Track AI system, including the two-stage pipeline (Planner + Executor), quota enforcement, usage tracking, and data flow.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Two-Stage Pipeline](#two-stage-pipeline)
3. [Quota Enforcement Flow](#quota-enforcement-flow)
4. [Usage Tracking Flow](#usage-tracking-flow)
5. [Data Models](#data-models)
6. [Component Interactions](#component-interactions)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ /api/ai/plan  │  │ /api/ai/answer│  │ /api/ai/batch │       │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘       │
│          │                   │                   │               │
│          └───────────────────┴───────────────────┘               │
│                              │                                   │
│                    ┌─────────▼─────────┐                         │
│                    │ Quota Middleware  │                         │
│                    │ (withQuotaGuard)  │                         │
│                    └─────────┬─────────┘                         │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
        ┌───────▼────────┐          ┌────────▼────────┐
        │   Stage A:     │          │   Stage B:      │
        │   Planner      │─────────▶│   Executor      │
        │ (gpt-4o-mini)  │   plan   │ (mini or full)  │
        └───────┬────────┘          └────────┬────────┘
                │                            │
                │                   ┌────────┴────────┐
                │                   │                 │
                │          ┌────────▼────────┐ ┌─────▼──────┐
                │          │  RAG Retrieval  │ │ Web Search │
                │          │ (Hybrid BM25+   │ │ (OpenAI)   │
                │          │  Vector)        │ │            │
                │          └─────────────────┘ └────────────┘
                │                   │
                │          ┌────────▼────────┐
                │          │ Finance Tools   │
                │          │ (Unit Econ,     │
                │          │  Projections)   │
                │          └─────────────────┘
                │                   │
        ┌───────▼───────────────────▼─────────────┐
        │        OpenAI Client (LLM)              │
        │   - chat() / chatStructured()           │
        │   - chatWithTools()                     │
        │   - Prompt caching                      │
        │   - Usage emission                      │
        └───────┬─────────────────────────────────┘
                │
        ┌───────▼────────┐
        │ Usage Tracking │
        │  emitUsage()   │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │   PostgreSQL   │
        │  usage_logs    │
        └────────────────┘
```

---

## Two-Stage Pipeline

### Stage A: Planner (Cheap-by-Default)

**Purpose**: Analyze request and create structured plan

**Model**: `gpt-4o-mini-2024-07-18` (always)

**Input**:
```ts
{
  assistant: 'streamlined_plan' | 'exec_summary' | 'financial_overview' | 'market_analysis',
  input: 'User question or prompt',
  tenantId: 'tenant123',
  userId: 'user456',
  extra?: { financialInputs, context }
}
```

**Output**:
```ts
{
  task: AssistantType,
  requires_retrieval: boolean,
  requires_web_search: boolean,
  query_terms: string[],
  sections: string[],
  metrics_needed: string[],
  escalate_model: boolean
}
```

**Decision Logic**:
- Determines if retrieval, web search, or finance tools needed
- Decides mini vs. full model for executor
- Extracts query terms for RAG/web search
- Defines required sections for answer

**Cost**: ~$0.0005-0.002 per request

### Stage B: Executor (Selective Power)

**Purpose**: Generate final answer with tools and context

**Model**:
- `gpt-4o-mini` (default, 90% of requests)
- `gpt-4o` (escalated, 10% of requests)

**Process**:
1. Preflight quota check (conservative estimate)
2. **Parallel Preparation**:
   - RAG retrieval (if `requires_retrieval`)
   - Web search (if `requires_web_search`)
   - Finance model computation (if needed)
3. **Message Assembly**: System + Developer + User + RAG context + Web results
4. **Tool Setup**: Build tool specs for finance calculations
5. **LLM Call**: Generate answer with tools
6. **Response Parsing**: Extract sections, sources, citations
7. **Policy Validation**: Check for hallucinations, citations, disclaimers
8. **Usage Emission**: Log tokens, cost, latency to database

**Cost**:
- Mini: $0.001-0.01 per request
- Escalated: $0.05-0.20 per request

---

## Quota Enforcement Flow

### Sequence Diagram: Request with Quota Check

```
User          API Route        Middleware       Database      Planner/Executor    OpenAI Client     usage_logs
 │                │                │                │                 │                  │              │
 │   POST        │                │                │                 │                  │              │
 │─────────────▶ │                │                │                 │                  │              │
 │  /api/ai/plan │                │                │                 │                  │              │
 │               │                │                │                 │                  │              │
 │               │ withQuotaGuard │                │                 │                  │              │
 │               │───────────────▶│                │                 │                  │              │
 │               │                │                │                 │                  │              │
 │               │                │ Extract params │                 │                  │              │
 │               │                │ (tenantId,     │                 │                  │              │
 │               │                │  userId, input)│                 │                  │              │
 │               │                │                │                 │                  │              │
 │               │                │ Estimate usage │                 │                  │              │
 │               │                │ (input*1.5 +   │                 │                  │              │
 │               │                │  context +     │                 │                  │              │
 │               │                │  maxOutput)    │                 │                  │              │
 │               │                │                │                 │                  │              │
 │               │                │ Query current  │                 │                  │              │
 │               │                │ usage today    │                 │                  │              │
 │               │                │───────────────▶│                 │                  │              │
 │               │                │                │                 │                  │              │
 │               │                │   SUM(tokens)  │                 │                  │              │
 │               │                │   WHERE userId │                 │                  │              │
 │               │                │   AND created  │                 │                  │              │
 │               │                │   >= midnight  │                 │                  │              │
 │               │                │◀───────────────│                 │                  │              │
 │               │                │                │                 │                  │              │
 │               │                │ Check quotas:  │                 │                  │              │
 │               │                │ current + est  │                 │                  │              │
 │               │                │ vs. limits     │                 │                  │              │
 │               │                │                │                 │                  │              │
 │               │                │                │                 │                  │              │
 │               │     ┌──────────┴─────────┐      │                 │                  │              │
 │               │     │ IF QUOTA EXCEEDED  │      │                 │                  │              │
 │               │     └──────────┬─────────┘      │                 │                  │              │
 │               │                │                │                 │                  │              │
 │               │      429 Error │                │                 │                  │              │
 │               │◀───────────────│                │                 │                  │              │
 │◀──────────────│                │                │                 │                  │              │
 │  { error:     │                │                │                 │                  │              │
 │    quota_     │                │                │                 │                  │              │
 │    exceeded,  │                │                │                 │                  │              │
 │    resetsAt } │                │                │                 │                  │              │
 │               │                │                │                 │                  │              │
 │               │     ┌──────────┴─────────┐      │                 │                  │              │
 │               │     │ IF QUOTA OK        │      │                 │                  │              │
 │               │     └──────────┬─────────┘      │                 │                  │              │
 │               │                │                │                 │                  │              │
 │               │   Call handler │                │                 │                  │              │
 │               │───────────────▶│                │                 │                  │              │
 │               │                │ planWithQuota  │                 │                  │              │
 │               │                │ Check()        │                 │                  │              │
 │               │                │───────────────────────────────▶  │                  │              │
 │               │                │                │                 │                  │              │
 │               │                │                │       plan()    │                  │              │
 │               │                │                │       with      │                  │              │
 │               │                │                │       telemetry │                  │              │
 │               │                │                │                 │   chatStructured│              │
 │               │                │                │                 │─────────────────▶              │
 │               │                │                │                 │                  │              │
 │               │                │                │                 │   LLM response  │              │
 │               │                │                │                 │◀─────────────────│              │
 │               │                │                │                 │                  │              │
 │               │                │                │                 │   emitUsage()   │              │
 │               │                │                │                 │   with metrics  │              │
 │               │                │                │                 │─────────────────────────────────▶
 │               │                │                │                 │                  │              │
 │               │                │                │                 │                  │   INSERT INTO│
 │               │                │                │                 │                  │   usage_logs │
 │               │                │                │                 │                  │◀─────────────│
 │               │                │                │   Plan result   │                  │              │
 │               │                │◀───────────────────────────────  │                  │              │
 │               │                │                │                 │                  │              │
 │               │   200 OK       │                │                 │                  │              │
 │               │◀───────────────│                │                 │                  │              │
 │◀──────────────│                │                │                 │                  │              │
 │  { success,   │                │                │                 │                  │              │
 │    plan }     │                │                │                 │                  │              │
```

### Key Points

1. **Preflight Check**: Quota validation happens **before** LLM call
2. **Conservative Estimation**: Assumes worst case (no caching, max output)
3. **Fail Fast**: Returns 429 immediately if quota would be exceeded
4. **Database Queries**:
   - User sum: `SUM(tokensIn + tokensOut) WHERE userId = ? AND createdAt >= midnightUTC`
   - Tenant sum: `SUM(tokensIn + tokensOut) WHERE tenantId = ? AND createdAt >= midnightUTC`
5. **Fail Closed**: Database errors → deny request (conservative)

---

## Usage Tracking Flow

### Sequence Diagram: Usage Emission After Completion

```
OpenAI Client      emitUsage()      meter.ts        db/usage.ts      PostgreSQL
      │                 │               │                │               │
      │   chatStructured│               │                │               │
      │   completes     │               │                │               │
      │─────────────────▶               │                │               │
      │                 │               │                │               │
      │   Build metrics │               │                │               │
      │   from response │               │                │               │
      │   (tokens, cost,│               │                │               │
      │    latency)     │               │                │               │
      │                 │               │                │               │
      │   buildUsageFrom│               │                │               │
      │   ClientEvent() │               │                │               │
      │────────────────────────────────▶│                │               │
      │                 │               │                │               │
      │                 │   UsageMetric │                │               │
      │◀────────────────────────────────│                │               │
      │                 │               │                │               │
      │   emitUsage({   │               │                │               │
      │     tenantId,   │               │                │               │
      │     userId,     │               │                │               │
      │     assistant,  │               │                │               │
      │     metrics,    │               │                │               │
      │     requestId   │               │                │               │
      │   })            │               │                │               │
      │────────────────▶│               │                │               │
      │                 │               │                │               │
      │                 │ Check sampling│                │               │
      │                 │ rate (random) │                │               │
      │                 │               │                │               │
      │                 │  ┌────────────┴──────────┐    │               │
      │                 │  │ IF SAMPLED OUT:       │    │               │
      │                 │  │   return (skip log)   │    │               │
      │                 │  └────────────┬──────────┘    │               │
      │                 │               │                │               │
      │                 │  ┌────────────┴──────────┐    │               │
      │                 │  │ IF SAMPLED IN:        │    │               │
      │                 │  │   recordUsage()       │    │               │
      │                 │  └────────────┬──────────┘    │               │
      │                 │               │                │               │
      │                 │   recordUsage(│                │               │
      │                 │     row        │                │               │
      │                 │   )            │                │               │
      │                 │───────────────────────────────▶│               │
      │                 │               │                │               │
      │                 │               │   INSERT INTO  │               │
      │                 │               │   usage_logs   │               │
      │                 │               │   VALUES(...)  │               │
      │                 │               │────────────────────────────────▶
      │                 │               │                │               │
      │                 │               │   Row inserted │               │
      │                 │               │◀────────────────────────────────
      │                 │               │                │               │
      │                 │   Success     │                │               │
      │                 │◀───────────────────────────────│               │
      │                 │               │                │               │
      │   .catch(err)   │               │                │               │
      │   if DB fails   │               │                │               │
      │◀────────────────│               │                │               │
      │                 │               │                │               │
      │  ┌──────────────┴────────────┐  │                │               │
      │  │ IF USAGE_SOFT_FAIL=true: │  │                │               │
      │  │   Log warning, continue   │  │                │               │
      │  │                           │  │                │               │
      │  │ IF USAGE_SOFT_FAIL=false:│  │                │               │
      │  │   Throw error             │  │                │               │
      │  └──────────────┬────────────┘  │                │               │
      │                 │               │                │               │
      │   Continue with │               │                │               │
      │   response to   │               │                │               │
      │   user          │               │                │               │
      │                 │               │                │               │
```

### Usage Log Schema

```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  assistant_type VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  tokens_in INTEGER NOT NULL,
  tokens_out INTEGER NOT NULL,
  cost_cents INTEGER NOT NULL,
  latency_ms INTEGER NOT NULL,
  tool_invocations JSONB,
  request_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_created (user_id, created_at),
  INDEX idx_tenant_created (tenant_id, created_at),
  INDEX idx_assistant_created (assistant_type, created_at)
);
```

### Cost Calculation

```ts
// Example: gpt-4o-mini
tokensIn: 1000
tokensOut: 500
cachedInputTokens: 800 (80% cache hit)

// Pricing (per 1M tokens)
inputCost = (1000 - 800) * $0.150 / 1M = $0.00003
cachedCost = 800 * $0.075 / 1M = $0.00006
outputCost = 500 * $0.600 / 1M = $0.0003

totalCost = $0.00039
costCents = Math.ceil(0.039) = 1 cent  // Rounded UP
```

---

## Data Models

### PlannerInput

```ts
interface PlannerInput {
  assistant: AssistantType;
  input: string;
  tenantId: string;
  userId: string;
  extra?: {
    financialInputs?: FinancialInputs;
    context?: string;
  };
}
```

### PlannerOutput

```ts
interface PlannerOutput {
  task: AssistantType;
  requires_retrieval: boolean;
  requires_web_search: boolean;
  query_terms: string[];
  sections: string[];
  metrics_needed: string[];
  escalate_model: boolean;
}
```

### AssistantRequest

```ts
interface AssistantRequest {
  assistant: AssistantType;
  input: string;
  extra?: Record<string, any>;
}
```

### AssistantResponse

```ts
interface AssistantResponse {
  assistant: AssistantType;
  sections: Record<string, string>;  // e.g., { "Executive Summary": "...", "Financials": "..." }
  sources: Source[];
  rawModelOutput: string;
  metadata: {
    model: string;
    tokensUsed: number;
    latencyMs: number;
    cost: number;
  };
}
```

### UsageMetric

```ts
interface UsageMetric {
  model: string;
  tokensIn: number;
  tokensOut: number;
  costCents: number;
  latencyMs: number;
  toolInvocations: {
    retrieval: number;
    webSearch: number;
    finance: number;
  };
}
```

### QuotaCheckResult

```ts
interface QuotaCheckResult {
  ok: boolean;
  reason?: string;
  resetsAtISO?: string;  // ISO 8601 timestamp of next midnight UTC
  currentUsage?: {
    tokens: number;
    costCents: number;
  };
}
```

---

## Component Interactions

### Planner Module

**Location**: `packages/ai-core/src/orchestration/planner.ts`

**Key Functions**:
- `plan(input)`: Core planning logic (pure function)
- `planWithQuotaCheck(input)`: Wrapper with preflight quota check
- `deriveHeuristics(input)`: Fast heuristic extraction
- `validatePlannerInput(input)`: Zod schema validation

**Dependencies**:
- `OpenAIClient` for LLM calls
- `preflightPlannerCheck` for quota enforcement
- `PlannerOutputSchema` for structured output

### Executor Module

**Location**: `packages/ai-core/src/orchestration/executor.ts`

**Key Functions**:
- `execute(options)`: Main execution orchestrator
- `prepareRetrieval()`: RAG chunk retrieval
- `prepareWebSearch()`: OpenAI web search
- `prepareFinance()`: Financial model computation

**Flow**:
1. Preflight quota check
2. Parallel preparation (retrieval, web, finance)
3. Message assembly with context
4. Tool setup (finance calculations)
5. LLM call with tools
6. Response parsing and validation
7. Usage emission

**Dependencies**:
- `OpenAIClient` for LLM + telemetry
- `retrieveHybrid` for RAG
- `webSearchWithOpenAI` for web search
- `buildFinancialModel` for finance
- `preflightQuotaGuard` for quota enforcement

### Quota Module

**Location**: `packages/ai-core/src/usage/quota.ts`

**Key Functions**:
- `checkQuotas(params)`: Async quota validation
- `enforcePerRequestCaps(params)`: Sync token/cost limits
- `assertQuotasOk(params)`: Throwing variant
- `getCurrentQuotaUsage(params)`: UI-friendly stats

**Quota Types**:
1. **Daily User Quota**: Reset at midnight UTC
2. **Daily Tenant Quota**: Reset at midnight UTC
3. **Per-Request Token Cap**: Immediate, no reset
4. **Per-Request Cost Cap**: Immediate, no reset

### Meter Module

**Location**: `packages/ai-core/src/usage/meter.ts`

**Key Functions**:
- `calcCostCents(params)`: Cost calculation with rounding
- `buildUsageFromClientEvent(params)`: Metric normalization
- `emitUsage(params)`: Sampling + persistence
- `estimateUsage(params)`: Preflight estimation

**Behavior**:
- Sampling controlled by `USAGE_SAMPLING_RATE`
- Soft-fail controlled by `USAGE_SOFT_FAIL`
- Cost rounded UP to nearest cent

### Database Module

**Location**: `packages/db/src/usage.ts`

**Key Functions**:
- `recordUsage(row)`: Insert usage log
- `sumTokensByUser(params)`: User daily tokens
- `sumTokensByTenant(params)`: Tenant daily tokens
- `recentUsageByAssistant(params)`: Analytics aggregation
- `purgeOldUsage(params)`: Retention policy cleanup

**Query Patterns**:
- All sums use `COALESCE(SUM(...), 0)` for null safety
- Bigint results converted to number
- Parameterized queries prevent SQL injection

---

## Security Considerations

### Authentication

- **Firebase Auth** (optional): User ID tokens validated at API layer
- **API Keys** (alternative): Tenant-scoped keys for service-to-service
- **Multi-tenancy**: All data scoped by `tenantId`

### Quota Bypass Prevention

- Quota checks run **before** any LLM work (fail fast)
- Database errors → deny request (fail closed)
- Quota enforcement cannot be disabled in production
- Usage logs immutable (no UPDATE or DELETE except purge)

### Cost Controls

- Per-request cost cap ($0.50 default)
- Model escalation requires explicit planner decision
- Prompt caching reduces repeat costs
- Usage sampling reduces DB load

### Privacy

- User input **not** stored in `usage_logs` (only tokens/cost)
- Request IDs enable tracing without PII
- Logs purged after retention period (90 days default)

---

## Performance Optimization

### Caching Strategy

1. **Prompt Caching** (OpenAI):
   - System prompts (~1-2KB)
   - Developer prompts (~2-4KB)
   - RAG context (up to 4KB)
   - Cache TTL: ~5-10 minutes

2. **Database Connection Pooling**:
   - Max connections: 20
   - Connection timeout: 5s
   - Query timeout: 30s

3. **Parallel Execution**:
   - RAG, web search, finance run concurrently
   - Reduces executor latency by 30-50%

### Indexing

Critical indexes on `usage_logs`:

```sql
CREATE INDEX idx_user_created ON usage_logs(user_id, created_at);
CREATE INDEX idx_tenant_created ON usage_logs(tenant_id, created_at);
CREATE INDEX idx_assistant_created ON usage_logs(assistant_type, created_at);
```

Without these, quota queries will timeout under load.

---

## Monitoring & Alerts

### Key Dashboards

1. **Request Volume**: Requests/minute by assistant type
2. **Quota Usage**: User/tenant quota utilization (%)
3. **Cost Trends**: Daily cost breakdown by model
4. **Error Rates**: 429, 500 errors over time
5. **Latency**: p50, p95, p99 for planner and executor

### Alerts

- **High Cost**: Daily spend > $100
- **Quota Abuse**: Single user > 80% of daily quota
- **Error Spike**: 429 or 500 > 5% of requests
- **Latency Spike**: p95 > 10s for executor
- **Database Lag**: Quota queries > 500ms

---

## Future Enhancements

1. **Redis Quota Cache**: In-memory quota tracking for sub-millisecond checks
2. **Streaming Responses**: Server-sent events for progressive answers
3. **Batch Processing**: Queue-based async processing for non-interactive requests
4. **Multi-Model Support**: Add Anthropic, Gemini as fallbacks
5. **Advanced Analytics**: ML-based anomaly detection for abuse
