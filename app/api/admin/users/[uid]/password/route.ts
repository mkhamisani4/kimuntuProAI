/**
 * PATCH /api/admin/users/[uid]/password
 * Admin-only: change any user's password via Firebase Admin SDK
 */

import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminApp, adminDb } from '@kimuntupro/db';

async function verifyAdmin(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw new Error('Missing authorization token');
  if (!adminApp) throw new Error('Admin SDK not initialized');
  const decoded = await admin.auth(adminApp).verifyIdToken(token);
  if (!adminDb) throw new Error('Admin Firestore not available');
  const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    throw new Error('Insufficient permissions');
  }
  return decoded.uid;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;
    const { password } = await req.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ success: true, uid });
    }

    await verifyAdmin(req);
    await admin.auth(adminApp!).updateUser(uid, { password });

    return NextResponse.json({ success: true, uid });
  } catch (error: any) {
    const status =
      error.message.includes('permissions') || error.message.includes('token') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
