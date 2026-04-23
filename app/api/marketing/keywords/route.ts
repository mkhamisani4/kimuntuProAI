/**
 * POST /api/marketing/keywords
 * Proxy to DataForSEO Keyword Suggestions API
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api/requireAuthContext';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await req.json();
    const { keyword, location } = body;

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { error: 'validation_failed', message: 'keyword is required' },
        { status: 400 }
      );
    }

    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;

    if (!login || !password) {
      return NextResponse.json(
        { error: 'config_error', message: 'DataForSEO credentials are not configured' },
        { status: 503 }
      );
    }

    const credentials = Buffer.from(`${login}:${password}`).toString('base64');

    const response = await fetch(
      'https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_suggestions/live',
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            keyword,
            location_name: location || 'United States',
            language_name: 'English',
            limit: 20,
          },
        ]),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] DataForSEO error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'DataForSEO API request failed' },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Extract and map results
    const items = data?.tasks?.[0]?.result?.[0]?.items || [];
    const keywords = items.map((item: any) => ({
      keyword: item.keyword,
      search_volume: item.keyword_info?.search_volume ?? 0,
      cpc: item.keyword_info?.cpc ?? 0,
      keyword_difficulty: item.keyword_properties?.keyword_difficulty ?? 0,
    }));

    return NextResponse.json({ success: true, keywords }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Keywords error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to fetch keywords' },
      { status: 500 }
    );
  }
}
