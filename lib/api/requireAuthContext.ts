/**
 * Server-side auth context helper.
 *
 * Verifies the Firebase ID token from the Authorization header and returns
 * the authenticated user's uid. In the per-user tenant model, `uid` is the
 * authoritative tenantId/userId — callers should use the returned value rather
 * than trusting anything in the request body.
 */

import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminApp } from '@kimuntupro/db/firebase/admin';

export type AuthContext = {
  uid: string;
  email: string | null;
};

export type RequireAuthResult =
  | { ok: true; auth: AuthContext }
  | { ok: false; response: NextResponse };

export async function requireAuthContext(req: NextRequest): Promise<RequireAuthResult> {
  const header = req.headers.get('Authorization') || req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'missing_auth', message: 'Authorization token required. Please sign in.' },
        { status: 401 }
      ),
    };
  }

  if (!adminApp) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'server_misconfigured', message: 'Auth backend is unavailable.' },
        { status: 503 }
      ),
    };
  }

  try {
    const decoded = await admin.auth(adminApp).verifyIdToken(token);
    return {
      ok: true,
      auth: {
        uid: decoded.uid,
        email: decoded.email ?? null,
      },
    };
  } catch (err: any) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'invalid_auth', message: 'Authentication token is invalid or expired.' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Assert that the body-supplied tenantId/userId match the authenticated uid.
 * In the per-user tenant model both must equal the signed-in uid.
 */
export function assertBodyMatchesAuth(
  body: { tenantId?: string; userId?: string } | null | undefined,
  uid: string
): NextResponse | null {
  if (!body) return null;
  if (body.userId && body.userId !== uid) {
    return NextResponse.json(
      { error: 'forbidden', message: 'User ID does not match authenticated session.' },
      { status: 403 }
    );
  }
  if (body.tenantId && body.tenantId !== uid) {
    return NextResponse.json(
      { error: 'forbidden', message: 'Tenant ID does not match authenticated session.' },
      { status: 403 }
    );
  }
  return null;
}
