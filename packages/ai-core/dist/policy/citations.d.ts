/**
 * Citation Validation for Business Track Policy
 * Validates that all citation markers map to actual sources
 */
import type { AssistantResponse, AssistantSource } from '@kimuntupro/shared';
/**
 * Validation issue
 */
export interface ValidationIssue {
    code: 'NO_SOURCES_SECTION' | 'MISSING_CITATION_TARGET' | 'UNMAPPED_CITATION_MARKER' | 'UNSUPPORTED_SOURCE_TYPE' | 'UNSUPPORTED_RECENCY' | 'UNGROUNDED_NUMBER' | 'SUSPICIOUS_MAGNITUDE' | 'PROMPT_INJECTION_DETECTED' | 'PII_LEAKAGE' | 'EMPTY_REQUIRED_SECTION' | 'MISSING_SECTION_CITATION';
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
export declare function hasSourcesSection(response: AssistantResponse): boolean;
/**
 * Extract citation markers from text
 * Finds all [R1], [W2], etc. patterns
 *
 * @param text - Text to search
 * @returns Array of citation markers (e.g., ['R1', 'W2'])
 */
export declare function extractCitationMarkers(text: string): string[];
/**
 * Validate citation mapping between markers and sources
 *
 * @param rawText - Complete response text
 * @param ragSources - Available RAG sources
 * @param webSources - Available web sources
 * @returns Array of validation issues
 */
export declare function validateCitationMapping(rawText: string, ragSources: AssistantSource[], webSources: AssistantSource[]): ValidationIssue[];
/**
 * Validate that each section contains at least one citation (Phase 5)
 * Required when retrieval or web search is used
 *
 * @param response - Assistant response
 * @param requirePerSectionCitations - Whether to enforce citations per section
 * @returns Array of validation issues
 */
export declare function validatePerSectionCitations(response: AssistantResponse, requirePerSectionCitations: boolean): ValidationIssue[];
/**
 * Validate citations in response
 * Combines all citation checks
 *
 * @param response - Assistant response
 * @param context - Validation context
 * @returns Array of validation issues
 */
export declare function validateCitations(response: AssistantResponse, context: {
    requireSourcesSection: boolean;
    requirePerSectionCitations?: boolean;
}): ValidationIssue[];
/**
 * Check if two section names match with fuzzy matching
 * Handles abbreviations and common variations
 *
 * @param expected - Expected section name
 * @param actual - Actual section name from response
 * @returns True if names match (fuzzy)
 */
export declare function fuzzyMatchSectionName(expected: string, actual: string): boolean;
/**
 * Find section by name with fuzzy matching
 * Handles common abbreviations and variations
 *
 * @param response - Assistant response
 * @param sectionName - Section name to find
 * @returns Section content or undefined
 */
export declare function findSection(response: AssistantResponse, sectionName: string): string | undefined;
/**
 * Get all section names (normalized)
 *
 * @param response - Assistant response
 * @returns Array of section names
 */
export declare function getSectionNames(response: AssistantResponse): string[];
//# sourceMappingURL=citations.d.ts.map