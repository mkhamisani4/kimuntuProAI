/**
 * GET /api/websites/[id]
 * Fetch a single website by ID
 *
 * DELETE /api/websites/[id]
 * Delete a website by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteAdmin, deleteWebsiteAdmin } from '@kimuntupro/db/firebase/websites.server';
import { deleteLogo } from '@kimuntupro/db';

/**
 * GET handler - Fetch website by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: websiteId } = await params;

    if (!websiteId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Website ID is required' },
        { status: 400 }
      );
    }

    const website = await getWebsiteAdmin(websiteId);

    if (!website) {
      return NextResponse.json(
        { error: 'not_found', message: 'Website not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, website }, { status: 200 });
  } catch (error: any) {
    console.error('[API] Get website error:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to fetch website',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Delete website and associated logo
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: websiteId } = await params;

    if (!websiteId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Website ID is required' },
        { status: 400 }
      );
    }

    // Get website to check if it has a logo
    const website = await getWebsiteAdmin(websiteId);

    if (!website) {
      return NextResponse.json(
        { error: 'not_found', message: 'Website not found' },
        { status: 404 }
      );
    }

    // Delete logo from storage if exists
    if (website.wizardInput?.logoUrl) {
      try {
        await deleteLogo(website.wizardInput.logoUrl);
        console.log(`[API] Deleted logo for website: ${websiteId}`);
      } catch (err) {
        console.warn('[API] Failed to delete logo, continuing with website deletion:', err);
        // Continue with website deletion even if logo deletion fails
      }
    }

    // Delete website document
    await deleteWebsiteAdmin(websiteId);

    return NextResponse.json(
      { success: true, message: 'Website deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Delete website error:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to delete website',
      },
      { status: 500 }
    );
  }
}
