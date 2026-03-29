/**
 * Prompt Injection Detection for Business Track Policy
 * Detects and mitigates prompt injection attempts from RAG/Web sources
 */
import type { AssistantSource } from '@kimuntupro/shared';
import type { ValidationIssue } from './citations.js';
/**
 * Detect prompt injection in text
 *
 * @param text - Text to check
 * @returns Detected patterns
 */
export declare function detectInjection(text: string): string[];
/**
 * Validate sources for prompt injection attempts
 *
 * @param sources - RAG and web sources
 * @returns Array of validation issues
 */
export declare function validateSourcesForInjection(sources: AssistantSource[]): ValidationIssue[];
/**
 * Strip injection markers from text
 * Removes obvious system/assistant role markers
 *
 * @param text - Text to clean
 * @returns Cleaned text
 */
export declare function stripInjection(text: string): string;
/**
 * Check if text contains leaked system prompts
 * Detects if model output contains system-level instructions
 *
 * @param text - Text to check
 * @returns True if system prompt leaked
 */
export declare function hasSystemPromptLeakage(text: string): boolean;
/**
 * Sanitize source snippets before injection into prompts
 * Defensive preprocessing of RAG/Web content
 *
 * @param snippet - Source snippet
 * @returns Sanitized snippet
 */
export declare function sanitizeSnippet(snippet: string): string;
/**
 * Score injection risk for a text
 * Returns 0-1 score (higher = more risky)
 *
 * @param text - Text to score
 * @returns Risk score
 */
export declare function scoreInjectionRisk(text: string): number;
//# sourceMappingURL=injection.d.ts.map