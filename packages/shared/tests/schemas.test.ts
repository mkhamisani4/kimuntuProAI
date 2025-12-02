import { describe, it, expect } from 'vitest';
import {
  AssistantRequestSchema,
  AssistantResponseSchema,
  PlannerOutputSchema,
  UsageMetricSchema,
  WebSearchResultSchema,
  FinancialModelSchema,
  UnitEconomicsInputSchema,
  RevenueProjectionInputSchema,
  RetrievalRequestSchema,
} from '../src/schemas.js';

describe('Schemas - Validation Tests', () => {
  describe('AssistantRequestSchema', () => {
    it('should validate valid request', () => {
      const valid = {
        assistant: 'streamlined_plan',
        input: 'Create a business plan',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const result = AssistantRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject empty input', () => {
      const invalid = {
        assistant: 'streamlined_plan',
        input: '',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const result = AssistantRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid assistant type', () => {
      const invalid = {
        assistant: 'invalid_type',
        input: 'Test',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const result = AssistantRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject missing tenantId', () => {
      const invalid = {
        assistant: 'streamlined_plan',
        input: 'Test',
        userId: 'user-456',
      };

      const result = AssistantRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('PlannerOutputSchema', () => {
    it('should validate valid planner output', () => {
      const valid = {
        task: 'market_analysis',
        requires_retrieval: true,
        requires_web_search: false,
        query_terms: ['market', 'competitors'],
        sections: ['Definition', 'TAM'],
        metrics_needed: ['market_size'],
        escalate_model: false,
      };

      const result = PlannerOutputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject empty sections array', () => {
      const invalid = {
        task: 'market_analysis',
        requires_retrieval: true,
        requires_web_search: false,
        query_terms: ['market'],
        sections: [],
        metrics_needed: [],
        escalate_model: false,
      };

      const result = PlannerOutputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('UsageMetricSchema', () => {
    it('should validate valid usage metric', () => {
      const valid = {
        model: 'gpt-4o-mini',
        tokensIn: 1000,
        tokensOut: 500,
        costCents: 10,
        latencyMs: 2000,
        toolInvocations: {
          retrieval: 1,
          webSearch: 0,
          finance: 0,
        },
      };

      const result = UsageMetricSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject negative token counts', () => {
      const invalid = {
        model: 'gpt-4o-mini',
        tokensIn: -100,
        tokensOut: 500,
        costCents: 10,
        latencyMs: 2000,
        toolInvocations: { retrieval: 0, webSearch: 0, finance: 0 },
      };

      const result = UsageMetricSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('WebSearchResultSchema', () => {
    it('should validate valid web search result', () => {
      const valid = {
        query: 'SaaS pricing',
        results: [
          {
            title: 'Pricing Guide',
            snippet: 'How to price...',
            url: 'https://example.com/guide',
          },
        ],
      };

      const result = WebSearchResultSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const invalid = {
        query: 'SaaS pricing',
        results: [
          {
            title: 'Guide',
            snippet: 'Content',
            url: 'not-a-url',
          },
        ],
      };

      const result = WebSearchResultSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('FinancialModelSchema', () => {
    it('should validate valid financial model', () => {
      const valid = {
        unitEconomics: {
          grossMargin: 0.7,
          contributionMargin: 0.5,
          breakEvenUnits: 1000,
        },
        projections: [
          {
            month: 1,
            revenue: 10000,
            cogs: 3000,
            grossMargin: 0.7,
          },
        ],
      };

      const result = FinancialModelSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject negative breakEvenUnits', () => {
      const invalid = {
        unitEconomics: {
          grossMargin: 0.7,
          contributionMargin: 0.5,
          breakEvenUnits: -100,
        },
        projections: [{ month: 1, revenue: 10000, cogs: 3000, grossMargin: 0.7 }],
      };

      const result = FinancialModelSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('UnitEconomicsInputSchema', () => {
    it('should validate valid input', () => {
      const valid = {
        pricePerUnit: 100,
        cogsPerUnit: 30,
        fixedCosts: 5000,
      };

      const result = UnitEconomicsInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
      const invalid = {
        pricePerUnit: -100,
        cogsPerUnit: 30,
        fixedCosts: 5000,
      };

      const result = UnitEconomicsInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject zero price', () => {
      const invalid = {
        pricePerUnit: 0,
        cogsPerUnit: 30,
        fixedCosts: 5000,
      };

      const result = UnitEconomicsInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('RevenueProjectionInputSchema', () => {
    it('should validate valid input', () => {
      const valid = {
        initialRevenue: 10000,
        growthRate: 0.1,
        months: 12,
        cogsPercentage: 0.3,
      };

      const result = RevenueProjectionInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject unrealistic growth rate', () => {
      const invalid = {
        initialRevenue: 10000,
        growthRate: 15, // 1500% monthly growth is unrealistic
        months: 12,
        cogsPercentage: 0.3,
      };

      const result = RevenueProjectionInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject COGS > 100%', () => {
      const invalid = {
        initialRevenue: 10000,
        growthRate: 0.1,
        months: 12,
        cogsPercentage: 1.5,
      };

      const result = RevenueProjectionInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('RetrievalRequestSchema', () => {
    it('should validate valid request', () => {
      const valid = {
        query: 'business planning',
        tenantId: 'tenant-123',
        topK: 10,
        minScore: 0.7,
      };

      const result = RetrievalRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should allow optional parameters', () => {
      const valid = {
        query: 'business planning',
        tenantId: 'tenant-123',
      };

      const result = RetrievalRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject empty query', () => {
      const invalid = {
        query: '',
        tenantId: 'tenant-123',
      };

      const result = RetrievalRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('AssistantResponseSchema', () => {
    it('should validate complete response with metadata', () => {
      const valid = {
        assistant: 'streamlined_plan',
        sections: {
          Problem: 'Market issue',
          Solution: 'Our product',
        },
        sources: [
          {
            type: 'rag',
            docId: 'doc-123',
            snippet: 'Content',
          },
        ],
        rawModelOutput: 'Full output',
        metadata: {
          model: 'gpt-4o-mini',
          tokensUsed: 1500,
          latencyMs: 3000,
          cost: 0.05,
        },
      };

      const result = AssistantResponseSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should validate response without optional metadata', () => {
      const valid = {
        assistant: 'market_analysis',
        sections: { Definition: 'Market def' },
        sources: [],
        rawModelOutput: 'Output',
      };

      const result = AssistantResponseSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
