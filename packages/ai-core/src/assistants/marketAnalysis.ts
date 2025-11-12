/**
 * Market Analysis Assistant (#110)
 * Analyzes market landscapes with web search for current data
 * ALWAYS enables web search for TAM/SAM/SOM, competitors, and pricing
 */

import type { AssistantRequest, AssistantResponse } from '@kimuntupro/shared';
import { planWithQuotaCheck } from '../orchestration/planner.js';
import { execute } from '../orchestration/executor.js';

/**
 * Run Market Analysis assistant
 * Required sections: Market Definition, TAM/SAM/SOM, Target Segments, Competitors, Pricing Bands, GTM Angles, Assumptions, Sources
 *
 * @param input - Assistant request with tenant/user context
 * @returns Assistant response with market research
 */
export async function runMarketAnalysisAssistant(
  input: AssistantRequest & { tenantId: string; userId: string }
): Promise<AssistantResponse> {
  const { assistant, input: userInput, extra, tenantId, userId } = input;

  // Stage A: Planning (planner will automatically enable web search for market_analysis)
  const plan = await planWithQuotaCheck({
    assistant,
    input: userInput,
    tenantId,
    userId,
    extra,
  });

  // Verify web search is enabled (should be automatic for market_analysis)
  if (!plan.requires_web_search) {
    console.warn('Market analysis should always use web search - forcing enablement');
    plan.requires_web_search = true;
  }

  // Stage B: Execution with web search
  const response = await execute({
    plan,
    request: input, // Pass the full input object which already has tenantId and userId
    tenantId,
    userId,
  });

  return response;
}
