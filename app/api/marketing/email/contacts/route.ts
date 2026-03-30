/**
 * GET/POST/DELETE /api/marketing/email/contacts
 * Manage Mailchimp audience contacts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMarketingSettings } from '@kimuntupro/db';
import crypto from 'crypto';

function mailchimpApi(server: string, path: string, token: string, options: RequestInit = {}) {
  return fetch(`https://${server}.api.mailchimp.com/3.0${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

/**
 * GET — List audience members
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const userId = searchParams.get('userId');
    const offset = searchParams.get('offset') || '0';
    const count = searchParams.get('count') || '20';

    if (!tenantId || !userId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'tenantId and userId are required' },
        { status: 400 }
      );
    }

    const settings = await getMarketingSettings(tenantId, userId);
    if (!settings?.mailchimpAccessToken || !settings?.mailchimpServer || !settings?.mailchimpListId) {
      return NextResponse.json(
        { error: 'not_connected', message: 'Mailchimp is not connected or no audience selected' },
        { status: 400 }
      );
    }

    const response = await mailchimpApi(
      settings.mailchimpServer,
      `/lists/${settings.mailchimpListId}/members?offset=${offset}&count=${count}`,
      settings.mailchimpAccessToken
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Mailchimp list members error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'Failed to fetch contacts' },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Contacts list error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to list contacts' },
      { status: 500 }
    );
  }
}

/**
 * POST — Add a contact
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { tenantId, userId, email, firstName, lastName, tags } = body;

    if (!tenantId || !userId || !email) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'tenantId, userId, and email are required' },
        { status: 400 }
      );
    }

    const settings = await getMarketingSettings(tenantId, userId);
    if (!settings?.mailchimpAccessToken || !settings?.mailchimpServer || !settings?.mailchimpListId) {
      return NextResponse.json(
        { error: 'not_connected', message: 'Mailchimp is not connected or no audience selected' },
        { status: 400 }
      );
    }

    const memberData: Record<string, any> = {
      email_address: email,
      status: 'subscribed',
    };

    if (firstName || lastName) {
      memberData.merge_fields = {};
      if (firstName) memberData.merge_fields.FNAME = firstName;
      if (lastName) memberData.merge_fields.LNAME = lastName;
    }

    if (tags && Array.isArray(tags)) {
      memberData.tags = tags;
    }

    const response = await mailchimpApi(
      settings.mailchimpServer,
      `/lists/${settings.mailchimpListId}/members`,
      settings.mailchimpAccessToken,
      {
        method: 'POST',
        body: JSON.stringify(memberData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Mailchimp add member error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'Failed to add contact' },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Contact add error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to add contact' },
      { status: 500 }
    );
  }
}

/**
 * DELETE — Archive a contact
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { tenantId, userId, email } = body;

    if (!tenantId || !userId || !email) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'tenantId, userId, and email are required' },
        { status: 400 }
      );
    }

    const settings = await getMarketingSettings(tenantId, userId);
    if (!settings?.mailchimpAccessToken || !settings?.mailchimpServer || !settings?.mailchimpListId) {
      return NextResponse.json(
        { error: 'not_connected', message: 'Mailchimp is not connected' },
        { status: 400 }
      );
    }

    const subscriberHash = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');

    const response = await mailchimpApi(
      settings.mailchimpServer,
      `/lists/${settings.mailchimpListId}/members/${subscriberHash}`,
      settings.mailchimpAccessToken,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Mailchimp archive member error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'Failed to archive contact' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Contact delete error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to archive contact' },
      { status: 500 }
    );
  }
}
