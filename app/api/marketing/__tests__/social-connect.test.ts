/**
 * Unit tests for POST /api/marketing/social/connect
 * Tests the Ayrshare profile linking URL generation proxy route
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

describe('POST /api/marketing/social/connect', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should return 503 when Ayrshare API key is missing', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', '');

    const { POST } = await import('../social/connect/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/connect', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.error).toBe('config_error');
    expect(data.message).toBe('Ayrshare API key is not configured');
  });

  it('should return 502 when Ayrshare connect API returns a non-ok response', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Forbidden'),
    });

    const { POST } = await import('../social/connect/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/connect', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.error).toBe('api_error');
    expect(data.message).toBe('Failed to generate Ayrshare connect URL');
  });

  it('should return profileUrl from url field on success', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          url: 'https://app.ayrshare.com/connect/abc123',
        }),
    });

    const { POST } = await import('../social/connect/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/connect', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.profileUrl).toBe('https://app.ayrshare.com/connect/abc123');
  });

  it('should return profileUrl from profileUrl field when url is absent', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          profileUrl: 'https://app.ayrshare.com/profile/xyz789',
        }),
    });

    const { POST } = await import('../social/connect/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/connect', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.profileUrl).toBe('https://app.ayrshare.com/profile/xyz789');
  });

  it('should send correct authorization and domain to Ayrshare', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', 'my-connect-key');
    vi.stubEnv('NEXT_PUBLIC_APP_DOMAIN', 'myapp.com');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://ayrshare.com/link' }),
    });
    global.fetch = mockFetch;

    const { POST } = await import('../social/connect/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/connect', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await POST(req);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://app.ayrshare.com/api/profiles/generateJWT');
    expect(options.method).toBe('POST');
    expect(options.headers['Authorization']).toBe('Bearer my-connect-key');

    const sentBody = JSON.parse(options.body);
    expect(sentBody.domain).toBe('myapp.com');
  });

  it('should default domain to localhost when NEXT_PUBLIC_APP_DOMAIN is not set', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');
    vi.stubEnv('NEXT_PUBLIC_APP_DOMAIN', '');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://ayrshare.com/link' }),
    });
    global.fetch = mockFetch;

    const { POST } = await import('../social/connect/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/connect', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await POST(req);

    const sentBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(sentBody.domain).toBe('localhost');
  });

  it('should return 500 when an unexpected error occurs', async () => {
    vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

    global.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    const { POST } = await import('../social/connect/route.js');
    const req = new NextRequest('http://localhost/api/marketing/social/connect', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('internal_error');
    expect(data.message).toBe('ECONNREFUSED');
  });
});
