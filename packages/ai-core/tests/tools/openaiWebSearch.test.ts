/**
 * Tests for OpenAI Web Search Tool
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  webSearchWithOpenAI,
  buildOpenAIWebSearchTools,
  buildOpenAIWebSearchToolSpec,
  resetWebSearchState,
} from '../../src/tools/openaiWebSearch.js';
import type { OpenAIClient } from '../../src/llm/client.js';

// Mock environment variables
const originalEnv = process.env;

describe('buildOpenAIWebSearchTools', () => {
  it('should return web_search tool definition', () => {
    const tools = buildOpenAIWebSearchTools();

    expect(tools).toHaveLength(1);
    expect(tools[0]).toEqual({ type: 'web_search' });
  });
});

describe('webSearchWithOpenAI', () => {
  let mockClient: OpenAIClient;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    process.env.OPENAI_WEB_SEARCH_ENABLED = 'true';
    process.env.OPENAI_WEB_SEARCH_MAX_RESULTS = '8';
    process.env.WEBSEARCH_RATE_LIMIT = '100';
    process.env.WEBSEARCH_CACHE_TTL_SEC = '300';

    // Reset state
    resetWebSearchState();

    // Create mock client
    mockClient = {
      chatWithTools: vi.fn(),
    } as any;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should throw error if disabled', async () => {
    process.env.OPENAI_WEB_SEARCH_ENABLED = 'false';

    await expect(
      webSearchWithOpenAI(mockClient, {
        query: 'test query',
        tenantId: 'tenant1',
        userId: 'user1',
      })
    ).rejects.toThrow('OpenAI web search is disabled');
  });

  it('should throw error for empty query', async () => {
    await expect(
      webSearchWithOpenAI(mockClient, {
        query: '   ',
        tenantId: 'tenant1',
        userId: 'user1',
      })
    ).rejects.toThrow('Query cannot be empty');
  });

  it('should throw error for too long query', async () => {
    const longQuery = 'a'.repeat(501);

    await expect(
      webSearchWithOpenAI(mockClient, {
        query: longQuery,
        tenantId: 'tenant1',
        userId: 'user1',
      })
    ).rejects.toThrow('Query too long');
  });

  it('should call chatWithTools with correct parameters', async () => {
    const mockResponse = {
      text: JSON.stringify([
        {
          title: 'Result 1',
          snippet: 'Snippet 1',
          url: 'https://example.com/1',
        },
      ]),
      toolCalls: [],
      toolInvocations: {},
      raw: {},
      tokensIn: 100,
      tokensOut: 50,
      model: 'gpt-4o-mini',
      latencyMs: 1000,
      costCents: 0.01,
    };

    (mockClient.chatWithTools as any).mockResolvedValue(mockResponse);

    const result = await webSearchWithOpenAI(mockClient, {
      query: 'test query',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(mockClient.chatWithTools).toHaveBeenCalledWith({
      messages: expect.arrayContaining([
        expect.objectContaining({ role: 'system' }),
        expect.objectContaining({ role: 'user', content: expect.stringContaining('test query') }),
      ]),
      tools: [{ type: 'web_search' }],
      toolHandlers: expect.any(Object),
      maxToolCalls: 1,
      maxOutputTokens: 4000,
    });

    expect(result.query).toBe('test query');
    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toBe('Result 1');
  });

  it('should extract results from JSON response', async () => {
    const mockResponse = {
      text: JSON.stringify([
        {
          title: 'Result 1',
          snippet: 'Snippet 1',
          url: 'https://example.com/1',
        },
        {
          title: 'Result 2',
          snippet: 'Snippet 2',
          url: 'https://example.com/2',
        },
      ]),
      toolCalls: [],
      toolInvocations: {},
      raw: {},
      tokensIn: 100,
      tokensOut: 50,
      model: 'gpt-4o-mini',
      latencyMs: 1000,
      costCents: 0.01,
    };

    (mockClient.chatWithTools as any).mockResolvedValue(mockResponse);

    const result = await webSearchWithOpenAI(mockClient, {
      query: 'test',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(result.results).toHaveLength(2);
    expect(result.results[0].url).toBe('https://example.com/1');
    expect(result.results[1].url).toBe('https://example.com/2');
  });

  it('should extract results from markdown response', async () => {
    const mockResponse = {
      text: 'Here are the results:\n[Result 1](https://example.com/1)\n[Result 2](https://example.com/2)',
      toolCalls: [],
      toolInvocations: {},
      raw: {},
      tokensIn: 100,
      tokensOut: 50,
      model: 'gpt-4o-mini',
      latencyMs: 1000,
      costCents: 0.01,
    };

    (mockClient.chatWithTools as any).mockResolvedValue(mockResponse);

    const result = await webSearchWithOpenAI(mockClient, {
      query: 'test',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].url).toBe('https://example.com/1');
  });

  it('should cache results', async () => {
    const mockResponse = {
      text: JSON.stringify([
        {
          title: 'Result 1',
          snippet: 'Snippet 1',
          url: 'https://example.com/1',
        },
      ]),
      toolCalls: [],
      toolInvocations: {},
      raw: {},
      tokensIn: 100,
      tokensOut: 50,
      model: 'gpt-4o-mini',
      latencyMs: 1000,
      costCents: 0.01,
    };

    (mockClient.chatWithTools as any).mockResolvedValue(mockResponse);

    // First call
    const result1 = await webSearchWithOpenAI(mockClient, {
      query: 'test',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(result1.cached).toBeUndefined();

    // Second call with same query
    const result2 = await webSearchWithOpenAI(mockClient, {
      query: 'test',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(result2.cached).toBe(true);
    expect(mockClient.chatWithTools).toHaveBeenCalledTimes(1); // Only called once
  });

  it('should enforce rate limiting', async () => {
    // Set very low rate limit
    process.env.WEBSEARCH_RATE_LIMIT = '2';
    // Disable cache to ensure rate limiting is tested
    process.env.WEBSEARCH_CACHE_TTL_SEC = '0';
    resetWebSearchState();

    const mockResponse = {
      text: JSON.stringify([{ title: 'Result', snippet: 'Snippet', url: 'https://example.com' }]),
      toolCalls: [],
      toolInvocations: {},
      raw: {},
      tokensIn: 100,
      tokensOut: 50,
      model: 'gpt-4o-mini',
      latencyMs: 1000,
      costCents: 0.01,
    };

    (mockClient.chatWithTools as any).mockResolvedValue(mockResponse);

    // First two calls should succeed (using unique queries to avoid cache)
    await webSearchWithOpenAI(mockClient, {
      query: 'test query number one unique',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    await webSearchWithOpenAI(mockClient, {
      query: 'test query number two unique',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    // Third call should fail due to rate limit
    await expect(
      webSearchWithOpenAI(mockClient, {
        query: 'test query number three unique',
        tenantId: 'tenant1',
        userId: 'user1',
      })
    ).rejects.toThrow('Rate limit exceeded');
  });

  it('should filter blocklist domains', async () => {
    process.env.WEBSEARCH_BLOCKLIST = 'blocked.com';
    resetWebSearchState();

    const mockResponse = {
      text: JSON.stringify([
        {
          title: 'Good Result',
          snippet: 'Good snippet',
          url: 'https://example.com/page',
        },
        {
          title: 'Blocked Result',
          snippet: 'Blocked snippet',
          url: 'https://blocked.com/page',
        },
      ]),
      toolCalls: [],
      toolInvocations: {},
      raw: {},
      tokensIn: 100,
      tokensOut: 50,
      model: 'gpt-4o-mini',
      latencyMs: 1000,
      costCents: 0.01,
    };

    (mockClient.chatWithTools as any).mockResolvedValue(mockResponse);

    const result = await webSearchWithOpenAI(mockClient, {
      query: 'test',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(result.results).toHaveLength(1);
    expect(result.results[0].url).toBe('https://example.com/page');
  });

  it('should filter by allowlist if set', async () => {
    process.env.WEBSEARCH_ALLOWLIST = 'allowed.com';
    resetWebSearchState();

    const mockResponse = {
      text: JSON.stringify([
        {
          title: 'Allowed Result',
          snippet: 'Allowed snippet',
          url: 'https://allowed.com/page',
        },
        {
          title: 'Other Result',
          snippet: 'Other snippet',
          url: 'https://other.com/page',
        },
      ]),
      toolCalls: [],
      toolInvocations: {},
      raw: {},
      tokensIn: 100,
      tokensOut: 50,
      model: 'gpt-4o-mini',
      latencyMs: 1000,
      costCents: 0.01,
    };

    (mockClient.chatWithTools as any).mockResolvedValue(mockResponse);

    const result = await webSearchWithOpenAI(mockClient, {
      query: 'test',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(result.results).toHaveLength(1);
    expect(result.results[0].url).toBe('https://allowed.com/page');
  });

  it('should deduplicate results', async () => {
    const mockResponse = {
      text: JSON.stringify([
        {
          title: 'Result 1',
          snippet: 'Snippet 1',
          url: 'https://example.com/page',
        },
        {
          title: 'Result 2',
          snippet: 'Snippet 2',
          url: 'https://example.com/page/', // Same URL with trailing slash
        },
      ]),
      toolCalls: [],
      toolInvocations: {},
      raw: {},
      tokensIn: 100,
      tokensOut: 50,
      model: 'gpt-4o-mini',
      latencyMs: 1000,
      costCents: 0.01,
    };

    (mockClient.chatWithTools as any).mockResolvedValue(mockResponse);

    const result = await webSearchWithOpenAI(mockClient, {
      query: 'test',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(result.results).toHaveLength(1);
  });

  it('should truncate to n results', async () => {
    const mockResponse = {
      text: JSON.stringify(
        Array.from({ length: 20 }, (_, i) => ({
          title: `Result ${i + 1}`,
          snippet: `Snippet ${i + 1}`,
          url: `https://example.com/${i + 1}`,
        }))
      ),
      toolCalls: [],
      toolInvocations: {},
      raw: {},
      tokensIn: 100,
      tokensOut: 50,
      model: 'gpt-4o-mini',
      latencyMs: 1000,
      costCents: 0.01,
    };

    (mockClient.chatWithTools as any).mockResolvedValue(mockResponse);

    const result = await webSearchWithOpenAI(mockClient, {
      query: 'test',
      n: 5,
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(result.results).toHaveLength(5);
  });

  it('should return empty results on error', async () => {
    (mockClient.chatWithTools as any).mockRejectedValue(new Error('API error'));

    const result = await webSearchWithOpenAI(mockClient, {
      query: 'test',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(result.results).toHaveLength(0);
    expect(result.query).toBe('test');
  });

  it('should normalize query before caching', async () => {
    const mockResponse = {
      text: JSON.stringify([{ title: 'Result', snippet: 'Snippet', url: 'https://example.com' }]),
      toolCalls: [],
      toolInvocations: {},
      raw: {},
      tokensIn: 100,
      tokensOut: 50,
      model: 'gpt-4o-mini',
      latencyMs: 1000,
      costCents: 0.01,
    };

    (mockClient.chatWithTools as any).mockResolvedValue(mockResponse);

    // First call with different formatting
    await webSearchWithOpenAI(mockClient, {
      query: '  TEST   QUERY  ',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    // Second call with normalized query should hit cache
    const result = await webSearchWithOpenAI(mockClient, {
      query: 'test query',
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(result.cached).toBe(true);
    expect(mockClient.chatWithTools).toHaveBeenCalledTimes(1);
  });
});

describe('buildOpenAIWebSearchToolSpec', () => {
  let mockClient: OpenAIClient;

  beforeEach(() => {
    process.env.OPENAI_WEB_SEARCH_ENABLED = 'true';
    resetWebSearchState();

    mockClient = {
      chatWithTools: vi.fn(),
    } as any;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return spec and handler', () => {
    const { spec, handler } = buildOpenAIWebSearchToolSpec(mockClient);

    expect(spec.type).toBe('function');
    expect(spec.function.name).toBe('web_search');
    expect(spec.function.parameters).toBeDefined();
    expect(handler).toBeInstanceOf(Function);
  });

  it('should invoke handler successfully', async () => {
    const mockResponse = {
      text: JSON.stringify([{ title: 'Result', snippet: 'Snippet', url: 'https://example.com' }]),
      toolCalls: [],
      toolInvocations: {},
      raw: {},
      tokensIn: 100,
      tokensOut: 50,
      model: 'gpt-4o-mini',
      latencyMs: 1000,
      costCents: 0.01,
    };

    (mockClient.chatWithTools as any).mockResolvedValue(mockResponse);

    const { handler } = buildOpenAIWebSearchToolSpec(mockClient);

    const result = await handler({
      query: 'test query',
      n: 5,
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(result.query).toBe('test query');
    expect(result.results).toHaveLength(1);
  });
});
