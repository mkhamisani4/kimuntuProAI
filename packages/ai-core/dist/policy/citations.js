/**
 * Citation Validation for Business Track Policy
 * Validates that all citation markers map to actual sources
 */
/**
 * Check if response has a Sources section
 * Case-insensitive matching
 *
 * @param response - Assistant response
 * @returns True if Sources section exists
 */
export function hasSourcesSection(response) {
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
export function extractCitationMarkers(text) {
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
export function validateCitationMapping(rawText, ragSources, webSources) {
    const issues = [];
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
            }
            else {
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
        }
        else if (type === 'W') {
            // Web citation
            if (index < 0 || index >= webSources.length) {
                issues.push({
                    code: 'UNMAPPED_CITATION_MARKER',
                    message: `Citation marker [${marker}] references non-existent web source (have ${webSources.length} web sources)`,
                    meta: { marker, type: 'web', index, available: webSources.length },
                    severity: 'error',
                });
            }
            else {
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
        }
        else {
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
 * Validate citations in response
 * Combines all citation checks
 *
 * @param response - Assistant response
 * @param context - Validation context
 * @returns Array of validation issues
 */
export function validateCitations(response, context) {
    const issues = [];
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
    const mappingIssues = validateCitationMapping(response.rawModelOutput, ragSources, webSources);
    issues.push(...mappingIssues);
    return issues;
}
/**
 * Find section by name (case-insensitive)
 *
 * @param response - Assistant response
 * @param sectionName - Section name to find
 * @returns Section content or undefined
 */
export function findSection(response, sectionName) {
    const normalizedName = sectionName.toLowerCase();
    for (const [key, value] of Object.entries(response.sections)) {
        if (key.toLowerCase() === normalizedName) {
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
export function getSectionNames(response) {
    return Object.keys(response.sections);
}
//# sourceMappingURL=citations.js.map