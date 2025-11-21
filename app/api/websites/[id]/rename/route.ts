/**
 * PATCH /api/websites/[id]/rename
 * Update website title/name
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteAdmin, updateWebsiteAdmin } from '@kimuntupro/db/firebase/websites.server';

/**
 * Handle PATCH request to rename a website
 */
async function handleRename(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract website ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const websiteId = pathParts[pathParts.length - 2]; // /api/websites/[id]/rename -> [id] is second to last

    const body = await request.json();
    const { userId, title } = body;

    // Validate required fields
    if (!userId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title' },
        { status: 400 }
      );
    }

    // Validate title
    if (typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title must be a non-empty string' },
        { status: 400 }
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: 'Title must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Get existing website and verify ownership
    const existingWebsite = await getWebsiteAdmin(websiteId);
    if (!existingWebsite) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    if (existingWebsite.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update title
    await updateWebsiteAdmin(websiteId, {
      title: title.trim(),
    });

    console.log(`[WebsiteRename] Renamed website ${websiteId} to "${title.trim()}"`);

    return NextResponse.json({
      success: true,
      websiteId,
      title: title.trim(),
    });
  } catch (error: any) {
    console.error('[WebsiteRename] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rename website' },
      { status: 500 }
    );
  }
}

export const PATCH = handleRename;
