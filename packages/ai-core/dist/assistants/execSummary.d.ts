/**
 * Executive Summary Assistant (#109)
 * Generates executive summaries with financial projections
 * ALWAYS includes finance metrics and unit economics
 */
import type { AssistantRequest, AssistantResponse } from '@kimuntupro/shared';
/**
 * Run Executive Summary assistant
 * Required sections: Executive Summary, Unit Economics, Projections (12-24 months), Recommendations, Sources
 *
 * @param input - Assistant request with tenant/user context and financial inputs
 * @returns Assistant response with financial analysis
 */
export declare function runExecSummaryAssistant(input: AssistantRequest & {
    tenantId: string;
    userId: string;
}): Promise<AssistantResponse>;
//# sourceMappingURL=execSummary.d.ts.map