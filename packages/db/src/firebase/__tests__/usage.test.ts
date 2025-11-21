/**
 * Unit tests for Firestore usage tracking functions
 * Mocks Firestore operations to test business logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordUsage, sumTokensByUser, sumTokensByTenant, getUsageMetrics } from '../usage.js';
import type { UsageRow } from '../usage.js';

// Mock Firestore client
vi.mock('../client.js', () => {
  const mockCollection = vi.fn();
  const mockAddDoc = vi.fn();
  const mockGetDocs = vi.fn();
  const mockQuery = vi.fn();
  const mockWhere = vi.fn();
  const mockTimestamp = {
    now: vi.fn(() => ({ toDate: () => new Date('2025-01-15T10:00:00Z') })),
    fromDate: vi.fn((date: Date) => ({ toDate: () => date })),
  };

  return {
    db: {},
    Timestamp: mockTimestamp,
    collection: mockCollection,
    addDoc: mockAddDoc,
    getDocs: mockGetDocs,
    query: mockQuery,
    where: mockWhere,
  };
});

// Get mocked functions for assertions
const { addDoc, getDocs, collection, query, where } = await import('../client.js');

describe('Firestore Usage Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordUsage', () => {
    it('should write usage document to Firestore with all fields', async () => {
      const usageRow: UsageRow = {
        tenantId: 'test-tenant',
        userId: 'user-123',
        assistant: 'streamlined_plan',
        model: 'gpt-4',
        tokensIn: 100,
        tokensOut: 200,
        costCents: 0.5,
        latencyMs: 1500,
        toolInvocations: { retrieval: 2, webSearch: 1 },
        requestId: 'req-abc',
      };

      vi.mocked(addDoc).mockResolvedValue({ id: 'doc-123' } as any);

      await recordUsage(usageRow);

      // Verify addDoc was called with correct collection and data
      expect(addDoc).toHaveBeenCalledTimes(1);
      const [collectionRef, data] = vi.mocked(addDoc).mock.calls[0];
      expect(data).toMatchObject({
        tenantId: 'test-tenant',
        userId: 'user-123',
        assistant: 'streamlined_plan',
        model: 'gpt-4',
        tokensIn: 100,
        tokensOut: 200,
        totalTokens: 300, // tokensIn + tokensOut
        costCents: 0.5,
        latencyMs: 1500,
        toolInvocations: { retrieval: 2, webSearch: 1 },
        requestId: 'req-abc',
      });
      expect(data.createdAt).toBeDefined();
    });

    it('should handle missing optional fields', async () => {
      const usageRow: UsageRow = {
        tenantId: 'test-tenant',
        userId: 'user-123',
        assistant: 'market_analysis',
        model: 'gpt-3.5-turbo',
        tokensIn: 50,
        tokensOut: 150,
        costCents: 0.2,
        latencyMs: 800,
      };

      vi.mocked(addDoc).mockResolvedValue({ id: 'doc-456' } as any);

      await recordUsage(usageRow);

      const [, data] = vi.mocked(addDoc).mock.calls[0];
      expect(data.toolInvocations).toBeUndefined();
      expect(data.requestId).toBeNull();
    });
  });

  describe('sumTokensByUser', () => {
    it('should sum tokens for a specific user since a date', async () => {
      const userId = 'user-123';
      const since = new Date('2025-01-01T00:00:00Z');

      // Mock Firestore query results
      const mockDocs = [
        { data: () => ({ tokensIn: 100, tokensOut: 200 }) },
        { data: () => ({ tokensIn: 50, tokensOut: 150 }) },
        { data: () => ({ tokensIn: 75, tokensOut: 125 }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const totalTokens = await sumTokensByUser(userId, since);

      // Verify query was constructed correctly
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('userId', '==', userId);
      expect(where).toHaveBeenCalledWith('createdAt', '>=', expect.anything());

      // Verify sum: (100+200) + (50+150) + (75+125) = 700
      expect(totalTokens).toBe(700);
    });

    it('should return 0 when no documents match', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);

      const totalTokens = await sumTokensByUser('user-999', new Date());

      expect(totalTokens).toBe(0);
    });

    it('should handle documents with missing token fields', async () => {
      const mockDocs = [
        { data: () => ({ tokensIn: 100 }) }, // Missing tokensOut
        { data: () => ({ tokensOut: 200 }) }, // Missing tokensIn
        { data: () => ({}) }, // Missing both
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const totalTokens = await sumTokensByUser('user-123', new Date());

      // Should only count defined values: 100 + 200 = 300
      expect(totalTokens).toBe(300);
    });
  });

  describe('sumTokensByTenant', () => {
    it('should sum tokens for a specific tenant since a date', async () => {
      const tenantId = 'test-tenant';
      const since = new Date('2025-01-01T00:00:00Z');

      const mockDocs = [
        { data: () => ({ tokensIn: 200, tokensOut: 300 }) },
        { data: () => ({ tokensIn: 100, tokensOut: 100 }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const totalTokens = await sumTokensByTenant(tenantId, since);

      // Verify query used tenantId
      expect(where).toHaveBeenCalledWith('tenantId', '==', tenantId);

      // Verify sum: (200+300) + (100+100) = 700
      expect(totalTokens).toBe(700);
    });
  });

  describe('getUsageMetrics', () => {
    it('should aggregate metrics with no filters', async () => {
      const mockDocs = [
        {
          data: () => ({
            assistant: 'streamlined_plan',
            tokensIn: 100,
            tokensOut: 200,
            costCents: 0.5,
          }),
        },
        {
          data: () => ({
            assistant: 'exec_summary',
            tokensIn: 150,
            tokensOut: 250,
            costCents: 0.8,
          }),
        },
        {
          data: () => ({
            assistant: 'streamlined_plan',
            tokensIn: 50,
            tokensOut: 100,
            costCents: 0.3,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const metrics = await getUsageMetrics();

      // Verify totals
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.totalCostCents).toBeCloseTo(1.6);
      expect(metrics.totalTokensIn).toBe(300); // 100 + 150 + 50
      expect(metrics.totalTokensOut).toBe(550); // 200 + 250 + 100

      // Verify byAssistant breakdown
      expect(metrics.byAssistant['streamlined_plan']).toEqual({
        requests: 2,
        costCents: 0.8, // 0.5 + 0.3
        tokens: 450, // (100+200) + (50+100)
      });

      expect(metrics.byAssistant['exec_summary']).toEqual({
        requests: 1,
        costCents: 0.8,
        tokens: 400, // 150 + 250
      });
    });

    it('should filter by tenantId when provided', async () => {
      const mockDocs = [
        { data: () => ({ assistant: 'market_analysis', tokensIn: 50, tokensOut: 50, costCents: 0.2 }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const metrics = await getUsageMetrics({ tenantId: 'test-tenant' });

      expect(where).toHaveBeenCalledWith('tenantId', '==', 'test-tenant');
      expect(metrics.totalRequests).toBe(1);
    });

    it('should filter by userId when provided', async () => {
      const mockDocs = [
        { data: () => ({ assistant: 'exec_summary', tokensIn: 75, tokensOut: 125, costCents: 0.4 }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const metrics = await getUsageMetrics({ userId: 'user-123' });

      expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(metrics.totalRequests).toBe(1);
    });

    it('should filter by date when since is provided', async () => {
      const since = new Date('2025-01-10T00:00:00Z');
      const mockDocs = [];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      await getUsageMetrics({ since });

      expect(where).toHaveBeenCalledWith('createdAt', '>=', expect.anything());
    });

    it('should return zero metrics when no documents match', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);

      const metrics = await getUsageMetrics();

      expect(metrics.totalRequests).toBe(0);
      expect(metrics.totalCostCents).toBe(0);
      expect(metrics.totalTokensIn).toBe(0);
      expect(metrics.totalTokensOut).toBe(0);
      expect(metrics.byAssistant).toEqual({});
    });

    it('should handle documents with missing cost or token fields gracefully', async () => {
      const mockDocs = [
        { data: () => ({ assistant: 'streamlined_plan', tokensIn: 100 }) }, // Missing tokensOut, costCents
        { data: () => ({ assistant: 'exec_summary', costCents: 0.5 }) }, // Missing tokens
        { data: () => ({ assistant: 'market_analysis' }) }, // Missing all numeric fields
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const metrics = await getUsageMetrics();

      expect(metrics.totalRequests).toBe(3);
      expect(metrics.totalCostCents).toBeCloseTo(0.5);
      expect(metrics.totalTokensIn).toBe(100);
      expect(metrics.totalTokensOut).toBe(0);
    });
  });
});
