/**
 * Streamlined Plan Assistant (#108)
 * Generates lean one-page business plans for startups
 */

import type { AssistantRequest, AssistantResponse } from '@kimuntupro/shared';
import { planWithQuotaCheck } from '../orchestration/planner';
import { execute } from '../orchestration/executor';

/**
 * Run Streamlined Plan assistant
 * Default sections: Problem, Solution, ICP, GTM, 90-Day Milestones, KPIs, Next Actions, Sources
 *
 * @param input - Assistant request with tenant/user context
 * @returns Assistant response with sections and sources
 */
export async function runStreamlinedPlanAssistant(
  input: AssistantRequest & { tenantId: string; userId: string }
): Promise<AssistantResponse> {
  const { assistant, input: userInput, extra, tenantId, userId } = input;

  // Stage A: Planning
  const plan = await planWithQuotaCheck({
    assistant,
    input: userInput,
    tenantId,
    userId,
    extra,
  });

  // Stage B: Execution
  const response = await execute({
    plan,
    request: input, // Pass the full input object which already has tenantId and userId
    tenantId,
    userId,
    // Note: RAG query functions would be injected here
    // For now, they're undefined so RAG will be skipped unless requires_retrieval is false
  });

  return response;
}
