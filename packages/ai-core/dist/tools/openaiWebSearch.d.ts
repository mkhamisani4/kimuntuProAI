/**
 * OpenAI Built-in Web Search Tool
 * Wrapper around OpenAI's native web_search tool via Responses API
 */
import type { OpenAIClient, ToolSpec, ToolHandler } from '../llm/client.js';
/**
 * Web search result
 */
export interface WebSearchResult {
    title: string;
    snippet: string;
    url: string;
}
/**
 * Web search response
 */
export interface WebSearchResponse {
    query: string;
    results: WebSearchResult[];
    cached?: boolean;
}
/**
 * Web search options
 */
export interface WebSearchOptions {
    query: string;
    n?: number;
    tenantId: string;
    userId: string;
}
/**
 * Build OpenAI web search tool definition
 * @returns Tool definition array for OpenAI client
 */
export declare function buildOpenAIWebSearchTools(): any[];
/**
 * Perform web search using OpenAI's built-in web_search tool
 * @param client - OpenAI client instance
 * @param options - Search options
 * @returns Search results
 */
export declare function webSearchWithOpenAI(client: OpenAIClient, options: WebSearchOptions): Promise<WebSearchResponse>;
/**
 * Build web search ToolSpec for use with chatWithTools()
 * This allows other code to invoke web search as a tool
 * @param client - OpenAI client instance
 * @returns ToolSpec object
 */
export declare function buildOpenAIWebSearchToolSpec(client: OpenAIClient): {
    spec: ToolSpec;
    handler: ToolHandler;
};
/**
 * Reset rate limiter and cache (useful for testing)
 */
export declare function resetWebSearchState(): void;
//# sourceMappingURL=openaiWebSearch.d.ts.map