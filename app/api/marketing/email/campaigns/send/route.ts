/**
 * POST /api/marketing/email/campaigns/send
 * Send or schedule an email campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getMarketingSettings,
  updateEmailCampaign,
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { tenantId, userId, campaignId, mailchimpCampaignId, scheduleAt } = body;

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

    let action: string;
    let mcBody: string | undefined;

    if (scheduleAt) {
      // Schedule campaign
      action = 'schedule';
      const scheduleDate = new Date(scheduleAt);
      mcBody = JSON.stringify({ schedule_time: scheduleDate.toISOString() });
    } else {
      // Send immediately
      action = 'send';
    }

    const mcResponse = await mailchimpApi(
      settings.mailchimpServer,
      `/campaigns/${mailchimpCampaignId}/actions/${action}`,
      settings.mailchimpAccessToken,
      {
        method: 'POST',
        ...(mcBody ? { body: mcBody } : {}),
      }
    );

    if (!mcResponse.ok) {
      const errorText = await mcResponse.text();
      console.error(`[API] Mailchimp ${action} campaign error:`, errorText);

      await createEmailErrorLog({
        tenantId,
        userId,
        emailCampaignId: campaignId,
        operation: action === 'send' ? 'send' : 'schedule',
        errorCode: String(mcResponse.status),
        errorMessage: errorText,
        requestPayload: { mailchimpCampaignId, scheduleAt },
        retryCount: 0,
        maxRetries: 3,
        status: 'pending_retry',
        nextRetryAt: new Date(Date.now() + 60000),
        resolvedAt: null,
      });

      return NextResponse.json(
        { error: 'api_error', message: `Failed to ${action} campaign` },
        { status: 502 }
      );
    }

    // Update Firestore
    if (scheduleAt) {
      await updateEmailCampaign(campaignId, {
        status: 'scheduled',
        scheduledAt: new Date(scheduleAt),
      });
    } else {
      await updateEmailCampaign(campaignId, {
        status: 'sent',
        sentAt: new Date(),
      });
    }

    return NextResponse.json(
      { success: true, action },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Send/schedule campaign error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to send/schedule campaign' },
      { status: 500 }
    );
  }
}
