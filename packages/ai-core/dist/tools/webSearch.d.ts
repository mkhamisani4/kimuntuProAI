/**
 * Unified Web Search Entry Point
 * Delegates to either OpenAI or Tavily based on configuration
 */
import type { OpenAIClient } from '../llm/client.js';
import { type WebSearchOptions, type WebSearchResponse, type WebSearchResult } from './openaiWebSearch.js';
/**
 * Perform web search using configured provider
 * @param client - OpenAI client instance (only needed for OpenAI provider)
 * @param options - Search options
 * @returns Search results
 */
export declare function webSearch(client: OpenAIClient | null, options: WebSearchOptions): Promise<WebSearchResponse>;
/**
 * Build web search tools for configured provider
 * @returns Tool definition array
 */
export declare function buildWebSearchTools(): any[];
/**
 * Build web search ToolSpec for chatWithTools()
 * @param client - OpenAI client instance
 * @returns ToolSpec and handler
 */
export declare function buildWebSearchToolSpec(client: OpenAIClient): {
    spec: import("../index.js").ToolSpec;
    handler: import("../index.js").ToolHandler;
};
/**
 * Reset web search state (for testing)
 */
export declare function resetWebSearch(): void;
/**
 * Re-export types
 */
export type { WebSearchOptions, WebSearchResponse, WebSearchResult };
//# sourceMappingURL=webSearch.d.ts.map