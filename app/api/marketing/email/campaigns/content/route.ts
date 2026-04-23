/**
 * POST/PUT /api/marketing/email/campaigns/content
 * AI-generate email HTML content + set content in Mailchimp
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api/requireAuthContext';
import {
  getMarketingSettings,
  updateEmailCampaign,
} from '@kimuntupro/db';
import Anthropic from '@anthropic-ai/sdk';

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
 * POST — AI-generate email HTML content
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await req.json();
    const { subject, goal, tone, generateSubjectLines } = body;

    if (!goal) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'goal is required' },
        { status: 400 }
      );
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json(
        { error: 'config_error', message: 'Anthropic API key is not configured' },
        { status: 503 }
      );
    }

    const client = new Anthropic({ apiKey: anthropicKey });

    let systemPrompt: string;
    let userPrompt: string;
    let maxTokens: number;

    if (generateSubjectLines) {
      systemPrompt = 'You are an email marketing copywriter. Generate compelling email subject lines. Return a JSON array of 5 subject line strings. Each should be under 60 characters, compelling, and relevant to the campaign goal.';
      userPrompt = `Campaign goal: ${goal}\n${tone ? `Tone: ${tone}` : ''}\n\nGenerate 5 email subject line options.`;
      maxTokens = 300;
    } else {
      systemPrompt = `You are an expert email marketing copywriter. Generate a complete HTML email template that is:
- Mobile-responsive with inline CSS
- Clean, modern design with a single-column layout
- Uses a professional color scheme
- Includes a clear call-to-action button
- Has proper HTML email structure (table-based layout for email client compatibility)
- Does NOT include <html>, <head>, or <body> tags (Mailchimp adds these)
Return ONLY the HTML content, no markdown code blocks.`;
      userPrompt = `Subject: ${subject || 'N/A'}\nCampaign goal: ${goal}\n${tone ? `Tone: ${tone}` : 'Tone: professional'}\n\nGenerate the email HTML content.`;
      maxTokens = 2000;
    }

    const aiResponse = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
      ],
    });

    const content = aiResponse.content[0]?.type === 'text' ? aiResponse.content[0].text : '';

    if (generateSubjectLines) {
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const subjectLines = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
        return NextResponse.json({ success: true, subjectLines }, { status: 200 });
      } catch {
        return NextResponse.json(
          { error: 'parse_error', message: 'Failed to parse subject line suggestions' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, htmlContent: content }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Content generation error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

/**
 * PUT — Set HTML content on a Mailchimp campaign + update Firestore
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;
  const { uid } = authResult.auth;
  const tenantId = uid;
  const userId = uid;

  try {
    const body = await req.json();
    const { campaignId, mailchimpCampaignId, htmlContent } = body;

    if (!campaignId || !mailchimpCampaignId || !htmlContent) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'campaignId, mailchimpCampaignId, and htmlContent are required' },
        { status: 400 }
      );
    }

    const settings = await getMarketingSettings(tenantId, userId) as any;
    if (!settings?.mailchimpAccessToken || !settings?.mailchimpServer) {
      return NextResponse.json(
        { error: 'not_connected', message: 'Mailchimp is not connected' },
        { status: 400 }
      );
    }

    // Set content in Mailchimp
    const mcResponse = await mailchimpApi(
      settings.mailchimpServer,
      `/campaigns/${mailchimpCampaignId}/content`,
      settings.mailchimpAccessToken,
      {
        method: 'PUT',
        body: JSON.stringify({ html: htmlContent }),
      }
    );

    if (!mcResponse.ok) {
      const errorText = await mcResponse.text();
      console.error('[API] Mailchimp set content error:', errorText);

      console.error('[API] Mailchimp content update failed — error details:', {
        tenantId,
        userId,
        campaignId,
        operation: 'content_update',
        errorCode: mcResponse.status,
        errorMessage: errorText,
      });

      return NextResponse.json(
        { error: 'api_error', message: 'Failed to set campaign content' },
        { status: 502 }
      );
    }

    // Update Firestore
    await updateEmailCampaign(campaignId, { htmlContent } as any);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Set content error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to set content' },
      { status: 500 }
    );
  }
}
