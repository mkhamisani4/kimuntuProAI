/**
 * Unit tests for Firestore marketing campaign persistence functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCampaign, getCampaign, listCampaigns, updateCampaign, deleteCampaign } from '../marketingCampaigns.js';

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

const { addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, where, orderBy, limit } =
  await import('../client.js');

describe('Marketing Campaigns CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCampaign', () => {
    it('should create a campaign document and return ID', async () => {
      vi.mocked(addDoc).mockResolvedValue({ id: 'campaign-123' } as any);

      const id = await createCampaign({
        tenantId: 'test-tenant',
        userId: 'user-123',
        title: 'Summer Sale',
        description: 'Summer promotion',
        status: 'active',
      });

      expect(id).toBe('campaign-123');
      expect(addDoc).toHaveBeenCalledTimes(1);
      const [, data] = vi.mocked(addDoc).mock.calls[0];
      expect(data.title).toBe('Summer Sale');
      expect(data.status).toBe('active');
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });
  });

  describe('getCampaign', () => {
    it('should return campaign when found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'campaign-123',
        data: () => ({
          tenantId: 'test-tenant',
          userId: 'user-123',
          title: 'Summer Sale',
          description: 'Summer promo',
          status: 'active',
          createdAt: { toDate: () => new Date('2025-01-15T10:00:00Z') },
          updatedAt: { toDate: () => new Date('2025-01-15T10:00:00Z') },
        }),
      } as any);

      const campaign = await getCampaign('campaign-123');
      expect(campaign).not.toBeNull();
      expect(campaign?.id).toBe('campaign-123');
      expect(campaign?.title).toBe('Summer Sale');
      expect(campaign?.createdAt).toBeInstanceOf(Date);
    });

    it('should return null when not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
      const campaign = await getCampaign('nonexistent');
      expect(campaign).toBeNull();
    });
  });

  describe('listCampaigns', () => {
    it('should list campaigns for tenant/user', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          {
            id: 'c1',
            data: () => ({
              tenantId: 'test-tenant',
              userId: 'user-123',
              title: 'Campaign 1',
              status: 'active',
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
            }),
          },
        ],
      } as any);

      const campaigns = await listCampaigns('test-tenant', 'user-123');
      expect(campaigns).toHaveLength(1);
      expect(where).toHaveBeenCalledWith('tenantId', '==', 'test-tenant');
      expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('should return empty array when no campaigns', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
      const campaigns = await listCampaigns('test-tenant', 'user-123');
      expect(campaigns).toHaveLength(0);
    });
  });

  describe('updateCampaign', () => {
    it('should update campaign fields', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      await updateCampaign('campaign-123', { status: 'paused' });
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'marketing_campaigns', 'campaign-123');
      expect(updateDoc).toHaveBeenCalledTimes(1);
      const [, updates] = vi.mocked(updateDoc).mock.calls[0];
      expect(updates.status).toBe('paused');
      expect(updates.updatedAt).toBeDefined();
    });
  });

  describe('deleteCampaign', () => {
    it('should delete campaign document', async () => {
      vi.mocked(deleteDoc).mockResolvedValue(undefined);
      await deleteCampaign('campaign-123');
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'marketing_campaigns', 'campaign-123');
      expect(deleteDoc).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors', async () => {
      vi.mocked(deleteDoc).mockRejectedValue(new Error('Permission denied'));
      await expect(deleteCampaign('campaign-456')).rejects.toThrow('Permission denied');
    });
  });
});
