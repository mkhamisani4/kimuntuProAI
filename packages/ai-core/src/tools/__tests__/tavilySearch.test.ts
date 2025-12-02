import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  webSearchWithTavily,
  buildTavilyWebSearchTools,
  resetTavilyState,
} from '../tavilySearch.js';

// Mock tavily module
vi.mock('tavily', () => ({
  tavily: vi.fn(() => ({
    search: vi.fn(),
  })),
}));

describe('tavilySearch', () => {
  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-456';

  beforeEach(() => {
    vi.clearAllMocks();
    resetTavilyState();
    // Set up environment for Tavily
    process.env.WEBSEARCH_PROVIDER = 'tavily';
    process.env.WEBSEARCH_API_KEY = 'test-tvly-key';
    process.env.WEBSEARCH_MAX_RESULTS = '10';
    process.env.TAVILY_SEARCH_DEPTH = 'basic';
    process.env.WEBSEARCH_RATE_LIMIT = '100';
    process.env.WEBSEARCH_CACHE_TTL_SEC = '300';
  });

  afterEach(() => {
    delete process.env.WEBSEARCH_PROVIDER;
    delete process.env.WEBSEARCH_API_KEY;
    delete process.env.WEBSEARCH_MAX_RESULTS;
    delete process.env.TAVILY_SEARCH_DEPTH;
  });

  describe('webSearchWithTavily', () => {
    it('returns empty results when Tavily is not enabled', async () => {
      process.env.WEBSEARCH_PROVIDER = 'openai';

      const result = await webSearchWithTavily('test query', {
        tenantId: mockTenantId,
        userId: mockUserId,
      });

      expect(result.query).toBe('test query');
      expect(result.results).toEqual([]);
      expect(result.timestamp).toBeDefined();
    });

    it('returns empty results when API key is missing', async () => {
      delete process.env.WEBSEARCH_API_KEY;

      const result = await webSearchWithTavily('test query', {
        tenantId: mockTenantId,
        userId: mockUserId,
      });

      expect(result.query).toBe('test query');
      expect(result.results).toEqual([]);
      expect(result.timestamp).toBeDefined();
    });

    it('performs search and maps results correctly', async () => {
      const mockTavilyResults = {
        results: [
          {
            title: 'Test Result 1',
            content: 'This is a test snippet 1',
            url: 'https://example.com/1',
          },
          {
            title: 'Test Result 2',
            content: 'This is a test snippet 2',
            url: 'https://example.com/2',
          },
        ],
      };

      const mockSearch = vi.fn().mockResolvedValue(mockTavilyResults);
      const { tavily } = await import('tavily');
      (tavily as any).mockReturnValue({ search: mockSearch });

      resetTavilyState(); // Force re-creation of client

      const result = await webSearchWithTavily('Phoenix food delivery', {
        tenantId: mockTenantId,
        userId: mockUserId,
        n: 5,
      });

      expect(result.query).toBe('Phoenix food delivery');
      expect(result.results).toHaveLength(2);
      expect(result.results[0]).toEqual({
        title: 'Test Result 1',
        snippet: 'This is a test snippet 1',
        url: 'https://example.com/1',
      });
      expect(result.timestamp).toBeDefined();
      expect(result.cached).toBeUndefined();

      // Verify search was called with correct parameters
      expect(mockSearch).toHaveBeenCalledWith('Phoenix food delivery', {
        searchDepth: 'basic',
        maxResults: 5,
        includeAnswer: false,
        includeRawContent: false,
      });
    });

    it('caches results and returns cached data on subsequent calls', async () => {
      const mockTavilyResults = {
        results: [
          {
            title: 'Cached Result',
            content: 'Cached content',
            url: 'https://example.com/cached',
          },
        ],
      };

      const mockSearch = vi.fn().mockResolvedValue(mockTavilyResults);
      const { tavily } = await import('tavily');
      (tavily as any).mockReturnValue({ search: mockSearch });

      resetTavilyState();

      // First call - should hit API
      const result1 = await webSearchWithTavily('cached query', {
        tenantId: mockTenantId,
        userId: mockUserId,
      });

      expect(result1.cached).toBeUndefined();
      expect(mockSearch).toHaveBeenCalledTimes(1);

      // Second call - should return from cache
      const result2 = await webSearchWithTavily('cached query', {
        tenantId: mockTenantId,
        userId: mockUserId,
      });

      expect(result2.cached).toBe(true);
      expect(result2.results).toEqual(result1.results);
      expect(mockSearch).toHaveBeenCalledTimes(1); // Still only one API call
    });

    it('handles API errors gracefully', async () => {
      const mockSearch = vi.fn().mockRejectedValue(new Error('API Error'));
      const { tavily } = await import('tavily');
      (tavily as any).mockReturnValue({ search: mockSearch });

      resetTavilyState();

      const result = await webSearchWithTavily('error query', {
        tenantId: mockTenantId,
        userId: mockUserId,
      });

      expect(result.query).toBe('error query');
      expect(result.results).toEqual([]);
      expect(result.timestamp).toBeDefined();
    });

    it('respects maxResults configuration', async () => {
      const mockTavilyResults = {
        results: Array.from({ length: 15 }, (_, i) => ({
          title: `Result ${i}`,
          content: `Content ${i}`,
          url: `https://example.com/${i}`,
        })),
      };

      const mockSearch = vi.fn().mockResolvedValue(mockTavilyResults);
      const { tavily } = await import('tavily');
      (tavily as any).mockReturnValue({ search: mockSearch });

      resetTavilyState();

      await webSearchWithTavily('test query', {
        tenantId: mockTenantId,
        userId: mockUserId,
        n: 10,
      });

      expect(mockSearch).toHaveBeenCalledWith('test query', {
        searchDepth: 'basic',
        maxResults: 10,
        includeAnswer: false,
        includeRawContent: false,
      });
    });
  });

  describe('buildTavilyWebSearchTools', () => {
    it('returns empty array when Tavily is not enabled', () => {
      process.env.WEBSEARCH_PROVIDER = 'openai';

      const tools = buildTavilyWebSearchTools();

      expect(tools).toEqual([]);
    });

    it('returns web_search tool definition when enabled', () => {
      const tools = buildTavilyWebSearchTools();

      expect(tools).toHaveLength(1);
      expect(tools[0]).toMatchObject({
        type: 'function',
        function: {
          name: 'web_search',
          description: expect.stringContaining('Search the web'),
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: expect.any(String),
              },
            },
            required: ['query'],
          },
        },
      });
    });
  });

  describe('resetTavilyState', () => {
    it('clears cache and rate limiter state', async () => {
      const mockTavilyResults = {
        results: [{ title: 'Test', content: 'Test', url: 'https://test.com' }],
      };

      const mockSearch = vi.fn().mockResolvedValue(mockTavilyResults);
      const { tavily } = await import('tavily');
      (tavily as any).mockReturnValue({ search: mockSearch });

      resetTavilyState();

      // First call
      await webSearchWithTavily('test', {
        tenantId: mockTenantId,
        userId: mockUserId,
      });

      // Reset state
      resetTavilyState();

      // Second call after reset - should hit API again
      await webSearchWithTavily('test', {
        tenantId: mockTenantId,
        userId: mockUserId,
      });

      expect(mockSearch).toHaveBeenCalledTimes(2); // Called twice, not cached
    });
  });
});
