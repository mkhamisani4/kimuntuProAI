/**
 * Unit tests for Firestore marketing settings persistence functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMarketingSettings, updateMarketingSettings } from '../marketingSettings.js';

vi.mock('../client.js', () => {
  return {
    db: {},
    Timestamp: {
      now: vi.fn(() => ({ toDate: () => new Date('2025-01-15T10:00:00Z') })),
      fromDate: vi.fn((date: Date) => ({ toDate: () => date })),
    },
    collection: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
  };
});

const { getDocs, setDoc, doc, where } =
  await import('../client.js');

describe('Marketing Settings CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMarketingSettings', () => {
    it('should return settings when found', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'test-tenant_user-123',
            data: () => ({
              tenantId: 'test-tenant',
              userId: 'user-123',
              ayrshareProfileKey: 'profile-key-abc',
              connectedPlatforms: ['twitter', 'facebook'],
              updatedAt: { toDate: () => new Date('2025-01-15T10:00:00Z') },
            }),
          },
        ],
      } as any);

      const settings = await getMarketingSettings('test-tenant', 'user-123');
      expect(settings).not.toBeNull();
      expect(settings?.id).toBe('test-tenant_user-123');
      expect(settings?.ayrshareProfileKey).toBe('profile-key-abc');
      expect(settings?.connectedPlatforms).toEqual(['twitter', 'facebook']);
      expect(settings?.updatedAt).toBeInstanceOf(Date);
      expect(where).toHaveBeenCalledWith('tenantId', '==', 'test-tenant');
      expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
    });

    it('should return null when not found', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: [],
      } as any);

      const settings = await getMarketingSettings('test-tenant', 'user-999');
      expect(settings).toBeNull();
    });

    it('should propagate errors', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Permission denied'));
      await expect(getMarketingSettings('test-tenant', 'user-123')).rejects.toThrow('Permission denied');
    });
  });

  describe('updateMarketingSettings', () => {
    it('should update existing settings document', async () => {
      // First call to getMarketingSettings inside updateMarketingSettings
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'test-tenant_user-123',
            data: () => ({
              tenantId: 'test-tenant',
              userId: 'user-123',
              ayrshareProfileKey: 'old-key',
              connectedPlatforms: ['twitter'],
              updatedAt: { toDate: () => new Date('2025-01-10T10:00:00Z') },
            }),
          },
        ],
      } as any);

      vi.mocked(setDoc).mockResolvedValue(undefined);

      await updateMarketingSettings('test-tenant', 'user-123', {
        ayrshareProfileKey: 'new-key',
        connectedPlatforms: ['twitter', 'facebook', 'instagram'],
      });

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'marketing_settings', 'test-tenant_user-123');
      expect(setDoc).toHaveBeenCalledTimes(1);
      const [, data, options] = vi.mocked(setDoc).mock.calls[0];
      expect(data.ayrshareProfileKey).toBe('new-key');
      expect(data.connectedPlatforms).toEqual(['twitter', 'facebook', 'instagram']);
      expect(data.tenantId).toBe('test-tenant');
      expect(data.userId).toBe('user-123');
      expect(data.updatedAt).toBeDefined();
      expect(options).toEqual({ merge: true });
    });

    it('should create new settings document when none exists', async () => {
      // getMarketingSettings returns null (no existing doc)
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: [],
      } as any);

      vi.mocked(setDoc).mockResolvedValue(undefined);

      await updateMarketingSettings('test-tenant', 'user-456', {
        ayrshareProfileKey: 'brand-new-key',
        connectedPlatforms: ['linkedin'],
      });

      // Should use deterministic ID: tenantId_userId
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'marketing_settings', 'test-tenant_user-456');
      expect(setDoc).toHaveBeenCalledTimes(1);
      const [, data] = vi.mocked(setDoc).mock.calls[0];
      expect(data.tenantId).toBe('test-tenant');
      expect(data.userId).toBe('user-456');
      expect(data.ayrshareProfileKey).toBe('brand-new-key');
      expect(data.connectedPlatforms).toEqual(['linkedin']);
      expect(data.updatedAt).toBeDefined();
    });

    it('should provide default values when creating new settings', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: [],
      } as any);

      vi.mocked(setDoc).mockResolvedValue(undefined);

      // Pass only partial updates - no ayrshareProfileKey or connectedPlatforms
      await updateMarketingSettings('test-tenant', 'user-789', {});

      const [, data] = vi.mocked(setDoc).mock.calls[0];
      // Defaults should be set for new documents
      expect(data.ayrshareProfileKey).toBeNull();
      expect(data.connectedPlatforms).toEqual([]);
    });

    it('should propagate errors', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Network error'));
      await expect(
        updateMarketingSettings('test-tenant', 'user-123', { ayrshareProfileKey: 'key' })
      ).rejects.toThrow('Network error');
    });
  });
});
