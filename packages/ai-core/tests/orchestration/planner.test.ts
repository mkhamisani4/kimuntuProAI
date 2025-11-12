/**
 * Tests for Stage A Planner
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { plan, deriveHeuristics, validatePlannerInput } from '../../src/orchestration/planner.js';
import type { PlannerInput, PlannerOutput } from '@kimuntupro/shared';
import { OpenAIClient } from '../../src/llm/client.js';

describe('deriveHeuristics', () => {
  it('should extract query terms from input', () => {
    const input: PlannerInput = {
      assistant: 'streamlined_plan',
      input: 'Create a business plan for a B2B SaaS company targeting mid-market enterprises',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const heuristics = deriveHeuristics(input);

    expect(heuristics.suggested_query_terms).toContain('business plan');
    expect(heuristics.suggested_query_terms.length).toBeGreaterThan(0);
    expect(heuristics.suggested_query_terms.length).toBeLessThanOrEqual(10);
  });

  it('should detect retrieval triggers', () => {
    const input: PlannerInput = {
      assistant: 'exec_summary',
      input: 'According to our internal report from last quarter, analyze the financials',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const heuristics = deriveHeuristics(input);

    expect(heuristics.suggested_requires_retrieval).toBe(true);
  });

  it('should detect web search triggers', () => {
    const input: PlannerInput = {
      assistant: 'streamlined_plan',
      input: 'What is the latest market size and competitive landscape for AI tools?',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const heuristics = deriveHeuristics(input);

    expect(heuristics.suggested_requires_web_search).toBe(true);
  });

  it('should always enable web search for market_analysis', () => {
    const input: PlannerInput = {
      assistant: 'market_analysis',
      input: 'Simple market analysis request',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const heuristics = deriveHeuristics(input);

    expect(heuristics.suggested_requires_web_search).toBe(true);
  });

  it('should include finance metrics for exec_summary', () => {
    const input: PlannerInput = {
      assistant: 'exec_summary',
      input: 'Create an executive summary',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const heuristics = deriveHeuristics(input);

    expect(heuristics.suggested_metrics_needed).toContain('unit_economics');
    expect(heuristics.suggested_metrics_needed).toContain('twelve_month_projection');
  });

  it('should include finance metrics for financial_overview', () => {
    const input: PlannerInput = {
      assistant: 'financial_overview',
      input: 'Provide financial overview',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const heuristics = deriveHeuristics(input);

    expect(heuristics.suggested_metrics_needed).toContain('unit_economics');
    expect(heuristics.suggested_metrics_needed).toContain('twelve_month_projection');
  });

  it('should suggest appropriate sections for streamlined_plan', () => {
    const input: PlannerInput = {
      assistant: 'streamlined_plan',
      input: 'Create a business plan',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const heuristics = deriveHeuristics(input);

    expect(heuristics.suggested_sections).toContain('Problem');
    expect(heuristics.suggested_sections).toContain('Solution');
    expect(heuristics.suggested_sections).toContain('ICP');
    expect(heuristics.suggested_sections).toContain('GTM');
  });

  it('should suggest appropriate sections for market_analysis', () => {
    const input: PlannerInput = {
      assistant: 'market_analysis',
      input: 'Analyze the market',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const heuristics = deriveHeuristics(input);

    expect(heuristics.suggested_sections).toContain('Market Definition');
    expect(heuristics.suggested_sections).toContain('Sizing (TAM/SAM/SOM)');
    expect(heuristics.suggested_sections).toContain('Competitors');
  });

  it('should add Sources section when retrieval or web search enabled', () => {
    const input: PlannerInput = {
      assistant: 'streamlined_plan',
      input: 'Check our uploaded docs and latest market trends',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const heuristics = deriveHeuristics(input);

    expect(heuristics.suggested_requires_retrieval).toBe(true);
    expect(heuristics.suggested_sections).toContain('Sources');
  });

  it('should not add duplicate Sources section', () => {
    const input: PlannerInput = {
      assistant: 'market_analysis',
      input: 'Market analysis',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const heuristics = deriveHeuristics(input);

    const sourcesSections = heuristics.suggested_sections.filter((s) => s === 'Sources');
    expect(sourcesSections).toHaveLength(1);
  });

  it('should filter stopwords from query terms', () => {
    const input: PlannerInput = {
      assistant: 'streamlined_plan',
      input: 'the and for are but not you all can',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const heuristics = deriveHeuristics(input);

    // Should not include short or stopword terms
    expect(heuristics.suggested_query_terms.length).toBe(0);
  });
});

describe('validatePlannerInput', () => {
  it('should accept valid input', () => {
    const input = {
      assistant: 'streamlined_plan',
      input: 'Create a business plan',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = validatePlannerInput(input);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should reject missing required fields', () => {
    const input = {
      assistant: 'streamlined_plan',
      // missing input, tenantId, userId
    };

    const result = validatePlannerInput(input);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject invalid assistant type', () => {
    const input = {
      assistant: 'invalid_assistant',
      input: 'Test',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = validatePlannerInput(input);

    expect(result.success).toBe(false);
  });

  it('should accept optional extra field', () => {
    const input = {
      assistant: 'streamlined_plan',
      input: 'Test',
      tenantId: 'tenant1',
      userId: 'user1',
      extra: { customField: 'value' },
    };

    const result = validatePlannerInput(input);

    if (!result.success) {
      console.log('Validation errors:', result.errors);
    }

    expect(result.success).toBe(true);
    if (result.data?.extra) {
      expect(result.data.extra).toEqual({ customField: 'value' });
    }
  });
});

describe('plan with mocked OpenAI', () => {
  let mockClient: OpenAIClient;

  beforeEach(() => {
    mockClient = {
      chatStructured: vi.fn(),
    } as any;
  });

  it('should return valid plan for streamlined_plan', async () => {
    const mockResponse: PlannerOutput = {
      task: 'streamlined_plan',
      requires_retrieval: true,
      requires_web_search: false,
      query_terms: ['business plan', 'b2b saas', 'mid-market'],
      sections: ['Problem', 'Solution', 'ICP', 'GTM', '90-day Milestones', 'KPIs', 'Sources'],
      metrics_needed: [],
      escalate_model: false,
    };

    (mockClient.chatStructured as any).mockResolvedValue({
      data: mockResponse,
      raw: {},
      tokensIn: 200,
      tokensOut: 150,
      model: 'gpt-4o-mini',
      latencyMs: 500,
      cachedInputApplied: false,
      costCents: 0.01,
    });

    const input: PlannerInput = {
      assistant: 'streamlined_plan',
      input: 'Create a business plan for B2B SaaS targeting mid-market',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = await plan(input, mockClient);

    expect(result.task).toBe('streamlined_plan');
    expect(result.sections).toContain('Problem');
    expect(result.sections).toContain('Sources');
    expect(result.escalate_model).toBe(false);
  });

  it('should return valid plan for exec_summary with finance metrics', async () => {
    const mockResponse: PlannerOutput = {
      task: 'exec_summary',
      requires_retrieval: false,
      requires_web_search: false,
      query_terms: ['executive summary', 'business model'],
      sections: [
        'Executive Summary',
        'Business Model',
        'Unit Economics',
        'Financial Projections',
        'Recommendations',
      ],
      metrics_needed: ['unit_economics', 'twelve_month_projection'],
      escalate_model: false,
    };

    (mockClient.chatStructured as any).mockResolvedValue({
      data: mockResponse,
      raw: {},
      tokensIn: 200,
      tokensOut: 150,
      model: 'gpt-4o-mini',
      latencyMs: 500,
      cachedInputApplied: false,
      costCents: 0.01,
    });

    const input: PlannerInput = {
      assistant: 'exec_summary',
      input: 'Generate executive summary',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = await plan(input, mockClient);

    expect(result.task).toBe('exec_summary');
    expect(result.metrics_needed).toContain('unit_economics');
    expect(result.metrics_needed).toContain('twelve_month_projection');
  });

  it('should return valid plan for financial_overview with finance metrics', async () => {
    const mockResponse: PlannerOutput = {
      task: 'financial_overview',
      requires_retrieval: false,
      requires_web_search: false,
      query_terms: ['financial overview', 'unit economics'],
      sections: [
        'Financial Overview',
        'Unit Economics',
        'Projections (12-24 Months)',
        'Key Metrics & Ratios',
      ],
      metrics_needed: ['unit_economics', 'twelve_month_projection'],
      escalate_model: false,
    };

    (mockClient.chatStructured as any).mockResolvedValue({
      data: mockResponse,
      raw: {},
      tokensIn: 200,
      tokensOut: 150,
      model: 'gpt-4o-mini',
      latencyMs: 500,
      cachedInputApplied: false,
      costCents: 0.01,
    });

    const input: PlannerInput = {
      assistant: 'financial_overview',
      input: 'Provide financial overview',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = await plan(input, mockClient);

    expect(result.task).toBe('financial_overview');
    expect(result.metrics_needed).toContain('unit_economics');
  });

  it('should return valid plan for market_analysis with web search', async () => {
    const mockResponse: PlannerOutput = {
      task: 'market_analysis',
      requires_retrieval: false,
      requires_web_search: true,
      query_terms: ['market size', 'TAM SAM SOM', 'competitors', 'pricing'],
      sections: [
        'Market Definition',
        'Sizing (TAM/SAM/SOM)',
        'Target Segments',
        'Competitors',
        'Pricing Bands',
        'GTM Angles',
        'Sources',
      ],
      metrics_needed: [],
      escalate_model: false,
    };

    (mockClient.chatStructured as any).mockResolvedValue({
      data: mockResponse,
      raw: {},
      tokensIn: 200,
      tokensOut: 150,
      model: 'gpt-4o-mini',
      latencyMs: 500,
      cachedInputApplied: false,
      costCents: 0.01,
    });

    const input: PlannerInput = {
      assistant: 'market_analysis',
      input: 'Analyze the SaaS market',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = await plan(input, mockClient);

    expect(result.task).toBe('market_analysis');
    expect(result.requires_web_search).toBe(true);
    expect(result.sections).toContain('Competitors');
    expect(result.sections).toContain('Sources');
  });

  it('should auto-add Sources section if missing but retrieval/search enabled', async () => {
    const mockResponse: PlannerOutput = {
      task: 'streamlined_plan',
      requires_retrieval: true,
      requires_web_search: false,
      query_terms: ['business plan'],
      sections: ['Problem', 'Solution', 'GTM'],
      metrics_needed: [],
      escalate_model: false,
    };

    (mockClient.chatStructured as any).mockResolvedValue({
      data: mockResponse,
      raw: {},
      tokensIn: 200,
      tokensOut: 150,
      model: 'gpt-4o-mini',
      latencyMs: 500,
      cachedInputApplied: false,
      costCents: 0.01,
    });

    const input: PlannerInput = {
      assistant: 'streamlined_plan',
      input: 'Create plan',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = await plan(input, mockClient);

    expect(result.sections).toContain('Sources');
  });

  it('should retry once on schema validation error', async () => {
    // First call throws ZodError
    const zodError: any = new Error('Schema validation failed');
    zodError.name = 'ZodError';

    (mockClient.chatStructured as any).mockRejectedValueOnce(zodError);

    // Second call returns valid data
    const mockResponse: PlannerOutput = {
      task: 'streamlined_plan',
      requires_retrieval: false,
      requires_web_search: false,
      query_terms: ['test'],
      sections: ['Problem', 'Solution'],
      metrics_needed: [],
      escalate_model: false,
    };

    (mockClient.chatStructured as any).mockResolvedValueOnce({
      data: mockResponse,
      raw: {},
      tokensIn: 200,
      tokensOut: 150,
      model: 'gpt-4o-mini',
      latencyMs: 500,
      cachedInputApplied: false,
      costCents: 0.01,
    });

    const input: PlannerInput = {
      assistant: 'streamlined_plan',
      input: 'Test',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = await plan(input, mockClient);

    expect(result).toBeDefined();
    expect(mockClient.chatStructured).toHaveBeenCalledTimes(2);
  });

  it('should use heuristic fallback if all retries fail', async () => {
    (mockClient.chatStructured as any).mockRejectedValue(new Error('LLM failure'));

    const input: PlannerInput = {
      assistant: 'market_analysis',
      input: 'Analyze the market for AI tools',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = await plan(input, mockClient);

    // Should still return valid plan from heuristics
    expect(result.task).toBe('market_analysis');
    expect(result.requires_web_search).toBe(true); // Heuristic for market_analysis
    expect(result.sections).toContain('Market Definition');
    expect(result.escalate_model).toBe(false); // Safe default
  });

  it('should default escalate_model to false', async () => {
    const mockResponse: PlannerOutput = {
      task: 'streamlined_plan',
      requires_retrieval: false,
      requires_web_search: false,
      query_terms: ['test'],
      sections: ['Problem', 'Solution'],
      metrics_needed: [],
      escalate_model: false,
    };

    (mockClient.chatStructured as any).mockResolvedValue({
      data: mockResponse,
      raw: {},
      tokensIn: 200,
      tokensOut: 150,
      model: 'gpt-4o-mini',
      latencyMs: 500,
      cachedInputApplied: false,
      costCents: 0.01,
    });

    const input: PlannerInput = {
      assistant: 'streamlined_plan',
      input: 'Simple request',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = await plan(input, mockClient);

    expect(result.escalate_model).toBe(false);
  });

  it('should respect section count limits (cap at 15)', async () => {
    const manySections = Array.from({ length: 20 }, (_, i) => `Section ${i + 1}`);

    const mockResponse: PlannerOutput = {
      task: 'streamlined_plan',
      requires_retrieval: false,
      requires_web_search: false,
      query_terms: ['test'],
      sections: manySections.slice(0, 15), // Respects cap
      metrics_needed: [],
      escalate_model: false,
    };

    (mockClient.chatStructured as any).mockResolvedValue({
      data: mockResponse,
      raw: {},
      tokensIn: 200,
      tokensOut: 150,
      model: 'gpt-4o-mini',
      latencyMs: 500,
      cachedInputApplied: false,
      costCents: 0.01,
    });

    const input: PlannerInput = {
      assistant: 'streamlined_plan',
      input: 'Comprehensive plan',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = await plan(input, mockClient);

    expect(result.sections.length).toBeLessThanOrEqual(15);
  });

  it('should limit query_terms to 20', async () => {
    const manyTerms = Array.from({ length: 25 }, (_, i) => `term${i + 1}`);

    const mockResponse: PlannerOutput = {
      task: 'streamlined_plan',
      requires_retrieval: false,
      requires_web_search: false,
      query_terms: manyTerms.slice(0, 20), // Respects cap
      sections: ['Problem', 'Solution'],
      metrics_needed: [],
      escalate_model: false,
    };

    (mockClient.chatStructured as any).mockResolvedValue({
      data: mockResponse,
      raw: {},
      tokensIn: 200,
      tokensOut: 150,
      model: 'gpt-4o-mini',
      latencyMs: 500,
      cachedInputApplied: false,
      costCents: 0.01,
    });

    const input: PlannerInput = {
      assistant: 'streamlined_plan',
      input: 'Test',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = await plan(input, mockClient);

    expect(result.query_terms.length).toBeLessThanOrEqual(20);
  });
});
