/**
 * Stage A Planner for Business Track AI Assistant
 * Cost-conscious structured planning using OpenAI mini model with Zod validation
 */
import type { PlannerInput, PlannerOutput } from '@kimuntupro/shared';
import { OpenAIClient } from '../llm/client.js';
/**
 * Heuristics for initial plan derivation
 */
interface PlanHeuristics {
    suggested_query_terms: string[];
    suggested_requires_retrieval: boolean;
    suggested_requires_web_search: boolean;
    suggested_sections: string[];
    suggested_metrics_needed: string[];
}
/**
 * Extract heuristics from input before calling LLM
 * Reduces token usage and provides fallback if LLM fails
 *
 * @param input - Planner input
 * @returns Derived heuristics
 */
export declare function deriveHeuristics(input: PlannerInput): PlanHeuristics;
/**
 * Plan a Business Track AI assistant request (Stage A)
 * Uses structured output from OpenAI mini model
 *
 * @param input - Planner input
 * @param client - Optional OpenAI client (creates new if not provided)
 * @returns Structured plan for executor
 */
export declare function plan(input: PlannerInput, client?: OpenAIClient): Promise<PlannerOutput>;
/**
 * Validate planner input
 * @param input - Input to validate
 * @returns Validation result
 */
export declare function validatePlannerInput(input: unknown): {
    success: boolean;
    data?: PlannerInput;
    errors?: string[];
};
/**
 * Plan with quota preflight check (Step 11)
 * Wrapper for API routes that enforces quotas before planning
 * Keeps core plan() function pure while adding quota enforcement
 *
 * @param input - Planner input
 * @param client - Optional OpenAI client
 * @returns Structured plan for executor
 * @throws QuotaError if quota would be exceeded
 */
export declare function planWithQuotaCheck(input: PlannerInput, client?: OpenAIClient): Promise<PlannerOutput>;
export {};
//# sourceMappingURL=planner.d.ts.map