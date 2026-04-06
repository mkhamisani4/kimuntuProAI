/**
 * POST/DELETE /api/marketing/social/post
 * Proxy to Ayrshare Post API for scheduling and deleting social posts
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST - Schedule a social media post via Ayrshare
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { post, platforms, mediaUrls, scheduleDate } = body;

    if (!post || typeof post !== 'string') {
      return NextResponse.json(
        { error: 'validation_failed', message: 'post content is required' },
        { status: 400 }
      );
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'platforms array is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.AYRSHARE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'config_error', message: 'Ayrshare API key is not configured' },
        { status: 503 }
      );
    }

    const payload: any = {
      post,
      platforms,
    };

    if (mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length > 0) {
      payload.mediaUrls = mediaUrls;
    }

    if (scheduleDate) {
      payload.scheduleDate = scheduleDate;
    }

    const response = await fetch('https://app.ayrshare.com/api/post', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Ayrshare post error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'Ayrshare post request failed' },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Social post error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to schedule post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a scheduled post from Ayrshare
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { ayrshareId } = body;

    if (!ayrshareId || typeof ayrshareId !== 'string') {
      return NextResponse.json(
        { error: 'validation_failed', message: 'ayrshareId is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.AYRSHARE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'config_error', message: 'Ayrshare API key is not configured' },
        { status: 503 }
      );
    }

    const response = await fetch('https://app.ayrshare.com/api/post', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: ayrshareId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Ayrshare delete error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'Ayrshare delete request failed' },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Social post delete error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
}
