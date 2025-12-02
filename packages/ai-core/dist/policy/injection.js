/**
 * Prompt Injection Detection for Business Track Policy
 * Detects and mitigates prompt injection attempts from RAG/Web sources
 */
/**
 * Red flag patterns for prompt injection
 */
const INJECTION_PATTERNS = [
    // Direct instruction patterns
    /ignore\s+(all\s+)?(prior|previous|earlier)\s+(instructions?|prompts?|commands?)/i,
    /disregard\s+(all\s+)?(prior|previous|earlier)/i,
    /forget\s+(all\s+)?(prior|previous|earlier)/i,
    // Role manipulation
    /act\s+as\s+(system|admin|root|assistant)/i,
    /you\s+are\s+(now\s+)?(a\s+)?(system|admin|root)/i,
    /switch\s+to\s+(system|admin)\s+mode/i,
    // System markers
    /<\s*(system|assistant|user)\s*>/i,
    /\[?\s*(system|assistant|user)\s*\]?:/i,
    // Prompt exfiltration
    /repeat\s+(your|the)\s+(instructions?|prompt|system\s+message)/i,
    /show\s+me\s+(your|the)\s+(instructions?|prompt)/i,
    /what\s+(are|is)\s+your\s+(instructions?|prompt)/i,
    // Override attempts
    /override\s+(all\s+)?(instructions?|settings?|rules?)/i,
    /bypass\s+(all\s+)?(security|safety|checks?)/i,
    // Role switching
    /\/assistant\s*$/i,
    /\/system\s*$/i,
    /new\s+conversation/i,
];
/**
 * Detect prompt injection in text
 *
 * @param text - Text to check
 * @returns Detected patterns
 */
export function detectInjection(text) {
    const detected = [];
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(text)) {
            detected.push(pattern.source);
        }
    }
    return detected;
}
/**
 * Validate sources for prompt injection attempts
 *
 * @param sources - RAG and web sources
 * @returns Array of validation issues
 */
export function validateSourcesForInjection(sources) {
    const issues = [];
    for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const snippet = source.snippet || '';
        const detected = detectInjection(snippet);
        if (detected.length > 0) {
            issues.push({
                code: 'PROMPT_INJECTION_DETECTED',
                message: `Potential prompt injection detected in ${source.type} source: ${source.title || source.url || 'unknown'}`,
                meta: {
                    sourceIndex: i,
                    sourceType: source.type,
                    sourceTitle: source.title,
                    sourceUrl: source.url,
                    docId: source.docId,
                    patterns: detected,
                    snippet: snippet.slice(0, 100),
                },
                severity: 'warning',
            });
        }
    }
    return issues;
}
/**
 * Strip injection markers from text
 * Removes obvious system/assistant role markers
 *
 * @param text - Text to clean
 * @returns Cleaned text
 */
export function stripInjection(text) {
    let cleaned = text;
    // Remove system/assistant/user markers
    cleaned = cleaned.replace(/<\s*(system|assistant|user)\s*>/gi, '');
    cleaned = cleaned.replace(/\[\s*(system|assistant|user)\s*\]/gi, '');
    // Remove role markers at line start
    cleaned = cleaned.replace(/^\s*(system|assistant|user)\s*:/gim, '');
    // Remove command-like patterns
    cleaned = cleaned.replace(/\/\s*(system|assistant|user)\s*$/gim, '');
    // Remove "ignore instructions" type phrases
    const dangerousPhrases = [
        /ignore\s+(all\s+)?(prior|previous)\s+instructions?/gi,
        /disregard\s+(all\s+)?(prior|previous)/gi,
        /forget\s+(all\s+)?(prior|previous)/gi,
    ];
    for (const pattern of dangerousPhrases) {
        cleaned = cleaned.replace(pattern, '[removed]');
    }
    return cleaned;
}
/**
 * Check if text contains leaked system prompts
 * Detects if model output contains system-level instructions
 *
 * @param text - Text to check
 * @returns True if system prompt leaked
 */
export function hasSystemPromptLeakage(text) {
    const leakagePatterns = [
        /you are the (stage-a|stage-b|business track)/i,
        /your role is to (analyze|generate|produce)/i,
        /critical rules?:/i,
        /never fabricate/i,
        /always cite sources/i,
    ];
    return leakagePatterns.some((pattern) => pattern.test(text));
}
/**
 * Sanitize source snippets before injection into prompts
 * Defensive preprocessing of RAG/Web content
 *
 * @param snippet - Source snippet
 * @returns Sanitized snippet
 */
export function sanitizeSnippet(snippet) {
    let sanitized = snippet;
    // Limit length to prevent overwhelming context
    if (sanitized.length > 500) {
        sanitized = sanitized.slice(0, 500) + '...';
    }
    // Strip injection markers
    sanitized = stripInjection(sanitized);
    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    return sanitized;
}
/**
 * Score injection risk for a text
 * Returns 0-1 score (higher = more risky)
 *
 * @param text - Text to score
 * @returns Risk score
 */
export function scoreInjectionRisk(text) {
    let score = 0;
    // Check each pattern
    const detected = detectInjection(text);
    score += detected.length * 0.2; // Each pattern adds 20%
    // Check for system prompt leakage
    if (hasSystemPromptLeakage(text)) {
        score += 0.3;
    }
    // Check for excessive role markers
    const roleMarkers = (text.match(/<(system|assistant|user)>/gi) || []).length;
    score += Math.min(roleMarkers * 0.1, 0.3);
    // Cap at 1.0
    return Math.min(score, 1.0);
}
//# sourceMappingURL=injection.js.map