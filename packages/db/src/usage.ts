/**
 * Usage Tracking Database Functions
 * Handles usage log persistence and aggregations for quotas and analytics
 */

import { prisma } from './index.js';
import type { Prisma } from '@prisma/client';

/**
 * Usage row for insertion
 */
export interface UsageRow {
  tenantId: string;
  userId: string;
  assistant: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  costCents: number;
  latencyMs: number;
  toolInvocations: {
    retrieval?: number;
    webSearch?: number;
    finance?: number;
  };
  requestId?: string;
  meta?: Record<string, any>;
}

/**
 * Record a usage event in the database
 *
 * @param row - Usage row to record
 * @returns Promise resolving when recorded
 */
export async function recordUsage(row: UsageRow): Promise<void> {
  try {
    await prisma.usageLog.create({
      data: {
        tenantId: row.tenantId,
        userId: row.userId,
        assistantType: row.assistant,
        model: row.model,
        tokensIn: row.tokensIn,
        tokensOut: row.tokensOut,
        costCents: row.costCents,
        latencyMs: row.latencyMs,
        toolInvocations: row.toolInvocations as Prisma.JsonObject,
      },
    });
  } catch (error: any) {
    console.error('Failed to record usage:', error);
    throw error;
  }
}

/**
 * Sum tokens by user since a given time
 *
 * @param params - Query parameters
 * @returns Total tokens used by user
 */
export async function sumTokensByUser(params: {
  userId: string;
  since: Date;
}): Promise<number> {
  const result = await prisma.$queryRaw<Array<{ total: bigint }>>`
    SELECT COALESCE(SUM("tokensIn" + "tokensOut"), 0) as total
    FROM "usage_logs"
    WHERE "userId" = ${params.userId}
      AND "createdAt" >= ${params.since}
  `;

  if (result.length === 0) {
    return 0;
  }

  // Convert bigint to number
  return Number(result[0].total);
}

/**
 * Sum tokens by tenant since a given time
 *
 * @param params - Query parameters
 * @returns Total tokens used by tenant
 */
export async function sumTokensByTenant(params: {
  tenantId: string;
  since: Date;
}): Promise<number> {
  const result = await prisma.$queryRaw<Array<{ total: bigint }>>`
    SELECT COALESCE(SUM("tokensIn" + "tokensOut"), 0) as total
    FROM "usage_logs"
    WHERE "tenantId" = ${params.tenantId}
      AND "createdAt" >= ${params.since}
  `;

  if (result.length === 0) {
    return 0;
  }

  // Convert bigint to number
  return Number(result[0].total);
}

/**
 * Aggregate stats by assistant type for analytics
 *
 * @param params - Query parameters
 * @returns Array of assistant stats
 */
export async function recentUsageByAssistant(params: {
  tenantId: string;
  days: number;
}): Promise<
  Array<{
    assistant: string;
    calls: number;
    tokens: number;
    cost_cents: number;
  }>
> {
  const since = new Date();
  since.setDate(since.getDate() - params.days);

  const result = await prisma.$queryRaw<
    Array<{
      assistant: string;
      calls: bigint;
      tokens: bigint;
      cost_cents: bigint;
    }>
  >`
    SELECT
      COALESCE("assistantType", 'unknown') as assistant,
      COUNT(*) as calls,
      COALESCE(SUM("tokensIn" + "tokensOut"), 0) as tokens,
      COALESCE(SUM("costCents"), 0) as cost_cents
    FROM "usage_logs"
    WHERE "tenantId" = ${params.tenantId}
      AND "createdAt" >= ${since}
    GROUP BY "assistantType"
    ORDER BY calls DESC
  `;

  // Convert bigints to numbers
  return result.map((row) => ({
    assistant: row.assistant,
    calls: Number(row.calls),
    tokens: Number(row.tokens),
    cost_cents: Number(row.cost_cents),
  }));
}

/**
 * Delete old usage logs before a given date
 * Used for data retention policies
 *
 * @param params - Query parameters
 * @returns Number of rows deleted
 */
export async function purgeOldUsage(params: { before: Date }): Promise<number> {
  const result = await prisma.usageLog.deleteMany({
    where: {
      createdAt: {
        lt: params.before,
      },
    },
  });

  return result.count;
}

/**
 * Get usage stats for a specific user
 *
 * @param params - Query parameters
 * @returns Usage stats
 */
export async function getUserUsageStats(params: {
  userId: string;
  since: Date;
}): Promise<{
  totalTokens: number;
  totalCostCents: number;
  callCount: number;
}> {
  const result = await prisma.$queryRaw<
    Array<{
      total_tokens: bigint;
      total_cost: bigint;
      call_count: bigint;
    }>
  >`
    SELECT
      COALESCE(SUM("tokensIn" + "tokensOut"), 0) as total_tokens,
      COALESCE(SUM("costCents"), 0) as total_cost,
      COUNT(*) as call_count
    FROM "usage_logs"
    WHERE "userId" = ${params.userId}
      AND "createdAt" >= ${params.since}
  `;

  if (result.length === 0) {
    return {
      totalTokens: 0,
      totalCostCents: 0,
      callCount: 0,
    };
  }

  return {
    totalTokens: Number(result[0].total_tokens),
    totalCostCents: Number(result[0].total_cost),
    callCount: Number(result[0].call_count),
  };
}

/**
 * Get usage stats for a specific tenant
 *
 * @param params - Query parameters
 * @returns Usage stats
 */
export async function getTenantUsageStats(params: {
  tenantId: string;
  since: Date;
}): Promise<{
  totalTokens: number;
  totalCostCents: number;
  callCount: number;
}> {
  const result = await prisma.$queryRaw<
    Array<{
      total_tokens: bigint;
      total_cost: bigint;
      call_count: bigint;
    }>
  >`
    SELECT
      COALESCE(SUM("tokensIn" + "tokensOut"), 0) as total_tokens,
      COALESCE(SUM("costCents"), 0) as total_cost,
      COUNT(*) as call_count
    FROM "usage_logs"
    WHERE "tenantId" = ${params.tenantId}
      AND "createdAt" >= ${params.since}
  `;

  if (result.length === 0) {
    return {
      totalTokens: 0,
      totalCostCents: 0,
      callCount: 0,
    };
  }

  return {
    totalTokens: Number(result[0].total_tokens),
    totalCostCents: Number(result[0].total_cost),
    callCount: Number(result[0].call_count),
  };
}
