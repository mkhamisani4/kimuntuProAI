/**
 * GET /api/logo/[id] - Get logo by ID
 * PATCH /api/logo/[id] - Update logo (rename)
 * DELETE /api/logo/[id] - Delete logo
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLogoAdmin, deleteLogoAdmin, updateLogoAdmin } from '@kimuntupro/db/firebase/logos.server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const logo = await getLogoAdmin(id);

    if (!logo) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, logo }, { status: 200 });
  } catch (error: any) {
    console.error('[Logo GET] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Name must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Update the logo name
    await updateLogoAdmin(id, { name: name.trim() });

    return NextResponse.json({ success: true, message: 'Logo renamed successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('[Logo PATCH] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    await deleteLogoAdmin(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Logo DELETE] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}
