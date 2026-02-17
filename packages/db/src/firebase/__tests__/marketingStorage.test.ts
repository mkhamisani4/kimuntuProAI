/**
 * Unit tests for Firebase Storage marketing media functions
 * Mocks Firebase Storage operations to test business logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadPostMedia, deletePostMedia } from '../marketingStorage.js';

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

describe('Marketing Storage Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadPostMedia', () => {
    it('should upload media and return download URL', async () => {
      const mockFile = new File(['image content'], 'banner.png', { type: 'image/png' });
      const tenantId = 'test-tenant';
      const postId = 'post-123';
      const expectedUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/marketing%2Ftest-tenant%2Fposts%2Fpost-123%2Fbanner.png?alt=media';

      vi.mocked(uploadBytes).mockResolvedValue({
        ref: { fullPath: `marketing/${tenantId}/posts/${postId}/banner.png` },
      } as any);

      vi.mocked(getDownloadURL).mockResolvedValue(expectedUrl);

      const downloadURL = await uploadPostMedia(mockFile, tenantId, postId);

      expect(ref).toHaveBeenCalledWith(expect.anything(), `marketing/${tenantId}/posts/${postId}/banner.png`);
      expect(uploadBytes).toHaveBeenCalledWith(
        expect.objectContaining({ fullPath: `marketing/${tenantId}/posts/${postId}/banner.png` }),
        mockFile
      );
      expect(getDownloadURL).toHaveBeenCalled();
      expect(downloadURL).toBe(expectedUrl);
    });

    it('should create correct storage path format', async () => {
      const mockFile = new File(['data'], 'promo-video.mp4', { type: 'video/mp4' });
      const tenantId = 'acme-corp';
      const postId = 'post-789';

      vi.mocked(uploadBytes).mockResolvedValue({
        ref: { fullPath: `marketing/acme-corp/posts/post-789/promo-video.mp4` },
      } as any);
      vi.mocked(getDownloadURL).mockResolvedValue('https://example.com/video.mp4');

      await uploadPostMedia(mockFile, tenantId, postId);

      expect(ref).toHaveBeenCalledWith(
        expect.anything(),
        'marketing/acme-corp/posts/post-789/promo-video.mp4'
      );
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

      vi.mocked(uploadBytes).mockRejectedValue(new Error('Upload failed'));

      await expect(uploadPostMedia(mockFile, 'test-tenant', 'post-123')).rejects.toThrow('Upload failed');
    });
  });

  describe('deletePostMedia', () => {
    it('should delete media from storage', async () => {
      const mediaUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/marketing%2Ftest-tenant%2Fposts%2Fpost-123%2Fbanner.png?alt=media&token=abc123';

      vi.mocked(deleteObject).mockResolvedValue(undefined);

      await deletePostMedia(mediaUrl);

      expect(ref).toHaveBeenCalledWith(expect.anything(), 'marketing/test-tenant/posts/post-123/banner.png');
      expect(deleteObject).toHaveBeenCalled();
    });

    it('should decode URL-encoded path correctly', async () => {
      const mediaUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/marketing%2Facme-corp%2Fposts%2Fpost-456%2Fphoto%20with%20spaces.png?alt=media';

      vi.mocked(deleteObject).mockResolvedValue(undefined);

      await deletePostMedia(mediaUrl);

      expect(ref).toHaveBeenCalledWith(
        expect.anything(),
        'marketing/acme-corp/posts/post-456/photo with spaces.png'
      );
    });

    it('should handle invalid URL format', async () => {
      const invalidUrl = 'https://example.com/invalid/url';

      await expect(deletePostMedia(invalidUrl)).rejects.toThrow('Invalid media URL format');
      expect(deleteObject).not.toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      const mediaUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/marketing%2Ftest%2Fposts%2Fp1%2Ffile.png?alt=media';

      vi.mocked(deleteObject).mockRejectedValue(new Error('File not found'));

      await expect(deletePostMedia(mediaUrl)).rejects.toThrow('File not found');
    });
  });
});
