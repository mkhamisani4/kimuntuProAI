import { describe, it, expect } from 'vitest';
import type {
  AssistantType,
  AssistantRequest,
  AssistantResponse,
  PlannerOutput,
  UsageMetric,
  WebSearchResult,
  FinancialModel,
  UnitEconomics,
  RetrievedChunk,
} from '../src/types.js';

describe('Types - Instantiation Tests', () => {
  describe('AssistantType', () => {
    it('should accept valid assistant types', () => {
      const types: AssistantType[] = [
        'streamlined_plan',
        'exec_summary',
        'financial_overview',
        'market_analysis',
      ];

      expect(types).toHaveLength(4);
      expect(types).toContain('streamlined_plan');
    });
  });

  describe('AssistantRequest', () => {
    it('should create valid assistant request', () => {
      const request: AssistantRequest = {
        assistant: 'streamlined_plan',
        input: 'Help me create a business plan for a SaaS startup',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      expect(request.assistant).toBe('streamlined_plan');
      expect(request.input).toBeTruthy();
      expect(request.tenantId).toBe('tenant-123');
    });

    it('should support extra fields', () => {
      const request: AssistantRequest = {
        assistant: 'financial_overview',
        input: 'Project my revenue',
        tenantId: 'tenant-123',
        userId: 'user-456',
        extra: {
          initialRevenue: 10000,
          growthRate: 0.1,
        },
      };

      expect(request.extra?.initialRevenue).toBe(10000);
    });
  });

  describe('AssistantResponse', () => {
    it('should create valid assistant response', () => {
      const response: AssistantResponse = {
        assistant: 'streamlined_plan',
        sections: {
          Problem: 'Users struggle with X',
          Solution: 'Our product solves Y',
        },
        sources: [
          {
            type: 'rag',
            docId: 'doc-123',
            snippet: 'Market research shows...',
          },
        ],
        rawModelOutput: 'Full model output...',
      };

      expect(response.sections.Problem).toBeTruthy();
      expect(response.sources).toHaveLength(1);
      expect(response.sources[0].type).toBe('rag');
    });
  });

  describe('PlannerOutput', () => {
    it('should create valid planner output', () => {
      const output: PlannerOutput = {
        task: 'market_analysis',
        requires_retrieval: true,
        requires_web_search: true,
        query_terms: ['SaaS market size', 'competitor pricing'],
        sections: ['Definition', 'TAM/SAM/SOM', 'Competitors'],
        metrics_needed: ['market_size', 'growth_rate'],
        escalate_model: false,
      };

      expect(output.task).toBe('market_analysis');
      expect(output.requires_web_search).toBe(true);
      expect(output.query_terms).toContain('SaaS market size');
    });
  });

  describe('UsageMetric', () => {
    it('should create valid usage metric', () => {
      const metric: UsageMetric = {
        model: 'gpt-4o-mini',
        tokensIn: 1500,
        tokensOut: 800,
        costCents: 25,
        latencyMs: 3500,
        toolInvocations: {
          retrieval: 1,
          webSearch: 2,
          finance: 0,
        },
      };

      expect(metric.model).toBe('gpt-4o-mini');
      expect(metric.costCents).toBe(25);
      expect(metric.toolInvocations.webSearch).toBe(2);
    });
  });

  describe('WebSearchResult', () => {
    it('should create valid web search result', () => {
      const result: WebSearchResult = {
        query: 'SaaS pricing models',
        results: [
          {
            title: 'SaaS Pricing Guide',
            snippet: 'Best practices for pricing...',
            url: 'https://example.com/pricing-guide',
          },
        ],
      };

      expect(result.query).toBe('SaaS pricing models');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].url).toContain('https://');
    });
  });

  describe('FinancialModel', () => {
    it('should create valid financial model', () => {
      const unitEcon: UnitEconomics = {
        grossMargin: 0.7,
        contributionMargin: 0.5,
        breakEvenUnits: 1000,
      };

      const model: FinancialModel = {
        unitEconomics: unitEcon,
        projections: [
          {
            month: 1,
            revenue: 10000,
            cogs: 3000,
            grossMargin: 0.7,
          },
          {
            month: 2,
            revenue: 11000,
            cogs: 3300,
            grossMargin: 0.7,
          },
        ],
      };

      expect(model.unitEconomics.grossMargin).toBe(0.7);
      expect(model.projections).toHaveLength(2);
      expect(model.projections[0].month).toBe(1);
    });
  });

  describe('RetrievedChunk', () => {
    it('should create valid retrieved chunk', () => {
      const chunk: RetrievedChunk = {
        chunkId: 'chunk-123',
        documentId: 'doc-456',
        content: 'Business plan content...',
        score: 0.85,
        metadata: {
          title: 'Sample Business Plan',
          tags: ['business', 'planning'],
        },
      };

      expect(chunk.score).toBeGreaterThan(0);
      expect(chunk.metadata?.tags).toContain('business');
    });
  });
});
