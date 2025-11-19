/**
 * Citation Validation for Business Track Policy
 * Validates that all citation markers map to actual sources
 */

import type { AssistantResponse, AssistantSource } from '@kimuntupro/shared';

/**
 * Validation issue
 */
export interface ValidationIssue {
  code:
    | 'NO_SOURCES_SECTION'
    | 'MISSING_CITATION_TARGET'
    | 'UNMAPPED_CITATION_MARKER'
    | 'UNSUPPORTED_SOURCE_TYPE'
    | 'UNSUPPORTED_RECENCY'
    | 'UNGROUNDED_NUMBER'
    | 'SUSPICIOUS_MAGNITUDE'
    | 'PROMPT_INJECTION_DETECTED'
    | 'PII_LEAKAGE'
    | 'EMPTY_REQUIRED_SECTION'
    | 'MISSING_SECTION_CITATION'; // Phase 5: Per-section citation requirement
  message: string;
  meta?: Record<string, any>;
  severity: 'warning' | 'error';
}

/**
 * Check if response has a Sources section
 * Case-insensitive matching
 *
 * @param response - Assistant response
 * @returns True if Sources section exists
 */
export function hasSourcesSection(response: AssistantResponse): boolean {
  const sectionKeys = Object.keys(response.sections);

  return sectionKeys.some((key) => key.toLowerCase() === 'sources');
}

/**
 * Extract citation markers from text
 * Finds all [R1], [W2], etc. patterns
 *
 * @param text - Text to search
 * @returns Array of citation markers (e.g., ['R1', 'W2'])
 */
export function extractCitationMarkers(text: string): string[] {
  const markers = text.match(/\[([RW]\d+)\]/g) || [];
  return [...new Set(markers.map((m) => m.slice(1, -1)))]; // Remove brackets and dedupe
}

/**
 * Validate citation mapping between markers and sources
 *
 * @param rawText - Complete response text
 * @param ragSources - Available RAG sources
 * @param webSources - Available web sources
 * @returns Array of validation issues
 */
export function validateCitationMapping(
  rawText: string,
  ragSources: AssistantSource[],
  webSources: AssistantSource[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const markers = extractCitationMarkers(rawText);

  for (const marker of markers) {
    const type = marker[0]; // 'R' or 'W'
    const index = parseInt(marker.slice(1), 10) - 1; // Convert to 0-indexed

    if (type === 'R') {
      // RAG citation
      if (index < 0 || index >= ragSources.length) {
        issues.push({
          code: 'UNMAPPED_CITATION_MARKER',
          message: `Citation marker [${marker}] references non-existent RAG source (have ${ragSources.length} RAG sources)`,
          meta: { marker, type: 'rag', index, available: ragSources.length },
          severity: 'error',
        });
      } else {
        // Validate source has required fields
        const source = ragSources[index];
        if (!source.title && !source.docId) {
          issues.push({
            code: 'MISSING_CITATION_TARGET',
            message: `RAG source at index ${index} missing title/docId`,
            meta: { marker, index },
            severity: 'warning',
          });
        }
      }
    } else if (type === 'W') {
      // Web citation
      if (index < 0 || index >= webSources.length) {
        issues.push({
          code: 'UNMAPPED_CITATION_MARKER',
          message: `Citation marker [${marker}] references non-existent web source (have ${webSources.length} web sources)`,
          meta: { marker, type: 'web', index, available: webSources.length },
          severity: 'error',
        });
      } else {
        // Validate source has URL
        const source = webSources[index];
        if (!source.url) {
          issues.push({
            code: 'MISSING_CITATION_TARGET',
            message: `Web source at index ${index} missing URL`,
            meta: { marker, index },
            severity: 'warning',
          });
        }
      }
    } else {
      // Unsupported marker type
      issues.push({
        code: 'UNSUPPORTED_SOURCE_TYPE',
        message: `Citation marker [${marker}] has unsupported type '${type}' (expected R or W)`,
        meta: { marker, type },
        severity: 'error',
      });
    }
  }

  return issues;
}

/**
 * Validate that each section contains at least one citation (Phase 5)
 * Required when retrieval or web search is used
 *
 * @param response - Assistant response
 * @param requirePerSectionCitations - Whether to enforce citations per section
 * @returns Array of validation issues
 */
export function validatePerSectionCitations(
  response: AssistantResponse,
  requirePerSectionCitations: boolean
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!requirePerSectionCitations) {
    return issues;
  }

  // Only enforce if sources are available
  if (response.sources.length === 0) {
    return issues;
  }

  // Check each section (excluding Sources section itself)
  for (const [sectionName, sectionContent] of Object.entries(response.sections)) {
    if (sectionName.toLowerCase() === 'sources') {
      continue; // Skip Sources section
    }

    // Check for citation markers [R1], [W2], etc.
    const hasCitation = /\[[RW]\d+\]/.test(sectionContent);

    if (!hasCitation) {
      issues.push({
        code: 'MISSING_SECTION_CITATION',
        message: `Section '${sectionName}' must include at least one source citation when retrieval/web search is used`,
        meta: { section: sectionName },
        severity: 'error',
      });
    }
  }

  return issues;
}

