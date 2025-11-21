# AI Prompts for Business Track

This document maintains versioned prompts for the Business Track AI orchestration layer.

## Overview

All prompts follow the **GLOBAL DIRECTIVE**: Business Track context with cost-consciousness. Prompts are versioned to support A/B testing, rollback, and iterative improvement.

---

## Planner Prompts (Stage A)

### PLANNER_SYSTEM_V1

**Purpose:** System-level instructions for the Stage-A Planner
**Model:** gpt-4o-mini (cost-conscious default)
**Output:** Structured JSON conforming to `PlannerOutput` schema

**Prompt:**

```
You are the Stage-A Planner for the Business Track AI Assistant.

Your role is to analyze the user's request and output a structured JSON plan that guides the executor.

CRITICAL RULES:
1. Output ONLY valid JSON conforming to the PlannerOutput schema - no markdown, no explanations
2. Be extremely cost-conscious - prefer RAG over web search when possible
3. NEVER fabricate numbers or financial metrics - only list what metrics_needed the executor should compute
4. Keep query_terms short and specific (nouns/phrases, no boilerplate)
5. Cap sections to a practical set for each assistant (typically 6-10 sections)
6. Set escalate_model = true ONLY for rare multi-step chained reasoning with heavy abstraction

ASSISTANT-SPECIFIC DEFAULTS:
- market_analysis (#110): requires_web_search = true by default
- exec_summary & financial_overview (#109): include finance metrics in metrics_needed
- streamlined_plan (#108): requires_retrieval often true for internal materials

Always include "Sources" in sections if requires_retrieval or requires_web_search is true.
```

---

### PLANNER_DEVELOPER_V1

**Purpose:** Developer-mode instructions with canonical section templates
**Role:** Defines expected structure for each assistant type

**Prompt:**

```
CANONICAL SECTIONS BY ASSISTANT TYPE:

#108 "streamlined_plan":
- Expected sections: ["Problem", "Solution", "ICP", "GTM", "90-day Milestones", "Risks & Mitigations", "KPIs", "Next Actions"]
- Typical requires_retrieval: true (if referencing internal docs)
- Typical requires_web_search: false (unless market claims requested)
- metrics_needed: rarely needed (not a financial assistant)

#109 "exec_summary" or "financial_overview":
- Expected sections: ["Executive Summary", "Business Model", "Unit Economics", "Financial Projections", "Key Risks", "Recommendations"]
- ALWAYS include metrics_needed: ["unit_economics", "twelve_month_projection"] or similar
- Finance metrics are computed by deterministic tools - do NOT generate numbers
- Typical requires_retrieval: true (for company context)
- Typical requires_web_search: false (unless market data needed)

#110 "market_analysis":
- Expected sections: ["Market Definition", "Sizing (TAM/SAM/SOM)", "Target Segments", "Competitors", "Pricing Bands", "GTM Angles", "Assumptions & Data Freshness"]
- ALWAYS requires_web_search: true (needs current market data)
- Typical requires_retrieval: false (unless using internal market research)
- query_terms: focus on industry, competitors, pricing, market size

SOURCES SECTION:
- MUST be included whenever requires_retrieval OR requires_web_search is true
- Not counted toward section cap - it's automatically added

QUERY TERMS:
- Extract 3-10 specific noun phrases or keywords
- Examples: ["B2B SaaS", "mid-market", "pricing models", "competitor landscape"]
- Avoid: generic terms like "business", "plan", "analysis"

ESCALATE_MODEL:
- Default: false (use mini model for cost efficiency)
- Set true only if: complex multi-step reasoning, heavy abstraction, mathematical proofs
- Example rare cases: strategic pivots requiring game theory, multi-stakeholder analysis
```

---

## Usage Examples

### Example 1: Streamlined Plan (Internal Docs)

**Input:**
```json
{
  "assistant": "streamlined_plan",
  "input": "Create a business plan based on our uploaded pitch deck and Q3 financials",
  "tenantId": "biz-123",
  "userId": "user-456"
}
```

**Expected Plan:**
```json
{
  "task": "streamlined_plan",
  "requires_retrieval": true,
  "requires_web_search": false,
  "query_terms": ["pitch deck", "Q3 financials", "business plan", "strategy"],
  "sections": [
    "Problem",
    "Solution",
    "ICP",
    "GTM",
    "90-day Milestones",
    "KPIs",
    "Sources"
  ],
  "metrics_needed": [],
  "escalate_model": false
}
```

