/**
 * GET /api/marketing/email/audiences
 * Fetch Mailchimp audiences (server-side proxy to avoid CORS)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMarketingSettings } from '@kimuntupro/db';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const userId = searchParams.get('userId');

    if (!tenantId || !userId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'tenantId and userId are required' },
        { status: 400 }
      );
    }

    const settings = await getMarketingSettings(tenantId, userId);
    if (!settings?.mailchimpAccessToken || !settings?.mailchimpServer) {
      return NextResponse.json(
        { error: 'not_connected', message: 'Mailchimp is not connected' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://${settings.mailchimpServer}.api.mailchimp.com/3.0/lists?count=100`,
      { headers: { Authorization: `Bearer ${settings.mailchimpAccessToken}` } }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Mailchimp audiences error:', errorText);
      return NextResponse.json(
        { error: 'mailchimp_error', message: 'Failed to fetch audiences' },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ lists: data.lists || [] }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Audiences error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to fetch audiences' },
      { status: 500 }
    );
  }
}
