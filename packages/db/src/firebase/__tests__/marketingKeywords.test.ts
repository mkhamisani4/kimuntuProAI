/**
 * Unit tests for Firestore marketing keyword persistence functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveKeyword, listKeywords, deleteKeyword } from '../marketingKeywords.js';

vi.mock('../client.js', () => {
  return {
    db: {},
    Timestamp: {
      now: vi.fn(() => ({ toDate: () => new Date('2025-01-15T10:00:00Z') })),
      fromDate: vi.fn((date: Date) => ({ toDate: () => date })),
    },
    collection: vi.fn(),
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
  };
});

const { addDoc, getDocs, deleteDoc, doc, where, orderBy, limit } =
  await import('../client.js');

describe('Marketing Keywords CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveKeyword', () => {
    it('should save a keyword document and return ID', async () => {
      vi.mocked(addDoc).mockResolvedValue({ id: 'kw-123' } as any);

      const id = await saveKeyword({
        tenantId: 'test-tenant',
        userId: 'user-123',
        campaignId: 'campaign-1',
        keyword: 'digital marketing',
        volume: 12000,
        difficulty: 45,
        cpc: 2.5,
      });

      expect(id).toBe('kw-123');
      expect(addDoc).toHaveBeenCalledTimes(1);
      const [, data] = vi.mocked(addDoc).mock.calls[0];
      expect(data.keyword).toBe('digital marketing');
      expect(data.volume).toBe(12000);
      expect(data.difficulty).toBe(45);
      expect(data.cpc).toBe(2.5);
      expect(data.createdAt).toBeDefined();
    });

    it('should save keyword without campaignId', async () => {
      vi.mocked(addDoc).mockResolvedValue({ id: 'kw-456' } as any);

      const id = await saveKeyword({
        tenantId: 'test-tenant',
        userId: 'user-123',
        campaignId: null,
        keyword: 'seo tips',
        volume: 8500,
        difficulty: 30,
        cpc: 1.8,
      });

      expect(id).toBe('kw-456');
      const [, data] = vi.mocked(addDoc).mock.calls[0];
      expect(data.campaignId).toBeNull();
    });

    it('should propagate errors on save', async () => {
      vi.mocked(addDoc).mockRejectedValue(new Error('Quota exceeded'));
      await expect(
        saveKeyword({
          tenantId: 'test-tenant',
          userId: 'user-123',
          campaignId: null,
          keyword: 'fail keyword',
          volume: 100,
          difficulty: 10,
          cpc: 0.5,
        })
      ).rejects.toThrow('Quota exceeded');
    });
  });

  describe('listKeywords', () => {
    it('should list keywords for tenant/user', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          {
            id: 'kw-1',
            data: () => ({
              tenantId: 'test-tenant',
              userId: 'user-123',
              campaignId: null,
              keyword: 'content marketing',
              volume: 9000,
              difficulty: 40,
              cpc: 3.2,
              createdAt: { toDate: () => new Date() },
            }),
          },
          {
            id: 'kw-2',
            data: () => ({
              tenantId: 'test-tenant',
              userId: 'user-123',
              campaignId: 'campaign-1',
              keyword: 'social media strategy',
              volume: 6500,
              difficulty: 35,
              cpc: 2.1,
              createdAt: { toDate: () => new Date() },
            }),
          },
        ],
      } as any);

      const keywords = await listKeywords('test-tenant', 'user-123');
      expect(keywords).toHaveLength(2);
      expect(where).toHaveBeenCalledWith('tenantId', '==', 'test-tenant');
      expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('should filter by campaignId when provided', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          {
            id: 'kw-1',
            data: () => ({
              tenantId: 'test-tenant',
              userId: 'user-123',
              campaignId: 'campaign-1',
              keyword: 'email marketing',
              volume: 7500,
              difficulty: 38,
              cpc: 2.8,
              createdAt: { toDate: () => new Date() },
            }),
          },
        ],
      } as any);

      const keywords = await listKeywords('test-tenant', 'user-123', 'campaign-1');
      expect(keywords).toHaveLength(1);
      expect(where).toHaveBeenCalledWith('campaignId', '==', 'campaign-1');
    });

    it('should not add campaignId filter when not provided', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);

      await listKeywords('test-tenant', 'user-123');
      expect(where).not.toHaveBeenCalledWith('campaignId', '==', expect.anything());
    });

    it('should return empty array when no keywords', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
      const keywords = await listKeywords('test-tenant', 'user-123');
      expect(keywords).toHaveLength(0);
    });

    it('should respect custom limit', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
      await listKeywords('test-tenant', 'user-123', undefined, 25);
      expect(limit).toHaveBeenCalledWith(25);
    });
  });

  describe('deleteKeyword', () => {
    it('should delete keyword document', async () => {
      vi.mocked(deleteDoc).mockResolvedValue(undefined);
      await deleteKeyword('kw-123');
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'marketing_keywords', 'kw-123');
      expect(deleteDoc).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors', async () => {
      vi.mocked(deleteDoc).mockRejectedValue(new Error('Permission denied'));
      await expect(deleteKeyword('kw-456')).rejects.toThrow('Permission denied');
    });
  });
});
