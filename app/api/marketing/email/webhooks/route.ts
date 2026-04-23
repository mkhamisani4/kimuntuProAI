/**
 * GET/POST /api/marketing/email/webhooks
 * Mailchimp webhook receiver for email analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getEmailCampaignByMailchimpId,
  createEmailAnalyticsEvent,
  emailAnalyticsEventExists,
  db,
  doc,
  updateDoc,
} from '@kimuntupro/db';
import { increment } from 'firebase/firestore';

type WebhookCampaign = {
  id: string;
  tenantId: string;
  userId: string;
};

/**
 * GET — Mailchimp validation ping
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}

/**
 * POST — Receive webhook events (application/x-www-form-urlencoded)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate webhook secret
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const webhookSecret = process.env.MAILCHIMP_WEBHOOK_SECRET;

    if (webhookSecret && secret !== webhookSecret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }

    // Parse form-urlencoded body
    const formData = await req.formData();
    const type = formData.get('type') as string;
    const firedAt = formData.get('fired_at') as string;

    // Extract data from form fields (Mailchimp uses nested data[key] format)
    const dataEntries: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('data[')) {
        const cleanKey = key.replace(/^data\[/, '').replace(/\]$/, '').replace(/\]\[/g, '.');
        dataEntries[cleanKey] = value as string;
      }
    }

    // Map Mailchimp event types to our types
    const eventTypeMap: Record<string, string> = {
      open: 'open',
      click: 'click',
      hard_bounce: 'bounce',
      soft_bounce: 'bounce',
      unsubscribe: 'unsubscribe',
      spam: 'complaint',
    };

    const eventType = eventTypeMap[type];
    if (!eventType) {
      // Not an event we track
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const email = dataEntries['email'] || dataEntries['merges.EMAIL'] || '';
    const mailchimpCampaignId = dataEntries['id'] || dataEntries['campaign_id'] || '';
    const url = dataEntries['url'] || undefined;

    if (!mailchimpCampaignId || !email) {
      return NextResponse.json({ status: 'missing_data' }, { status: 200 });
    }

    // Look up our campaign
    const campaign = (await getEmailCampaignByMailchimpId(mailchimpCampaignId)) as unknown as WebhookCampaign | null;
    if (!campaign || !campaign.id) {
      console.warn(`[Webhook] Unknown Mailchimp campaign: ${mailchimpCampaignId}`);
      return NextResponse.json({ status: 'unknown_campaign' }, { status: 200 });
    }

    const timestamp = firedAt ? new Date(firedAt) : new Date();

    // Deduplication check
    const exists = await emailAnalyticsEventExists(
      campaign.id,
      eventType,
      email,
      timestamp
    );

    if (exists) {
      return NextResponse.json({ status: 'duplicate' }, { status: 200 });
    }

    // Write analytics event
    await createEmailAnalyticsEvent({
      tenantId: campaign.tenantId,
      userId: campaign.userId,
      emailCampaignId: campaign.id,
      mailchimpCampaignId,
      eventType: eventType as any,
      email,
      url,
      timestamp,
      raw: dataEntries,
    });

    // Increment stats counters on the campaign doc
    const statsField = getStatsField(eventType);
    if (statsField) {
      try {
        const campaignRef = doc(db, 'email_campaigns', campaign.id);
        await updateDoc(campaignRef, {
          [`stats.${statsField}`]: increment(1),
        });
      } catch (err) {
        console.error('[Webhook] Failed to increment stats:', err);
      }
    }

    return NextResponse.json({ status: 'processed' }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook] Email webhook error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

function getStatsField(eventType: string): string | null {
  switch (eventType) {
    case 'open': return 'opens';
    case 'click': return 'clicks';
    case 'bounce': return 'bounces';
    case 'unsubscribe': return 'unsubscribes';
    default: return null;
  }
}
