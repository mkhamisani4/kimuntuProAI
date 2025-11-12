/**
 * Policy Validation for Business Track AI Assistant
 * Main orchestrator for all validation checks
 */
import type { AssistantResponse, AssistantType } from '@kimuntupro/shared';
import type { ExecutorContext } from '../orchestration/answerFormatter.js';
import { type ValidationIssue } from './citations.js';
/**
 * Policy validation result
 */
export interface PolicyValidationResult {
    valid: boolean;
    issues: ValidationIssue[];
    appendedDisclaimer?: string;
}
/**
 * Policy issue (re-export)
 */
export type PolicyIssue = ValidationIssue;
/**
 * Validate executor output against policies
 *
 * @param response - Assistant response
 * @param context - Executor context
 * @returns Validation result
 */
export declare function validateOutput(response: AssistantResponse, context: ExecutorContext & {
    assistant: AssistantType;
    requiresWebSearch?: boolean;
    requiredSections?: string[];
}): PolicyValidationResult;
/**
 * Check if response contains proper citations
 *
 * @param response - Assistant response
 * @returns Validation result
 */
export declare function validateCitations(response: AssistantResponse): PolicyValidationResult;
/**
 * Check for potential hallucinations or unsupported claims
 *
 * @param response - Assistant response
 * @param context - Executor context
 * @returns Validation result
 */
export declare function validateFactualConsistency(response: AssistantResponse, context: ExecutorContext): PolicyValidationResult;
/**
 * Validate financial metrics for accuracy
 *
 * @param response - Assistant response
 * @param context - Executor context
 * @returns Validation result
 */
export declare function validateFinancialMetrics(response: AssistantResponse, context: ExecutorContext): PolicyValidationResult;
/**
 * Sanitize response by stripping injection markers
 *
 * @param response - Assistant response
 * @returns Sanitized response
 */
export declare function sanitizeResponse(response: AssistantResponse): AssistantResponse;
//# sourceMappingURL=validator.d.ts.map