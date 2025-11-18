/**
 * POST /api/websites/generate
 * Initiates website generation (creates draft + kicks off async generation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createWebsiteAdmin, updateWebsiteAdmin } from '@kimuntupro/db/firebase/websites.server';
import { recordUsage } from '@kimuntupro/db';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';
import { generateWebsite } from '@kimuntupro/ai-core';
import type { WebsiteGenerationRequest } from '@kimuntupro/shared';

/**
 * Background generation function using Claude Sonnet 4.5
 */
async function generateWebsiteInBackground(
  websiteId: string,
  tenantId: string,
  userId: string,
  wizardInput: any,
  businessPlanId: string | null,
  businessPlan: any | null
): Promise<void> {
  try {
    console.log(`[WebsiteGeneration] Starting Claude generation for website: ${websiteId}`, businessPlanId ? `(with plan: ${businessPlanId})` : '');

    // Log business plan info
    if (businessPlan) {
      console.log(`[WebsiteGeneration] Business plan provided directly:`, {
        hasPlan: !!businessPlan,
        hasSections: !!businessPlan?.sections,
        sectionCount: businessPlan?.sections ? Object.keys(businessPlan.sections).length : 0,
        sectionKeys: businessPlan?.sections ? Object.keys(businessPlan.sections) : []
      });
    } else {
      console.log('[WebsiteGeneration] No business plan provided');
    }

    // Generate website with Claude Sonnet 4.5
    const result = await generateWebsite(wizardInput, {
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxTokens: 8000,
      businessPlan: businessPlan,
    });

    console.log(`[WebsiteGeneration] Claude generation complete for ${websiteId}`);

    // Update website with generated content
    await updateWebsiteAdmin(websiteId, {
      completedInput: wizardInput,
      siteSpec: result.siteSpec,
      siteCode: result.siteCode,
      status: 'ready',
      generationMetadata: {
        model: result.metadata.model,
        tokensUsed: result.metadata.tokensUsed,
        latencyMs: result.metadata.latencyMs,
        costCents: result.metadata.costCents,
        generatedAt: result.metadata.generatedAt,
      },
    });

    // Record usage for quota tracking (non-blocking - don't fail generation if this fails)
    try {
      await recordUsage({
        tenantId,
        userId,
        assistant: 'website_builder' as any, // Will be added to AssistantType
        model: result.metadata.model,
        tokensIn: result.metadata.tokensIn,
        tokensOut: result.metadata.tokensOut,
        totalTokens: result.metadata.tokensUsed,
        costCents: result.metadata.costCents,
        latencyMs: result.metadata.latencyMs,
        toolInvocations: {}, // No tool invocations for website generation
      });
    } catch (usageError: any) {
      // Log but don't fail the entire generation
      console.error('[WebsiteGeneration] Failed to record usage (non-critical):', usageError.message);
    }

    console.log(`[WebsiteGeneration] Successfully generated website ${websiteId} - ${result.metadata.tokensUsed} tokens, ${result.metadata.costCents.toFixed(2)}¢`);
  } catch (error: any) {
    console.error(`[WebsiteGeneration] Failed for website ${websiteId}:`, error);

    await updateWebsiteAdmin(websiteId, {
      status: 'failed',
      errorMessage: error.message || 'Unknown error during generation',
    });
  }
}

/**
 * Handle POST request to /api/websites/generate
 */
async function handleGenerate(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await req.json();
    const { tenantId, userId, businessPlanId, businessPlan, wizardInput } = body;

    // Validate required fields
    if (!tenantId || !userId || !wizardInput) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Missing required fields: tenantId, userId, or wizardInput' },
        { status: 400 }
      );
    }

    // Validate wizardInput has enabledSections (required field)
    if (!wizardInput.enabledSections) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'wizardInput.enabledSections is required' },
        { status: 400 }
      );
    }

    // Generate title from company name or default
    const title = wizardInput.companyName
      ? `${wizardInput.companyName} Website`
      : 'Untitled Website';

    // Create website document with draft status
    const websiteId = await createWebsiteAdmin({
      tenantId,
      userId,
      businessPlanId: businessPlanId || null,
      hasPlanAttached: !!businessPlanId,
      wizardInput,
      completedInput: null,
      siteSpec: null,
      siteCode: null,
      title,
      status: 'draft',
      errorMessage: null,
      generationMetadata: null,
    });

    // Update status to generating
    await updateWebsiteAdmin(websiteId, { status: 'generating' });

    // Kick off background generation (fire-and-forget)
    generateWebsiteInBackground(
      websiteId,
      tenantId,
      userId,
      wizardInput,
      businessPlanId || null,
      businessPlan || null
    ).catch((err) => {
      console.error('[API] Background generation promise rejected:', err);
    });

    // Return immediately
    return NextResponse.json(
      {
        success: true,
        websiteId,
        status: 'generating',
        message: 'Website generation started. You can navigate away.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Generate route error:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to start website generation',
      },
      { status: 500 }
    );
  }
}

// Export POST handler with quota guard
export const POST = withQuotaGuard(handleGenerate, { for: 'executor' });
