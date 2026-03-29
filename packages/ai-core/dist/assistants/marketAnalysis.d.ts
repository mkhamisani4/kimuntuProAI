/**
 * Market Analysis Assistant (#110)
 * Analyzes market landscapes with web search for current data
 * ALWAYS enables web search for TAM/SAM/SOM, competitors, and pricing
 */
import type { AssistantRequest, AssistantResponse } from '@kimuntupro/shared';
/**
 * Run Market Analysis assistant
 * Required sections: Market Definition, TAM/SAM/SOM, Target Segments, Competitors, Pricing Bands, GTM Angles, Assumptions, Sources
 *
 * @param input - Assistant request with tenant/user context
 * @returns Assistant response with market research
 */
export declare function runMarketAnalysisAssistant(input: AssistantRequest & {
    tenantId: string;
    userId: string;
}): Promise<AssistantResponse>;
//# sourceMappingURL=marketAnalysis.d.ts.map