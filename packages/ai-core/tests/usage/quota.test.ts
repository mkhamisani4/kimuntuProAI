/**
 * Tests for Quota Enforcement Module (Step 11)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  checkQuotas,
  enforcePerRequestCaps,
  assertQuotasOk,
  assertPerRequestCapsOk,
  getCurrentQuotaUsage,
} from '../../src/usage/quota.js';
import { QuotaError } from '@kimuntupro/shared';

// Mock the db module
vi.mock('@kimuntupro/db', () => ({
  sumTokensByUser: vi.fn(),
  sumTokensByTenant: vi.fn(),
}));

describe('checkQuotas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default quota config
    process.env.DAILY_TOKEN_QUOTA_PER_USER = '100000';
    process.env.DAILY_TOKEN_QUOTA_PER_TENANT = '2000000';
    process.env.MAX_COST_PER_REQUEST_CENTS = '50';
    process.env.MAX_TOKENS_PER_REQUEST = '16000';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should pass when within all quotas', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(50000); // 50% used
    vi.mocked(sumTokensByTenant).mockResolvedValue(1000000); // 50% used

    const result = await checkQuotas({
      tenantId: 'tenant1',
      userId: 'user1',
      plannedTokens: 10000,
      plannedCostCents: 10,
    });

    expect(result.ok).toBe(true);
    expect(result.currentUsage).toEqual({
      tokens: 50000,
      costCents: 0,
    });
  });

  it('should fail when user quota would be exceeded', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(95000); // 95% used
    vi.mocked(sumTokensByTenant).mockResolvedValue(1000000);

    const result = await checkQuotas({
      tenantId: 'tenant1',
      userId: 'user1',
      plannedTokens: 10000, // Would exceed 100000 limit
      plannedCostCents: 10,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('User daily token quota exceeded');
    expect(result.reason).toContain('95000');
    expect(result.reason).toContain('100000');
    expect(result.resetsAtISO).toBeDefined();
  });

  it('should fail when tenant quota would be exceeded', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    // User: 30K + 60K = 90K < 100K (OK)
    // Tenant: 1950K + 60K = 2010K > 2000K (FAIL)
    vi.mocked(sumTokensByUser).mockResolvedValue(30000);  // User OK
    vi.mocked(sumTokensByTenant).mockResolvedValue(1950000); // Tenant will exceed

    const result = await checkQuotas({
      tenantId: 'tenant1',
      userId: 'user1',
      plannedTokens: 60000, // User OK, but tenant exceeds
      plannedCostCents: 10,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('Tenant daily token quota exceeded');
    expect(result.reason).toContain('1950000');
    expect(result.reason).toContain('2000000');
    expect(result.resetsAtISO).toBeDefined();
  });

  it('should fail when per-request token cap exceeded', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(50000);
    vi.mocked(sumTokensByTenant).mockResolvedValue(1000000);

    const result = await checkQuotas({
      tenantId: 'tenant1',
      userId: 'user1',
      plannedTokens: 20000, // Exceeds 16000 limit
      plannedCostCents: 10,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('Request exceeds maximum tokens per request');
    expect(result.reason).toContain('20000');
    expect(result.reason).toContain('16000');
  });

  it('should fail when per-request cost cap exceeded', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(50000);
    vi.mocked(sumTokensByTenant).mockResolvedValue(1000000);

    const result = await checkQuotas({
      tenantId: 'tenant1',
      userId: 'user1',
      plannedTokens: 10000,
      plannedCostCents: 60, // Exceeds 50 cent limit
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('Request exceeds maximum cost per request');
    expect(result.reason).toContain('60 cents');
    expect(result.reason).toContain('50 cents');
  });

  it('should fail closed on database error', async () => {
    const { sumTokensByUser } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockRejectedValue(new Error('DB connection failed'));

    const result = await checkQuotas({
      tenantId: 'tenant1',
      userId: 'user1',
      plannedTokens: 10000,
      plannedCostCents: 10,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('Quota check failed due to system error');
    expect(result.reason).toContain('DB connection failed');
  });

  it('should include resetsAtISO in response for daily quotas', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(95000);
    vi.mocked(sumTokensByTenant).mockResolvedValue(1000000);

    const result = await checkQuotas({
      tenantId: 'tenant1',
      userId: 'user1',
      plannedTokens: 10000,
      plannedCostCents: 10,
    });

    expect(result.ok).toBe(false);
    expect(result.resetsAtISO).toBeDefined();
    expect(result.resetsAtISO).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00/); // Next midnight UTC
  });
});

describe('enforcePerRequestCaps', () => {
  beforeEach(() => {
    process.env.MAX_COST_PER_REQUEST_CENTS = '50';
    process.env.MAX_TOKENS_PER_REQUEST = '16000';
  });

  it('should pass when within caps', () => {
    const result = enforcePerRequestCaps({
      tokens: 10000,
      costCents: 30,
    });

    expect(result.ok).toBe(true);
  });

  it('should fail when token cap exceeded', () => {
    const result = enforcePerRequestCaps({
      tokens: 20000,
      costCents: 30,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('Request exceeds maximum tokens per request');
    expect(result.reason).toContain('20000 tokens');
    expect(result.reason).toContain('16000');
  });

  it('should fail when cost cap exceeded', () => {
    const result = enforcePerRequestCaps({
      tokens: 10000,
      costCents: 60,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('Request exceeds maximum cost per request');
    expect(result.reason).toContain('60 cents');
    expect(result.reason).toContain('50 cents');
  });

  it('should allow requests exactly at the cap', () => {
    const result = enforcePerRequestCaps({
      tokens: 16000,
      costCents: 50,
    });

    expect(result.ok).toBe(true);
  });
});

describe('assertQuotasOk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DAILY_TOKEN_QUOTA_PER_USER = '100000';
    process.env.DAILY_TOKEN_QUOTA_PER_TENANT = '2000000';
    process.env.MAX_COST_PER_REQUEST_CENTS = '50';
    process.env.MAX_TOKENS_PER_REQUEST = '16000';
  });

  it('should not throw when quotas ok', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(50000);
    vi.mocked(sumTokensByTenant).mockResolvedValue(1000000);

    await expect(
      assertQuotasOk({
        tenantId: 'tenant1',
        userId: 'user1',
        plannedTokens: 10000,
        plannedCostCents: 10,
      })
    ).resolves.toBeUndefined();
  });

  it('should throw QuotaError when quota exceeded', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(95000);
    vi.mocked(sumTokensByTenant).mockResolvedValue(1000000);

    await expect(
      assertQuotasOk({
        tenantId: 'tenant1',
        userId: 'user1',
        plannedTokens: 10000,
        plannedCostCents: 10,
      })
    ).rejects.toThrow(QuotaError);
  });

  it('should include resetsAtISO in QuotaError', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(95000);
    vi.mocked(sumTokensByTenant).mockResolvedValue(1000000);

    try {
      await assertQuotasOk({
        tenantId: 'tenant1',
        userId: 'user1',
        plannedTokens: 10000,
        plannedCostCents: 10,
      });
      expect.fail('Should have thrown QuotaError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(QuotaError);
      expect(error.resetsAtISO).toBeDefined();
      expect(error.resetsAtISO).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00/);
    }
  });
});

describe('assertPerRequestCapsOk', () => {
  beforeEach(() => {
    process.env.MAX_COST_PER_REQUEST_CENTS = '50';
    process.env.MAX_TOKENS_PER_REQUEST = '16000';
  });

  it('should not throw when within caps', () => {
    expect(() =>
      assertPerRequestCapsOk({
        tokens: 10000,
        costCents: 30,
      })
    ).not.toThrow();
  });

  it('should throw QuotaError when caps exceeded', () => {
    expect(() =>
      assertPerRequestCapsOk({
        tokens: 20000,
        costCents: 30,
      })
    ).toThrow(QuotaError);
  });

  it('should throw QuotaError with correct message', () => {
    try {
      assertPerRequestCapsOk({
        tokens: 20000,
        costCents: 30,
      });
      expect.fail('Should have thrown QuotaError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(QuotaError);
      expect(error.message).toContain('Request exceeds maximum tokens per request');
    }
  });
});

describe('getCurrentQuotaUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DAILY_TOKEN_QUOTA_PER_USER = '100000';
    process.env.DAILY_TOKEN_QUOTA_PER_TENANT = '2000000';
  });

  it('should return current usage stats', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(60000);
    vi.mocked(sumTokensByTenant).mockResolvedValue(1200000);

    const usage = await getCurrentQuotaUsage({
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(usage.user).toEqual({
      tokensUsed: 60000,
      tokensRemaining: 40000,
      quotaLimit: 100000,
    });

    expect(usage.tenant).toEqual({
      tokensUsed: 1200000,
      tokensRemaining: 800000,
      quotaLimit: 2000000,
    });

    expect(usage.resetsAtISO).toBeDefined();
    expect(usage.resetsAtISO).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00/);
  });

  it('should handle zero usage', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(0);
    vi.mocked(sumTokensByTenant).mockResolvedValue(0);

    const usage = await getCurrentQuotaUsage({
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(usage.user.tokensUsed).toBe(0);
    expect(usage.user.tokensRemaining).toBe(100000);
    expect(usage.tenant.tokensUsed).toBe(0);
    expect(usage.tenant.tokensRemaining).toBe(2000000);
  });

  it('should handle quota exceeded case', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(110000); // Over quota
    vi.mocked(sumTokensByTenant).mockResolvedValue(1200000);

    const usage = await getCurrentQuotaUsage({
      tenantId: 'tenant1',
      userId: 'user1',
    });

    expect(usage.user.tokensUsed).toBe(110000);
    expect(usage.user.tokensRemaining).toBe(0); // Should be max(0, ...)
  });
});

describe('preflightQuotaGuard integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DAILY_TOKEN_QUOTA_PER_USER = '100000';
    process.env.DAILY_TOKEN_QUOTA_PER_TENANT = '2000000';
    process.env.MAX_COST_PER_REQUEST_CENTS = '50';
    process.env.MAX_TOKENS_PER_REQUEST = '16000';
    process.env.CONTEXT_TOKEN_LIMIT = '2000';
    process.env.MAX_TOKENS_EXECUTOR = '8000';
  });

  it('should check quotas before expensive operations', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(50000);
    vi.mocked(sumTokensByTenant).mockResolvedValue(1000000);

    // Import preflightQuotaGuard
    const { preflightQuotaGuard } = await import('../../src/orchestration/middleware.js');

    await expect(
      preflightQuotaGuard({
        plan: {
          task: 'exec_summary',
          requires_retrieval: true,
          requires_web_search: true,
          query_terms: ['financial', 'projections'],
          sections: ['Executive Summary', 'Financial Projections'],
          metrics_needed: ['unit_economics'],
          escalate_model: false,
        },
        tenantId: 'tenant1',
        userId: 'user1',
        inputLength: 100,
      })
    ).resolves.toBeUndefined();
  });

  it('should throw QuotaError when quota would be exceeded', async () => {
    const { sumTokensByUser, sumTokensByTenant } = await import('@kimuntupro/db');
    vi.mocked(sumTokensByUser).mockResolvedValue(95000);
    vi.mocked(sumTokensByTenant).mockResolvedValue(1000000);

    const { preflightQuotaGuard } = await import('../../src/orchestration/middleware.js');

    await expect(
      preflightQuotaGuard({
        plan: {
          task: 'exec_summary',
          requires_retrieval: true,
          requires_web_search: false,
          query_terms: [],
          sections: ['Executive Summary'],
          metrics_needed: [],
          escalate_model: false,
        },
        tenantId: 'tenant1',
        userId: 'user1',
        inputLength: 100,
      })
    ).rejects.toThrow(QuotaError);
  });
});
