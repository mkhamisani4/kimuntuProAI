/**
 * Executive Summary Assistant (#109)
 * Generates executive summaries with financial projections
 * ALWAYS includes finance metrics and unit economics
 */

import type { AssistantRequest, AssistantResponse } from '@kimuntupro/shared';
import { planWithQuotaCheck } from '../orchestration/planner.js';
import { execute } from '../orchestration/executor.js';

/**
 * Run Executive Summary assistant
 * Required sections: Executive Summary, Unit Economics, Projections (12-24 months), Recommendations, Sources
 *
 * @param input - Assistant request with tenant/user context and financial inputs
 * @returns Assistant response with financial analysis
 */
export async function runExecSummaryAssistant(
  input: AssistantRequest & { tenantId: string; userId: string }
): Promise<AssistantResponse> {
  const { assistant, input: userInput, extra, tenantId, userId } = input;

  // Ensure financial inputs are present in extra
  // If not provided, planner will request clarification or use defaults
  const financialInputs = extra || {};

  // Stage A: Planning
  const plan = await planWithQuotaCheck({
    assistant,
    input: userInput,
    tenantId,
    userId,
    extra: {
      ...financialInputs,
      // Flag to always compute finance metrics
      requiresFinance: true,
    },
  });

  // Stage B: Execution (executor will compute finance model)
  const response = await execute({
    plan,
    request: {
      ...input,
      extra: {
        ...financialInputs,
        requiresFinance: true,
      },
    },
    tenantId,
    userId,
  });

  return response;
}
