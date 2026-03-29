/**
 * Unit Tests for Policy Validator (Phase 5)
 * Tests numeric tolerance, per-section citations, and POLICY_ENFORCE flag
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateOutput, validateCitations, validateFinancialMetrics } from '../validator.js';
import type { AssistantResponse } from '@kimuntupro/shared';

describe('Policy Validator - Phase 5 Enhancements', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Numeric Tolerance (±2%)', () => {
    it('accepts numbers within ±2% tolerance of finance model', () => {
      const financeModel = {
        revenue: 100000,
        costs: 50000,
        profit: 50000,
      };

      const response: AssistantResponse = {
        sections: {
          'Financial Summary': 'Our revenue is $101,500 with profit of $49,200.',
        },
        sources: [],
        rawModelOutput: 'Our revenue is $101,500 with profit of $49,200.',
      };

      const result = validateFinancialMetrics(response, {
        financeModel,
        tenantId: 'test-tenant',
        userId: 'test-user',
      });

      // $101,500 is within 2% of $100,000 (±$2,000)
      // $49,200 is within 2% of $50,000 (±$1,000)
      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.code === 'UNGROUNDED_NUMBER')).toHaveLength(0);
    });

    it('flags numbers outside ±2% tolerance as ungrounded', () => {
      const financeModel = {
        revenue: 100000,
      };

      const response: AssistantResponse = {
        sections: {
          'Financial Summary': 'Our revenue is $105,000.', // 5% off - exceeds ±2%
        },
        sources: [],
        rawModelOutput: 'Our revenue is $105,000.',
      };

      const result = validateFinancialMetrics(response, {
        financeModel,
        tenantId: 'test-tenant',
        userId: 'test-user',
      });

      const ungroundedIssues = result.issues.filter((i) => i.code === 'UNGROUNDED_NUMBER');
      expect(ungroundedIssues.length).toBeGreaterThan(0);
      expect(ungroundedIssues[0].message).toContain('not found in finance calculations');
    });

    it('applies ±2% tolerance to currency values by default', () => {
      const financeModel = {
        price: 50, // $50
      };

      const response: AssistantResponse = {
        sections: {
          Pricing: 'Our price is $51.', // Exactly 2% over
        },
        sources: [],
        rawModelOutput: 'Our price is $51.',
      };

      const result = validateFinancialMetrics(response, {
        financeModel,
        tenantId: 'test-tenant',
        userId: 'test-user',
      });

      // $51 is exactly at 2% tolerance boundary
      expect(result.valid).toBe(true);
    });
  });

  describe('Per-Section Citation Enforcement', () => {
    it('requires citations in each section when sources available and enforcement enabled', () => {
      process.env.POLICY_REQUIRE_SECTION_CITATIONS = 'true';

      const response: AssistantResponse = {
        sections: {
          'Market Definition': 'The market is large and growing.',
          'Target Segments': 'We target young professionals [R1].',
        },
        sources: [
          { type: 'rag', title: 'Market Research', snippet: 'Data about professionals' },
        ],
        rawModelOutput: 'The market is large and growing. We target young professionals [R1].',
      };

      const result = validateCitations(response, {
        requireSourcesSection: false,
        requirePerSectionCitations: true,
      });

      const missingSectionCitationIssues = result.issues.filter(
        (i) => i.code === 'MISSING_SECTION_CITATION'
      );

      expect(missingSectionCitationIssues.length).toBeGreaterThan(0);
      expect(missingSectionCitationIssues[0].meta?.section).toBe('Market Definition');
      expect(missingSectionCitationIssues[0].severity).toBe('error');
    });

    it('does not require citations when no sources available', () => {
      process.env.POLICY_REQUIRE_SECTION_CITATIONS = 'true';

      const response: AssistantResponse = {
        sections: {
          'Market Definition': 'The market is large and growing.',
        },
        sources: [], // No sources available
        rawModelOutput: 'The market is large and growing.',
      };

      const result = validateCitations(response, {
        requireSourcesSection: false,
        requirePerSectionCitations: true,
      });

      const missingSectionCitationIssues = result.issues.filter(
        (i) => i.code === 'MISSING_SECTION_CITATION'
      );

      expect(missingSectionCitationIssues).toHaveLength(0);
    });

    it('skips Sources section from citation requirement', () => {
      process.env.POLICY_REQUIRE_SECTION_CITATIONS = 'true';

      const response: AssistantResponse = {
        sections: {
          'Market Analysis': 'Data shows growth [W1].',
          Sources: 'List of sources without citations',
        },
        sources: [{ type: 'web', title: 'Market Report', url: 'https://example.com' }],
        rawModelOutput: 'Data shows growth [W1]. List of sources without citations.',
      };

      const result = validateCitations(response, {
        requireSourcesSection: false,
        requirePerSectionCitations: true,
      });

      // Only check that Sources section is not flagged
      const missingSectionCitationIssues = result.issues.filter(
        (i) => i.code === 'MISSING_SECTION_CITATION'
      );

      const sourcesIssue = missingSectionCitationIssues.find(
        (i) => i.meta?.section?.toLowerCase() === 'sources'
      );

      expect(sourcesIssue).toBeUndefined();
    });

    it('allows disabling per-section citation enforcement', () => {
      process.env.POLICY_REQUIRE_SECTION_CITATIONS = 'false';

      const response: AssistantResponse = {
        sections: {
          'Market Definition': 'The market is large and growing.',
        },
        sources: [{ type: 'rag', title: 'Market Research', snippet: 'Data' }],
        rawModelOutput: 'The market is large and growing.',
      };

      const result = validateCitations(response, {
        requireSourcesSection: false,
        requirePerSectionCitations: false,
      });

      const missingSectionCitationIssues = result.issues.filter(
        (i) => i.code === 'MISSING_SECTION_CITATION'
      );

      expect(missingSectionCitationIssues).toHaveLength(0);
    });
  });

  describe('POLICY_ENFORCE Flag', () => {
    it('blocks response when POLICY_ENFORCE=true and errors present', () => {
      process.env.POLICY_ENFORCE = 'true';
      process.env.POLICY_REQUIRE_SECTION_CITATIONS = 'true';

      const response: AssistantResponse = {
        sections: {
          'Market Definition': 'The market is large.',
        },
        sources: [{ type: 'rag', title: 'Market Research', snippet: 'Data' }],
        rawModelOutput: 'The market is large.',
      };

      const result = validateOutput(response, {
        assistant: 'market_analysis',
        tenantId: 'test-tenant',
        userId: 'test-user',
        requiresWebSearch: false,
      });

      // Missing section citation is an error
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.severity === 'error')).toBe(true);
    });

    it('allows response when POLICY_ENFORCE=false even with errors', () => {
      process.env.POLICY_ENFORCE = 'false';
      process.env.POLICY_REQUIRE_SECTION_CITATIONS = 'true';

      const response: AssistantResponse = {
        sections: {
          'Market Definition': 'The market is large.',
        },
        sources: [{ type: 'rag', title: 'Market Research', snippet: 'Data' }],
        rawModelOutput: 'The market is large.',
      };

      const result = validateOutput(response, {
        assistant: 'market_analysis',
        tenantId: 'test-tenant',
        userId: 'test-user',
        requiresWebSearch: false,
      });

      // Permissive mode: valid=true even with errors
      expect(result.valid).toBe(true);
      expect(result.issues.some((i) => i.severity === 'error')).toBe(true);
    });

    it('allows response when POLICY_ENFORCE=true but no errors', () => {
      process.env.POLICY_ENFORCE = 'true';

      const response: AssistantResponse = {
        sections: {
          'Market Definition': 'The market is large [R1].',
        },
        sources: [{ type: 'rag', title: 'Market Research', snippet: 'Data' }],
        rawModelOutput: 'The market is large [R1].',
      };

      const result = validateOutput(response, {
        assistant: 'market_analysis',
        tenantId: 'test-tenant',
        userId: 'test-user',
        requiresWebSearch: false,
      });

      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.severity === 'error')).toHaveLength(0);
    });

    it('defaults to POLICY_ENFORCE=false for backward compatibility', () => {
      delete process.env.POLICY_ENFORCE; // Not set

      const response: AssistantResponse = {
        sections: {
          Summary: 'Invalid content without citations.',
        },
        sources: [{ type: 'rag', title: 'Data', snippet: 'Info' }],
        rawModelOutput: 'Invalid content without citations.',
      };

      // Simulate error-level issue
      const result = validateOutput(response, {
        assistant: 'streamlined_plan',
        tenantId: 'test-tenant',
        userId: 'test-user',
      });

      // Should allow response through even with issues (permissive mode)
      expect(result.valid).toBe(true);
    });
  });

  describe('Combined Validation', () => {
    it('validates both numeric and citation requirements together', () => {
      process.env.POLICY_ENFORCE = 'true';
      process.env.POLICY_REQUIRE_SECTION_CITATIONS = 'true';
      process.env.POLICY_STRICT_NUMBERS = 'true';

      const financeModel = {
        revenue: 100000,
      };

      const response: AssistantResponse = {
        sections: {
          'Financial Summary': 'Revenue of $200,000 expected [R1].', // Wrong number
        },
        sources: [{ type: 'rag', title: 'Finance Data', snippet: 'Data' }],
        rawModelOutput: 'Revenue of $200,000 expected [R1].',
      };

      const result = validateOutput(response, {
        assistant: 'exec_summary',
        tenantId: 'test-tenant',
        userId: 'test-user',
        financeModel,
      });

      // Should have numeric issue (200k != 100k, exceeds ±2%)
      const numericIssues = result.issues.filter((i) => i.code === 'UNGROUNDED_NUMBER');
      expect(numericIssues.length).toBeGreaterThan(0);

      // Enforcement enabled: should block
      expect(result.valid).toBe(false);
    });
  });
});
