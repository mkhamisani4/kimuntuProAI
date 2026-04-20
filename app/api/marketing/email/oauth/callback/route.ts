/**
 * GET /api/marketing/email/oauth/callback
 * Mailchimp OAuth callback — exchanges code for access token
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateMarketingSettings } from '@kimuntupro/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');

    if (!code || !stateParam) {
      return NextResponse.redirect(
        new URL('/dashboard/business/marketing/email?error=missing_params', req.url)
      );
    }

    // Decode state
    let tenantId: string;
    let userId: string;
    try {
      const state = JSON.parse(Buffer.from(stateParam, 'base64').toString());
      tenantId = state.tenantId;
      userId = state.userId;
    } catch {
      return NextResponse.redirect(
        new URL('/dashboard/business/marketing/email?error=invalid_state', req.url)
      );
    }

    const clientId = process.env.MAILCHIMP_CLIENT_ID;
    const clientSecret = process.env.MAILCHIMP_CLIENT_SECRET;
    const redirectUri = process.env.MAILCHIMP_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.redirect(
        new URL('/dashboard/business/marketing/email?error=config_error', req.url)
      );
    }

    // Use localhost for post-OAuth redirects so the rest of the app
    // (Firebase Auth, etc.) stays on the localhost origin.
    // The redirect URI itself uses 127.0.0.1 to satisfy Mailchimp's requirement,
    // but both resolve to the same dev server.
    const baseUrl = 'http://localhost:3000';

    // Exchange code for access token
    const tokenResponse = await fetch('https://login.mailchimp.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[API] Mailchimp token exchange failed:', errorText);
      return NextResponse.redirect(
        new URL('/dashboard/business/marketing/email?error=token_exchange_failed', baseUrl)
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch data center from metadata endpoint
    const metadataResponse = await fetch('https://login.mailchimp.com/oauth2/metadata', {
      headers: { Authorization: `OAuth ${accessToken}` },
    });

    if (!metadataResponse.ok) {
      console.error('[API] Mailchimp metadata fetch failed');
      return NextResponse.redirect(
        new URL('/dashboard/business/marketing/email?error=metadata_failed', baseUrl)
      );
    }

    const metadata = await metadataResponse.json();
    const server = metadata.dc; // e.g. "us21"

    // Store token and default sender info in marketing settings
    await updateMarketingSettings(tenantId, userId, {
      mailchimpAccessToken: accessToken,
      mailchimpServer: server,
      mailchimpReplyTo: metadata.login?.email || null,
      mailchimpFromName: metadata.accountname || null,
    });

    console.log(`[API] Mailchimp OAuth complete for tenant ${tenantId}, server: ${server}`);

    return NextResponse.redirect(
      new URL('/dashboard/business/marketing/email?connected=true', baseUrl)
    );
  } catch (error: any) {
    console.error('[API] Mailchimp OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/business/marketing/email?error=internal_error', req.url)
    );
  }
}
