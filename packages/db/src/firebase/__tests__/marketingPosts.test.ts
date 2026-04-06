/**
 * Unit tests for Firestore marketing post persistence functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPost, getPost, listPosts, updatePost, deletePost } from '../marketingPosts.js';

vi.mock('../client.js', () => {
  return {
    db: {},
    Timestamp: {
      now: vi.fn(() => ({ toDate: () => new Date('2025-01-15T10:00:00Z') })),
      fromDate: vi.fn((date: Date) => ({ toDate: () => date })),
    },
    collection: vi.fn(),
    addDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
  };
});

const { addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, where, orderBy, limit, Timestamp } =
  await import('../client.js');

describe('Marketing Posts CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a post document and return ID', async () => {
      vi.mocked(addDoc).mockResolvedValue({ id: 'post-123' } as any);

      const id = await createPost({
        tenantId: 'test-tenant',
        userId: 'user-123',
        campaignId: 'campaign-1',
        ayrshareId: null,
        content: 'Check out our summer deals!',
        mediaUrl: null,
        platforms: ['twitter', 'facebook'],
        scheduledAt: null,
        status: 'draft',
        metrics: null,
      });

      expect(id).toBe('post-123');
      expect(addDoc).toHaveBeenCalledTimes(1);
      const [, data] = vi.mocked(addDoc).mock.calls[0];
      expect(data.content).toBe('Check out our summer deals!');
      expect(data.platforms).toEqual(['twitter', 'facebook']);
      expect(data.status).toBe('draft');
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });

    it('should convert scheduledAt Date to Firestore Timestamp', async () => {
      vi.mocked(addDoc).mockResolvedValue({ id: 'post-456' } as any);
      const scheduledDate = new Date('2025-02-01T14:00:00Z');

      await createPost({
        tenantId: 'test-tenant',
        userId: 'user-123',
        campaignId: null,
        ayrshareId: null,
        content: 'Scheduled post',
        mediaUrl: null,
        platforms: ['instagram'],
        scheduledAt: scheduledDate,
        status: 'scheduled',
        metrics: null,
      });

      expect(Timestamp.fromDate).toHaveBeenCalledWith(scheduledDate);
    });
  });

  describe('getPost', () => {
    it('should return post when found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'post-123',
        data: () => ({
          tenantId: 'test-tenant',
          userId: 'user-123',
          campaignId: 'campaign-1',
          ayrshareId: null,
          content: 'Great post!',
          mediaUrl: null,
          platforms: ['twitter'],
          scheduledAt: { toDate: () => new Date('2025-02-01T14:00:00Z') },
          status: 'scheduled',
          metrics: null,
          createdAt: { toDate: () => new Date('2025-01-15T10:00:00Z') },
          updatedAt: { toDate: () => new Date('2025-01-15T10:00:00Z') },
        }),
      } as any);

      const post = await getPost('post-123');
      expect(post).not.toBeNull();
      expect(post?.id).toBe('post-123');
      expect(post?.content).toBe('Great post!');
      expect(post?.scheduledAt).toBeInstanceOf(Date);
      expect(post?.createdAt).toBeInstanceOf(Date);
    });

    it('should return null when not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
      const post = await getPost('nonexistent');
      expect(post).toBeNull();
    });

    it('should handle null scheduledAt', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'post-789',
        data: () => ({
          tenantId: 'test-tenant',
          userId: 'user-123',
          campaignId: null,
          ayrshareId: null,
          content: 'Draft post',
          mediaUrl: null,
          platforms: ['facebook'],
          scheduledAt: null,
          status: 'draft',
          metrics: null,
          createdAt: { toDate: () => new Date('2025-01-15T10:00:00Z') },
          updatedAt: { toDate: () => new Date('2025-01-15T10:00:00Z') },
        }),
      } as any);

      const post = await getPost('post-789');
      expect(post).not.toBeNull();
      expect(post?.scheduledAt).toBeNull();
    });
  });

  describe('listPosts', () => {
    it('should list posts for tenant/user', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          {
            id: 'p1',
            data: () => ({
              tenantId: 'test-tenant',
              userId: 'user-123',
              campaignId: null,
              content: 'Post 1',
              platforms: ['twitter'],
              scheduledAt: null,
              status: 'draft',
              metrics: null,
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
            }),
          },
          {
            id: 'p2',
            data: () => ({
              tenantId: 'test-tenant',
              userId: 'user-123',
              campaignId: 'campaign-1',
              content: 'Post 2',
              platforms: ['facebook'],
              scheduledAt: { toDate: () => new Date('2025-03-01T12:00:00Z') },
              status: 'scheduled',
              metrics: null,
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
            }),
          },
        ],
      } as any);

      const posts = await listPosts('test-tenant', 'user-123');
      expect(posts).toHaveLength(2);
      expect(where).toHaveBeenCalledWith('tenantId', '==', 'test-tenant');
      expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('should filter by campaignId when provided', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          {
            id: 'p1',
            data: () => ({
              tenantId: 'test-tenant',
              userId: 'user-123',
              campaignId: 'campaign-1',
              content: 'Campaign post',
              platforms: ['twitter'],
              scheduledAt: null,
              status: 'draft',
              metrics: null,
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
            }),
          },
        ],
      } as any);

      const posts = await listPosts('test-tenant', 'user-123', 'campaign-1');
      expect(posts).toHaveLength(1);
      expect(where).toHaveBeenCalledWith('campaignId', '==', 'campaign-1');
    });

    it('should not add campaignId filter when not provided', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);

      await listPosts('test-tenant', 'user-123');
      expect(where).not.toHaveBeenCalledWith('campaignId', '==', expect.anything());
    });

    it('should return empty array when no posts', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
      const posts = await listPosts('test-tenant', 'user-123');
      expect(posts).toHaveLength(0);
    });
  });

  describe('updatePost', () => {
    it('should update post fields', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      await updatePost('post-123', { status: 'posted' });
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'marketing_posts', 'post-123');
      expect(updateDoc).toHaveBeenCalledTimes(1);
      const [, updates] = vi.mocked(updateDoc).mock.calls[0];
      expect(updates.status).toBe('posted');
      expect(updates.updatedAt).toBeDefined();
    });

    it('should convert scheduledAt Date to Timestamp on update', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      const scheduledDate = new Date('2025-03-15T09:00:00Z');

      await updatePost('post-123', { scheduledAt: scheduledDate });
      expect(Timestamp.fromDate).toHaveBeenCalledWith(scheduledDate);
    });
  });

  describe('deletePost', () => {
    it('should delete post document', async () => {
      vi.mocked(deleteDoc).mockResolvedValue(undefined);
      await deletePost('post-123');
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'marketing_posts', 'post-123');
      expect(deleteDoc).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors', async () => {
      vi.mocked(deleteDoc).mockRejectedValue(new Error('Permission denied'));
      await expect(deletePost('post-456')).rejects.toThrow('Permission denied');
    });
  });
});
