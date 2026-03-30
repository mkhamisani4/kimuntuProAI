/**
 * POST /api/marketing/email/oauth
 * Generate Mailchimp OAuth authorization URL
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const clientId = process.env.MAILCHIMP_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: 'config_error', message: 'Mailchimp client ID is not configured' },
        { status: 503 }
      );
    }

    const redirectUri = process.env.MAILCHIMP_REDIRECT_URI;
    if (!redirectUri) {
      return NextResponse.json(
        { error: 'config_error', message: 'Mailchimp redirect URI is not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { tenantId, userId } = body;

    if (!tenantId || !userId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'tenantId and userId are required' },
        { status: 400 }
      );
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    const state = Buffer.from(JSON.stringify({ tenantId, userId, nonce })).toString('base64');

    const authUrl = `https://login.mailchimp.com/oauth2/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
    }).toString()}`;

    return NextResponse.json({ success: true, authUrl }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Mailchimp OAuth error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to generate OAuth URL' },
      { status: 500 }
    );
  }
}
