import { NextRequest, NextResponse } from 'next/server';
import { getWebsite, updateWebsite, recordUsage } from '@kimuntupro/db';
import { editWebsite } from '@kimuntupro/ai-core';
import { withQuotaGuard } from '@/lib/api/quotaMiddleware';

/**
 * Edit Website API Route
 * Accepts AI editing instructions and updates the website
 */
async function handleEdit(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Extract website ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const websiteId = pathParts[pathParts.length - 2]; // /api/websites/[id]/edit -> [id] is second to last

    const body = await request.json();
    const { tenantId, userId, instruction } = body;

    // Validate required fields
    if (!tenantId || !userId || !instruction) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, userId, instruction' },
        { status: 400 }
      );
    }

    if (typeof instruction !== 'string' || instruction.trim().length === 0) {
      return NextResponse.json(
        { error: 'Instruction must be a non-empty string' },
        { status: 400 }
      );
    }

    // Get existing website and verify ownership
    const existingWebsite = await getWebsite(websiteId);
    if (!existingWebsite) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }
    if (existingWebsite.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('[WebsiteEdit] Editing website:', websiteId, 'Instruction:', instruction.substring(0, 100));

    // Update status to generating
    await updateWebsite(websiteId, {
      status: 'generating',
      errorMessage: null,
      updatedAt: new Date(),
    });

    // Start background editing
    editWebsiteInBackground(websiteId, tenantId, userId, instruction, existingWebsite);

    return NextResponse.json({
      success: true,
      websiteId,
      message: 'Website editing started',
    });
  } catch (error: any) {
    console.error('[WebsiteEdit] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to start editing' }, { status: 500 });
  }
}

/**
 * Background editing function
 */
async function editWebsiteInBackground(
  websiteId: string,
  tenantId: string,
  userId: string,
  instruction: string,
  existingWebsite: any
) {
  try {
    console.log('[WebsiteEdit] Starting background edit for:', websiteId);

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // Call AI to edit the website
    const result = await editWebsite(
      instruction,
      existingWebsite.siteCode,
      existingWebsite.siteSpec,
      { apiKey }
    );

    console.log('[WebsiteEdit] Edit complete, updating database...');

    // Update website in database
    await updateWebsite(websiteId, {
      siteCode: result.siteCode,
      siteSpec: result.siteSpec,
      status: 'ready',
      errorMessage: null,
      generationMetadata: {
        model: result.metadata.model,
        tokensUsed: result.metadata.tokensUsed,
        latencyMs: result.metadata.latencyMs,
        costCents: result.metadata.costCents,
        generatedAt: result.metadata.generatedAt,
      },
      updatedAt: new Date(),
    });

    // Record usage (don't fail the whole operation if this fails)
    try {
      await recordUsage({
        tenantId,
        userId,
        assistant: 'website-editor',
        model: result.metadata.model,
        tokensIn: result.metadata.tokensIn,
        tokensOut: result.metadata.tokensOut,
        totalTokens: result.metadata.tokensUsed,
        costCents: result.metadata.costCents,
        latencyMs: result.metadata.latencyMs,
        toolInvocations: {},
        requestId: `edit-${websiteId}-${Date.now()}`,
      });
    } catch (usageError: any) {
      // Log error but don't fail the edit
      console.error('[WebsiteEdit] Failed to record usage (non-critical):', usageError.message);
    }

    console.log('[WebsiteEdit] Website edited successfully:', websiteId);
  } catch (error: any) {
    console.error('[WebsiteEdit] Background edit failed:', error);

    // Update website with error
    await updateWebsite(websiteId, {
      status: 'failed',
      errorMessage: error.message || 'Edit failed',
      updatedAt: new Date(),
    });
  }
}

// Apply quota guard middleware
export const POST = withQuotaGuard(handleEdit, { for: 'executor' });