/**
 * Validate citations in response
 * Combines all citation checks
 *
 * @param response - Assistant response
 * @param context - Validation context
 * @returns Array of validation issues
 */
export function validateCitations(
  response: AssistantResponse,
  context: {
    requireSourcesSection: boolean;
    requirePerSectionCitations?: boolean; // Phase 5: Per-section enforcement
  }
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for Sources section
  if (context.requireSourcesSection && !hasSourcesSection(response)) {
    issues.push({
      code: 'NO_SOURCES_SECTION',
      message: 'Response missing required Sources section',
      severity: 'error',
    });
  }

  // Validate citation markers map to actual sources
  const ragSources = response.sources.filter((s) => s.type === 'rag');
  const webSources = response.sources.filter((s) => s.type === 'web');

  const mappingIssues = validateCitationMapping(
    response.rawModelOutput,
    ragSources,
    webSources
  );

  issues.push(...mappingIssues);

  // Phase 5: Validate each section has at least one citation
  if (context.requirePerSectionCitations) {
    const perSectionIssues = validatePerSectionCitations(response, true);
    issues.push(...perSectionIssues);
  }

  return issues;
}

/**
 * Common section name variations and abbreviations
 * Maps expected section names to possible variations
 */
const SECTION_NAME_VARIATIONS: Record<string, string[]> = {
  'ideal customer profile': ['icp', 'customer profile', 'target customer', 'customer persona'],
  'go-to-market strategy': ['gtm strategy', 'gtm', 'market strategy', 'go to market'],
  'key performance indicators': ['kpis', 'performance indicators', 'metrics'],
  'executive summary': ['summary', 'overview', 'executive overview'],
  'competitive analysis': ['competition', 'competitive landscape', 'market competition'],
  'financial projections': ['financials', 'financial forecast', 'projections'],
  'market analysis': ['market research', 'market overview', 'industry analysis'],
  'value proposition': ['value prop', 'unique value proposition', 'uvp'],
  'business model': ['revenue model', 'business model canvas'],
};

/**
 * Check if two section names match with fuzzy matching
 * Handles abbreviations and common variations
 *
 * @param expected - Expected section name
 * @param actual - Actual section name from response
 * @returns True if names match (fuzzy)
 */
export function fuzzyMatchSectionName(expected: string, actual: string): boolean {
  const normalizedExpected = expected.toLowerCase().trim();
  const normalizedActual = actual.toLowerCase().trim();

  // Exact match
  if (normalizedExpected === normalizedActual) {
    return true;
  }

  // Check if actual contains expected or vice versa
  if (
    normalizedActual.includes(normalizedExpected) ||
    normalizedExpected.includes(normalizedActual)
  ) {
    return true;
  }

  // Check against known variations
  const variations = SECTION_NAME_VARIATIONS[normalizedExpected] || [];
  if (variations.some((v) => normalizedActual.includes(v) || v.includes(normalizedActual))) {
    return true;
  }

  // Also check reverse: if actual is a known section, check if expected is in its variations
  for (const [knownSection, knownVariations] of Object.entries(SECTION_NAME_VARIATIONS)) {
    if (normalizedActual === knownSection || knownVariations.includes(normalizedActual)) {
      // actual is a known section, check if expected matches it
      if (
        normalizedExpected === knownSection ||
        knownVariations.some((v) => v === normalizedExpected || normalizedExpected.includes(v))
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Find section by name with fuzzy matching
 * Handles common abbreviations and variations
 *
 * @param response - Assistant response
 * @param sectionName - Section name to find
 * @returns Section content or undefined
 */
export function findSection(
  response: AssistantResponse,
  sectionName: string
): string | undefined {
  // Try exact case-insensitive match first
  const normalizedName = sectionName.toLowerCase();

  for (const [key, value] of Object.entries(response.sections)) {
    if (key.toLowerCase() === normalizedName) {
      return value;
    }
  }

  // Try fuzzy matching
  for (const [key, value] of Object.entries(response.sections)) {
    if (fuzzyMatchSectionName(sectionName, key)) {
      return value;
    }
  }

  return undefined;
}

/**
 * Get all section names (normalized)
 *
 * @param response - Assistant response
 * @returns Array of section names
 */
export function getSectionNames(response: AssistantResponse): string[] {
  return Object.keys(response.sections);
}
