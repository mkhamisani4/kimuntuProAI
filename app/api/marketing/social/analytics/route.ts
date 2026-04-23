/**
 * POST /api/marketing/social/analytics
 * Proxy to Ayrshare Post Analytics API
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api/requireAuthContext';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await req.json();
    const { ayrshareId } = body;

    if (!ayrshareId || typeof ayrshareId !== 'string') {
      return NextResponse.json(
        { error: 'validation_failed', message: 'ayrshareId is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.AYRSHARE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'config_error', message: 'Ayrshare API key is not configured' },
        { status: 503 }
      );
    }

    const response = await fetch('https://app.ayrshare.com/api/analytics/post', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: ayrshareId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Ayrshare analytics error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'Ayrshare analytics request failed' },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Extract views and clicks from analytics response
    const metrics = {
      views: data.analytics?.impressions ?? data.analytics?.views ?? 0,
      clicks: data.analytics?.clicks ?? data.analytics?.engagements ?? 0,
    };

    return NextResponse.json({ success: true, metrics }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Social analytics error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
