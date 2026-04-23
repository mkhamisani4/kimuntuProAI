/**
 * POST /api/marketing/audit
 * Proxy to Google PageSpeed Insights API for SEO auditing
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api/requireAuthContext';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'validation_failed', message: 'url is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_PAGESPEED_API_KEY;
    let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=seo`;

    if (apiKey) {
      apiUrl += `&key=${apiKey}`;
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] PageSpeed error:', errorText);
      return NextResponse.json(
        { error: 'api_error', message: 'PageSpeed API request failed' },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Extract SEO score and audits from Lighthouse result
    const lighthouseResult = data.lighthouseResult;
    const seoCategory = lighthouseResult?.categories?.seo;
    const score = Math.round((seoCategory?.score ?? 0) * 100);

    // Map audits to actionable items
    const auditRefs = seoCategory?.auditRefs || [];
    const audits = auditRefs
      .map((ref: any) => {
        const audit = lighthouseResult?.audits?.[ref.id];
        if (!audit) return null;
        return {
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          displayValue: audit.displayValue || null,
          scoreDisplayMode: audit.scoreDisplayMode,
        };
      })
      .filter((a: any) => a !== null);

    return NextResponse.json({ success: true, score, audits }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Audit error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message || 'Failed to run site audit' },
      { status: 500 }
    );
  }
}
