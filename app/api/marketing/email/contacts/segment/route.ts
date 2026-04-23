/**
 * POST /api/marketing/email/contacts/segment
 * AI-powered audience segmentation via Anthropic Claude + Mailchimp segments API
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api/requireAuthContext';
import { getMarketingSettings } from '@kimuntupro/db';
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;
  const { uid } = authResult.auth;

  try {
    const body = await req.json();
    const { goal, contactTags } = body;

    if (!goal) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'goal is required' },
        { status: 400 }
      );
    }

    const settings = await getMarketingSettings(uid, uid) as any;
    if (!settings?.mailchimpAccessToken || !settings?.mailchimpServer || !settings?.mailchimpListId) {
      return NextResponse.json(
        { error: 'not_connected', message: 'Mailchimp is not connected or no audience selected' },
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

    const aiResponse = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      temperature: 0.7,
      system: `You are an email marketing expert. Given contact tags and a campaign goal, suggest audience segments. Return a JSON array of segment objects with: "name" (string), "description" (string), "conditions" (array of Mailchimp segment condition objects with "field", "op", "value"). Only use tag-based conditions with field "static_segment" or merge field conditions.`,
      messages: [
        {
          role: 'user',
          content: `Campaign goal: ${goal}\n\nAvailable contact tags: ${JSON.stringify(contactTags || [])}\n\nSuggest 2-3 targeted audience segments.`,
        },
      ],
    });

    const aiContent = aiResponse.content[0]?.type === 'text' ? aiResponse.content[0].text : '';

    let segments: any[];
    try {
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      segments = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiContent);
    } catch {
      return NextResponse.json(
        { error: 'parse_error', message: 'Failed to parse AI segment suggestions' },
        { status: 500 }
      );
    }

    // Create segments in Mailchimp
    const createdSegments = [];
    for (const segment of segments) {
      try {
        const mcResponse = await mailchimpApi(
          settings.mailchimpServer,
          `/lists/${settings.mailchimpListId}/segments`,
          settings.mailchimpAccessToken,
          {
            method: 'POST',
            body: JSON.stringify({
              name: segment.name,
              static_segment: [],
              options: segment.conditions
                ? { match: 'all', conditions: segment.conditions }
                : undefined,
            }),
          }
        );

        if (mcResponse.ok) {
          const mcData = await mcResponse.json();
          createdSegments.push({
            id: mcData.id,
            name: mcData.name,
            memberCount: mcData.member_count,
            description: segment.description,
          });
        } else {
          console.error('[API] Mailchimp segment creation failed for:', segment.name);
        }
      } catch (err) {
        console.error('[API] Error creating segment:', segment.name, err);
      }
    }

    return NextResponse.json(
      { success: true, suggestions: segments, createdSegments },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Segment error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to create segments' },
      { status: 500 }
    );
  }
}
