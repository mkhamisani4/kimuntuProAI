/**
 * GET /api/websites/[id]
 * Fetch a single website by ID
 *
 * DELETE /api/websites/[id]
 * Delete a website by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api/requireAuthContext';
import { getWebsiteAdmin, deleteWebsiteAdmin } from '@kimuntupro/db/firebase/websites.server';
import { deleteLogo, type Website } from '@kimuntupro/db';

async function loadAndAuthorize(websiteId: string, uid: string) {
  const website = await getWebsiteAdmin(websiteId);
  if (!website) return { notFound: true as const };
  const site = website as Website;
  if (site.tenantId !== uid || site.userId !== uid) return { forbidden: true as const };
  return { website: site };
}

/**
 * GET handler - Fetch website by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;
  const { uid } = authResult.auth;

  try {
    const { id: websiteId } = await params;

    if (!websiteId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Website ID is required' },
        { status: 400 }
      );
    }

    const result = await loadAndAuthorize(websiteId, uid);
    if ('notFound' in result) {
      return NextResponse.json({ error: 'not_found', message: 'Website not found' }, { status: 404 });
    }
    if ('forbidden' in result) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, website: result.website }, { status: 200 });
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
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;
  const { uid } = authResult.auth;

  try {
    const { id: websiteId } = await params;

    if (!websiteId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Website ID is required' },
        { status: 400 }
      );
    }

    const result = await loadAndAuthorize(websiteId, uid);
    if ('notFound' in result) {
      return NextResponse.json({ error: 'not_found', message: 'Website not found' }, { status: 404 });
    }
    if ('forbidden' in result) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    // Delete logo from storage if exists
    if (result.website.wizardInput?.logoUrl) {
      try {
        await deleteLogo(result.website.wizardInput.logoUrl);
        console.log(`[API] Deleted logo for website: ${websiteId}`);
      } catch (err) {
        console.warn('[API] Failed to delete logo, continuing with website deletion:', err);
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
