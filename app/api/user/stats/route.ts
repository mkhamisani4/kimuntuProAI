/**
 * GET /api/user/stats
 * Get user activity statistics (plans, websites, token usage, costs)
 * Uses usage_logs collection for accurate usage tracking (not affected by deletions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecentResults, listWebsites, getUsageMetrics } from '@kimuntupro/db';

/**
 * GET handler - Get user statistics
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const userId = searchParams.get('userId') || undefined;

    console.log('[Stats API] Request received:', { tenantId, userId, url: req.url });

    // Validate required parameters
    if (!tenantId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'tenantId query parameter is required' },
        { status: 400 }
      );
    }

    // Calculate this month's date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch usage metrics from usage_logs collection (not affected by deletions)
    const [thisMonthUsage, allTimeUsage, assistantResults, websites] = await Promise.all([
      getUsageMetrics({ tenantId, userId, since: firstDayOfMonth }).catch((err) => {
        console.warn('[Stats API] Failed to fetch this month usage:', err);
        return {
          totalRequests: 0,
          totalCostCents: 0,
          totalTokensIn: 0,
          totalTokensOut: 0,
          byAssistant: {}
        };
      }),
      getUsageMetrics({ tenantId, userId }).catch((err) => {
        console.warn('[Stats API] Failed to fetch all time usage:', err);
        return {
          totalRequests: 0,
          totalCostCents: 0,
          totalTokensIn: 0,
          totalTokensOut: 0,
          byAssistant: {}
        };
      }),
      getRecentResults(tenantId, 1000).catch((err) => {
        console.warn('[Stats API] Failed to fetch results:', err);
        return [];
      }),
      userId ? listWebsites(tenantId, userId, 1000).catch((err) => {
        console.warn('[Stats API] Failed to fetch websites:', err);
        return [];
      }) : Promise.resolve([])
    ]);

    console.log('[Stats API] Raw data fetched:', {
      assistantResults: {
        count: assistantResults.length,
        sample: assistantResults.slice(0, 2).map(r => ({
          id: r.id,
          assistant: r.assistant,
          createdAt: r.createdAt,
          hasMetadata: !!r.metadata,
          tokensUsed: r.metadata?.tokensUsed
        }))
      },
      websites: {
        count: websites.length,
        sample: websites.slice(0, 2).map(w => ({
          id: w.id,
          status: w.status,
          createdAt: w.createdAt,
          hasMetadata: !!w.generationMetadata,
          tokensUsed: w.generationMetadata?.tokensUsed
        }))
      },
      usageLogs: {
        thisMonth: {
          requests: thisMonthUsage.totalRequests,
          tokens: thisMonthUsage.totalTokensIn + thisMonthUsage.totalTokensOut,
          cost: thisMonthUsage.totalCostCents
        },
        allTime: {
          requests: allTimeUsage.totalRequests,
          tokens: allTimeUsage.totalTokensIn + allTimeUsage.totalTokensOut,
          cost: allTimeUsage.totalCostCents
        }
      }
    });

    // Filter results by this month (for counting outputs, not usage)
    const thisMonthResults = assistantResults.filter(r =>
      r.createdAt && r.createdAt >= firstDayOfMonth
    );
    const thisMonthWebsites = websites.filter(w =>
      w.createdAt && w.createdAt >= firstDayOfMonth
    );

    // Calculate tokens from usage logs (these won't decrease when results are deleted)
    // FALLBACK: If usage_logs is empty (legacy data), calculate from metadata
    let tokensUsedThisMonth = thisMonthUsage.totalTokensIn + thisMonthUsage.totalTokensOut;
    let tokensUsedAllTime = allTimeUsage.totalTokensIn + allTimeUsage.totalTokensOut;
    let costThisMonth = thisMonthUsage.totalCostCents;
    let costAllTime = allTimeUsage.totalCostCents;

    // Fallback to metadata if usage_logs is empty (for backward compatibility)
    if (tokensUsedAllTime === 0 && (assistantResults.length > 0 || websites.length > 0)) {
      console.log('[Stats API] No usage_logs data found, falling back to metadata calculation');

      // Helper to safely convert cost to cents (handles both dollars and cents)
      const convertToCents = (cost: number | undefined, fieldName: string): number => {
        if (!cost) return 0;

        // If cost is < 1, it's likely in dollars (e.g., 0.15 dollars)
        // If cost is >= 10, it's likely already in cents (e.g., 15 cents)
        // Edge case: 1-9 could be either $1-9 or 1-9 cents
        // We'll assume values < 10 are in dollars to be safe
        if (cost < 10) {
          // Assume dollars, convert to cents
          return Math.round(cost * 100);
        } else {
          // Assume already in cents
          return Math.round(cost);
        }
      };

      // Calculate tokens from metadata (legacy method)
      const thisMonthTokensFromMetadata = [
        ...thisMonthResults.map(r => r.metadata?.tokensUsed || 0),
        ...thisMonthWebsites.map(w => w.generationMetadata?.tokensUsed || 0)
      ].reduce((sum, tokens) => sum + tokens, 0);

      const allTimeTokensFromMetadata = [
        ...assistantResults.map(r => r.metadata?.tokensUsed || 0),
        ...websites.map(w => w.generationMetadata?.tokensUsed || 0)
      ].reduce((sum, tokens) => sum + tokens, 0);

      // Check if costs are stored in metadata
      // For assistant results: metadata.cost is in dollars, convert to cents
      // For websites: generationMetadata.costCents is already in cents
      const thisMonthCostsFromMetadata = [
        ...thisMonthResults.map(r => convertToCents(r.metadata?.cost, 'result.metadata.cost')),
        ...thisMonthWebsites.map(w => w.generationMetadata?.costCents || 0)
      ].reduce((sum, cost) => sum + cost, 0);

      const allTimeCostsFromMetadata = [
        ...assistantResults.map(r => convertToCents(r.metadata?.cost, 'result.metadata.cost')),
        ...websites.map(w => w.generationMetadata?.costCents || 0)
      ].reduce((sum, cost) => sum + cost, 0);

      console.log('[Stats API] Metadata details:', {
        results: assistantResults.map(r => ({
          id: r.id,
          tokens: r.metadata?.tokensUsed,
          costRaw: r.metadata?.cost,
          costCentsConverted: convertToCents(r.metadata?.cost, 'result.metadata.cost')
        })),
        websites: websites.map(w => ({
          id: w.id,
          tokens: w.generationMetadata?.tokensUsed,
          costCents: w.generationMetadata?.costCents
        }))
      });

      tokensUsedThisMonth = thisMonthTokensFromMetadata;
      tokensUsedAllTime = allTimeTokensFromMetadata;

      // Use stored costs if available, otherwise calculate
      if (allTimeCostsFromMetadata > 0) {
        costThisMonth = thisMonthCostsFromMetadata;
        costAllTime = allTimeCostsFromMetadata;
        console.log('[Stats API] Using stored costs from metadata:', {
          thisMonthCost: costThisMonth,
          allTimeCost: costAllTime
        });
      } else {
        // Calculate costs (using simplified $10/M average)
        const calculateCostCents = (tokens: number) => Math.round(tokens * (10 / 1_000_000) * 100);
        costThisMonth = calculateCostCents(thisMonthTokensFromMetadata);
        costAllTime = calculateCostCents(allTimeTokensFromMetadata);
        console.log('[Stats API] Calculated costs from tokens:', {
          thisMonthCost: costThisMonth,
          allTimeCost: costAllTime
        });
      }

      console.log('[Stats API] Using metadata fallback:', {
        thisMonthTokens: tokensUsedThisMonth,
        allTimeTokens: tokensUsedAllTime,
        thisMonthCost: costThisMonth,
        allTimeCost: costAllTime
      });
    }

    // Build response (usage metrics from usage_logs with metadata fallback, counts from results/websites)
    const stats = {
      thisMonth: {
        plansGenerated: thisMonthResults.length,
        websitesBuilt: thisMonthWebsites.filter(w => w.status === 'ready').length,
        tokensUsed: tokensUsedThisMonth,
        costCents: costThisMonth
      },
      allTime: {
        totalPlans: assistantResults.length,
        totalWebsites: websites.filter(w => w.status === 'ready').length,
        tokensUsed: tokensUsedAllTime,
        costCents: costAllTime
      },
      quota: {
        // Use all-time tokens if this month is 0 (index not ready yet)
        used: Math.min(100, Math.floor(((tokensUsedThisMonth || tokensUsedAllTime) / 1_000_000) * 100)),
        limit: 100,
        resetsAt: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
      }
    };

    return NextResponse.json({ success: true, stats }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Get user stats error:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to get user statistics',
      },
      { status: 500 }
    );
  }
}
