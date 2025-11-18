/**
 * POST /api/websites/[id]/regenerate
 * Regenerate a failed or existing website with updated inputs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWebsite, updateWebsite } from '@kimuntupro/db';
import { generateWebsite } from '@kimuntupro/ai-core';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';

async function handleRegenerate(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const websiteId = params.id;
    const body = await request.json();
    const { tenantId, userId, wizardInput, businessPlan } = body;

    console.log(`[WebsiteRegenerate] Regenerating website ${websiteId}`);

    // Validate required fields
    if (!tenantId || !userId || !wizardInput) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, userId, wizardInput' },
        { status: 400 }
      );
    }

    // Get existing website
    const existingWebsite = await getWebsite(tenantId, websiteId);
    if (!existingWebsite) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingWebsite.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update status to generating
    await updateWebsite(tenantId, websiteId, {
      status: 'generating',
      errorMessage: null,
      updatedAt: new Date(),
    });

    // Start background regeneration (don't await)
    regenerateWebsiteInBackground(
      websiteId,
      tenantId,
      userId,
      wizardInput,
      businessPlan || null
    );

    return NextResponse.json({
      success: true,
      websiteId,
      message: 'Website regeneration started',
    });
  } catch (error: any) {
    console.error('[WebsiteRegenerate] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start regeneration' },
      { status: 500 }
    );
  }
}

/**
 * Background task to regenerate website
 */
async function regenerateWebsiteInBackground(
  websiteId: string,
  tenantId: string,
  userId: string,
  wizardInput: any,
  businessPlan: any | null
): Promise<void> {
  try {
    console.log(`[WebsiteRegenerate] Starting background regeneration for ${websiteId}`);

    // Log business plan info
    if (businessPlan) {
      console.log(`[WebsiteRegenerate] Business plan provided:`, {
        hasPlan: !!businessPlan,
        hasSections: !!businessPlan?.sections,
        sectionCount: businessPlan?.sections ? Object.keys(businessPlan.sections).length : 0,
      });
    }

    // Generate website with Claude
    const result = await generateWebsite(wizardInput, {
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxTokens: 8000,
      businessPlan: businessPlan,
    });

    // Update website document with generated content
    await updateWebsite(tenantId, websiteId, {
      status: 'ready',
      siteCode: result.siteCode,
      siteSpec: result.siteSpec,
      generationMetadata: result.metadata,
      wizardInput: wizardInput,
      businessPlanId: businessPlan?.id || null,
      errorMessage: null,
      updatedAt: new Date(),
    });

    console.log(`[WebsiteRegenerate] Successfully regenerated website ${websiteId}`);
  } catch (error: any) {
    console.error(`[WebsiteRegenerate] Failed to regenerate website ${websiteId}:`, error);

    // Update status to failed
    await updateWebsite(tenantId, websiteId, {
      status: 'failed',
      errorMessage: error.message || 'Unknown error during regeneration',
      updatedAt: new Date(),
    });
  }
}

// Apply quota guard middleware
export const POST = withQuotaGuard(handleRegenerate, { for: 'executor' });
