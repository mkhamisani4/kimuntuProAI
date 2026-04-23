/**
 * POST /api/marketing/social/connect
 * Generate Ayrshare profile linking URL for OAuth flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api/requireAuthContext';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;

  try {
    const apiKey = process.env.AYRSHARE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'config_error', message: 'Ayrshare API key is not configured' },
        { status: 503 }
      );
    }

    // Generate a profile linking URL via Ayrshare
    const response = await fetch('https://app.ayrshare.com/api/profiles/generateJWT', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Ayrshare connect error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'Failed to generate Ayrshare connect URL' },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      { success: true, profileUrl: data.url || data.profileUrl },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Social connect error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to connect social accounts' },
      { status: 500 }
    );
  }
}
