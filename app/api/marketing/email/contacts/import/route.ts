/**
 * POST/GET /api/marketing/email/contacts/import
 * Bulk import contacts via Mailchimp batch API
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api/requireAuthContext';
import { getMarketingSettings } from '@kimuntupro/db';

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
 * POST — Bulk import contacts via batch API
 * Expects { tenantId, userId, contacts: [{ email, firstName?, lastName?, tags? }] }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;
  const { uid } = authResult.auth;

  try {
    const body = await req.json();
    const { contacts } = body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'contacts array is required' },
        { status: 400 }
      );
    }

    // Validate minimum schema: every row must have an email column.
    const rowsMissingEmail = contacts
      .map((c: any, i: number) => ({ i, has: typeof c?.email === 'string' && c.email.trim().length > 0 }))
      .filter((r) => !r.has);
    if (rowsMissingEmail.length > 0) {
      return NextResponse.json(
        {
          error: 'invalid_schema',
          message: `Missing required "email" column on ${rowsMissingEmail.length} row(s). First offending row index: ${rowsMissingEmail[0].i}.`,
        },
        { status: 400 }
      );
    }

    const settings = await getMarketingSettings(uid, uid);
    if (!settings?.mailchimpAccessToken || !settings?.mailchimpServer || !settings?.mailchimpListId) {
      return NextResponse.json(
        { error: 'not_connected', message: 'Mailchimp is not connected or no audience selected' },
        { status: 400 }
      );
    }

    // Build batch operations
    const operations = contacts.map((contact: any, index: number) => {
      const memberData: Record<string, any> = {
        email_address: contact.email,
        status: 'subscribed',
      };

      if (contact.firstName || contact.lastName) {
        memberData.merge_fields = {};
        if (contact.firstName) memberData.merge_fields.FNAME = contact.firstName;
        if (contact.lastName) memberData.merge_fields.LNAME = contact.lastName;
      }

      return {
        method: 'POST',
        path: `/lists/${settings.mailchimpListId}/members`,
        operation_id: `import_${index}`,
        body: JSON.stringify(memberData),
      };
    });

    const response = await mailchimpApi(
      settings.mailchimpServer,
      '/batches',
      settings.mailchimpAccessToken,
      {
        method: 'POST',
        body: JSON.stringify({ operations }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Mailchimp batch import error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'Failed to start batch import' },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { success: true, batchId: data.id, status: data.status },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Batch import error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to import contacts' },
      { status: 500 }
    );
  }
}

/**
 * GET — Poll batch status
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;
  const { uid } = authResult.auth;

  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'batchId is required' },
        { status: 400 }
      );
    }

    const settings = await getMarketingSettings(uid, uid);
    if (!settings?.mailchimpAccessToken || !settings?.mailchimpServer) {
      return NextResponse.json(
        { error: 'not_connected', message: 'Mailchimp is not connected' },
        { status: 400 }
      );
    }

    const response = await mailchimpApi(
      settings.mailchimpServer,
      `/batches/${batchId}`,
      settings.mailchimpAccessToken
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Mailchimp batch status error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'Failed to get batch status' },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      batchId: data.id,
      status: data.status,
      totalOperations: data.total_operations,
      finishedOperations: data.finished_operations,
      erroredOperations: data.errored_operations,
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Batch status error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to check batch status' },
      { status: 500 }
    );
  }
}
