# Business Track AI - Setup & Demo Guide

## Overview

The Business Track AI provides three intelligent assistants for startup planning:

1. **Streamlined Plan (#108)**: Generates lean one-page business plans
2. **Executive Summary (#109)**: Creates financial overviews with projections
3. **Market Analysis (#110)**: Analyzes markets with web-sourced data

---

## Quick Start Demo

### Prerequisites

- Node.js 18+ installed
- OpenAI API key
- PostgreSQL database (optional for full features)

### 1. Environment Setup

Create a `.env.local` file in the project root:

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional (for full features)
DATABASE_URL=postgresql://user:pass@localhost:5432/kimuntupro
ENABLE_USAGE_TRACKING=true
ENABLE_WEB_SEARCH=true

# Quota Configuration (optional)
DAILY_TOKEN_QUOTA_PER_USER=100000
DAILY_TOKEN_QUOTA_PER_TENANT=2000000
MAX_COST_PER_REQUEST_CENTS=50
MAX_TOKENS_PER_REQUEST=16000

# Usage Tracking (optional)
USAGE_SOFT_FAIL=false
USAGE_SAMPLING_RATE=1.0
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Packages

```bash
# Build all packages
npm run build

# Or build individually
npm -w @kimuntupro/shared run build
npm -w @kimuntupro/db run build
npm -w @kimuntupro/ai-core run build
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### 5. Access the Demo

Navigate to: **http://localhost:3000/dashboard/business/ai-assistant**

---

## Demo Scenarios

### Scenario 1: Streamlined Plan (#108)

**Prompt:**
```
Draft a lean one-page plan for a meal-prep SaaS targeting students at ASU.
```

**Expected Output:**
- Problem statement
- Solution overview
- Ideal Customer Profile (ICP)
- Go-to-Market (GTM) strategy
- 90-Day Milestones
- Key Performance Indicators (KPIs)
- Next Actions
- Sources (if RAG documents available)

### Scenario 2: Executive Summary with Financials (#109)

**Prompt:**
```
Financial overview for $99/mo SaaS, 20% COGS, 4% churn, +25 subs/mo, $10k S&M, 12 months.
```

**Advanced Options (Optional):**
- ARPU: $99
- COGS: 20%
- Churn Rate: 4%
- New Customers/Month: 25
- S&M Spend: $10,000
- Projection Months: 12

**Expected Output:**
- Executive Summary
- Unit Economics (CAC, LTV, LTV:CAC ratio)
- 12-Month Financial Projections (MRR, ARR, runway)
- Cost Structure breakdown
- Key Metrics & Ratios
- Recommendations
- Sources

### Scenario 3: Market Analysis (#110)

**Prompt:**
```
Analyze the AI coding assistant market; top competitors, pricing bands, and GTM angles.
```

**Expected Output:**
- Market Definition
- TAM/SAM/SOM estimates
- Target Segments
- Competitive Landscape (GitHub Copilot, Cursor, TabNine, etc.)
- Pricing Bands analysis
- Go-to-Market Angles
- Data Sources and Assumptions
- Web Sources (with links to recent articles)

---

## Features

### Quota Enforcement

The system enforces usage quotas to control costs:

- **Per-User Daily Limit**: 100,000 tokens/day
- **Per-Tenant Daily Limit**: 2,000,000 tokens/day
- **Per-Request Token Cap**: 16,000 tokens
- **Per-Request Cost Cap**: $0.50

If you exceed a quota, you'll see a **429 Quota Exceeded** error with reset time.

### Error Handling

The UI handles three error types:

1. **Quota Exceeded (429)**: Shows reset time and retry instructions
2. **Authentication Required (401/403)**: Prompts for sign-in
3. **Server Error (500)**: Displays error message with retry button

### Usage Tracking

All requests are tracked for:
- Token usage (input + output)
- Cost in cents
- Latency in milliseconds
- Tool invocations (RAG, web search, finance)

View usage in the top-right badge or query the database directly.

---

## Architecture

### Two-Stage Pipeline

1. **Stage A: Planner (Cheap)**
   - Uses `gpt-4o-mini` to analyze request
   - Determines required tools (RAG, web search, finance)
   - Decides mini vs. full model for execution
   - Returns structured `PlannerOutput`

2. **Stage B: Executor (Selective Power)**
   - Runs retrieval, web search, or finance tools as needed
   - Uses `gpt-4o-mini` (default) or `gpt-4o` (escalated)
   - Generates final answer with policy validation
   - Returns `AssistantResponse` with sections and sources

### Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                        │
│    /dashboard/business/ai-assistant/page.tsx                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
            POST /api/ai/answer { assistant, input, extra }
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   Quota Middleware                           │
│    (withQuotaGuard checks quotas before proceeding)          │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┴───────────────────┐
        │                                      │
┌───────▼────────┐                  ┌──────────▼─────────┐
│ Planner (A)    │  ─────plan────▶  │ Executor (B)       │
│ gpt-4o-mini    │                  │ mini or gpt-4o     │
└────────────────┘                  └──────────┬─────────┘
                                               │
                      ┌────────────────────────┴──────────┐
                      │                                   │
            ┌─────────▼─────────┐              ┌─────────▼─────────┐
            │ RAG Retrieval     │              │ Web Search        │
            │ (Hybrid BM25+Vec) │              │ (OpenAI built-in) │
            └───────────────────┘              └───────────────────┘
                      │
            ┌─────────▼─────────┐
            │ Finance Tools     │
            │ (Unit Econ, Proj) │
            └───────────────────┘
```

---

## Testing

### Run All Tests

```bash
npm -w @kimuntupro/ai-core run test
```

### Run Specific Test Suites

```bash
# Assistant E2E tests
npm -w @kimuntupro/ai-core run test -- tests/assistants

# Usage tracking tests
npm -w @kimuntupro/ai-core run test -- tests/usage

# Quota enforcement tests
npm -w @kimuntupro/ai-core run test -- tests/usage/quota.test.ts
```

### Expected Test Results

- **Assistant E2E Tests**: 15 tests passing
- **Meter Tests**: 23 tests passing
- **Quota Tests**: 22 tests passing
- **Total**: ~400+ tests passing across all modules

---

## Troubleshooting

### OpenAI API Key Issues

**Error**: `401 Unauthorized`

**Solution**:
- Verify `OPENAI_API_KEY` is set in `.env.local`
- Check key has sufficient credits
- Ensure key starts with `sk-`

### Quota Exceeded Errors

**Error**: `429 Quota Exceeded`

**Solution**:
- Wait until reset time (shown in error message)
- Increase quotas in `.env.local`:
  ```bash
  DAILY_TOKEN_QUOTA_PER_USER=200000
  MAX_COST_PER_REQUEST_CENTS=100
  ```
- Or disable enforcement for testing:
  ```bash
  DISABLE_QUOTA_ENFORCEMENT=true
  ```

### Database Connection Issues

**Error**: `Failed to record usage`

**Solution**:
- Set `USAGE_SOFT_FAIL=true` to continue without usage tracking
- Or set `ENABLE_USAGE_TRACKING=false` to disable tracking entirely
- Verify `DATABASE_URL` is correct if tracking is desired

### Build Errors

**Error**: TypeScript compilation failed

**Solution**:
```bash
# Clean and rebuild
rm -rf packages/*/dist packages/*/.tsbuildinfo
npm run build
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Use a different port
PORT=3001 npm run dev
```

---

## Advanced Configuration

### Enable Prompt Caching

Reduce costs by 50% for repeated prompts:

```bash
ENABLE_PROMPT_CACHING=true
```

### Adjust Model Selection

Force use of full model for all requests:

```bash
DEFAULT_MODEL_MINI=gpt-4o
DEFAULT_MODEL_ESCALATION=gpt-4o
```

### Configure Web Search

```bash
ENABLE_WEB_SEARCH=true
OPENAI_WEB_SEARCH_MAX_RESULTS=8
```

### RAG Configuration

```bash
RETRIEVAL_FINAL_K=8
CONTEXT_TOKEN_LIMIT=4000
```

---

## Production Deployment

### Environment Variables

Ensure these are set in production:

```bash
NODE_ENV=production
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
ENABLE_USAGE_TRACKING=true
USAGE_SOFT_FAIL=false  # Fail hard in production
DISABLE_QUOTA_ENFORCEMENT=false  # Never disable in production
```

### Database Setup

```bash
# Run migrations
npm -w @kimuntupro/db run db:migrate

# Generate Prisma client
npm -w @kimuntupro/db run db:generate
```

### Build for Production

```bash
npm run build
npm start
```

---

## Support & Documentation

- **Architecture Guide**: `docs/ai/ARCHITECTURE.md`
- **Operations Runbook**: `docs/ai/RUNBOOK.md`
- **Prompt Engineering**: `docs/ai/PROMPTS.md`
- **Web Search Guide**: `docs/ai/WEBSEARCH.md`

For issues or questions, check the [GitHub repository](https://github.com/your-org/kimuntupro).
