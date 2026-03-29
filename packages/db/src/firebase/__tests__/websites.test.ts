/**
 * Unit tests for Firestore website persistence functions
 * Mocks Firestore operations to test business logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWebsite, getWebsite, updateWebsite, listWebsites, deleteWebsite } from '../websites.js';
import type { Website } from '../websites.js';

// Mock Firestore client
vi.mock('../client.js', () => {
  const mockCollection = vi.fn();
  const mockAddDoc = vi.fn();
  const mockGetDoc = vi.fn();
  const mockGetDocs = vi.fn();
  const mockUpdateDoc = vi.fn();
  const mockDeleteDoc = vi.fn();
  const mockDoc = vi.fn();
  const mockQuery = vi.fn();
  const mockWhere = vi.fn();
  const mockOrderBy = vi.fn();
  const mockLimit = vi.fn();
  const mockTimestamp = {
    now: vi.fn(() => ({ toDate: () => new Date('2025-01-15T10:00:00Z') })),
    fromDate: vi.fn((date: Date) => ({ toDate: () => date })),
  };

  return {
    db: {},
    Timestamp: mockTimestamp,
    collection: mockCollection,
    addDoc: mockAddDoc,
    getDoc: mockGetDoc,
    getDocs: mockGetDocs,
    updateDoc: mockUpdateDoc,
    deleteDoc: mockDeleteDoc,
    doc: mockDoc,
    query: mockQuery,
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: mockLimit,
  };
});

// Get mocked functions for assertions
const { addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, limit, Timestamp } =
  await import('../client.js');

describe('Firestore Website Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWebsite', () => {
    it('should create a website document with all fields', async () => {
      const websiteData: Omit<Website, 'id' | 'createdAt' | 'updatedAt'> = {
        tenantId: 'test-tenant',
        userId: 'user-123',
        businessPlanId: 'plan-456',
        hasPlanAttached: true,
        wizardInput: {
          companyName: 'Acme Inc',
          tagline: 'Innovation at its finest',
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
        completedInput: null,
        siteSpec: null,
        siteCode: null,
        title: 'Acme Inc Website',
        status: 'draft',
        errorMessage: null,
        generationMetadata: null,
      };

      vi.mocked(addDoc).mockResolvedValue({ id: 'website-123' } as any);

      const websiteId = await createWebsite(websiteData);

      expect(websiteId).toBe('website-123');
      expect(addDoc).toHaveBeenCalledTimes(1);

      const [collectionRef, data] = vi.mocked(addDoc).mock.calls[0];
      expect(data).toMatchObject({
        tenantId: 'test-tenant',
        userId: 'user-123',
        businessPlanId: 'plan-456',
        hasPlanAttached: true,
        title: 'Acme Inc Website',
        status: 'draft',
      });
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });

    it('should create a website without business plan', async () => {
      const websiteData: Omit<Website, 'id' | 'createdAt' | 'updatedAt'> = {
        tenantId: 'test-tenant',
        userId: 'user-789',
        businessPlanId: null,
        hasPlanAttached: false,
        wizardInput: {
          companyName: 'Test Co',
          enabledSections: {
            features: true,
            services: false,
            about: true,
            testimonials: false,
            pricing: false,
            faq: false,
            contact: true,
          },
        },
        completedInput: null,
        siteSpec: null,
        siteCode: null,
        title: 'Test Co Website',
        status: 'draft',
        errorMessage: null,
        generationMetadata: null,
      };

      vi.mocked(addDoc).mockResolvedValue({ id: 'website-456' } as any);

      const websiteId = await createWebsite(websiteData);

      expect(websiteId).toBe('website-456');
      const [, data] = vi.mocked(addDoc).mock.calls[0];
      expect(data.businessPlanId).toBeNull();
      expect(data.hasPlanAttached).toBe(false);
    });
  });

  describe('getWebsite', () => {
    it('should return website when document exists', async () => {
      const mockDocData = {
        tenantId: 'test-tenant',
        userId: 'user-123',
        businessPlanId: 'plan-456',
        hasPlanAttached: true,
        wizardInput: { companyName: 'Acme Inc' },
        completedInput: null,
        siteSpec: null,
        siteCode: null,
        title: 'Acme Inc Website',
        status: 'ready',
        errorMessage: null,
        generationMetadata: {
          model: 'claude-sonnet-4.5',
          tokensUsed: 1000,
          latencyMs: 5000,
          costCents: 2.5,
          generatedAt: { toDate: () => new Date('2025-01-15T12:00:00Z') },
        },
        createdAt: { toDate: () => new Date('2025-01-15T10:00:00Z') },
        updatedAt: { toDate: () => new Date('2025-01-15T12:00:00Z') },
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'website-123',
        data: () => mockDocData,
      } as any);

      const website = await getWebsite('website-123');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'websites', 'website-123');
      expect(website).not.toBeNull();
      expect(website?.id).toBe('website-123');
      expect(website?.title).toBe('Acme Inc Website');
      expect(website?.status).toBe('ready');
      expect(website?.createdAt).toBeInstanceOf(Date);
      expect(website?.generationMetadata?.generatedAt).toBeInstanceOf(Date);
    });

    it('should return null when document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const website = await getWebsite('nonexistent-id');

      expect(website).toBeNull();
    });
  });

  describe('updateWebsite', () => {
    it('should update website with new status', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateWebsite('website-123', { status: 'generating' });

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'websites', 'website-123');
      expect(updateDoc).toHaveBeenCalledTimes(1);

      const [, updates] = vi.mocked(updateDoc).mock.calls[0];
      expect(updates.status).toBe('generating');
      expect(updates.updatedAt).toBeDefined();
    });

    it('should update website with generated content', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const updates = {
        status: 'ready' as const,
        siteCode: '<html>...</html>',
        siteSpec: { meta: { title: 'Test' } },
        generationMetadata: {
          model: 'claude-sonnet-4.5',
          tokensUsed: 1500,
          latencyMs: 6000,
          costCents: 3.0,
          generatedAt: new Date('2025-01-15T12:00:00Z'),
        },
      };

      await updateWebsite('website-456', updates);

      expect(updateDoc).toHaveBeenCalledTimes(1);
      const [, data] = vi.mocked(updateDoc).mock.calls[0];
      expect(data.status).toBe('ready');
      expect(data.siteCode).toBe('<html>...</html>');
      expect(data.generationMetadata).toBeDefined();
    });

    it('should convert Date to Timestamp for generationMetadata', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const updates = {
        generationMetadata: {
          model: 'claude-sonnet-4.5',
          tokensUsed: 1000,
          latencyMs: 5000,
          costCents: 2.5,
          generatedAt: new Date('2025-01-15T12:00:00Z'),
        },
      };

      await updateWebsite('website-789', updates);

      expect(Timestamp.fromDate).toHaveBeenCalledWith(updates.generationMetadata.generatedAt);
    });
  });

  describe('listWebsites', () => {
    it('should list websites for a tenant', async () => {
      const mockDocs = [
        {
          id: 'website-1',
          data: () => ({
            tenantId: 'test-tenant',
            userId: 'user-123',
            title: 'Website 1',
            status: 'ready',
            createdAt: { toDate: () => new Date('2025-01-15T10:00:00Z') },
            updatedAt: { toDate: () => new Date('2025-01-15T10:00:00Z') },
            generationMetadata: null,
          }),
        },
        {
          id: 'website-2',
          data: () => ({
            tenantId: 'test-tenant',
            userId: 'user-456',
            title: 'Website 2',
            status: 'generating',
            createdAt: { toDate: () => new Date('2025-01-15T09:00:00Z') },
            updatedAt: { toDate: () => new Date('2025-01-15T09:00:00Z') },
            generationMetadata: null,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const websites = await listWebsites('test-tenant');

      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('tenantId', '==', 'test-tenant');
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(limit).toHaveBeenCalledWith(20);

      expect(websites).toHaveLength(2);
      expect(websites[0].id).toBe('website-1');
      expect(websites[1].id).toBe('website-2');
    });

    it('should list websites for a specific user', async () => {
      const mockDocs = [
        {
          id: 'website-1',
          data: () => ({
            tenantId: 'test-tenant',
            userId: 'user-123',
            title: 'Website 1',
            status: 'ready',
            createdAt: { toDate: () => new Date('2025-01-15T10:00:00Z') },
            updatedAt: { toDate: () => new Date('2025-01-15T10:00:00Z') },
            generationMetadata: null,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const websites = await listWebsites('test-tenant', 'user-123');

      expect(where).toHaveBeenCalledWith('tenantId', '==', 'test-tenant');
      expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(websites).toHaveLength(1);
      expect(websites[0].userId).toBe('user-123');
    });

    it('should respect custom limit', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);

      await listWebsites('test-tenant', undefined, 50);

      expect(limit).toHaveBeenCalledWith(50);
    });

    it('should return empty array when no websites found', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);

      const websites = await listWebsites('empty-tenant');

      expect(websites).toHaveLength(0);
    });
  });

  describe('deleteWebsite', () => {
    it('should delete website document', async () => {
      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      await deleteWebsite('website-123');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'websites', 'website-123');
      expect(deleteDoc).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion errors', async () => {
      vi.mocked(deleteDoc).mockRejectedValue(new Error('Permission denied'));

      await expect(deleteWebsite('website-456')).rejects.toThrow('Permission denied');
    });
  });
});
