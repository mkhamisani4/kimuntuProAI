/**
 * POST /api/logo/spec
 * Generates 2-3 LogoSpec concepts from a design brief using Claude
 * DECISION: Uses executor quota
 */

import { NextRequest, NextResponse } from 'next/server';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';
import { generateLogoConcepts } from '@kimuntupro/ai-core';
import { logRequestUsage } from '@kimuntupro/ai-core/usage';
import { LogoDesignBriefSchema } from '@kimuntupro/shared';
import { z } from 'zod';

const RequestSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  brief: LogoDesignBriefSchema,
  companyName: z.string(),
  numConcepts: z.number().int().min(1).max(3).default(3),
});

async function handleSpecGeneration(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'validation_failed', message: validation.error.message },
        { status: 400 }
      );
    }

    const { tenantId, userId, brief, companyName, numConcepts } = validation.data;

    // Generate logo concepts using Claude
    const result = await generateLogoConcepts({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      brief,
      companyName,
      numConcepts,
    });

    // Record usage to database
    await logRequestUsage({
      tenantId,
      userId,
      assistant: null,
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
        concepts: result.concepts,
        metadata: result.metadata,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Logo Spec] Generation error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

export const POST = withQuotaGuard(handleSpecGeneration, { for: 'executor' });
