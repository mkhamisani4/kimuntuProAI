/**
 * Unit tests for POST /api/marketing/social/analytics
 * Tests the Ayrshare post analytics proxy route
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

describe('POST /api/marketing/social/analytics', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should return 400 when ayrshareId is missing', async () => {
    const { POST } = await import('../social/analytics/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/analytics', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('validation_failed');
    expect(data.message).toBe('ayrshareId is required');
  });

  it('should return 400 when ayrshareId is not a string', async () => {
    const { POST } = await import('../social/analytics/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/analytics', {
      method: 'POST',
      body: JSON.stringify({ ayrshareId: 123 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('validation_failed');
  });

  it('should return 503 when Ayrshare API key is missing', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', '');

    const { POST } = await import('../social/analytics/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/analytics', {
      method: 'POST',
      body: JSON.stringify({ ayrshareId: 'post-abc-123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.error).toBe('config_error');
    expect(data.message).toBe('Ayrshare API key is not configured');
  });

  it('should return 502 when Ayrshare analytics API returns a non-ok response', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Internal server error'),
    });

    const { POST } = await import('../social/analytics/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/analytics', {
      method: 'POST',
      body: JSON.stringify({ ayrshareId: 'post-abc-123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.error).toBe('api_error');
    expect(data.message).toBe('Ayrshare analytics request failed');
  });

  it('should return metrics with impressions and clicks on success', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          analytics: {
            impressions: 5000,
            clicks: 320,
          },
        }),
    });

    const { POST } = await import('../social/analytics/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/analytics', {
      method: 'POST',
      body: JSON.stringify({ ayrshareId: 'post-abc-123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.metrics).toEqual({ views: 5000, clicks: 320 });
  });

  it('should fall back to views field when impressions is not present', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          analytics: {
            views: 2500,
            engagements: 150,
          },
        }),
    });

    const { POST } = await import('../social/analytics/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/analytics', {
      method: 'POST',
      body: JSON.stringify({ ayrshareId: 'post-abc-123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.metrics).toEqual({ views: 2500, clicks: 150 });
  });

  it('should default to 0 when analytics fields are missing', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ analytics: {} }),
    });

    const { POST } = await import('../social/analytics/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/analytics', {
      method: 'POST',
      body: JSON.stringify({ ayrshareId: 'post-abc-123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.metrics).toEqual({ views: 0, clicks: 0 });
  });

  it('should send correct payload and authorization to Ayrshare', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', 'my-analytics-key');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ analytics: { impressions: 100, clicks: 10 } }),
    });
    global.fetch = mockFetch;

    const { POST } = await import('../social/analytics/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/analytics', {
      method: 'POST',
      body: JSON.stringify({ ayrshareId: 'post-xyz-789' }),
    });

    await POST(req);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://app.ayrshare.com/api/analytics/post');
    expect(options.method).toBe('POST');
    expect(options.headers['Authorization']).toBe('Bearer my-analytics-key');

    const sentBody = JSON.parse(options.body);
    expect(sentBody.id).toBe('post-xyz-789');
  });

  it('should return 500 when an unexpected error occurs', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

    global.fetch = vi.fn().mockRejectedValue(new Error('Socket hang up'));

    const { POST } = await import('../social/analytics/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/analytics', {
      method: 'POST',
      body: JSON.stringify({ ayrshareId: 'post-abc-123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('internal_error');
    expect(data.message).toBe('Socket hang up');
  });
});
