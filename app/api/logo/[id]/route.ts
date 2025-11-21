/**
 * GET /api/logo/[id] - Get logo by ID
 * DELETE /api/logo/[id] - Delete logo
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLogoAdmin, deleteLogoAdmin } from '@kimuntupro/db/firebase/logos.server';

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
