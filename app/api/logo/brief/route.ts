/**
 * POST /api/logo/brief
 * Generates a logo design brief from business context using Claude
 * DECISION: Uses executor quota (same as other AI features)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';
import { generateLogoBrief } from '@kimuntupro/ai-core';
import { logRequestUsage } from '@kimuntupro/ai-core/usage';
import { LogoGenerationRequestSchema } from '@kimuntupro/shared';

async function handleBriefGeneration(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    // Validate request
    const validation = LogoGenerationRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'validation_failed', message: validation.error.message },
        { status: 400 }
      );
    }

    const { tenantId, userId, companyName, businessPlanText } = validation.data;

    // Generate brief using Claude
    const result = await generateLogoBrief({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      companyName,
      businessContext: businessPlanText,
    });

    // Record usage to database
    await logRequestUsage({
      tenantId,
      userId,
      assistant: 'logo_brief',
      model: result.metadata.model,
      tokensIn: result.metadata.tokensIn,
      tokensOut: result.metadata.tokensOut,
      costCents: result.metadata.costCents,
      latencyMs: result.metadata.latencyMs || 0,
      toolInvocations: {},
    });

    return NextResponse.json(
      {
        success: true,
        brief: result.brief,
        metadata: result.metadata,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Logo Brief] Generation error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

// DECISION: Use same quota as other AI features
export const POST = withQuotaGuard(handleBriefGeneration, { for: 'executor' });
