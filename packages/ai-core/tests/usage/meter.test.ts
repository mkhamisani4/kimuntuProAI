/**
 * Tests for Usage Metering Module (Step 11)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  calcCostCents,
  buildUsageFromClientEvent,
  emitUsage,
  estimateUsage,
  formatUsageMetrics,
  aggregateUsageMetrics,
  calcTotalTokens,
} from '../../src/usage/meter.js';
import type { UsageMetric } from '@kimuntupro/shared';

// Mock the db module
vi.mock('@kimuntupro/db', () => ({
  recordUsage: vi.fn().mockResolvedValue(undefined),
}));

// Mock the costs module
vi.mock('../../src/llm/costs.js', () => ({
  getCostCents: vi.fn((params) => {
    // Simple mock: 0.01 cents per input token, 0.03 cents per output token
    return params.tokensIn * 0.01 + params.tokensOut * 0.03;
  }),
}));

describe('calcCostCents', () => {
  it('should calculate cost and round up to nearest cent', () => {
    const cost = calcCostCents({
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
    });

    // 100 * 0.01 + 50 * 0.03 = 1 + 1.5 = 2.5 cents, rounded up to 3
    expect(cost).toBe(3);
  });

  it('should handle zero tokens', () => {
    const cost = calcCostCents({
      model: 'gpt-4o-mini',
      tokensIn: 0,
      tokensOut: 0,
    });

    expect(cost).toBe(0);
  });

  it('should round up fractional cents conservatively', () => {
    const cost = calcCostCents({
      model: 'gpt-4o-mini',
      tokensIn: 10,
      tokensOut: 5,
    });

    // 10 * 0.01 + 5 * 0.03 = 0.1 + 0.15 = 0.25 cents, rounded up to 1
    expect(cost).toBe(1);
  });

  it('should include cached input tokens in calculation', () => {
    const cost = calcCostCents({
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      cachedInputTokens: 50,
    });

    // Should pass cachedInputTokens to getCostCents
    expect(cost).toBeGreaterThan(0);
  });
});

describe('buildUsageFromClientEvent', () => {
  it('should build usage metrics from client response', () => {
    const metrics = buildUsageFromClientEvent({
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      latencyMs: 500,
    });

    expect(metrics).toEqual({
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      costCents: 3, // Rounded up from 2.5
      latencyMs: 500,
      toolInvocations: {
        retrieval: 0,
        webSearch: 0,
        finance: 0,
      },
    });
  });

  it('should include cached input tokens', () => {
    const metrics = buildUsageFromClientEvent({
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      latencyMs: 500,
      cachedInputTokens: 80,
    });

    expect(metrics.costCents).toBeGreaterThan(0);
  });

  it('should include tool invocations', () => {
    const metrics = buildUsageFromClientEvent({
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      latencyMs: 500,
      toolInvocations: {
        retrieval: 1,
        webSearch: 2,
        finance: 1,
      },
    });

    expect(metrics.toolInvocations).toEqual({
      retrieval: 1,
      webSearch: 2,
      finance: 1,
    });
  });

  it('should default tool invocations to zero', () => {
    const metrics = buildUsageFromClientEvent({
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      latencyMs: 500,
      toolInvocations: {},
    });

    expect(metrics.toolInvocations).toEqual({
      retrieval: 0,
      webSearch: 0,
      finance: 0,
    });
  });
});

describe('emitUsage', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.ENABLE_USAGE_TRACKING;
    delete process.env.USAGE_SAMPLING_RATE;
    delete process.env.USAGE_SOFT_FAIL;
  });

  it('should persist usage to database', async () => {
    const { recordUsage } = await import('@kimuntupro/db');

    const metrics: UsageMetric = {
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      costCents: 3,
      latencyMs: 500,
      toolInvocations: {
        retrieval: 0,
        webSearch: 0,
        finance: 0,
      },
    };

    await emitUsage({
      tenantId: 'tenant1',
      userId: 'user1',
      assistant: 'streamlined_plan',
      metrics,
      requestId: 'req123',
    });

    expect(recordUsage).toHaveBeenCalledWith({
      tenantId: 'tenant1',
      userId: 'user1',
      assistant: 'streamlined_plan',
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      totalTokens: 150,
      costCents: 3,
      latencyMs: 500,
      toolInvocations: {
        retrieval: 0,
        webSearch: 0,
        finance: 0,
      },
      requestId: 'req123',
      meta: undefined,
    });
  });

  it('should skip tracking if ENABLE_USAGE_TRACKING is false', async () => {
    process.env.ENABLE_USAGE_TRACKING = 'false';
    const { recordUsage } = await import('@kimuntupro/db');

    const metrics: UsageMetric = {
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      costCents: 3,
      latencyMs: 500,
      toolInvocations: {
        retrieval: 0,
        webSearch: 0,
        finance: 0,
      },
    };

    await emitUsage({
      tenantId: 'tenant1',
      userId: 'user1',
      assistant: 'streamlined_plan',
      metrics,
    });

    expect(recordUsage).not.toHaveBeenCalled();
  });

  it('should respect sampling rate', async () => {
    process.env.USAGE_SAMPLING_RATE = '0.0'; // Sample out 100%
    const { recordUsage } = await import('@kimuntupro/db');

    const metrics: UsageMetric = {
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      costCents: 3,
      latencyMs: 500,
      toolInvocations: {
        retrieval: 0,
        webSearch: 0,
        finance: 0,
      },
    };

    await emitUsage({
      tenantId: 'tenant1',
      userId: 'user1',
      assistant: 'streamlined_plan',
      metrics,
    });

    expect(recordUsage).not.toHaveBeenCalled();
  });

  it('should throw on database error if USAGE_SOFT_FAIL is false', async () => {
    process.env.USAGE_SOFT_FAIL = 'false';
    const { recordUsage } = await import('@kimuntupro/db');
    vi.mocked(recordUsage).mockRejectedValueOnce(new Error('DB error'));

    const metrics: UsageMetric = {
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      costCents: 3,
      latencyMs: 500,
      toolInvocations: {
        retrieval: 0,
        webSearch: 0,
        finance: 0,
      },
    };

    await expect(
      emitUsage({
        tenantId: 'tenant1',
        userId: 'user1',
        assistant: 'streamlined_plan',
        metrics,
      })
    ).rejects.toThrow('DB error');
  });

  it('should not throw on database error if USAGE_SOFT_FAIL is true', async () => {
    process.env.USAGE_SOFT_FAIL = 'true';
    const { recordUsage } = await import('@kimuntupro/db');
    vi.mocked(recordUsage).mockRejectedValueOnce(new Error('DB error'));

    const metrics: UsageMetric = {
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      costCents: 3,
      latencyMs: 500,
      toolInvocations: {
        retrieval: 0,
        webSearch: 0,
        finance: 0,
      },
    };

    // Should not throw
    await expect(
      emitUsage({
        tenantId: 'tenant1',
        userId: 'user1',
        assistant: 'streamlined_plan',
        metrics,
      })
    ).resolves.toBeUndefined();
  });

  it('should call onPersist callback on success', async () => {
    const onPersist = vi.fn();

    const metrics: UsageMetric = {
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      costCents: 3,
      latencyMs: 500,
      toolInvocations: {
        retrieval: 0,
        webSearch: 0,
        finance: 0,
      },
    };

    await emitUsage({
      tenantId: 'tenant1',
      userId: 'user1',
      assistant: 'streamlined_plan',
      metrics,
      onPersist,
    });

    expect(onPersist).toHaveBeenCalledWith(null);
  });

  it('should call onPersist callback with error on failure', async () => {
    process.env.USAGE_SOFT_FAIL = 'true';
    const { recordUsage } = await import('@kimuntupro/db');
    const dbError = new Error('DB error');
    vi.mocked(recordUsage).mockRejectedValueOnce(dbError);

    const onPersist = vi.fn();

    const metrics: UsageMetric = {
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      costCents: 3,
      latencyMs: 500,
      toolInvocations: {
        retrieval: 0,
        webSearch: 0,
        finance: 0,
      },
    };

    await emitUsage({
      tenantId: 'tenant1',
      userId: 'user1',
      assistant: 'streamlined_plan',
      metrics,
      onPersist,
    });

    expect(onPersist).toHaveBeenCalledWith(dbError);
  });
});

describe('estimateUsage', () => {
  it('should estimate tokens conservatively', () => {
    const estimate = estimateUsage({
      model: 'gpt-4o-mini',
      inputLength: 100, // characters
      contextTokens: 1000,
      maxOutputTokens: 4000,
    });

    // Input: 100 * 1.5 = 150, + 1000 context = 1150 input tokens
    // Output: 4000 tokens (max)
    // Total: 5150 tokens
    expect(estimate.estimatedTokens).toBe(5150);
    expect(estimate.estimatedCostCents).toBeGreaterThan(0);
  });

  it('should handle zero context', () => {
    const estimate = estimateUsage({
      model: 'gpt-4o-mini',
      inputLength: 100,
      contextTokens: 0,
      maxOutputTokens: 1000,
    });

    // Input: 100 * 1.5 = 150
    // Output: 1000
    // Total: 1150
    expect(estimate.estimatedTokens).toBe(1150);
  });

  it('should round up input tokens', () => {
    const estimate = estimateUsage({
      model: 'gpt-4o-mini',
      inputLength: 11, // 11 * 1.5 = 16.5, should round up to 17
      contextTokens: 0,
      maxOutputTokens: 100,
    });

    // Ceil(11 * 1.5) + 100 = 17 + 100 = 117
    expect(estimate.estimatedTokens).toBe(117);
  });
});

describe('calcTotalTokens', () => {
  it('should sum input and output tokens', () => {
    expect(calcTotalTokens(100, 50)).toBe(150);
  });

  it('should handle zero tokens', () => {
    expect(calcTotalTokens(0, 0)).toBe(0);
  });
});

describe('formatUsageMetrics', () => {
  it('should format metrics as readable string', () => {
    const metrics: UsageMetric = {
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      costCents: 3,
      latencyMs: 500,
      toolInvocations: {
        retrieval: 0,
        webSearch: 0,
        finance: 0,
      },
    };

    const formatted = formatUsageMetrics(metrics);

    expect(formatted).toContain('gpt-4o-mini');
    expect(formatted).toContain('150 tokens');
    expect(formatted).toContain('$0.0300');
    expect(formatted).toContain('500ms');
  });
});

describe('aggregateUsageMetrics', () => {
  it('should aggregate multiple metrics', () => {
    const metrics1: UsageMetric = {
      model: 'gpt-4o-mini',
      tokensIn: 100,
      tokensOut: 50,
      costCents: 3,
      latencyMs: 500,
      toolInvocations: {
        retrieval: 0,
        webSearch: 0,
        finance: 0,
      },
    };

    const metrics2: UsageMetric = {
      model: 'gpt-4o-mini',
      tokensIn: 200,
      tokensOut: 100,
      costCents: 6,
      latencyMs: 800,
      toolInvocations: {
        retrieval: 0,
        webSearch: 0,
        finance: 0,
      },
    };

    const aggregated = aggregateUsageMetrics([metrics1, metrics2]);

    expect(aggregated).toEqual({
      totalTokensIn: 300,
      totalTokensOut: 150,
      totalCostCents: 9,
      totalLatencyMs: 1300,
      callCount: 2,
    });
  });

  it('should handle empty array', () => {
    const aggregated = aggregateUsageMetrics([]);

    expect(aggregated).toEqual({
      totalTokensIn: 0,
      totalTokensOut: 0,
      totalCostCents: 0,
      totalLatencyMs: 0,
      callCount: 0,
    });
  });
});
