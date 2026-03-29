/**
 * Unified Web Search Entry Point
 * Delegates to either OpenAI or Tavily based on configuration
 */
import { webSearchWithOpenAI, buildOpenAIWebSearchTools, buildOpenAIWebSearchToolSpec, resetWebSearchState, } from './openaiWebSearch.js';
import { webSearchWithTavily, buildTavilyWebSearchTools, resetTavilyState, } from './tavilySearch.js';
/**
 * Get configured web search provider
 */
function getProvider() {
    return process.env.WEBSEARCH_PROVIDER === 'tavily' ? 'tavily' : 'openai';
}
/**
 * Perform web search using configured provider
 * @param client - OpenAI client instance (only needed for OpenAI provider)
 * @param options - Search options
 * @returns Search results
 */
export async function webSearch(client, options) {
    const provider = getProvider();
    if (provider === 'tavily') {
        return webSearchWithTavily(options.query, {
            n: options.n,
            tenantId: options.tenantId,
            userId: options.userId,
        });
    }
    if (!client) {
        throw new Error('OpenAI client is required for OpenAI web search provider');
    }
    return webSearchWithOpenAI(client, options);
}
/**
 * Build web search tools for configured provider
 * @returns Tool definition array
 */
export function buildWebSearchTools() {
    const provider = getProvider();
    if (provider === 'tavily') {
        return buildTavilyWebSearchTools();
    }
    return buildOpenAIWebSearchTools();
}
/**
 * Build web search ToolSpec for chatWithTools()
 * @param client - OpenAI client instance
 * @returns ToolSpec and handler
 */
export function buildWebSearchToolSpec(client) {
    return buildOpenAIWebSearchToolSpec(client);
}
/**
 * Reset web search state (for testing)
 */
export function resetWebSearch() {
    resetWebSearchState();
    resetTavilyState();
}
//# sourceMappingURL=webSearch.js.map