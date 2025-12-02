/**
 * Integration tests for Website Builder API routes
 * Tests API logic and request/response handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the database functions
vi.mock('@kimuntupro/db', () => ({
  createWebsite: vi.fn(),
  getWebsite: vi.fn(),
  updateWebsite: vi.fn(),
  listWebsites: vi.fn(),
  deleteWebsite: vi.fn(),
  deleteLogo: vi.fn(),
  uploadLogo: vi.fn(),
  getAssistantResult: vi.fn(),
  recordUsage: vi.fn(),
}));

// Mock quota middleware
vi.mock('@/lib/api/quotaMiddleware', () => ({
  withQuotaGuard: vi.fn((handler) => handler),
}));

describe('Website Builder API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/websites/generate', () => {
    it('should validate required fields', async () => {
      const { POST } = await import('../generate/route.js');
      const { createWebsite } = await import('@kimuntupro/db');

      const request = new NextRequest('http://localhost/api/websites/generate', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_failed');
      expect(createWebsite).not.toHaveBeenCalled();
    });

    it('should create website and return websiteId', async () => {
      const { POST } = await import('../generate/route.js');
      const { createWebsite, updateWebsite } = await import('@kimuntupro/db');

      vi.mocked(createWebsite).mockResolvedValue('website-123');
      vi.mocked(updateWebsite).mockResolvedValue(undefined);

      const requestBody = {
        tenantId: 'test-tenant',
        userId: 'user-123',
        businessPlanId: null,
        wizardInput: {
          companyName: 'Acme Inc',
          enabledSections: {
            features: true,
            services: true,
            about: true,
            testimonials: false,
            pricing: false,
            faq: false,
            contact: true,
          },
        },
      };

      const request = new NextRequest('http://localhost/api/websites/generate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.websiteId).toBe('website-123');
      expect(data.status).toBe('generating');

      expect(createWebsite).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'test-tenant',
          userId: 'user-123',
          status: 'draft',
        })
      );

      expect(updateWebsite).toHaveBeenCalledWith('website-123', { status: 'generating' });
    });

    it('should validate enabledSections is present', async () => {
      const { POST } = await import('../generate/route.js');

      const requestBody = {
        tenantId: 'test-tenant',
        userId: 'user-123',
        wizardInput: {
          companyName: 'Test Co',
          // Missing enabledSections
        },
      };

      const request = new NextRequest('http://localhost/api/websites/generate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_failed');
      expect(data.message).toContain('enabledSections');
    });
  });

  describe('GET /api/websites/[id]', () => {
    it('should return website when found', async () => {
      const { GET } = await import('../[id]/route.js');
      const { getWebsite } = await import('@kimuntupro/db');

      const mockWebsite = {
        id: 'website-123',
        tenantId: 'test-tenant',
        userId: 'user-123',
        title: 'Acme Inc Website',
        status: 'ready',
        siteCode: '<html>...</html>',
      };

      vi.mocked(getWebsite).mockResolvedValue(mockWebsite as any);

      const request = new NextRequest('http://localhost/api/websites/website-123');
      const response = await GET(request, { params: { id: 'website-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.website.id).toBe('website-123');
      expect(getWebsite).toHaveBeenCalledWith('website-123');
    });

    it('should return 404 when website not found', async () => {
      const { GET } = await import('../[id]/route.js');
      const { getWebsite } = await import('@kimuntupro/db');

      vi.mocked(getWebsite).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/websites/nonexistent');
      const response = await GET(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('not_found');
    });
  });

  describe('DELETE /api/websites/[id]', () => {
    it('should delete website and logo', async () => {
      const { DELETE } = await import('../[id]/route.js');
      const { getWebsite, deleteWebsite, deleteLogo } = await import('@kimuntupro/db');

      const mockWebsite = {
        id: 'website-123',
        wizardInput: {
          logoUrl: 'https://storage.example.com/logo.png',
        },
      };

      vi.mocked(getWebsite).mockResolvedValue(mockWebsite as any);
      vi.mocked(deleteLogo).mockResolvedValue(undefined);
      vi.mocked(deleteWebsite).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/websites/website-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { id: 'website-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(deleteLogo).toHaveBeenCalledWith('https://storage.example.com/logo.png');
      expect(deleteWebsite).toHaveBeenCalledWith('website-123');
    });

    it('should delete website even if logo deletion fails', async () => {
      const { DELETE } = await import('../[id]/route.js');
      const { getWebsite, deleteWebsite, deleteLogo } = await import('@kimuntupro/db');

      const mockWebsite = {
        id: 'website-456',
        wizardInput: {
          logoUrl: 'https://storage.example.com/logo.png',
        },
      };

      vi.mocked(getWebsite).mockResolvedValue(mockWebsite as any);
      vi.mocked(deleteLogo).mockRejectedValue(new Error('Logo not found'));
      vi.mocked(deleteWebsite).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/websites/website-456', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { id: 'website-456' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(deleteWebsite).toHaveBeenCalledWith('website-456');
    });

    it('should return 404 when website not found', async () => {
      const { DELETE } = await import('../[id]/route.js');
      const { getWebsite } = await import('@kimuntupro/db');

      vi.mocked(getWebsite).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/websites/nonexistent', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('not_found');
    });
  });

  describe('GET /api/websites', () => {
    it('should list websites for tenant', async () => {
      const { GET } = await import('../route.js');
      const { listWebsites } = await import('@kimuntupro/db');

      const mockWebsites = [
        { id: 'website-1', title: 'Website 1', status: 'ready' },
        { id: 'website-2', title: 'Website 2', status: 'generating' },
      ];

      vi.mocked(listWebsites).mockResolvedValue(mockWebsites as any);

      const request = new NextRequest(
        'http://localhost/api/websites?tenantId=test-tenant&limit=20'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.websites).toHaveLength(2);
      expect(listWebsites).toHaveBeenCalledWith('test-tenant', undefined, 20);
    });

    it('should filter by userId when provided', async () => {
      const { GET } = await import('../route.js');
      const { listWebsites } = await import('@kimuntupro/db');

      vi.mocked(listWebsites).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost/api/websites?tenantId=test-tenant&userId=user-123'
      );
      await GET(request);

      expect(listWebsites).toHaveBeenCalledWith('test-tenant', 'user-123', 20);
    });

    it('should validate tenantId is required', async () => {
      const { GET } = await import('../route.js');

      const request = new NextRequest('http://localhost/api/websites');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_failed');
      expect(data.message).toContain('tenantId');
    });

    it('should validate limit is within bounds', async () => {
      const { GET } = await import('../route.js');

      const request = new NextRequest('http://localhost/api/websites?tenantId=test&limit=200');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_failed');
      expect(data.message).toContain('limit');
    });
  });

  describe('POST /api/websites/upload-logo', () => {
    it('should validate required fields', async () => {
      const { POST } = await import('../upload-logo/route.js');

      const formData = new FormData();
      // Missing file, tenantId, websiteId

      const request = new NextRequest('http://localhost/api/websites/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_failed');
    });

    it('should validate file type', async () => {
      const { POST } = await import('../upload-logo/route.js');

      const formData = new FormData();
      const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      formData.append('file', invalidFile);
      formData.append('tenantId', 'test-tenant');
      formData.append('websiteId', 'website-123');

      const request = new NextRequest('http://localhost/api/websites/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_failed');
      expect(data.message).toContain('Invalid file type');
    });

    it('should validate file size', async () => {
      const { POST } = await import('../upload-logo/route.js');

      const formData = new FormData();
      // Create a file larger than 5MB
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const largeFile = new File([largeContent], 'large.png', { type: 'image/png' });
      formData.append('file', largeFile);
      formData.append('tenantId', 'test-tenant');
      formData.append('websiteId', 'website-123');

      const request = new NextRequest('http://localhost/api/websites/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_failed');
      expect(data.message).toContain('File too large');
    });

    it('should upload valid image and return URL', async () => {
      const { POST } = await import('../upload-logo/route.js');
      const { uploadLogo } = await import('@kimuntupro/db');

      const expectedUrl = 'https://storage.example.com/logos/test-tenant/website-123/logo.png';
      vi.mocked(uploadLogo).mockResolvedValue(expectedUrl);

      const formData = new FormData();
      const validFile = new File(['content'], 'logo.png', { type: 'image/png' });
      formData.append('file', validFile);
      formData.append('tenantId', 'test-tenant');
      formData.append('websiteId', 'website-123');

      const request = new NextRequest('http://localhost/api/websites/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.logoUrl).toBe(expectedUrl);
      expect(uploadLogo).toHaveBeenCalledWith(validFile, 'test-tenant', 'website-123');
    });
  });
});
