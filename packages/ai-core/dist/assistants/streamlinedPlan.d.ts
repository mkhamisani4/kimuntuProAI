/**
 * Streamlined Plan Assistant (#108)
 * Generates lean one-page business plans for startups
 */
import type { AssistantRequest, AssistantResponse } from '@kimuntupro/shared';
/**
 * Run Streamlined Plan assistant
 * Default sections: Problem, Solution, ICP, GTM, 90-Day Milestones, KPIs, Next Actions, Sources
 *
 * @param input - Assistant request with tenant/user context
 * @returns Assistant response with sections and sources
 */
export declare function runStreamlinedPlanAssistant(input: AssistantRequest & {
    tenantId: string;
    userId: string;
}): Promise<AssistantResponse>;
//# sourceMappingURL=streamlinedPlan.d.ts.map