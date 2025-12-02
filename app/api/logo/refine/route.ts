/**
 * POST /api/logo/refine
 * Refines an existing logo based on user feedback using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { refineLogo } from '@kimuntupro/ai-core';
import { logRequestUsage } from '@kimuntupro/ai-core/usage';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';

async function handler(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { tenantId, userId, currentSpec, feedback, companyName } = body;

    // Validation
    if (!tenantId || !userId || !currentSpec || !feedback || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, userId, currentSpec, feedback, companyName' },
        { status: 400 }
      );
    }

    // Get API key from server environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('[Logo Refine] ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error: API key not set' },
        { status: 500 }
      );
    }

    console.log('[Logo Refine] Refining logo for company:', companyName);
    console.log('[Logo Refine] Feedback:', feedback);

    // Call AI refinement
    const result = await refineLogo({
      apiKey,
      currentSpec,
      feedback,
      companyName,
    });

    console.log('[Logo Refine] Refinement complete');

    // Record usage to database
    await logRequestUsage({
      tenantId,
      userId,
      assistant: 'logo_refine',
      model: result.metadata.model,
      tokensIn: result.metadata.tokensIn,
      tokensOut: result.metadata.tokensOut,
      costCents: result.metadata.costCents,
      latencyMs: result.metadata.latencyMs || 0,
      toolInvocations: {},
    });

    return NextResponse.json({
      success: true,
      refinedConcept: result.concepts[0], // refineLogo returns single concept
      metadata: result.metadata,
    });
  } catch (error: any) {
    console.error('[Logo Refine] Error:', error);
    return NextResponse.json(
      { error: 'refinement_failed', message: error.message },
      { status: 500 }
    );
  }
}

// Apply quota guard: use executor quota (same as other logo operations)
export const POST = withQuotaGuard(handler, { for: 'executor' });
