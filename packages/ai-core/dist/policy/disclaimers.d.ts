/**
 * Disclaimer Generation for Business Track Policy
 * Builds appropriate disclaimers based on assistant type and validation issues
 */
import type { AssistantType, AssistantSource } from '@kimuntupro/shared';
import type { ValidationIssue } from './citations.js';
/**
 * Build disclaimer for assistant response
 *
 * @param assistant - Assistant type
 * @param issues - Validation issues
 * @param context - Additional context
 * @returns Disclaimer text or empty string
 */
export declare function buildDisclaimer(assistant: AssistantType, issues: ValidationIssue[], context?: {
    webSources?: AssistantSource[];
    hasFinanceData?: boolean;
}): string;
/**
 * Build data freshness note
 *
 * @param webSources - Web sources used
 * @param recencyMonths - Recency requirement in months
 * @returns Freshness note or empty string
 */
export declare function buildFreshnessNote(webSources: AssistantSource[], recencyMonths?: number): string;
//# sourceMappingURL=disclaimers.d.ts.map