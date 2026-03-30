/**
 * Unit tests for POST /api/marketing/audit
 * Tests the Google PageSpeed Insights proxy route
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

describe('POST /api/marketing/audit', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should return 400 when url is missing', async () => {
    const { POST } = await import('../audit/route.js');
    const req = new NextRequest('http://localhost/api/marketing/audit', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('validation_failed');
    expect(data.message).toBe('url is required');
  });

  it('should return 400 when url is not a string', async () => {
    const { POST } = await import('../audit/route.js');
    const req = new NextRequest('http://localhost/api/marketing/audit', {
      method: 'POST',
      body: JSON.stringify({ url: 12345 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('validation_failed');
  });

  it('should return 400 when url format is invalid', async () => {
    const { POST } = await import('../audit/route.js');
    const req = new NextRequest('http://localhost/api/marketing/audit', {
      method: 'POST',
      body: JSON.stringify({ url: 'not-a-valid-url' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('validation_failed');
    expect(data.message).toBe('Invalid URL format');
  });

  it('should return 502 when PageSpeed API returns a non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Service unavailable'),
    });

    const { POST } = await import('../audit/route.js');
    const req = new NextRequest('http://localhost/api/marketing/audit', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.error).toBe('api_error');
    expect(data.message).toBe('PageSpeed API request failed');
  });

  it('should return score and mapped audits on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          lighthouseResult: {
            categories: {
              seo: {
                score: 0.92,
                auditRefs: [
                  { id: 'meta-description' },
                  { id: 'document-title' },
                ],
              },
            },
            audits: {
              'meta-description': {
                id: 'meta-description',
                title: 'Document has a meta description',
                description: 'Meta descriptions improve SEO.',
                score: 1,
                displayValue: null,
                scoreDisplayMode: 'binary',
              },
              'document-title': {
                id: 'document-title',
                title: 'Document has a title element',
                description: 'The title element improves SEO.',
                score: 1,
                displayValue: 'My Page Title',
                scoreDisplayMode: 'binary',
              },
            },
          },
        }),
    });

    const { POST } = await import('../audit/route.js');
    const req = new NextRequest('http://localhost/api/marketing/audit', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.score).toBe(92);
    expect(data.audits).toHaveLength(2);
    expect(data.audits[0]).toEqual({
      id: 'meta-description',
      title: 'Document has a meta description',
      description: 'Meta descriptions improve SEO.',
      score: 1,
      displayValue: null,
      scoreDisplayMode: 'binary',
    });
    expect(data.audits[1]).toEqual({
      id: 'document-title',
      title: 'Document has a title element',
      description: 'The title element improves SEO.',
      score: 1,
      displayValue: 'My Page Title',
      scoreDisplayMode: 'binary',
    });
  });

  it('should include the API key in the request URL when configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_PAGESPEED_API_KEY', 'test-api-key-123');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          lighthouseResult: {
            categories: { seo: { score: 0.85, auditRefs: [] } },
            audits: {},
          },
        }),
    });
    global.fetch = mockFetch;

    const { POST } = await import('../audit/route.js');
    const req = new NextRequest('http://localhost/api/marketing/audit', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    await POST(req);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('key=test-api-key-123');
    expect(calledUrl).toContain('category=seo');
    expect(calledUrl).toContain(encodeURIComponent('https://example.com'));
  });

  it('should work without an API key configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_PAGESPEED_API_KEY', '');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          lighthouseResult: {
            categories: { seo: { score: 0.7, auditRefs: [] } },
            audits: {},
          },
        }),
    });
    global.fetch = mockFetch;

    const { POST } = await import('../audit/route.js');
    const req = new NextRequest('http://localhost/api/marketing/audit', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.score).toBe(70);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain('key=');
  });

  it('should filter out null audits when auditRef id does not exist', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          lighthouseResult: {
            categories: {
              seo: {
                score: 0.5,
                auditRefs: [
                  { id: 'existing-audit' },
                  { id: 'nonexistent-audit' },
                ],
              },
            },
            audits: {
              'existing-audit': {
                id: 'existing-audit',
                title: 'Existing Audit',
                description: 'This audit exists.',
                score: 1,
                scoreDisplayMode: 'binary',
              },
              // 'nonexistent-audit' is not present
            },
          },
        }),
    });

    const { POST } = await import('../audit/route.js');
    const req = new NextRequest('http://localhost/api/marketing/audit', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.audits).toHaveLength(1);
    expect(data.audits[0].id).toBe('existing-audit');
  });

  it('should return 500 when an unexpected error occurs', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    const { POST } = await import('../audit/route.js');
    const req = new NextRequest('http://localhost/api/marketing/audit', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('internal_error');
    expect(data.message).toBe('Connection refused');
  });
});
