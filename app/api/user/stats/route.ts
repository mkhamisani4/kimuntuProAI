/**
 * GET /api/user/stats
 * Get user activity statistics (plans, websites, token usage, costs)
 * Uses usage_logs collection for accurate usage tracking (not affected by deletions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api/requireAuthContext';
import { getRecentResults, listWebsites, listLogos, getUsageMetrics } from '@kimuntupro/db';

export const dynamic = 'force-dynamic';

// In-memory cache: uid -> { at, payload }. 5-minute TTL per user.
type CacheEntry = { at: number; payload: any };
const STATS_CACHE_TTL_MS = 5 * 60 * 1000;
const statsCache = new Map<string, CacheEntry>();

function convertLegacyCostToCents(cost: number | undefined): number {
  // Legacy records sometimes stored cost in dollars. Treat < 10 as dollars.
  if (!cost) return 0;
  if (cost < 10) return Math.round(cost * 100);
  return Math.round(cost);
}

async function computeStats(uid: string) {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [thisMonthUsage, allTimeUsage, assistantResults, websites, logos] = await Promise.all([
    getUsageMetrics({ tenantId: uid, userId: uid, since: firstDayOfMonth }).catch(() => ({
      totalRequests: 0,
      totalCostCents: 0,
      totalTokensIn: 0,
      totalTokensOut: 0,
      byAssistant: {},
    })),
    getUsageMetrics({ tenantId: uid, userId: uid }).catch(() => ({
      totalRequests: 0,
      totalCostCents: 0,
      totalTokensIn: 0,
      totalTokensOut: 0,
      byAssistant: {},
    })),
    getRecentResults(uid, 1000).catch(() => []),
    listWebsites(uid, uid, 1000).catch(() => []),
    listLogos(uid, uid, 1000).catch(() => []),
  ]);

  const thisMonthResults = assistantResults.filter((r) => r.createdAt && r.createdAt >= firstDayOfMonth);
  const thisMonthWebsites = websites.filter((w) => w.createdAt && w.createdAt >= firstDayOfMonth);
  const thisMonthLogos = logos.filter((l) => l.createdAt && l.createdAt >= firstDayOfMonth);

  let tokensUsedThisMonth = thisMonthUsage.totalTokensIn + thisMonthUsage.totalTokensOut;
  let tokensUsedAllTime = allTimeUsage.totalTokensIn + allTimeUsage.totalTokensOut;
  let costThisMonth = thisMonthUsage.totalCostCents;
  let costAllTime = allTimeUsage.totalCostCents;

  // Fallback to metadata for legacy data (usage_logs empty but older generations exist).
  if (tokensUsedAllTime === 0 && (assistantResults.length > 0 || websites.length > 0 || logos.length > 0)) {
    const sumTokens = (items: any[], key: string) =>
      items.reduce((sum, it) => sum + (it[key]?.tokensUsed || 0), 0);

    tokensUsedThisMonth =
      sumTokens(thisMonthResults, 'metadata') +
      sumTokens(thisMonthWebsites, 'generationMetadata') +
      sumTokens(thisMonthLogos, 'generationMetadata');

    tokensUsedAllTime =
      sumTokens(assistantResults, 'metadata') +
      sumTokens(websites, 'generationMetadata') +
      sumTokens(logos, 'generationMetadata');

    const thisMonthCostCents =
      thisMonthResults.reduce((s, r) => s + convertLegacyCostToCents(r.metadata?.cost), 0) +
      thisMonthWebsites.reduce((s, w) => s + (w.generationMetadata?.costCents || 0), 0) +
      thisMonthLogos.reduce((s, l) => s + (l.generationMetadata?.costCents || 0), 0);

    const allTimeCostCents =
      assistantResults.reduce((s, r) => s + convertLegacyCostToCents(r.metadata?.cost), 0) +
      websites.reduce((s, w) => s + (w.generationMetadata?.costCents || 0), 0) +
      logos.reduce((s, l) => s + (l.generationMetadata?.costCents || 0), 0);

    if (allTimeCostCents > 0) {
      costThisMonth = thisMonthCostCents;
      costAllTime = allTimeCostCents;
    } else {
      // Last resort: estimate from tokens at $10/M.
      const estimate = (tokens: number) => Math.round(tokens * (10 / 1_000_000) * 100);
      costThisMonth = estimate(tokensUsedThisMonth);
      costAllTime = estimate(tokensUsedAllTime);
    }
  }

  return {
    thisMonth: {
      plansGenerated: thisMonthResults.length,
      websitesBuilt: thisMonthWebsites.filter((w) => w.status === 'ready').length,
      logosCreated: thisMonthLogos.length,
      tokensUsed: tokensUsedThisMonth,
      costCents: costThisMonth,
    },
    allTime: {
      totalPlans: assistantResults.length,
      totalWebsites: websites.filter((w) => w.status === 'ready').length,
      totalLogos: logos.length,
      primaryLogos: logos.filter((l) => l.isPrimary).length,
      tokensUsed: tokensUsedAllTime,
      costCents: costAllTime,
    },
    quota: {
      used: Math.min(100, Math.floor(((tokensUsedThisMonth || tokensUsedAllTime) / 1_000_000) * 100)),
      limit: 100,
      resetsAt: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    },
  };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;
  const { uid } = authResult.auth;

  try {
    const cached = statsCache.get(uid);
    if (cached && Date.now() - cached.at < STATS_CACHE_TTL_MS) {
      return NextResponse.json({ success: true, stats: cached.payload, cached: true }, { status: 200 });
    }

    const stats = await computeStats(uid);
    statsCache.set(uid, { at: Date.now(), payload: stats });

    return NextResponse.json({ success: true, stats }, { status: 200 });
  } catch (error: any) {
    console.error('[Stats API] error:', error?.message);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to get user statistics',
      },
      { status: 500 }
    );
  }
}
