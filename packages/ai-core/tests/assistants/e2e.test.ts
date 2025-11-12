/**
 * End-to-End Tests for Business Track AI Assistants
 * Tests the three main assistants with mocked planner and executor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  runStreamlinedPlanAssistant,
  runExecSummaryAssistant,
  runMarketAnalysisAssistant,
} from '../../src/assistants/index.js';
import type { AssistantResponse, PlannerOutput } from '@kimuntupro/shared';

// Mock the planner
vi.mock('../../src/orchestration/planner.js', () => ({
  planWithQuotaCheck: vi.fn(async (input) => {
    const mockPlan: PlannerOutput = {
      task: input.assistant,
      requires_retrieval: input.assistant === 'streamlined_plan',
      requires_web_search: input.assistant === 'market_analysis',
      query_terms: ['test', 'query'],
      sections: ['Section 1', 'Section 2', 'Sources'],
      metrics_needed: input.assistant === 'exec_summary' ? ['unit_economics'] : [],
      escalate_model: false,
    };
    return mockPlan;
  }),
}));

// Mock the executor
vi.mock('../../src/orchestration/executor.js', () => ({
  execute: vi.fn(async (options) => {
    const mockResponse: AssistantResponse = {
      assistant: options.request.assistant,
      sections: {
        'Section 1': 'Content for section 1',
        'Section 2': 'Content for section 2',
        Sources: '[R1] Test source',
      },
      sources: [
        {
          type: options.plan.requires_retrieval ? 'rag' : 'web',
          title: 'Test Source',
          snippet: 'Test snippet',
        },
      ],
      rawModelOutput: 'Mock raw output',
      metadata: {
        model: 'gpt-4o-mini',
        tokensUsed: 1000,
        latencyMs: 500,
        cost: 0.01,
      },
    };
    return mockResponse;
  }),
}));

describe('Streamlined Plan Assistant (#108)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run streamlined plan assistant end-to-end', async () => {
    const result = await runStreamlinedPlanAssistant({
      assistant: 'streamlined_plan',
      input: 'Create a business plan for a SaaS startup',
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    // Verify response structure
    expect(result).toBeDefined();
    expect(result.assistant).toBe('streamlined_plan');
    expect(result.sections).toBeDefined();
    expect(result.sources).toBeDefined();
    expect(result.metadata).toBeDefined();
  });

  it('should return required sections', async () => {
    const result = await runStreamlinedPlanAssistant({
      assistant: 'streamlined_plan',
      input: 'Test input',
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    // Verify sections exist
    expect(Object.keys(result.sections).length).toBeGreaterThan(0);
    expect(result.sections).toHaveProperty('Section 1');
    expect(result.sections).toHaveProperty('Section 2');
  });

  it('should return non-empty sources array', async () => {
    const result = await runStreamlinedPlanAssistant({
      assistant: 'streamlined_plan',
      input: 'Test input',
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    expect(Array.isArray(result.sources)).toBe(true);
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it('should include metadata with model info', async () => {
    const result = await runStreamlinedPlanAssistant({
      assistant: 'streamlined_plan',
      input: 'Test input',
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    expect(result.metadata).toHaveProperty('model');
    expect(result.metadata).toHaveProperty('tokensUsed');
    expect(result.metadata).toHaveProperty('latencyMs');
    expect(result.metadata).toHaveProperty('cost');
  });
});

describe('Executive Summary Assistant (#109)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run exec summary assistant end-to-end', async () => {
    const result = await runExecSummaryAssistant({
      assistant: 'exec_summary',
      input: 'Generate financial overview',
      extra: {
        arpu: 99,
        cogs_percent: 20,
        churn_rate: 0.04,
      },
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    expect(result).toBeDefined();
    expect(result.assistant).toBe('exec_summary');
    expect(result.sections).toBeDefined();
    expect(result.sources).toBeDefined();
  });

  it('should return required sections', async () => {
    const result = await runExecSummaryAssistant({
      assistant: 'exec_summary',
      input: 'Test input',
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    expect(Object.keys(result.sections).length).toBeGreaterThan(0);
  });

  it('should return non-empty sources array', async () => {
    const result = await runExecSummaryAssistant({
      assistant: 'exec_summary',
      input: 'Test input',
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    expect(Array.isArray(result.sources)).toBe(true);
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it('should handle finance inputs in extra field', async () => {
    const financeInputs = {
      arpu: 150,
      cogs_percent: 25,
      churn_rate: 0.05,
      new_customers_per_month: 50,
    };

    const result = await runExecSummaryAssistant({
      assistant: 'exec_summary',
      input: 'Financial analysis',
      extra: financeInputs,
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    expect(result).toBeDefined();
    expect(result.assistant).toBe('exec_summary');
  });
});

describe('Market Analysis Assistant (#110)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run market analysis assistant end-to-end', async () => {
    const result = await runMarketAnalysisAssistant({
      assistant: 'market_analysis',
      input: 'Analyze AI coding assistant market',
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    expect(result).toBeDefined();
    expect(result.assistant).toBe('market_analysis');
    expect(result.sections).toBeDefined();
    expect(result.sources).toBeDefined();
  });

  it('should return required sections', async () => {
    const result = await runMarketAnalysisAssistant({
      assistant: 'market_analysis',
      input: 'Test input',
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    expect(Object.keys(result.sections).length).toBeGreaterThan(0);
  });

  it('should return non-empty sources array', async () => {
    const result = await runMarketAnalysisAssistant({
      assistant: 'market_analysis',
      input: 'Test input',
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    expect(Array.isArray(result.sources)).toBe(true);
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it('should return web sources for market data', async () => {
    const result = await runMarketAnalysisAssistant({
      assistant: 'market_analysis',
      input: 'Test input',
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    // Verify sources include web type
    const hasWebSource = result.sources.some((s) => s.type === 'web');
    expect(hasWebSource).toBe(true);
  });
});

describe('Assistant Integration', () => {
  it('should handle tenant and user context', async () => {
    const tenantId = 'integration-tenant';
    const userId = 'integration-user';

    const result = await runStreamlinedPlanAssistant({
      assistant: 'streamlined_plan',
      input: 'Test',
      tenantId,
      userId,
    });

    expect(result).toBeDefined();
  });

  it('should handle optional extra fields', async () => {
    const result = await runStreamlinedPlanAssistant({
      assistant: 'streamlined_plan',
      input: 'Test',
      extra: { customField: 'value' },
      tenantId: 'test-tenant',
      userId: 'test-user',
    });

    expect(result).toBeDefined();
  });
});
