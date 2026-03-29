# Business Track AI - Operations Runbook

## Overview

This runbook covers operational aspects of the Business Track AI system, including deployment, monitoring, quotas, and troubleshooting.

---

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Quotas & Usage Tracking](#quotas--usage-tracking)
3. [Cost Management](#cost-management)
4. [Monitoring & Observability](#monitoring--observability)
5. [Troubleshooting](#troubleshooting)
6. [Maintenance Tasks](#maintenance-tasks)

---

## Environment Configuration

### Required Environment Variables

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-...

# Model Selection
DEFAULT_MODEL_MINI=gpt-4o-mini-2024-07-18
DEFAULT_MODEL_ESCALATION=gpt-4o-2024-08-06

# Token Limits
MAX_TOKENS_PLANNER=4000
MAX_TOKENS_EXECUTOR=8000
CONTEXT_TOKEN_LIMIT=4000
RETRIEVAL_FINAL_K=8

# Database
DATABASE_URL=postgresql://...

# Firebase (optional, for auth)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# Web Search (optional)
OPENAI_WEB_SEARCH_MAX_RESULTS=8
```

### Optional Configuration

```bash
# Prompt Caching
ENABLE_PROMPT_CACHING=true

# Logging
LOG_LEVEL=info

# Feature Flags
ENABLE_WEB_SEARCH=true
ENABLE_RAG=true
ENABLE_FINANCE_TOOLS=true
```

---

## Quotas & Usage Tracking

### Overview

The system enforces per-user and per-tenant quotas to control costs and prevent abuse. Quotas are checked **before** expensive operations (planner/executor) to fail fast.

### Environment Variables

```bash
# Daily Quotas (reset at midnight UTC)
DAILY_TOKEN_QUOTA_PER_USER=100000      # 100K tokens/day per user
DAILY_TOKEN_QUOTA_PER_TENANT=2000000   # 2M tokens/day per tenant

# Per-Request Limits
MAX_COST_PER_REQUEST_CENTS=50          # $0.50 per request
MAX_TOKENS_PER_REQUEST=16000           # 16K tokens per request

# Usage Tracking
ENABLE_USAGE_TRACKING=true             # Enable/disable tracking
USAGE_SAMPLING_RATE=1.0                # Sample rate (0.0-1.0)
USAGE_SOFT_FAIL=false                  # Continue on DB errors?
USAGE_RETENTION_DAYS=90                # Delete logs older than this
USAGE_ANALYTICS_WINDOW_DAYS=30         # Analytics lookback window

# Quota Enforcement
DISABLE_QUOTA_ENFORCEMENT=false        # Disable for testing
```

### Quota Enforcement Flow

```
1. API request arrives at /api/ai/plan or /api/ai/answer
2. withQuotaGuard middleware extracts tenantId, userId, input
3. Estimates token usage (conservative: inputLen * 1.5 + context + maxOutput)
4. Queries database for current usage since midnight UTC
5. Checks if projected usage would exceed quotas
6. If OK: proceeds to planner/executor
7. If EXCEEDED: returns HTTP 429 with resetsAt timestamp
```

### HTTP 429 Response Format

When quota is exceeded:

```json
{
  "error": "quota_exceeded",
  "message": "User daily token quota exceeded. Used 95000 of 100000 tokens today. Request would add 10000 tokens.",
  "resetsAt": "2024-11-12T00:00:00.000Z"
}
```

Headers:
```
Status: 429 Too Many Requests
Retry-After: 43200  (seconds until resetsAt)
```

### Quota Failure Modes

#### 1. User Quota Exceeded
- **Cause**: User has consumed daily token quota
- **Response**: HTTP 429 with user-specific message
- **Reset**: Next midnight UTC
- **Action**: User must wait or admin can increase quota

#### 2. Tenant Quota Exceeded
- **Cause**: Tenant organization has consumed daily quota
- **Response**: HTTP 429 with tenant-specific message
- **Reset**: Next midnight UTC
- **Action**: Tenant admin can upgrade plan or wait

#### 3. Per-Request Token Cap
- **Cause**: Single request estimates >16K tokens
- **Response**: HTTP 429 (no reset time, immediate)
- **Action**: User must reduce input size or context

#### 4. Per-Request Cost Cap
- **Cause**: Single request estimates >$0.50
- **Response**: HTTP 429 (no reset time, immediate)
- **Action**: Request requires escalation approval

#### 5. Database Error During Quota Check
- **Cause**: Database connection failure
- **Response**: HTTP 429 with system error message
- **Behavior**: **Fail closed** (deny request to prevent quota breach)
- **Action**: Check database connectivity

### Usage Sampling

To reduce database load in high-volume scenarios:

```bash
USAGE_SAMPLING_RATE=1.0   # Track 100% of requests (default)
USAGE_SAMPLING_RATE=0.5   # Track 50% of requests (random sample)
USAGE_SAMPLING_RATE=0.1   # Track 10% of requests
```

**Note**: Quota enforcement is **always** active regardless of sampling. Sampling only affects usage log persistence.

### Usage Soft Fail

Controls behavior when usage logging fails:

```bash
USAGE_SOFT_FAIL=false  # Default: throw error, block request
USAGE_SOFT_FAIL=true   # Log warning, continue with request
```

**Use Cases**:
- `false` (strict): High-stakes billing/compliance environments
- `true` (lenient): Development, demos, or when availability > perfect tracking

### Cost Calculation

Costs are calculated using OpenAI pricing per model:

```ts
// gpt-4o-mini-2024-07-18
Input:  $0.150 / 1M tokens
Output: $0.600 / 1M tokens
Cached: $0.075 / 1M tokens (50% discount)

// gpt-4o-2024-08-06
Input:  $2.50 / 1M tokens
Output: $10.00 / 1M tokens
Cached: $1.25 / 1M tokens (50% discount)
```

**Conservative Rounding**:
- All costs rounded **UP** to nearest cent
- Estimates use worst-case scenarios (no caching, max output tokens)

### Monitoring Quotas

#### Check Current Usage (API)

```bash
GET /api/usage/current?userId=user123&tenantId=tenant1
```

Response:
```json
{
  "user": {
    "tokensUsed": 60000,
    "tokensRemaining": 40000,
    "quotaLimit": 100000
  },
  "tenant": {
    "tokensUsed": 1200000,
    "tokensRemaining": 800000,
    "quotaLimit": 2000000
  },
  "resetsAt": "2024-11-12T00:00:00.000Z"
}
```

#### Database Queries

```sql
-- User usage today
SELECT SUM("tokensIn" + "tokensOut") as total_tokens
FROM usage_logs
WHERE "userId" = 'user123'
  AND "createdAt" >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC');

-- Tenant usage today
SELECT SUM("tokensIn" + "tokensOut") as total_tokens
FROM usage_logs
WHERE "tenantId" = 'tenant1'
  AND "createdAt" >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC');

-- Top users by usage (last 7 days)
SELECT "userId",
       COUNT(*) as calls,
       SUM("tokensIn" + "tokensOut") as tokens,
       SUM("costCents") / 100.0 as cost_dollars
FROM usage_logs
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY "userId"
ORDER BY tokens DESC
LIMIT 10;
```

---

## Cost Management

### Model Selection Strategy

The planner determines which model to use based on complexity:

```ts
// Default: gpt-4o-mini (cheap, fast)
escalate_model: false  → gpt-4o-mini

// Escalated: gpt-4o (expensive, powerful)
escalate_model: true   → gpt-4o
```

**Escalation Triggers**:
- Complex financial projections
- Multi-dimensional analysis
- Large context retrieval (>4K tokens)
- User explicitly requests "detailed" or "comprehensive"

### Prompt Caching

OpenAI's prompt caching reduces costs by 50% for cached inputs:

```bash
ENABLE_PROMPT_CACHING=true
```

**Cached Elements**:
- System prompts (planner, executor)
- Developer prompts (task definitions)
- RAG context (if stable)

**Cache Duration**: ~5-10 minutes per OpenAI policy

### Cost Estimation Before Execution

```ts
const estimate = estimateUsage({
  model: 'gpt-4o-mini',
  inputLength: 500,        // characters
  contextTokens: 2000,     // RAG chunks
  maxOutputTokens: 4000,   // max response
});

// estimate = { estimatedTokens: 6750, estimatedCostCents: 3 }
```

### Budget Alerts

Set up monitoring alerts:

```bash
# Daily cost exceeds $10
SELECT SUM("costCents") / 100.0 as daily_cost
FROM usage_logs
WHERE "createdAt" >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC');

# Alert if > $10
```

---

## Monitoring & Observability

### Key Metrics

1. **Request Latency**
   - Planner: <2s p95
   - Executor: <5s p95 (without web search)
   - Executor: <10s p95 (with web search)

2. **Token Usage**
   - User daily: <100K tokens
   - Tenant daily: <2M tokens

3. **Error Rates**
   - Quota exceeded (429): Expected, monitor for abuse
   - Internal errors (500): <1% of requests

4. **Cost per Request**
   - Mini model: $0.001-0.01 per request
   - Escalated model: $0.05-0.20 per request

### Logging

All usage events are logged to `usage_logs` table:

```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  assistant_type VARCHAR NOT NULL,
  model VARCHAR NOT NULL,
  tokens_in INT NOT NULL,
  tokens_out INT NOT NULL,
  cost_cents INT NOT NULL,
  latency_ms INT NOT NULL,
  tool_invocations JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes**:
- `(user_id, created_at)` for user quota queries
- `(tenant_id, created_at)` for tenant quota queries
- `(assistant_type, created_at)` for analytics

### Analytics Queries

```sql
-- Usage by assistant type (last 30 days)
SELECT assistant_type,
       COUNT(*) as calls,
       SUM(tokens_in + tokens_out) as tokens,
       SUM(cost_cents) / 100.0 as cost_dollars
FROM usage_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY assistant_type
ORDER BY calls DESC;

-- Tool invocation frequency
SELECT
  SUM((tool_invocations->>'retrieval')::int) as retrieval_calls,
  SUM((tool_invocations->>'webSearch')::int) as web_search_calls,
  SUM((tool_invocations->>'finance')::int) as finance_calls
FROM usage_logs
WHERE created_at >= NOW() - INTERVAL '7 days';
```

---

## Troubleshooting

### Common Issues

#### 1. "Quota exceeded" but user hasn't used system

**Symptoms**: User receives 429 despite not making requests

**Causes**:
- Clock skew (quota resets at UTC midnight)
- Shared tenantId (another user consumed quota)
- Cached query results (database lag)

**Solutions**:
1. Check current UTC time vs. user's timezone
2. Query `usage_logs` directly for user/tenant
3. Restart database connection pool

#### 2. Usage logs not appearing in database

**Symptoms**: Requests succeed but no logs in `usage_logs`

**Causes**:
- `ENABLE_USAGE_TRACKING=false`
- `USAGE_SAMPLING_RATE < 1.0` (sampled out)
- `USAGE_SOFT_FAIL=true` + database error
- Database write permissions

**Solutions**:
1. Check environment variables
2. Verify database connection
3. Check application logs for errors
4. Test with `USAGE_SAMPLING_RATE=1.0`

#### 3. High costs from escalated model

**Symptoms**: Bills higher than expected

**Causes**:
- Planner over-escalating to gpt-4o
- Large context retrieval triggering escalation
- User explicitly requesting "detailed" analysis

**Solutions**:
1. Review planner escalation logic
2. Reduce `CONTEXT_TOKEN_LIMIT`
3. Add per-tenant escalation budget cap
4. Audit `escalate_model: true` usage patterns

#### 4. Requests failing with "System error during quota check"

**Symptoms**: All requests return 429 with system error

**Causes**:
- Database connection failure
- Query timeout
- Missing indexes on `usage_logs`

**Solutions**:
1. Check database health
2. Verify connection string
3. Add indexes: `(user_id, created_at)`, `(tenant_id, created_at)`
4. Temporarily set `DISABLE_QUOTA_ENFORCEMENT=true` (not recommended for production)

---

## Maintenance Tasks

### Daily

- Monitor quota usage across tenants
- Check for 429 error spikes
- Review cost trends

### Weekly

- Analyze usage by assistant type
- Identify high-usage users/tenants
- Review escalation patterns

### Monthly

- Generate cost reports per tenant
- Adjust quota limits if needed
- Optimize prompt caching strategies

### Quarterly

- Purge old usage logs (>90 days):
  ```bash
  npm run db:purge-usage -- --before=2024-08-01
  ```
- Review and update pricing tiers
- Audit security and access patterns

---

## Emergency Procedures

### Runaway Cost Scenario

If costs spike unexpectedly:

1. **Immediate**: Set `DISABLE_QUOTA_ENFORCEMENT=false` and reduce quotas by 50%
2. **Identify**: Query top users/tenants by cost in last hour
3. **Throttle**: Temporarily reduce their quotas to 10% of normal
4. **Investigate**: Check for abuse, bugs, or legitimate surge
5. **Communicate**: Notify affected users/tenants
6. **Restore**: Gradually lift restrictions after mitigation

### Database Outage

If `usage_logs` database is unavailable:

1. **Fail closed**: Requests will return 429 (system error)
2. **Bypass option**: Set `DISABLE_QUOTA_ENFORCEMENT=true` (risky!)
3. **Alternative**: Use Redis for in-memory quota tracking
4. **Recovery**: Quotas reset at midnight UTC regardless

---

## Contact & Escalation

- **On-call**: [Your alerting system]
- **Database issues**: [DBA contact]
- **Cost alerts**: [Finance team]
- **Security incidents**: [Security team]
