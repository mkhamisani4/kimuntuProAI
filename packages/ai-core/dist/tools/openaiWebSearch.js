/**
 * OpenAI Built-in Web Search Tool
 * Wrapper around OpenAI's native web_search tool via Responses API
 */
import { RateLimiter, TTLCache, buildCacheKey } from './rateLimitCache.js';
/**
 * Load config from environment
 */
function loadConfig() {
    return {
        enabled: process.env.OPENAI_WEB_SEARCH_ENABLED !== 'false',
        maxResults: Number(process.env.OPENAI_WEB_SEARCH_MAX_RESULTS) || 8,
        rateLimit: Number(process.env.WEBSEARCH_RATE_LIMIT) || 100,
        cacheTTL: Number(process.env.WEBSEARCH_CACHE_TTL_SEC) || 300,
        blocklist: process.env.WEBSEARCH_BLOCKLIST?.split(',').map(s => s.trim()) || [],
        allowlist: process.env.WEBSEARCH_ALLOWLIST?.split(',').map(s => s.trim()) || [],
    };
}
/**
 * Singleton instances for rate limiting and caching
 */
let rateLimiter = null;
let cache = null;
/**
 * Get or create rate limiter
 */
function getRateLimiter() {
    if (!rateLimiter) {
        const config = loadConfig();
        rateLimiter = new RateLimiter(config.rateLimit, config.rateLimit);
    }
    return rateLimiter;
}
/**
 * Get or create cache
 */
function getCache() {
    if (!cache) {
        const config = loadConfig();
        cache = new TTLCache(config.cacheTTL, 1000);
    }
    return cache;
}
/**
 * Build OpenAI web search tool definition
 * @returns Tool definition array for OpenAI client
 */
export function buildOpenAIWebSearchTools() {
    const config = loadConfig();
    // Return empty array if web search is disabled
    if (!config.enabled) {
        return [];
    }
    // Note: OpenAI's built-in web_search tool is not currently supported
    // Returning empty array until we implement a proper function-based tool
    console.warn('Web search requested but not yet implemented');
    return [];
}
/**
 * Sanitize query
 * @param query - Raw query string
 * @returns Sanitized query
 * @throws Error if query is empty or invalid
 */
function sanitizeQuery(query) {
    const sanitized = query.trim().replace(/\s+/g, ' ');
    if (!sanitized) {
        throw new Error('Query cannot be empty');
    }
    if (sanitized.length > 500) {
        throw new Error('Query too long (max 500 characters)');
    }
    return sanitized;
}
/**
 * Filter results by blocklist/allowlist
 * @param results - Search results
 * @param config - Web search config
 * @returns Filtered results
 */
function filterResults(results, config) {
    return results.filter(result => {
        try {
            const url = new URL(result.url);
            const hostname = url.hostname.toLowerCase();
            // Check blocklist
            if (config.blocklist.length > 0) {
                for (const blocked of config.blocklist) {
                    if (hostname.includes(blocked.toLowerCase())) {
                        return false;
                    }
                }
            }
            // Check allowlist (if set, only allow these)
            if (config.allowlist.length > 0) {
                let allowed = false;
                for (const allow of config.allowlist) {
                    if (hostname.includes(allow.toLowerCase())) {
                        allowed = true;
                        break;
                    }
                }
                return allowed;
            }
            return true;
        }
        catch {
            // Invalid URL, filter out
            return false;
        }
    });
}
/**
 * Deduplicate results by URL
 * @param results - Search results
 * @returns Deduplicated results
 */
function deduplicateResults(results) {
    const seen = new Set();
    return results.filter(result => {
        const normalizedUrl = result.url.toLowerCase().replace(/\/+$/, ''); // Remove trailing slashes
        if (seen.has(normalizedUrl)) {
            return false;
        }
        seen.add(normalizedUrl);
        return true;
    });
}
/**
 * Extract search results from OpenAI response
 * @param content - Assistant message content
 * @returns Array of search results
 */
