/**
 * Numeric Validation for Business Track Policy
 * Validates number grounding and sanity checks
 */
import type { AssistantType } from '@kimuntupro/shared';
import type { ValidationIssue } from './citations.js';
/**
 * Extracted number with context
 */
export interface ExtractedNumber {
    value: number;
    text: string;
    context: string;
    section?: string;
}
/**
 * Extract numbers from text
 * Finds currency, percentages, and plain numbers
 *
 * @param text - Text to search
 * @param section - Optional section name for context
 * @returns Array of extracted numbers
 */
export declare function extractNumbers(text: string, section?: string): ExtractedNumber[];
/**
 * Check if number is grounded in finance JSON
 * Allows tolerance windows
 *
 * @param value - Number to check
 * @param financeJson - Finance JSON object
 * @param tolerance - Tolerance settings
 * @returns True if grounded
 */
export declare function isNumberGrounded(value: number, financeJson: any, tolerance?: {
    currencyPct: number;
    percentagePp: number;
    countPct: number;
}): boolean;
/**
 * Check if number magnitude is suspicious
 * Different rules for different contexts
 *
 * @param value - Number to check
 * @param context - Context text
 * @returns True if suspicious
 */
export declare function isSuspiciousMagnitude(value: number, context: string): boolean;
/**
 * Validate numbers for financial assistants (#109)
 * Requires strict grounding in finance JSON
 *
 * @param text - Complete response text
 * @param financeJson - Finance JSON object
 * @param strictMode - Enable strict validation
 * @returns Array of validation issues
 */
export declare function validateFinancialNumbers(text: string, financeJson: any, strictMode?: boolean): ValidationIssue[];
/**
 * Validate numbers for non-financial assistants (#108, #110)
 * Applies sanity checks only
 *
 * @param text - Complete response text
 * @returns Array of validation issues
 */
export declare function validateGeneralNumbers(text: string): ValidationIssue[];
/**
 * Validate numbers based on assistant type
 *
 * @param assistant - Assistant type
 * @param text - Complete response text
 * @param financeJson - Optional finance JSON
 * @param strictMode - Enable strict validation for #109
 * @returns Array of validation issues
 */
export declare function validateNumbers(assistant: AssistantType, text: string, financeJson?: any, strictMode?: boolean): ValidationIssue[];
//# sourceMappingURL=numbers.d.ts.map