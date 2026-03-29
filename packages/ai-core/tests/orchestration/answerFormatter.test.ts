/**
 * Tests for answer formatter and message assembly
 */

import { describe, it, expect } from 'vitest';
import {
  buildExecutorSystemPrompt,
  buildExecutorDeveloperPrompt,
  buildExecutorUserMessage,
  buildExecutorMessages,
  parseSections,
  extractCitationMarkers,
  buildRAGSources,
  buildWebSources,
  mapCitationsToSources,
  parseExecutorResponse,
  validateSections,
  type ExecutorContext,
} from '../../src/orchestration/answerFormatter.js';
import type {
  AssistantRequest,
  PlannerOutput,
  AssistantSource,
} from '@kimuntupro/shared';
import type { RetrievedChunk } from '../../src/retrieval/context.js';

describe('Answer Formatter', () => {
  describe('buildExecutorSystemPrompt', () => {
    it('should return system prompt', () => {
      const prompt = buildExecutorSystemPrompt();

      expect(prompt).toContain('Business Track Executor');
      expect(prompt).toContain('cite sources');
      expect(prompt).toContain('[R1]');
      expect(prompt).toContain('[W1]');
    });
  });

  describe('buildExecutorDeveloperPrompt', () => {
    it('should include required sections', () => {
      const plan: PlannerOutput = {
        task: 'streamlined_plan',
        requires_retrieval: false,
        requires_web_search: false,
        query_terms: [],
        sections: ['Problem', 'Solution', 'ICP'],
        metrics_needed: [],
        escalate_model: false,
      };

      const prompt = buildExecutorDeveloperPrompt(plan);

      expect(prompt).toContain('Problem');
      expect(prompt).toContain('Solution');
      expect(prompt).toContain('ICP');
    });

    it('should include metrics_needed if present', () => {
      const plan: PlannerOutput = {
        task: 'financial_overview',
        requires_retrieval: false,
        requires_web_search: false,
        query_terms: [],
        sections: ['Financial Overview'],
        metrics_needed: ['unit_economics', 'twelve_month_projection'],
        escalate_model: false,
      };

      const prompt = buildExecutorDeveloperPrompt(plan);

      expect(prompt).toContain('unit_economics');
      expect(prompt).toContain('twelve_month_projection');
    });
  });

  describe('buildExecutorUserMessage', () => {
    it('should include request and plan', () => {
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
        query_terms: ['business plan'],
        sections: ['Problem', 'Solution'],
        metrics_needed: [],
        escalate_model: false,
      };

      const context: ExecutorContext = {};

      const message = buildExecutorUserMessage(request, plan, context);

      expect(message).toContain('REQUEST');
      expect(message).toContain('PLANNER OUTPUT');
      expect(message).toContain('streamlined_plan');
    });

    it('should include RAG context if available', () => {
      const request: AssistantRequest = {
        assistant: 'streamlined_plan',
        input: 'Test',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const plan: PlannerOutput = {
        task: 'streamlined_plan',
        requires_retrieval: true,
        requires_web_search: false,
        query_terms: [],
        sections: ['Problem'],
        metrics_needed: [],
        escalate_model: false,
      };

      const context: ExecutorContext = {
        ragContext: {
          context: '[1] Document Name:\nSome content here',
          citations: [
            {
              id: '[1]',
              source: 'Document Name',
              excerpt: 'Some content',
            },
          ],
          token_count: 50,
          chunks_used: 1,
          chunks_truncated: 0,
        },
      };

      const message = buildExecutorUserMessage(request, plan, context);

      expect(message).toContain('RAG_CONTEXT');
      expect(message).toContain('Document Name');
    });

    it('should include web search results if available', () => {
      const request: AssistantRequest = {
        assistant: 'market_analysis',
        input: 'Test',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const plan: PlannerOutput = {
        task: 'market_analysis',
        requires_retrieval: false,
        requires_web_search: true,
        query_terms: [],
        sections: ['Market Definition'],
        metrics_needed: [],
        escalate_model: false,
      };

      const context: ExecutorContext = {
        webSearchResults: [
          {
            title: 'Market Report',
            url: 'https://example.com/report',
            snippet: 'Market size is growing',
          },
        ],
      };

      const message = buildExecutorUserMessage(request, plan, context);

      expect(message).toContain('WEB_CONTEXT');
      expect(message).toContain('Market Report');
      expect(message).toContain('[W1]');
    });

    it('should include finance model if available', () => {
      const request: AssistantRequest = {
        assistant: 'financial_overview',
        input: 'Test',
        tenantId: 'tenant-123',
        userId: 'user-456',
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

      const context: ExecutorContext = {
        financeModel: {
          unitEconomics: {
            arpuMonthly: 100,
            grossMarginPct: 70,
            cac: 400,
            ltv: 1200,
            paybackMonths: 4,
            ltvCacRatio: 3.0,
          },
          projections: [],
          assumptions: {},
        },
      };

      const message = buildExecutorUserMessage(request, plan, context);

      expect(message).toContain('FINANCE_JSON');
      expect(message).toContain('arpuMonthly');
    });
  });

  describe('buildExecutorMessages', () => {
    it('should build complete message array', () => {
      const request: AssistantRequest = {
        assistant: 'streamlined_plan',
        input: 'Test',
        tenantId: 'tenant-123',
        userId: 'user-456',
      };

      const plan: PlannerOutput = {
        task: 'streamlined_plan',
        requires_retrieval: false,
        requires_web_search: false,
        query_terms: [],
        sections: ['Problem'],
        metrics_needed: [],
        escalate_model: false,
      };

      const context: ExecutorContext = {};

      const messages = buildExecutorMessages(request, plan, context);

      expect(messages).toHaveLength(3);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('developer');
      expect(messages[2].role).toBe('user');
    });
  });

  describe('parseSections', () => {
    it('should parse sections from markdown', () => {
      const rawOutput = `## Problem
This is the problem section.

## Solution
This is the solution section.

## Sources
[R1] Document 1`;

      const sections = parseSections(rawOutput);

      expect(sections.Problem).toContain('This is the problem');
      expect(sections.Solution).toContain('This is the solution');
      expect(sections.Sources).toContain('[R1]');
    });

    it('should handle empty sections', () => {
      const rawOutput = `## Problem

## Solution
Content here`;

      const sections = parseSections(rawOutput);

      expect(sections.Problem).toBe('');
      expect(sections.Solution).toContain('Content here');
    });

    it('should handle no sections', () => {
      const rawOutput = 'Just plain text with no sections';

      const sections = parseSections(rawOutput);

      expect(Object.keys(sections)).toHaveLength(0);
    });
  });

  describe('extractCitationMarkers', () => {
    it('should extract RAG citations', () => {
      const text = 'According to [R1], the market is growing. See also [R2].';

      const markers = extractCitationMarkers(text);

      expect(markers).toContain('R1');
      expect(markers).toContain('R2');
    });

    it('should extract web citations', () => {
      const text = 'Research shows [W1] that the industry is expanding [W2].';

      const markers = extractCitationMarkers(text);

      expect(markers).toContain('W1');
      expect(markers).toContain('W2');
    });

    it('should deduplicate markers', () => {
      const text = 'Multiple references [R1] to the same source [R1].';

      const markers = extractCitationMarkers(text);

      expect(markers).toHaveLength(1);
      expect(markers[0]).toBe('R1');
    });

    it('should return empty array if no citations', () => {
      const text = 'No citations here';

      const markers = extractCitationMarkers(text);

      expect(markers).toHaveLength(0);
    });
  });

  describe('mapCitationsToSources', () => {
    it('should map RAG citations to sources', () => {
      const rawOutput = 'According to [R1], the market is growing.';

      const ragSources: AssistantSource[] = [
        {
          type: 'rag',
          title: 'Market Research',
          snippet: 'Market analysis',
        },
      ];

      const webSources: AssistantSource[] = [];

      const sources = mapCitationsToSources(rawOutput, ragSources, webSources);

      expect(sources).toHaveLength(1);
      expect(sources[0].title).toBe('Market Research');
    });

    it('should map web citations to sources', () => {
      const rawOutput = 'Industry report [W1] shows growth.';

      const ragSources: AssistantSource[] = [];

      const webSources: AssistantSource[] = [
        {
          type: 'web',
          title: 'Industry Report',
          url: 'https://example.com',
          snippet: 'Growth data',
        },
      ];

      const sources = mapCitationsToSources(rawOutput, ragSources, webSources);

      expect(sources).toHaveLength(1);
      expect(sources[0].title).toBe('Industry Report');
    });

    it('should handle mixed citations', () => {
      const rawOutput = 'Internal docs [R1] and external research [W1] both confirm.';

      const ragSources: AssistantSource[] = [
        {
          type: 'rag',
          title: 'Internal Doc',
          snippet: 'Internal data',
        },
      ];

      const webSources: AssistantSource[] = [
        {
          type: 'web',
          title: 'External Research',
          url: 'https://example.com',
          snippet: 'External data',
        },
      ];

      const sources = mapCitationsToSources(rawOutput, ragSources, webSources);

      expect(sources).toHaveLength(2);
      expect(sources.some((s) => s.type === 'rag')).toBe(true);
      expect(sources.some((s) => s.type === 'web')).toBe(true);
    });

    it('should handle invalid citation indices', () => {
      const rawOutput = 'Invalid citation [R99] should be ignored.';

      const ragSources: AssistantSource[] = [
        {
          type: 'rag',
          title: 'Doc 1',
          snippet: 'Content',
        },
      ];

      const sources = mapCitationsToSources(rawOutput, ragSources, []);

      expect(sources).toHaveLength(0);
    });
  });

  describe('validateSections', () => {
    it('should validate all sections present', () => {
      const sections = {
        Problem: 'Content',
        Solution: 'Content',
        ICP: 'Content',
      };

      const required = ['Problem', 'Solution', 'ICP'];

      const result = validateSections(sections, required);

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should detect missing sections', () => {
      const sections = {
        Problem: 'Content',
      };

      const required = ['Problem', 'Solution', 'ICP'];

      const result = validateSections(sections, required);

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('Solution');
      expect(result.missing).toContain('ICP');
    });

    it('should handle case-insensitive matching', () => {
      const sections = {
        problem: 'Content',
        SOLUTION: 'Content',
      };

      const required = ['Problem', 'Solution'];

      const result = validateSections(sections, required);

      expect(result.valid).toBe(true);
    });
  });
});
