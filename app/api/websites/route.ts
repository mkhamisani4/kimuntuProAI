/**
 * GET /api/websites
 * List websites for a tenant/user
 */

import { NextRequest, NextResponse } from 'next/server';
import { listWebsites } from '@kimuntupro/db';

/**
 * GET handler - List websites for tenant/user
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const userId = searchParams.get('userId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Validate required parameters
    if (!tenantId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'tenantId query parameter is required' },
        { status: 400 }
      );
    }

    // Validate limit is reasonable
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Fetch websites
    const websites = await listWebsites(tenantId, userId, limit);

    return NextResponse.json({ success: true, websites }, { status: 200 });
  } catch (error: any) {
    console.error('[API] List websites error:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to list websites',
      },
      { status: 500 }
    );
  }
}
