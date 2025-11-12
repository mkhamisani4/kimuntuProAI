/**
 * Unified Web Search Entry Point
 * Delegates to OpenAI's built-in web search tool
 */
import type { OpenAIClient } from '../llm/client.js';
import { type WebSearchOptions, type WebSearchResponse, type WebSearchResult } from './openaiWebSearch.js';
/**
 * Perform web search
 * @param client - OpenAI client instance
 * @param options - Search options
 * @returns Search results
 */
export declare function webSearch(client: OpenAIClient, options: WebSearchOptions): Promise<WebSearchResponse>;
/**
 * Build web search tools for OpenAI client
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