/**
 * Tests for Business Track Executor (Stage B)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  execute,
  validateExecuteOptions,
  type ExecuteOptions,
} from '../../src/orchestration/executor.js';
import type {
  AssistantRequest,
  PlannerOutput,
  UsageMetric,
} from '@kimuntupro/shared';
import { OpenAIClient } from '../../src/llm/client.js';

describe('Executor', () => {
  let mockClient: OpenAIClient;
  let mockBM25Query: any;
  let mockVectorQuery: any;
  let mockEmbed: any;

  beforeEach(() => {
    // Mock OpenAI client
    mockClient = {
      chatWithTools: vi.fn(async () => ({
        text: `## Problem
Market analysis indicates strong demand.

## Solution
Our platform addresses this need effectively [R1].

## ICP
Target customers are SMBs [W1].

## Sources
[R1] Internal market research
[W1] Industry report`,
        toolCalls: [],
        toolInvocations: {},
        raw: {},
        tokensIn: 1000,
        tokensOut: 500,
        model: 'gpt-4o-mini',
        latencyMs: 1000,
        costCents: 10,
      })),
    } as any;

    // Mock retrieval functions
    mockBM25Query = vi.fn(async () => [
      {
        id: 'chunk-1',
        content: 'Market research shows strong demand in SMB segment',
        score: 10.0,
        metadata: {
          document_id: 'doc-1',
          document_name: 'Market Research 2024',
          chunk_index: 0,
        },
      },
    ]);

    mockVectorQuery = vi.fn(async () => [
      {
        id: 'chunk-2',
        content: 'SMB market size is growing rapidly',
        score: 0.9,
        metadata: {
          document_id: 'doc-2',
          document_name: 'Industry Trends',
          chunk_index: 0,
        },
      },
    ]);

    mockEmbed = vi.fn(async () => new Array(1536).fill(0.1));
  });

  describe('execute', () => {
    it('should execute streamlined_plan with RAG retrieval', async () => {
      const request: AssistantRequest = {
        assistant: 'streamlined_plan',
        input: 'Create a business plan for our SaaS product',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const plan: PlannerOutput = {
        task: 'streamlined_plan',
        requires_retrieval: true,
        requires_web_search: false,
        query_terms: ['business plan', 'saas'],
        sections: ['Problem', 'Solution', 'ICP', 'Sources'],
        metrics_needed: [],
        escalate_model: false,
      };

      const usageCallback = vi.fn();

      const response = await execute({
        plan,
        request,
        tenantId: 'tenant-123',
        userId: 'user-456',
        onUsage: usageCallback,
        client: mockClient,
        bm25Query: mockBM25Query,
        vectorQuery: mockVectorQuery,
        embed: mockEmbed,
      });

      expect(response.assistant).toBe('streamlined_plan');
      expect(response.sections).toBeDefined();
      expect(Object.keys(response.sections).length).toBeGreaterThan(0);
      expect(response.sources).toBeDefined();
      expect(response.metadata).toBeDefined();
      expect(mockBM25Query).toHaveBeenCalled();
      expect(mockVectorQuery).toHaveBeenCalled();
      expect(usageCallback).toHaveBeenCalled();
    });

    it('should execute market_analysis with web search', async () => {
      // Mock web search result in client response
      mockClient.chatWithTools = vi.fn(async () => ({
        text: `## Market Definition
AI coding assistant market [W1].

## Sizing (TAM/SAM/SOM)
Market size is $5B [W1].

## Sources
[W1] Market research report`,
        toolCalls: [
          {
            name: 'web_search',
            arguments: { query: 'AI coding assistant market' },
            result: {
              results: [
                {
                  title: 'AI Market Report',
                  url: 'https://example.com/report',
                  snippet: 'Market size is growing',
                },
              ],
            },
          },
        ],
        toolInvocations: { web_search: 1 },
        raw: {},
        tokensIn: 800,
        tokensOut: 400,
        model: 'gpt-4o-mini',
        latencyMs: 1000,
        costCents: 8,
      })) as any;

      const request: AssistantRequest = {
        assistant: 'market_analysis',
        input: 'Analyze the AI coding assistant market',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const plan: PlannerOutput = {
        task: 'market_analysis',
        requires_retrieval: false,
        requires_web_search: true,
        query_terms: ['AI coding assistant', 'market'],
        sections: ['Market Definition', 'Sizing (TAM/SAM/SOM)', 'Sources'],
        metrics_needed: [],
        escalate_model: false,
      };

      const response = await execute({
        plan,
        request,
        tenantId: 'tenant-123',
        userId: 'user-456',
        client: mockClient,
        bm25Query: mockBM25Query,
        vectorQuery: mockVectorQuery,
        embed: mockEmbed,
      });

      expect(response.assistant).toBe('market_analysis');
      expect(response.sections).toBeDefined();
      expect(mockClient.chatWithTools).toHaveBeenCalled();
    });

    it('should execute financial_overview with finance model', async () => {
      mockClient.chatWithTools = vi.fn(async () => ({
        text: `## Financial Overview
Strong unit economics with 70% gross margin.

## Unit Economics
ARPU: $100, LTV: $1200, CAC: $400

## Sources
Finance calculations based on provided inputs`,
        toolCalls: [],
        toolInvocations: {},
        raw: {},
        tokensIn: 1200,
        tokensOut: 600,
        model: 'gpt-4o-mini',
        latencyMs: 1000,
        costCents: 12,
      })) as any;

      const request: AssistantRequest = {
        assistant: 'financial_overview',
        input: 'Provide financial overview',
        tenantId: 'tenant-123',
        userId: 'user-456',
        extra: {
          arpuMonthly: 100,
          cogsPct: 0.3,
          startingCustomers: 100,
          newCustomersPerMonth: 20,
          churnRateMonthly: 0.05,
          salesMarketingSpendMonthly: 8000,
          months: 12,
        },
      };

      const plan: PlannerOutput = {
        task: 'financial_overview',
        requires_retrieval: false,
        requires_web_search: false,
        query_terms: [],
        sections: ['Financial Overview', 'Unit Economics', 'Sources'],
        metrics_needed: ['unit_economics', 'twelve_month_projection'],
        escalate_model: false,
      };

      const response = await execute({
        plan,
        request,
        tenantId: 'tenant-123',
        userId: 'user-456',
        client: mockClient,
        bm25Query: mockBM25Query,
        vectorQuery: mockVectorQuery,
        embed: mockEmbed,
      });

      expect(response.assistant).toBe('financial_overview');
      expect(response.sections).toBeDefined();
      expect(mockClient.chatWithTools).toHaveBeenCalled();
    });

    it('should handle model escalation', async () => {
      const request: AssistantRequest = {
        assistant: 'streamlined_plan',
        input: 'Complex multi-stakeholder analysis',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const plan: PlannerOutput = {
        task: 'streamlined_plan',
        requires_retrieval: false,
        requires_web_search: false,
        query_terms: [],
        sections: ['Problem', 'Solution'],
        metrics_needed: [],
        escalate_model: true, // Escalate to larger model
      };

      await execute({
        plan,
        request,
        tenantId: 'tenant-123',
        userId: 'user-456',
        client: mockClient,
      });

      // Verify larger model was used
      const callArgs = (mockClient.chatWithTools as any).mock.calls[0][0];
      expect(callArgs.model).toBe('gpt-4o'); // Escalation model
    });

    it('should track usage metrics', async () => {
      const request: AssistantRequest = {
        assistant: 'streamlined_plan',
        input: 'Create a business plan',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const plan: PlannerOutput = {
        task: 'streamlined_plan',
        requires_retrieval: true,
        requires_web_search: false,
        query_terms: [],
        sections: ['Problem', 'Solution'],
        metrics_needed: [],
        escalate_model: false,
      };

      const usageCallback = vi.fn();

      await execute({
        plan,
        request,
        tenantId: 'tenant-123',
        userId: 'user-456',
        onUsage: usageCallback,
        client: mockClient,
        bm25Query: mockBM25Query,
        vectorQuery: mockVectorQuery,
        embed: mockEmbed,
      });

      expect(usageCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.any(String),
          tokensIn: expect.any(Number),
          tokensOut: expect.any(Number),
          costCents: expect.any(Number),
          latencyMs: expect.any(Number),
          toolInvocations: expect.objectContaining({
            retrieval: expect.any(Number),
            webSearch: expect.any(Number),
            finance: expect.any(Number),
          }),
        })
      );
    });

    it('should handle execution errors gracefully', async () => {
      mockClient.chatWithTools = vi.fn(async () => {
        throw new Error('Model API error');
      }) as any;

      const request: AssistantRequest = {
        assistant: 'streamlined_plan',
        input: 'Create a business plan',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const plan: PlannerOutput = {
        task: 'streamlined_plan',
        requires_retrieval: false,
        requires_web_search: false,
        query_terms: [],
        sections: ['Problem', 'Solution'],
        metrics_needed: [],
        escalate_model: false,
      };

      const response = await execute({
        plan,
        request,
        tenantId: 'tenant-123',
        userId: 'user-456',
        client: mockClient,
      });

      expect(response.sections.Error).toContain('Failed to generate response');
    });

    it('should skip RAG if query functions not provided', async () => {
      const request: AssistantRequest = {
        assistant: 'streamlined_plan',
        input: 'Create a business plan',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const plan: PlannerOutput = {
        task: 'streamlined_plan',
        requires_retrieval: true, // Requires retrieval but no functions provided
        requires_web_search: false,
        query_terms: [],
        sections: ['Problem', 'Solution'],
        metrics_needed: [],
        escalate_model: false,
      };

      const response = await execute({
        plan,
        request,
        tenantId: 'tenant-123',
        userId: 'user-456',
        client: mockClient,
        // No bm25Query, vectorQuery, embed provided
      });

      expect(response.assistant).toBe('streamlined_plan');
      // Should complete without retrieval
    });

    it('should handle missing financial inputs gracefully', async () => {
      const request: AssistantRequest = {
        assistant: 'financial_overview',
        input: 'Provide financial overview',
        tenantId: 'tenant-123',
        userId: 'user-456',
        extra: {
          // Missing required fields
          arpuMonthly: 100,
        },
      };

      const plan: PlannerOutput = {
        task: 'financial_overview',
        requires_retrieval: false,
        requires_web_search: false,
        query_terms: [],
        sections: ['Financial Overview'],
        metrics_needed: ['unit_economics'],
        escalate_model: false,
      };

      const response = await execute({
        plan,
        request,
        tenantId: 'tenant-123',
        userId: 'user-456',
        client: mockClient,
      });

      // Should complete without finance model
      expect(response.assistant).toBe('financial_overview');
    });
  });

  describe('validateExecuteOptions', () => {
    it('should validate correct options', () => {
      const options: ExecuteOptions = {
        plan: {
          task: 'streamlined_plan',
          requires_retrieval: false,
          requires_web_search: false,
          query_terms: [],
          sections: ['Problem'],
          metrics_needed: [],
          escalate_model: false,
        },
        request: {
          assistant: 'streamlined_plan',
          input: 'test',
          tenantId: 'tenant-123',
          userId: 'user-456',
        },
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const result = validateExecuteOptions(options);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const options: any = {
        plan: null,
        request: null,
        tenantId: '',
        userId: '',
      };

      const result = validateExecuteOptions(options);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
