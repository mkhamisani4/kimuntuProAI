/**
 * Tavily Web Search Adapter (Phase 4)
 * Provides web search functionality using Tavily API
 * Includes in-memory caching with 5-minute TTL
 */

import { TavilyClient } from 'tavily';
import { RateLimiter, TTLCache, buildCacheKey } from './rateLimitCache.js';

/**
 * Web search result
 */
export interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
}

/**
 * Web search response with timestamp
 */
export interface WebSearchResponse {
  query: string;
  results: WebSearchResult[];
  timestamp: string;
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
 * Tavily configuration from environment
 */
interface TavilyConfig {
  enabled: boolean;
  apiKey: string;
  maxResults: number;
  searchDepth: 'basic' | 'advanced';
  rateLimit: number;
  cacheTTL: number;
}

/**
 * Load Tavily config from environment
 */
function loadTavilyConfig(): TavilyConfig {
  return {
    enabled: process.env.WEBSEARCH_PROVIDER === 'tavily' && !!process.env.WEBSEARCH_API_KEY,
    apiKey: process.env.WEBSEARCH_API_KEY || '',
    maxResults: Number(process.env.WEBSEARCH_MAX_RESULTS) || 10,
    searchDepth: (process.env.TAVILY_SEARCH_DEPTH as 'basic' | 'advanced') || 'basic',
    rateLimit: Number(process.env.WEBSEARCH_RATE_LIMIT) || 100,
    cacheTTL: Number(process.env.WEBSEARCH_CACHE_TTL_SEC) || 300,
  };
}

/**
 * Singleton instances for rate limiting and caching
 */
let rateLimiter: RateLimiter | null = null;
let cache: TTLCache<WebSearchResponse> | null = null;
let tavilyClient: any = null;

/**
 * Get or create rate limiter
 */
function getRateLimiter(): RateLimiter {
  if (!rateLimiter) {
    const config = loadTavilyConfig();
    rateLimiter = new RateLimiter(config.rateLimit, config.rateLimit);
  }
  return rateLimiter;
}

/**
 * Get or create cache
 */
function getCache(): TTLCache<WebSearchResponse> {
  if (!cache) {
    const config = loadTavilyConfig();
    cache = new TTLCache<WebSearchResponse>(config.cacheTTL, 1000);
  }
  return cache;
}

/**
 * Get or create Tavily client
 */
function getTavilyClient() {
  if (!tavilyClient) {
    const config = loadTavilyConfig();
    if (!config.apiKey) {
      throw new Error('Tavily API key not configured. Set WEBSEARCH_API_KEY environment variable.');
    }
    tavilyClient = new TavilyClient({ apiKey: config.apiKey });
  }
  return tavilyClient;
}

/**
 * Perform web search using Tavily API
 * @param query - Search query
 * @param options - Search options with tenant/user context
 * @returns Search results with timestamp
 */
export async function webSearchWithTavily(
  query: string,
  options: Omit<WebSearchOptions, 'query'>
): Promise<WebSearchResponse> {
  const config = loadTavilyConfig();

  if (!config.enabled) {
    console.warn('Tavily web search is not enabled');
    return {
      query,
      results: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Build cache key for tenant/user isolation
  const maxResults = options.n || config.maxResults;
  const cacheKey = `tavily:${options.tenantId}:${buildCacheKey(query, maxResults)}`;
  const searchCache = getCache();

  // Check cache first
  const cachedResult = searchCache.get(cacheKey);
  if (cachedResult) {
    console.log(`[Tavily] Cache hit for query: "${query}"`);
    return {
      ...cachedResult,
      cached: true,
    };
  }

  // Check rate limit (per tenant)
  const limiter = getRateLimiter();
  const allowed = await limiter.checkLimit(options.tenantId);
  if (!allowed) {
    console.warn(`[Tavily] Rate limit exceeded for tenant: ${options.tenantId}`);
    return {
      query,
      results: [],
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const client = getTavilyClient();

    console.log(`[Tavily] Searching for: "${query}" (max ${maxResults} results)`);

    // Perform Tavily search
    const response = await client.search(query, {
      searchDepth: config.searchDepth,
      maxResults: maxResults,
      includeAnswer: false,
      includeRawContent: false,
    });

    // Map Tavily results to our interface
    const results: WebSearchResult[] = (response.results || []).map((result: any) => ({
      title: result.title || '',
      snippet: result.content || '',
      url: result.url || '',
    }));

    const searchResponse: WebSearchResponse = {
      query,
      results,
      timestamp: new Date().toISOString(),
    };

    // Cache the result
    searchCache.set(cacheKey, searchResponse);

    console.log(`[Tavily] Found ${results.length} results for: "${query}"`);

    return searchResponse;
  } catch (error) {
    console.error('[Tavily] Search error:', error);
    // Return empty results on error, don't throw
    return {
      query,
      results: [],
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Build web search tool definition for function calling
 * @returns Tool definition array
 */
export function buildTavilyWebSearchTools(): any[] {
  const config = loadTavilyConfig();

  if (!config.enabled) {
    return [];
  }

  return [
    {
      type: 'function',
      function: {
        name: 'web_search',
        description:
          'Search the web for current information about markets, competitors, pricing, trends, and other business data. Use this tool to find recent and relevant information.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query to execute',
            },
          },
          required: ['query'],
        },
      },
    },
  ];
}

/**
 * Reset Tavily state (for testing)
 */
export function resetTavilyState(): void {
  rateLimiter = null;
  cache = null;
  tavilyClient = null;
}
