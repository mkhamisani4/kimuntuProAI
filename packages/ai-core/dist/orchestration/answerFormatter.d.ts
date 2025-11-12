/**
 * Answer Formatter for Business Track Executor
 * Handles message assembly and response parsing with citations
 */
import type { AssistantRequest, AssistantSource, PlannerOutput } from '@kimuntupro/shared';
import type { RetrievedChunk, PackedContext } from '../retrieval/context.js';
import type { WebSearchResult } from '../tools/openaiWebSearch.js';
import type { ChatMessage } from '../llm/client.js';
import type { BusinessTrackFinancialModel } from '@kimuntupro/shared';
/**
 * Context prepared for executor
 */
export interface ExecutorContext {
    ragContext?: PackedContext;
    webSearchResults?: WebSearchResult[];
    financeModel?: BusinessTrackFinancialModel;
}
/**
 * Parsed executor response with sections and citations
 */
export interface ParsedExecutorResponse {
    sections: Record<string, string>;
    sources: AssistantSource[];
    rawOutput: string;
}
/**
 * Build system prompt for executor
 *
 * @returns System prompt
 */
export declare function buildExecutorSystemPrompt(): string;
/**
 * Build developer prompt with section requirements
 *
 * @param plan - Planner output
 * @returns Developer prompt
 */
export declare function buildExecutorDeveloperPrompt(plan: PlannerOutput): string;
/**
 * Build user message with all context
 *
 * @param request - Original request
 * @param plan - Planner output
 * @param context - Prepared context (RAG, web, finance)
 * @returns User message
 */
export declare function buildExecutorUserMessage(request: AssistantRequest, plan: PlannerOutput, context: ExecutorContext): string;
/**
 * Build complete message array for executor
 *
 * @param request - Original request
 * @param plan - Planner output
 * @param context - Prepared context
 * @returns Message array
 */
export declare function buildExecutorMessages(request: AssistantRequest, plan: PlannerOutput, context: ExecutorContext): ChatMessage[];
/**
 * Parse executor response into sections
 * Extracts markdown sections using ## headings
 *
 * @param rawOutput - Raw model output
 * @returns Parsed sections
 */
export declare function parseSections(rawOutput: string): Record<string, string>;
/**
 * Extract citation markers from text
 * Finds all [R1], [W2], etc. patterns
 *
 * @param text - Text to search
 * @returns Array of citation markers
 */
export declare function extractCitationMarkers(text: string): string[];
/**
 * Build source objects from RAG chunks
 *
 * @param chunks - Retrieved chunks
 * @returns AssistantSource array
 */
export declare function buildRAGSources(chunks: RetrievedChunk[]): AssistantSource[];
/**
 * Build source objects from web search results
 *
 * @param results - Web search results
 * @returns AssistantSource array
 */
export declare function buildWebSources(results: WebSearchResult[]): AssistantSource[];
/**
 * Map citation markers to actual sources
 * Returns only the sources that were actually cited
 *
 * @param rawOutput - Raw model output
 * @param ragSources - Available RAG sources
 * @param webSources - Available web sources
 * @returns Used sources in order
 */
export declare function mapCitationsToSources(rawOutput: string, ragSources: AssistantSource[], webSources: AssistantSource[]): AssistantSource[];
/**
 * Parse executor response with full citation mapping
 *
 * @param rawOutput - Raw model output
 * @param context - Executor context
 * @returns Parsed response
 */
export declare function parseExecutorResponse(rawOutput: string, context: ExecutorContext): ParsedExecutorResponse;
/**
 * Validate that all required sections are present
 *
 * @param sections - Parsed sections
 * @param requiredSections - Required section names
 * @returns Validation result
 */
export declare function validateSections(sections: Record<string, string>, requiredSections: string[]): {
    valid: boolean;
    missing: string[];
};
//# sourceMappingURL=answerFormatter.d.ts.map