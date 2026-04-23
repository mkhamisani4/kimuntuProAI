/**
 * Legal Analysis Assistant
 * Generates legal analysis, predicted outcomes, and action plans.
 */

import type { AssistantRequest, AssistantResponse } from '@kimuntupro/shared';
import { planWithQuotaCheck } from '../orchestration/planner';
import { execute } from '../orchestration/executor';

/**
 * Run Legal Analysis assistant.
 *
 * @param input - Assistant request with tenant/user context
 * @returns Assistant response with sections and sources
 */
export async function runLegalAnalysisAssistant(
  input: AssistantRequest & { tenantId: string; userId: string }
): Promise<AssistantResponse> {
  const { assistant, input: userInput, extra, tenantId, userId } = input;

  const plan = await planWithQuotaCheck({
    assistant,
    input: userInput,
    tenantId,
    userId,
    extra,
  });

  const response = await execute({
    plan,
    request: input,
    tenantId,
    userId,
  });

  return response;
}