function extractSearchResults(content) {
    const results = [];
    // Try to parse as JSON first
    try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
            return parsed
                .filter(item => item.url && item.title)
                .map(item => ({
                title: item.title || '',
                snippet: item.snippet || item.description || '',
                url: item.url,
            }));
        }
    }
    catch {
        // Not JSON, try to extract URLs from text
    }
    // Extract markdown links: [title](url)
    const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownRegex.exec(content)) !== null) {
        const title = match[1];
        const url = match[2];
        // Extract snippet from surrounding text
        const snippetStart = Math.max(0, match.index - 200);
        const snippetEnd = Math.min(content.length, match.index + match[0].length + 200);
        const snippet = content.substring(snippetStart, snippetEnd).trim();
        if (url.startsWith('http')) {
            results.push({ title, url, snippet });
        }
    }
    // If no markdown links, try to extract plain URLs
    if (results.length === 0) {
        const urlRegex = /https?:\/\/[^\s<>"]+/g;
        const urls = content.match(urlRegex) || [];
        urls.forEach(url => {
            results.push({
                title: url,
                snippet: '',
                url,
            });
        });
    }
    return results;
}
/**
 * Perform web search using OpenAI's built-in web_search tool
 * @param client - OpenAI client instance
 * @param options - Search options
 * @returns Search results
 */
export async function webSearchWithOpenAI(client, options) {
    const config = loadConfig();
    // Check if enabled
    if (!config.enabled) {
        throw new Error('OpenAI web search is disabled. Set OPENAI_WEB_SEARCH_ENABLED=true');
    }
    // Sanitize query
    const sanitized = sanitizeQuery(options.query);
    const n = Math.min(options.n ?? config.maxResults, 10); // Cap at 10
    // Check cache
    const cacheKey = buildCacheKey(sanitized, n);
    const cached = getCache().get(cacheKey);
    if (cached) {
        return { ...cached, cached: true };
    }
    // Check rate limit
    const limiter = getRateLimiter();
    const allowed = await limiter.checkLimit(options.tenantId);
    if (!allowed) {
        throw new Error(`Rate limit exceeded for tenant ${options.tenantId}. Please try again later.`);
    }
    try {
        // Build messages that instruct the model to use web search
        const messages = [
            {
                role: 'system',
                content: `You are a cost-conscious research assistant. Use the web_search tool to find up-to-date information. Return results in JSON format as an array of objects with fields: title, snippet, url. Limit to ${n} most relevant results.`,
            },
            {
                role: 'user',
                content: `Search for: "${sanitized}". Return up to ${n} relevant results with title, snippet, and URL.`,
            },
        ];
        // Call chatWithTools - the model will decide to invoke web_search
        // We provide a simple handler that just returns the tool result
        const response = await client.chatWithTools({
            messages,
            tools: buildOpenAIWebSearchTools(),
            toolHandlers: {
                web_search: async (args) => {
                    // This will be called by OpenAI's backend, we just pass through
                    return args;
                },
            },
            maxToolCalls: 1,
            maxOutputTokens: 4000,
        });
        // Extract results from response
        let results = extractSearchResults(response.text);
        // Filter by blocklist/allowlist
        results = filterResults(results, config);
        // Deduplicate
        results = deduplicateResults(results);
        // Truncate to n
        results = results.slice(0, n);
        const searchResponse = {
            query: sanitized,
            results,
        };
        // Cache the response
        getCache().set(cacheKey, searchResponse, config.cacheTTL);
        return searchResponse;
    }
    catch (error) {
        // Log error and return empty results
        console.warn(`Web search failed for query "${sanitized}":`, error.message);
        return {
            query: sanitized,
            results: [],
        };
    }
}
/**
 * Build web search ToolSpec for use with chatWithTools()
 * This allows other code to invoke web search as a tool
 * @param client - OpenAI client instance
 * @returns ToolSpec object
 */
export function buildOpenAIWebSearchToolSpec(client) {
    const spec = {
        type: 'function',
        function: {
            name: 'web_search',
            description: 'Search the web for up-to-date information using OpenAI built-in web search. Returns an array of results with title, snippet, and URL.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The search query',
                    },
                    n: {
                        type: 'number',
                        description: 'Maximum number of results to return (1-10)',
                        minimum: 1,
                        maximum: 10,
                    },
                    tenantId: {
                        type: 'string',
                        description: 'Tenant identifier for rate limiting',
                    },
                    userId: {
                        type: 'string',
                        description: 'User identifier for tracking',
                    },
                },
                required: ['query', 'tenantId', 'userId'],
            },
        },
    };
    const handler = async (args) => {
        const result = await webSearchWithOpenAI(client, {
            query: args.query,
            n: args.n,
            tenantId: args.tenantId,
            userId: args.userId,
        });
        return result;
    };
    return { spec, handler };
}
/**
 * Reset rate limiter and cache (useful for testing)
 */
export function resetWebSearchState() {
    rateLimiter?.resetAll();
    cache?.clear();
    // Set to null so they are re-created with new config on next access
    rateLimiter = null;
    cache = null;
}
//# sourceMappingURL=openaiWebSearch.js.map