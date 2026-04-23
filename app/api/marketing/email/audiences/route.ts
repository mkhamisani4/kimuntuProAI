/**
 * GET /api/marketing/email/audiences
 * Fetch Mailchimp audiences (server-side proxy to avoid CORS)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api/requireAuthContext';
import { getMarketingSettings } from '@kimuntupro/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;
  const { uid } = authResult.auth;

  try {
    const settings = await getMarketingSettings(uid, uid);
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
