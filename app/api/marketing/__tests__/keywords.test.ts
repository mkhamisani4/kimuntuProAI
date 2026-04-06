/**
 * Unit tests for POST /api/marketing/keywords
 * Tests the DataForSEO keyword suggestions proxy route
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

describe('POST /api/marketing/keywords', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should return 400 when keyword is missing', async () => {
    const { POST } = await import('../keywords/route.js');
    const req = new NextRequest('http://localhost/api/marketing/keywords', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('validation_failed');
    expect(data.message).toBe('keyword is required');
  });

  it('should return 400 when keyword is not a string', async () => {
    const { POST } = await import('../keywords/route.js');
    const req = new NextRequest('http://localhost/api/marketing/keywords', {
      method: 'POST',
      body: JSON.stringify({ keyword: 123 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('validation_failed');
  });

  it('should return 503 when DataForSEO credentials are missing', async () => {
    vi.stubEnv('DATAFORSEO_LOGIN', '');
    vi.stubEnv('DATAFORSEO_PASSWORD', '');

    const { POST } = await import('../keywords/route.js');
    const req = new NextRequest('http://localhost/api/marketing/keywords', {
      method: 'POST',
      body: JSON.stringify({ keyword: 'test' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.error).toBe('config_error');
    expect(data.message).toBe('DataForSEO credentials are not configured');
  });

  it('should return 502 when DataForSEO API returns a non-ok response', async () => {
    vi.stubEnv('DATAFORSEO_LOGIN', 'test-login');
    vi.stubEnv('DATAFORSEO_PASSWORD', 'test-pass');

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Unauthorized'),
    });

    const { POST } = await import('../keywords/route.js');
    const req = new NextRequest('http://localhost/api/marketing/keywords', {
      method: 'POST',
      body: JSON.stringify({ keyword: 'test' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.error).toBe('api_error');
    expect(data.message).toBe('DataForSEO API request failed');
  });

  it('should return mapped keywords on success', async () => {
    vi.stubEnv('DATAFORSEO_LOGIN', 'test-login');
    vi.stubEnv('DATAFORSEO_PASSWORD', 'test-pass');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          tasks: [
            {
              result: [
                {
                  items: [
                    {
                      keyword: 'test keyword',
                      keyword_info: { search_volume: 1000, cpc: 2.5 },
                      keyword_properties: { keyword_difficulty: 45 },
                    },
                    {
                      keyword: 'another keyword',
                      keyword_info: { search_volume: 500, cpc: 1.2 },
                      keyword_properties: { keyword_difficulty: 30 },
                    },
                  ],
                },
              ],
            },
          ],
        }),
    });

    const { POST } = await import('../keywords/route.js');
    const req = new NextRequest('http://localhost/api/marketing/keywords', {
      method: 'POST',
      body: JSON.stringify({ keyword: 'test' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.keywords).toHaveLength(2);
    expect(data.keywords[0]).toEqual({
      keyword: 'test keyword',
      search_volume: 1000,
      cpc: 2.5,
      keyword_difficulty: 45,
    });
    expect(data.keywords[1]).toEqual({
      keyword: 'another keyword',
      search_volume: 500,
      cpc: 1.2,
      keyword_difficulty: 30,
    });
  });

  it('should send correct authorization header and payload to DataForSEO', async () => {
    vi.stubEnv('DATAFORSEO_LOGIN', 'my-login');
    vi.stubEnv('DATAFORSEO_PASSWORD', 'my-pass');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tasks: [{ result: [{ items: [] }] }] }),
    });
    global.fetch = mockFetch;

    const { POST } = await import('../keywords/route.js');
    const req = new NextRequest('http://localhost/api/marketing/keywords', {
      method: 'POST',
      body: JSON.stringify({ keyword: 'seo tools', location: 'Canada' }),
    });

    await POST(req);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(
      'https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_suggestions/live'
    );
    expect(options.method).toBe('POST');

    const expectedCredentials = Buffer.from('my-login:my-pass').toString('base64');
    expect(options.headers['Authorization']).toBe(`Basic ${expectedCredentials}`);

    const sentBody = JSON.parse(options.body);
    expect(sentBody[0].keyword).toBe('seo tools');
    expect(sentBody[0].location_name).toBe('Canada');
    expect(sentBody[0].language_name).toBe('English');
    expect(sentBody[0].limit).toBe(20);
  });

  it('should default location to United States when not provided', async () => {
    vi.stubEnv('DATAFORSEO_LOGIN', 'test-login');
    vi.stubEnv('DATAFORSEO_PASSWORD', 'test-pass');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tasks: [{ result: [{ items: [] }] }] }),
    });
    global.fetch = mockFetch;

    const { POST } = await import('../keywords/route.js');
    const req = new NextRequest('http://localhost/api/marketing/keywords', {
      method: 'POST',
      body: JSON.stringify({ keyword: 'test' }),
    });

    await POST(req);

    const sentBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(sentBody[0].location_name).toBe('United States');
  });

  it('should handle empty items array gracefully', async () => {
    vi.stubEnv('DATAFORSEO_LOGIN', 'test-login');
    vi.stubEnv('DATAFORSEO_PASSWORD', 'test-pass');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ tasks: [{ result: [{ items: [] }] }] }),
    });

    const { POST } = await import('../keywords/route.js');
    const req = new NextRequest('http://localhost/api/marketing/keywords', {
      method: 'POST',
      body: JSON.stringify({ keyword: 'obscure query' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.keywords).toEqual([]);
  });

  it('should return 500 when an unexpected error occurs', async () => {
    vi.stubEnv('DATAFORSEO_LOGIN', 'test-login');
    vi.stubEnv('DATAFORSEO_PASSWORD', 'test-pass');

    global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

    const { POST } = await import('../keywords/route.js');
    const req = new NextRequest('http://localhost/api/marketing/keywords', {
      method: 'POST',
      body: JSON.stringify({ keyword: 'test' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('internal_error');
    expect(data.message).toBe('Network failure');
  });
});
