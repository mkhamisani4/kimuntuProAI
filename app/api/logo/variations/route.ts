/**
 * POST /api/logo/variations
 * Generates 2-3 variations of an existing logo using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateLogoVariations } from '@kimuntupro/ai-core';
import { logRequestUsage } from '@kimuntupro/ai-core/usage';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';

async function handler(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { tenantId, userId, currentSpec, companyName, numVariations = 3 } = body;

    // Validation
    if (!tenantId || !userId || !currentSpec || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, userId, currentSpec, companyName' },
        { status: 400 }
      );
    }

    // Get API key from server environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('[Logo Variations] ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error: API key not set' },
        { status: 500 }
      );
    }

    console.log('[Logo Variations] Generating variations for company:', companyName);
    console.log('[Logo Variations] Number of variations:', numVariations);

    // Call AI variations generator
    const result = await generateLogoVariations({
      apiKey,
      currentSpec,
      companyName,
      numVariations,
    });

    console.log('[Logo Variations] Generated', result.concepts.length, 'variations');

    // Record usage to database
    await logRequestUsage({
      tenantId,
      userId,
      assistant: 'logo_variations',
      model: result.metadata.model,
      tokensIn: result.metadata.tokensIn,
      tokensOut: result.metadata.tokensOut,
      costCents: result.metadata.costCents,
      latencyMs: result.metadata.latencyMs || 0,
      toolInvocations: {},
    });

    return NextResponse.json({
      success: true,
      variations: result.concepts,
      metadata: result.metadata,
    });
  } catch (error: any) {
    console.error('[Logo Variations] Error:', error);
    return NextResponse.json(
      { error: 'variations_failed', message: error.message },
      { status: 500 }
    );
  }
}

// Apply quota guard: use executor quota (same as other logo operations)
export const POST = withQuotaGuard(handler, { for: 'executor' });
