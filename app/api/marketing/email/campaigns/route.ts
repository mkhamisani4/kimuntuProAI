/**
 * GET/POST/PUT/DELETE /api/marketing/email/campaigns
 * Email campaign CRUD — synced between Firestore and Mailchimp
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getMarketingSettings,
  createEmailCampaign,
  listEmailCampaigns,
  updateEmailCampaign,
  deleteEmailCampaign,
  createEmailErrorLog,
} from '@kimuntupro/db';

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
 * GET — List email campaigns from Firestore
 */
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

    const campaigns = await listEmailCampaigns(tenantId, userId);
    return NextResponse.json({ success: true, campaigns }, { status: 200 });
  } catch (error: any) {
    console.error('[API] List email campaigns error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to list campaigns' },
      { status: 500 }
    );
  }
}

/**
 * POST — Create a new email campaign in Mailchimp + Firestore
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { tenantId, userId, title, subject, previewText, segmentId } = body;

    if (!tenantId || !userId || !title || !subject) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'tenantId, userId, title, and subject are required' },
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

    // Create campaign in Mailchimp
    const mcPayload: Record<string, any> = {
      type: 'regular',
      recipients: {
        list_id: settings.mailchimpListId,
      },
      settings: {
        subject_line: subject,
        preview_text: previewText || '',
        title,
        from_name: title,
        reply_to: '', // Will use Mailchimp default
      },
    };

    if (segmentId) {
      mcPayload.recipients.segment_opts = {
        saved_segment_id: parseInt(segmentId, 10),
      };
    }

    let mcData: any;
    try {
      const mcResponse = await mailchimpApi(
        settings.mailchimpServer,
        '/campaigns',
        settings.mailchimpAccessToken,
        { method: 'POST', body: JSON.stringify(mcPayload) }
      );

      if (!mcResponse.ok) {
        const errorText = await mcResponse.text();
        console.error('[API] Mailchimp create campaign error:', errorText);

        await createEmailErrorLog({
          tenantId,
          userId,
          emailCampaignId: '',
          operation: 'create',
          errorCode: String(mcResponse.status),
          errorMessage: errorText,
          requestPayload: mcPayload,
          retryCount: 0,
          maxRetries: 3,
          status: 'pending_retry',
          nextRetryAt: new Date(Date.now() + 60000),
          resolvedAt: null,
        });

        return NextResponse.json(
          { error: 'api_error', message: 'Failed to create campaign in Mailchimp' },
          { status: 502 }
        );
      }

      mcData = await mcResponse.json();
    } catch (err: any) {
      console.error('[API] Mailchimp API call failed:', err);
      return NextResponse.json(
        { error: 'api_error', message: 'Mailchimp API call failed' },
        { status: 502 }
      );
    }

    // Save to Firestore
    const campaignId = await createEmailCampaign({
      tenantId,
      userId,
      mailchimpCampaignId: mcData.id,
      title,
      subject,
      previewText: previewText || '',
      htmlContent: '',
      listId: settings.mailchimpListId,
      segmentId: segmentId || null,
      status: 'draft',
      scheduledAt: null,
      sentAt: null,
      recipientCount: mcData.recipients?.recipient_count || 0,
      stats: { opens: 0, uniqueOpens: 0, clicks: 0, uniqueClicks: 0, bounces: 0, unsubscribes: 0 },
    });

    return NextResponse.json(
      { success: true, campaignId, mailchimpCampaignId: mcData.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Create email campaign error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

/**
 * PUT — Update an email campaign in Mailchimp + Firestore
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { tenantId, userId, campaignId, mailchimpCampaignId, title, subject, previewText } = body;

    if (!tenantId || !userId || !campaignId || !mailchimpCampaignId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'tenantId, userId, campaignId, and mailchimpCampaignId are required' },
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

    // Update in Mailchimp
    const mcPayload: Record<string, any> = { settings: {} };
    if (title) mcPayload.settings.title = title;
    if (subject) mcPayload.settings.subject_line = subject;
    if (previewText !== undefined) mcPayload.settings.preview_text = previewText;

    const mcResponse = await mailchimpApi(
      settings.mailchimpServer,
      `/campaigns/${mailchimpCampaignId}`,
      settings.mailchimpAccessToken,
      { method: 'PATCH', body: JSON.stringify(mcPayload) }
    );

    if (!mcResponse.ok) {
      const errorText = await mcResponse.text();
      console.error('[API] Mailchimp update campaign error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'Failed to update campaign in Mailchimp' },
        { status: 502 }
      );
    }

    // Update Firestore
    const updates: Record<string, any> = {};
    if (title) updates.title = title;
    if (subject) updates.subject = subject;
    if (previewText !== undefined) updates.previewText = previewText;

    await updateEmailCampaign(campaignId, updates);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Update email campaign error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

/**
 * DELETE — Delete campaign from Mailchimp + Firestore
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { tenantId, userId, campaignId, mailchimpCampaignId } = body;

    if (!tenantId || !userId || !campaignId || !mailchimpCampaignId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'tenantId, userId, campaignId, and mailchimpCampaignId are required' },
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

    // Delete from Mailchimp
    const mcResponse = await mailchimpApi(
      settings.mailchimpServer,
      `/campaigns/${mailchimpCampaignId}`,
      settings.mailchimpAccessToken,
      { method: 'DELETE' }
    );

    if (!mcResponse.ok && mcResponse.status !== 404) {
      const errorText = await mcResponse.text();
      console.error('[API] Mailchimp delete campaign error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'Failed to delete campaign from Mailchimp' },
        { status: 502 }
      );
    }

    // Delete from Firestore
    await deleteEmailCampaign(campaignId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Delete email campaign error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
