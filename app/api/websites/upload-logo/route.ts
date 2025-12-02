/**
 * POST /api/websites/upload-logo
 * Upload logo to Firebase Storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadLogo } from '@kimuntupro/db';

/**
 * POST handler - Upload logo file
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tenantId = formData.get('tenantId') as string;
    const websiteId = formData.get('websiteId') as string;

    // Validate required fields
    if (!file || !tenantId || !websiteId) {
      return NextResponse.json(
        {
          error: 'validation_failed',
          message: 'Missing required fields: file, tenantId, or websiteId',
        },
        { status: 400 }
      );
    }

    // Validate file is actually a File object
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Invalid file upload' },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'validation_failed',
          message: 'Invalid file type. Only images (JPEG, PNG, GIF, SVG, WebP) are allowed.',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'validation_failed',
          message: 'File too large. Maximum size is 5MB.',
        },
        { status: 400 }
      );
    }

    // Upload to Firebase Storage
    const logoUrl = await uploadLogo(file, tenantId, websiteId);

    console.log(`[API] Successfully uploaded logo for website ${websiteId}: ${logoUrl}`);

    return NextResponse.json(
      { success: true, logoUrl },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Upload logo error:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to upload logo',
      },
      { status: 500 }
    );
  }
}

// Configure larger body size limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
