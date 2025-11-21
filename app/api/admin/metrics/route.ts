/**
 * Admin Metrics API
 * Provides usage analytics and statistics
 *
 * Security: Guarded by ADMIN_METRICS_UNAUTH_DEV flag (dev only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUsageMetrics } from '@kimuntupro/db';

/**
 * GET /api/admin/metrics
 * Returns aggregated usage metrics
 */
export async function GET(req: NextRequest) {
  // Security check
  if (process.env.ADMIN_METRICS_UNAUTH_DEV !== 'true') {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Metrics endpoint is disabled' },
      { status: 403 }
    );
  }

  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId') || undefined;
    const userId = searchParams.get('userId') || undefined;

    // Get all-time metrics
    const allTimeMetrics = await getUsageMetrics({
      tenantId,
      userId,
    });

    // Get last 24 hours metrics
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    const last24hMetrics = await getUsageMetrics({
      tenantId,
      userId,
      since: last24h,
    });

    // Format by assistant for response
    const byAssistant = Object.entries(allTimeMetrics.byAssistant).map(
      ([assistant, metrics]) => ({
        assistant,
        requests: metrics.requests,
        costCents: metrics.costCents,
        tokens: metrics.tokens,
      })
    );

    // Format by tenant (if not filtered)
    const byTenant: Array<{ tenantId: string; requests: number; costCents: number }> = [];
    if (!tenantId) {
      // Would need to aggregate by tenantId - for now empty
      // Can be enhanced with additional Firestore queries
    }

    // Response
    const response = {
      totals: {
        requests: allTimeMetrics.totalRequests,
        costCents: allTimeMetrics.totalCostCents,
        tokensIn: allTimeMetrics.totalTokensIn,
        tokensOut: allTimeMetrics.totalTokensOut,
      },
      byAssistant,
      byTenant,
      last24h: {
        requests: last24hMetrics.totalRequests,
        costCents: last24hMetrics.totalCostCents,
        tokensIn: last24hMetrics.totalTokensIn,
        tokensOut: last24hMetrics.totalTokensOut,
      },
      filters: {
        tenantId: tenantId || 'all',
        userId: userId || 'all',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('[Metrics API] Error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Failed to fetch metrics',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
