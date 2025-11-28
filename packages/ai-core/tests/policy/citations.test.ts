/**
 * Tests for Citation Validation
 */

import { describe, it, expect } from 'vitest';
import type { AssistantResponse, AssistantSource } from '@kimuntupro/shared';
import {
  hasSourcesSection,
  extractCitationMarkers,
  validateCitationMapping,
  validateCitations,
  findSection,
  getSectionNames,
} from '../../src/policy/citations.js';

describe('hasSourcesSection', () => {
  it('should detect Sources section (case-insensitive)', () => {
    const response: AssistantResponse = {
      rawModelOutput: 'test',
      sections: {
        Summary: 'test',
        Sources: 'R1, R2',
      },
      sources: [],
    };

    expect(hasSourcesSection(response)).toBe(true);
  });

  it('should detect sources with lowercase', () => {
    const response: AssistantResponse = {
      rawModelOutput: 'test',
      sections: {
        Summary: 'test',
        sources: 'R1, R2',
      },
      sources: [],
    };

    expect(hasSourcesSection(response)).toBe(true);
  });

  it('should return false when no Sources section', () => {
    const response: AssistantResponse = {
      rawModelOutput: 'test',
      sections: {
        Summary: 'test',
      },
      sources: [],
    };

    expect(hasSourcesSection(response)).toBe(false);
  });
});

describe('extractCitationMarkers', () => {
  it('should extract RAG citation markers', () => {
    const text = 'According to [R1], the market is growing. See also [R2].';
    const markers = extractCitationMarkers(text);

    expect(markers).toContain('R1');
    expect(markers).toContain('R2');
    expect(markers).toHaveLength(2);
  });

  it('should extract web citation markers', () => {
    const text = 'The report [W1] shows that [W2] confirms this.';
    const markers = extractCitationMarkers(text);

    expect(markers).toContain('W1');
    expect(markers).toContain('W2');
    expect(markers).toHaveLength(2);
  });

  it('should extract mixed RAG and web markers', () => {
    const text = 'Data from [R1] and [W1] support the claim [R2].';
    const markers = extractCitationMarkers(text);

    expect(markers).toContain('R1');
    expect(markers).toContain('R2');
    expect(markers).toContain('W1');
    expect(markers).toHaveLength(3);
  });

  it('should deduplicate repeated markers', () => {
    const text = 'According to [R1], and also [R1], the data shows [R1].';
    const markers = extractCitationMarkers(text);

    expect(markers).toHaveLength(1);
    expect(markers).toContain('R1');
  });

  it('should return empty array for no markers', () => {
    const text = 'No citations here.';
    const markers = extractCitationMarkers(text);

    expect(markers).toHaveLength(0);
  });

  it('should handle double-digit markers', () => {
    const text = 'See [R10] and [R99] and [W15].';
    const markers = extractCitationMarkers(text);

    expect(markers).toContain('R10');
    expect(markers).toContain('R99');
    expect(markers).toContain('W15');
    expect(markers).toHaveLength(3);
  });

  it('should not extract invalid marker formats', () => {
    const text = 'Not markers: [X1] [r1] [1] [RR1] [R] [R1.5]';
    const markers = extractCitationMarkers(text);

    // Only valid format is [R\d+] or [W\d+]
    expect(markers).toHaveLength(0);
  });
});

describe('validateCitationMapping', () => {
  it('should pass when all RAG markers map to sources', () => {
    const text = 'According to [R1] and [R2].';
    const ragSources: AssistantSource[] = [
      { type: 'rag', title: 'Doc1', docId: 'doc1', snippet: 'test', score: 0.9 },
      { type: 'rag', title: 'Doc2', docId: 'doc2', snippet: 'test', score: 0.8 },
    ];
    const webSources: AssistantSource[] = [];

    const issues = validateCitationMapping(text, ragSources, webSources);

    expect(issues).toHaveLength(0);
  });

  it('should pass when all web markers map to sources', () => {
    const text = 'According to [W1] and [W2].';
    const ragSources: AssistantSource[] = [];
    const webSources: AssistantSource[] = [
      { type: 'web', title: 'Site1', url: 'https://example.com/1', snippet: 'test' },
      { type: 'web', title: 'Site2', url: 'https://example.com/2', snippet: 'test' },
    ];

    const issues = validateCitationMapping(text, ragSources, webSources);

    expect(issues).toHaveLength(0);
  });

  it('should error when RAG marker references non-existent source', () => {
    const text = 'According to [R1] and [R3].'; // R3 doesn't exist
    const ragSources: AssistantSource[] = [
      { type: 'rag', title: 'Doc1', docId: 'doc1', snippet: 'test', score: 0.9 },
    ];
    const webSources: AssistantSource[] = [];

    const issues = validateCitationMapping(text, ragSources, webSources);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('UNMAPPED_CITATION_MARKER');
    expect(issues[0].severity).toBe('error');
    expect(issues[0].message).toContain('R3');
    expect(issues[0].meta?.marker).toBe('R3');
  });

  it('should error when web marker references non-existent source', () => {
    const text = 'According to [W1] and [W2].'; // W2 doesn't exist
    const ragSources: AssistantSource[] = [];
    const webSources: AssistantSource[] = [
      { type: 'web', title: 'Site1', url: 'https://example.com/1', snippet: 'test' },
    ];

    const issues = validateCitationMapping(text, ragSources, webSources);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('UNMAPPED_CITATION_MARKER');
    expect(issues[0].severity).toBe('error');
    expect(issues[0].message).toContain('W2');
  });

  it('should warn when RAG source missing title and docId', () => {
    const text = 'According to [R1].';
    const ragSources: AssistantSource[] = [
      { type: 'rag', snippet: 'test', score: 0.9 } as AssistantSource,
    ];
    const webSources: AssistantSource[] = [];

    const issues = validateCitationMapping(text, ragSources, webSources);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('MISSING_CITATION_TARGET');
    expect(issues[0].severity).toBe('warning');
  });

  it('should warn when web source missing URL', () => {
    const text = 'According to [W1].';
    const ragSources: AssistantSource[] = [];
    const webSources: AssistantSource[] = [
      { type: 'web', title: 'Site1', snippet: 'test' } as AssistantSource,
    ];

    const issues = validateCitationMapping(text, ragSources, webSources);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('MISSING_CITATION_TARGET');
    expect(issues[0].severity).toBe('warning');
  });

  it('should error for unsupported marker type', () => {
    const text = 'According to [X1].'; // X is not supported
    const ragSources: AssistantSource[] = [];
    const webSources: AssistantSource[] = [];

    const issues = validateCitationMapping(text, ragSources, webSources);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('UNSUPPORTED_SOURCE_TYPE');
    expect(issues[0].severity).toBe('error');
    expect(issues[0].message).toContain('X');
  });

  it('should handle mixed valid and invalid markers', () => {
    const text = 'According to [R1], [R3], and [W1].';
    const ragSources: AssistantSource[] = [
      { type: 'rag', title: 'Doc1', docId: 'doc1', snippet: 'test', score: 0.9 },
    ];
    const webSources: AssistantSource[] = [
      { type: 'web', title: 'Site1', url: 'https://example.com/1', snippet: 'test' },
    ];

    const issues = validateCitationMapping(text, ragSources, webSources);

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('UNMAPPED_CITATION_MARKER');
    expect(issues[0].meta?.marker).toBe('R3');
  });
});