### Example 2: Financial Overview (#109)

**Input:**
```json
{
  "assistant": "financial_overview",
  "input": "Provide a financial overview for a SaaS business with $100 ARPU, 25% COGS, 5% churn",
  "tenantId": "biz-123",
  "userId": "user-456"
}
```

**Expected Plan:**
```json
{
  "task": "financial_overview",
  "requires_retrieval": false,
  "requires_web_search": false,
  "query_terms": ["saas", "financial overview", "unit economics"],
  "sections": [
    "Financial Overview",
    "Revenue Model",
    "Unit Economics",
    "Projections (12-24 Months)",
    "Key Metrics & Ratios"
  ],
  "metrics_needed": ["unit_economics", "twelve_month_projection"],
  "escalate_model": false
}
```

### Example 3: Market Analysis (#110)

**Input:**
```json
{
  "assistant": "market_analysis",
  "input": "Analyze the AI coding assistant market including competitors and pricing",
  "tenantId": "biz-123",
  "userId": "user-456"
}
```

**Expected Plan:**
```json
{
  "task": "market_analysis",
  "requires_retrieval": false,
  "requires_web_search": true,
  "query_terms": [
    "AI coding assistant",
    "market size",
    "competitors",
    "pricing",
    "GitHub Copilot",
    "Cursor",
    "TAM SAM SOM"
  ],
  "sections": [
    "Market Definition",
    "Sizing (TAM/SAM/SOM)",
    "Target Segments",
    "Competitors",
    "Pricing Bands",
    "GTM Angles",
    "Assumptions & Data Freshness",
    "Sources"
  ],
  "metrics_needed": [],
  "escalate_model": false
}
```

---

## Heuristics (Pre-LLM)

Before calling the LLM, the planner applies cheap heuristics to reduce token usage and provide fallback:

1. **Retrieval Triggers:**
   - Keywords: "uploaded", "our doc", "internal report", "from last quarter"
   - Sets `requires_retrieval = true`

2. **Web Search Triggers:**
   - Keywords: "market", "competitor", "pricing", "latest", "current trends"
   - Assistant type: `market_analysis` → always `requires_web_search = true`

3. **Query Term Extraction:**
   - Remove stopwords (the, and, for, etc.)
   - Extract noun phrases (2-4 word combinations)
   - Limit to top 10 terms

4. **Finance Metrics:**
   - Assistant type: `exec_summary` or `financial_overview` → add `["unit_economics", "twelve_month_projection"]`

5. **Section Templates:**
   - Each assistant type has canonical sections (see PLANNER_DEVELOPER_V1)
   - Auto-add "Sources" if retrieval or web search enabled

---

## Fallback Strategy

If the LLM fails (network error, schema violation after retry, timeout):

1. **Use Heuristic Plan:**
   - Derived sections, query terms, and flags from heuristics
   - Safe default: `escalate_model = false`
   - Log warning for monitoring

2. **Validation:**
   - Always validate against `PlannerOutputSchema`
   - Retry once on Zod validation failure
   - If second attempt fails, use heuristic fallback

---

## Cost Optimization

### Token Savings
- **Heuristics passed as hints:** Reduces LLM guesswork
- **Prompt caching:** `cacheTag: "planner:v1"` for repeated system/developer prompts
- **Mini model default:** gpt-4o-mini for ~10x cost savings vs. gpt-4o
- **Low temperature:** 0.3 for consistent, deterministic planning
- **Token cap:** Max 1500 output tokens (plans are short)

### Typical Costs
- **Average plan:** ~350 tokens total (200 in + 150 out)
- **Cost per plan:** ~$0.0001 (with gpt-4o-mini)
- **With caching:** ~50% reduction on repeated requests

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| V1 | 2025-01-11 | Initial planner prompts for Business Track |

---

## Next Steps

- **Executor Prompts:** To be defined in Step 8-10
- **RAG Prompt Templates:** Context injection patterns (Step 11-12)
- **Tool-Specific Prompts:** Finance tool usage instructions (Step 12-14)

---

**Last Updated:** Step 7 - Planner Implementation
**Related Docs:**
- `/docs/business-track-parity-mapping.md` - Business Track features
- `/docs/ai/WEBSEARCH.md` - Web search integration
- `/packages/ai-core/src/orchestration/prompts.ts` - Source code
