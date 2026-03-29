/**
 * Unit tests for Firebase Storage functions
 * Mocks Firebase Storage operations to test business logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadLogo, deleteLogo } from '../storage.js';

// Mock Firebase Storage
vi.mock('firebase/storage', () => {
  const mockGetStorage = vi.fn(() => ({}));
  const mockRef = vi.fn((storage, path) => ({ fullPath: path }));
  const mockUploadBytes = vi.fn();
  const mockGetDownloadURL = vi.fn();
  const mockDeleteObject = vi.fn();

  return {
    getStorage: mockGetStorage,
    ref: mockRef,
    uploadBytes: mockUploadBytes,
    getDownloadURL: mockGetDownloadURL,
    deleteObject: mockDeleteObject,
  };
});

// Mock Firebase app
vi.mock('../client.js', () => ({
  app: {},
}));

// Get mocked functions for assertions
const { ref, uploadBytes, getDownloadURL, deleteObject } = await import('firebase/storage');

describe('Firebase Storage Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadLogo', () => {
    it('should upload logo and return download URL', async () => {
      const mockFile = new File(['test content'], 'logo.png', { type: 'image/png' });
      const tenantId = 'test-tenant';
      const websiteId = 'website-123';
      const expectedUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/logos%2Ftest-tenant%2Fwebsite-123%2Flogo.png?alt=media';

      vi.mocked(uploadBytes).mockResolvedValue({
        ref: { fullPath: `logos/${tenantId}/${websiteId}/logo.png` },
      } as any);

      vi.mocked(getDownloadURL).mockResolvedValue(expectedUrl);

      const downloadURL = await uploadLogo(mockFile, tenantId, websiteId);

      expect(ref).toHaveBeenCalledWith(expect.anything(), `logos/${tenantId}/${websiteId}/logo.png`);
      expect(uploadBytes).toHaveBeenCalledWith(
        expect.objectContaining({ fullPath: `logos/${tenantId}/${websiteId}/logo.png` }),
        mockFile
      );
      expect(getDownloadURL).toHaveBeenCalled();
      expect(downloadURL).toBe(expectedUrl);
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['test content'], 'logo.jpg', { type: 'image/jpeg' });
      const tenantId = 'test-tenant';
      const websiteId = 'website-456';

      vi.mocked(uploadBytes).mockRejectedValue(new Error('Upload failed'));

      await expect(uploadLogo(mockFile, tenantId, websiteId)).rejects.toThrow('Upload failed');
    });

    it('should create correct storage path', async () => {
      const mockFile = new File(['test'], 'company-logo.svg', { type: 'image/svg+xml' });
      const tenantId = 'acme-corp';
      const websiteId = 'website-789';

      vi.mocked(uploadBytes).mockResolvedValue({
        ref: { fullPath: `logos/acme-corp/website-789/company-logo.svg` },
      } as any);
      vi.mocked(getDownloadURL).mockResolvedValue('https://example.com/logo.svg');

      await uploadLogo(mockFile, tenantId, websiteId);

      expect(ref).toHaveBeenCalledWith(
        expect.anything(),
        'logos/acme-corp/website-789/company-logo.svg'
      );
    });
  });

  describe('deleteLogo', () => {
    it('should delete logo from storage', async () => {
      const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/logos%2Ftest-tenant%2Fwebsite-123%2Flogo.png?alt=media&token=abc123';

      vi.mocked(deleteObject).mockResolvedValue(undefined);

      await deleteLogo(logoUrl);

      expect(ref).toHaveBeenCalledWith(expect.anything(), 'logos/test-tenant/website-123/logo.png');
      expect(deleteObject).toHaveBeenCalled();
    });

    it('should decode URL-encoded path correctly', async () => {
      const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/logos%2Facme-corp%2Fwebsite-456%2Flogo%20with%20spaces.png?alt=media';

      vi.mocked(deleteObject).mockResolvedValue(undefined);

      await deleteLogo(logoUrl);

      expect(ref).toHaveBeenCalledWith(
        expect.anything(),
        'logos/acme-corp/website-456/logo with spaces.png'
      );
    });

    it('should handle invalid URL format', async () => {
      const invalidUrl = 'https://example.com/invalid/url';

      await expect(deleteLogo(invalidUrl)).rejects.toThrow('Invalid logo URL format');
      expect(deleteObject).not.toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/logos%2Ftest%2Ffile.png?alt=media';

      vi.mocked(deleteObject).mockRejectedValue(new Error('File not found'));

      await expect(deleteLogo(logoUrl)).rejects.toThrow('File not found');
    });
  });
});