describe('validateCitations', () => {
  it('should pass with Sources section and valid citations', () => {
    const response: AssistantResponse = {
      rawModelOutput: 'According to [R1].',
      sections: {
        Summary: 'test',
        Sources: 'R1: Doc1',
      },
      sources: [
        { type: 'rag', title: 'Doc1', docId: 'doc1', snippet: 'test', score: 0.9 },
      ],
    };

    const issues = validateCitations(response, { requireSourcesSection: true });

    expect(issues).toHaveLength(0);
  });

  it('should error when Sources section missing and required', () => {
    const response: AssistantResponse = {
      rawModelOutput: 'According to [R1].',
      sections: {
        Summary: 'test',
      },
      sources: [
        { type: 'rag', title: 'Doc1', docId: 'doc1', snippet: 'test', score: 0.9 },
      ],
    };

    const issues = validateCitations(response, { requireSourcesSection: true });

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.code === 'NO_SOURCES_SECTION')).toBe(true);
    const sourcesIssue = issues.find((i) => i.code === 'NO_SOURCES_SECTION');
    expect(sourcesIssue?.severity).toBe('error');
  });

  it('should pass without Sources section when not required', () => {
    const response: AssistantResponse = {
      rawModelOutput: 'According to [R1].',
      sections: {
        Summary: 'test',
      },
      sources: [
        { type: 'rag', title: 'Doc1', docId: 'doc1', snippet: 'test', score: 0.9 },
      ],
    };

    const issues = validateCitations(response, { requireSourcesSection: false });

    expect(issues.some((i) => i.code === 'NO_SOURCES_SECTION')).toBe(false);
  });

  it('should combine all citation issues', () => {
    const response: AssistantResponse = {
      rawModelOutput: 'According to [R1] and [R5].',
      sections: {
        Summary: 'test',
      },
      sources: [
        { type: 'rag', title: 'Doc1', docId: 'doc1', snippet: 'test', score: 0.9 },
      ],
    };

    const issues = validateCitations(response, { requireSourcesSection: true });

    // Should have: NO_SOURCES_SECTION + UNMAPPED_CITATION_MARKER for R5
    expect(issues.length).toBeGreaterThanOrEqual(2);
    expect(issues.some((i) => i.code === 'NO_SOURCES_SECTION')).toBe(true);
    expect(issues.some((i) => i.code === 'UNMAPPED_CITATION_MARKER')).toBe(true);
  });
});

describe('findSection', () => {
  it('should find section case-insensitively', () => {
    const response: AssistantResponse = {
      rawModelOutput: 'test',
      sections: {
        Summary: 'summary content',
        Sources: 'sources content',
      },
      sources: [],
    };

    expect(findSection(response, 'summary')).toBe('summary content');
    expect(findSection(response, 'SUMMARY')).toBe('summary content');
    expect(findSection(response, 'Summary')).toBe('summary content');
    expect(findSection(response, 'sources')).toBe('sources content');
  });

  it('should return undefined for non-existent section', () => {
    const response: AssistantResponse = {
      rawModelOutput: 'test',
      sections: {
        Summary: 'summary content',
      },
      sources: [],
    };

    expect(findSection(response, 'NotFound')).toBeUndefined();
  });
});

describe('getSectionNames', () => {
  it('should return all section names', () => {
    const response: AssistantResponse = {
      rawModelOutput: 'test',
      sections: {
        Summary: 'test',
        Sources: 'test',
        'Market Analysis': 'test',
      },
      sources: [],
    };

    const names = getSectionNames(response);

    expect(names).toContain('Summary');
    expect(names).toContain('Sources');
    expect(names).toContain('Market Analysis');
    expect(names).toHaveLength(3);
  });

  it('should return empty array for no sections', () => {
    const response: AssistantResponse = {
      rawModelOutput: 'test',
      sections: {},
      sources: [],
    };

    const names = getSectionNames(response);

    expect(names).toHaveLength(0);
  });
});
