/**
 * GET /api/logo/[id] - Get logo by ID
 * PATCH /api/logo/[id] - Update logo (rename)
 * DELETE /api/logo/[id] - Delete logo
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api/requireAuthContext';
import { getLogoAdmin, deleteLogoAdmin, updateLogoAdmin } from '@kimuntupro/db/firebase/logos.server';

async function loadAndAuthorize(id: string, uid: string) {
  const logo = await getLogoAdmin(id);
  if (!logo) return { notFound: true as const };
  if (logo.tenantId !== uid || logo.userId !== uid) return { forbidden: true as const };
  return { logo };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;
  const { uid } = authResult.auth;

  try {
    const { id } = await params;
    const result = await loadAndAuthorize(id, uid);
    if ('notFound' in result) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if ('forbidden' in result) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    return NextResponse.json({ success: true, logo: result.logo }, { status: 200 });
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
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;
  const { uid } = authResult.auth;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name } = body;

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

    const result = await loadAndAuthorize(id, uid);
    if ('notFound' in result) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if ('forbidden' in result) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

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
  const authResult = await requireAuthContext(req);
  if (!authResult.ok) return authResult.response;
  const { uid } = authResult.auth;

  try {
    const { id } = await params;
    const result = await loadAndAuthorize(id, uid);
    if ('notFound' in result) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if ('forbidden' in result) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

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
