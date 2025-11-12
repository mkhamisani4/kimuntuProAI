/**
 * Unified Web Search Entry Point
 * Delegates to OpenAI's built-in web search tool
 */

import type { OpenAIClient } from '../llm/client.js';
import {
  webSearchWithOpenAI,
  buildOpenAIWebSearchTools,
  buildOpenAIWebSearchToolSpec,
  resetWebSearchState,
  type WebSearchOptions,
  type WebSearchResponse,
  type WebSearchResult,
} from './openaiWebSearch.js';

/**
 * Perform web search
 * @param client - OpenAI client instance
 * @param options - Search options
 * @returns Search results
 */
export async function webSearch(
  client: OpenAIClient,
  options: WebSearchOptions
): Promise<WebSearchResponse> {
  return webSearchWithOpenAI(client, options);
}

/**
 * Build web search tools for OpenAI client
 * @returns Tool definition array
 */
export function buildWebSearchTools() {
  return buildOpenAIWebSearchTools();
}

/**
 * Build web search ToolSpec for chatWithTools()
 * @param client - OpenAI client instance
 * @returns ToolSpec and handler
 */
export function buildWebSearchToolSpec(client: OpenAIClient) {
  return buildOpenAIWebSearchToolSpec(client);
}

/**
 * Reset web search state (for testing)
 */
export function resetWebSearch(): void {
  resetWebSearchState();
}

/**
 * Re-export types
 */
export type { WebSearchOptions, WebSearchResponse, WebSearchResult };
