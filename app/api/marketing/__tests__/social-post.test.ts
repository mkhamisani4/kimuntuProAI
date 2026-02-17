/**
 * Unit tests for POST/DELETE /api/marketing/social/post
 * Tests the Ayrshare social post scheduling and deletion proxy route
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

describe('/api/marketing/social/post', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  /* ------------------------------------------------------------------ */
  /*  POST handler tests                                                */
  /* ------------------------------------------------------------------ */
  describe('POST', () => {
    it('should return 400 when post content is missing', async () => {
      const { POST } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'POST',
        body: JSON.stringify({ platforms: ['twitter'] }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('validation_failed');
      expect(data.message).toBe('post content is required');
    });

    it('should return 400 when post is not a string', async () => {
      const { POST } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'POST',
        body: JSON.stringify({ post: 42, platforms: ['twitter'] }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('validation_failed');
    });

    it('should return 400 when platforms is missing', async () => {
      const { POST } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'POST',
        body: JSON.stringify({ post: 'Hello world!' }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('validation_failed');
      expect(data.message).toBe('platforms array is required');
    });

    it('should return 400 when platforms is an empty array', async () => {
      const { POST } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'POST',
        body: JSON.stringify({ post: 'Hello world!', platforms: [] }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('validation_failed');
      expect(data.message).toBe('platforms array is required');
    });

    it('should return 503 when Ayrshare API key is missing', async () => {
      vi.stubEnv('AYRSHARE_API_KEY', '');

      const { POST } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'POST',
        body: JSON.stringify({ post: 'Hello world!', platforms: ['twitter'] }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.error).toBe('config_error');
      expect(data.message).toBe('Ayrshare API key is not configured');
    });

    it('should return 502 when Ayrshare API returns a non-ok response', async () => {
      vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Bad request'),
      });

      const { POST } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'POST',
        body: JSON.stringify({ post: 'Hello world!', platforms: ['twitter'] }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(502);
      expect(data.error).toBe('api_error');
      expect(data.message).toBe('Ayrshare post request failed');
    });

    it('should return Ayrshare data on success', async () => {
      vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

      const ayrshareResponse = {
        id: 'post-abc-123',
        status: 'success',
        postIds: [{ platform: 'twitter', id: 'tw-456' }],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(ayrshareResponse),
      });

      const { POST } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'POST',
        body: JSON.stringify({ post: 'Hello world!', platforms: ['twitter'] }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(ayrshareResponse);
    });

    it('should forward mediaUrls and scheduleDate when provided', async () => {
      vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'post-123' }),
      });
      global.fetch = mockFetch;

      const { POST } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'POST',
        body: JSON.stringify({
          post: 'Scheduled post with media',
          platforms: ['twitter', 'facebook'],
          mediaUrls: ['https://example.com/image.png'],
          scheduleDate: '2026-03-01T12:00:00Z',
        }),
      });

      await POST(req);

      const sentBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(sentBody.post).toBe('Scheduled post with media');
      expect(sentBody.platforms).toEqual(['twitter', 'facebook']);
      expect(sentBody.mediaUrls).toEqual(['https://example.com/image.png']);
      expect(sentBody.scheduleDate).toBe('2026-03-01T12:00:00Z');
    });

    it('should not include mediaUrls when the array is empty', async () => {
      vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'post-123' }),
      });
      global.fetch = mockFetch;

      const { POST } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'POST',
        body: JSON.stringify({
          post: 'No media post',
          platforms: ['twitter'],
          mediaUrls: [],
        }),
      });

      await POST(req);

      const sentBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(sentBody.mediaUrls).toBeUndefined();
    });

    it('should send correct authorization header to Ayrshare', async () => {
      vi.stubEnv('AYRSHARE_API_KEY', 'my-secret-key');

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'post-123' }),
      });
      global.fetch = mockFetch;

      const { POST } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'POST',
        body: JSON.stringify({ post: 'Test', platforms: ['twitter'] }),
      });

      await POST(req);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://app.ayrshare.com/api/post');
      expect(options.headers['Authorization']).toBe('Bearer my-secret-key');
    });

    it('should return 500 when an unexpected error occurs', async () => {
      vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

      global.fetch = vi.fn().mockRejectedValue(new Error('Timeout'));

      const { POST } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'POST',
        body: JSON.stringify({ post: 'Test', platforms: ['twitter'] }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe('internal_error');
      expect(data.message).toBe('Timeout');
    });
  });

  /* ------------------------------------------------------------------ */
  /*  DELETE handler tests                                              */
  /* ------------------------------------------------------------------ */
  describe('DELETE', () => {
    it('should return 400 when ayrshareId is missing', async () => {
      const { DELETE } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'DELETE',
        body: JSON.stringify({}),
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('validation_failed');
      expect(data.message).toBe('ayrshareId is required');
    });

    it('should return 400 when ayrshareId is not a string', async () => {
      const { DELETE } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'DELETE',
        body: JSON.stringify({ ayrshareId: 999 }),
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('validation_failed');
    });

    it('should return 503 when Ayrshare API key is missing', async () => {
      vi.stubEnv('AYRSHARE_API_KEY', '');

      const { DELETE } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'DELETE',
        body: JSON.stringify({ ayrshareId: 'post-abc-123' }),
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.error).toBe('config_error');
    });

    it('should return 502 when Ayrshare delete API returns a non-ok response', async () => {
      vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Not found'),
      });

      const { DELETE } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'DELETE',
        body: JSON.stringify({ ayrshareId: 'post-abc-123' }),
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(502);
      expect(data.error).toBe('api_error');
      expect(data.message).toBe('Ayrshare delete request failed');
    });

    it('should return Ayrshare data on successful deletion', async () => {
      vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

      const deleteResponse = { id: 'post-abc-123', status: 'deleted' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(deleteResponse),
      });

      const { DELETE } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'DELETE',
        body: JSON.stringify({ ayrshareId: 'post-abc-123' }),
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(deleteResponse);
    });

    it('should send correct payload to Ayrshare delete endpoint', async () => {
      vi.stubEnv('AYRSHARE_API_KEY', 'my-key');

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'deleted' }),
      });
      global.fetch = mockFetch;

      const { DELETE } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'DELETE',
        body: JSON.stringify({ ayrshareId: 'post-xyz-789' }),
      });

      await DELETE(req);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://app.ayrshare.com/api/post');
      expect(options.method).toBe('DELETE');
      expect(options.headers['Authorization']).toBe('Bearer my-key');

      const sentBody = JSON.parse(options.body);
      expect(sentBody.id).toBe('post-xyz-789');
    });

    it('should return 500 when an unexpected error occurs', async () => {
      vi.stubEnv('AYRSHARE_API_KEY', 'test-api-key');

      global.fetch = vi.fn().mockRejectedValue(new Error('DNS lookup failed'));

      const { DELETE } = await import('../social/post/route.js');
      const req = new NextRequest('http://localhost/api/marketing/social/post', {
        method: 'DELETE',
        body: JSON.stringify({ ayrshareId: 'post-abc-123' }),
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe('internal_error');
      expect(data.message).toBe('DNS lookup failed');
    });
  });
});
