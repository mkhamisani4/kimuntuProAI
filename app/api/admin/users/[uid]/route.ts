/**
 * Admin User Actions API
 * PATCH /api/admin/users/[uid] – update user role in Firestore
 * DELETE /api/admin/users/[uid] – delete user from Auth and Firestore
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

/**
 * PATCH /api/admin/users/[uid]
 * Body: { role: 'admin' | 'user' }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;
    const body = await req.json();

    if (process.env.NODE_ENV !== 'production') {
      const { role, displayName, email, subscriptionTier } = body;
      return NextResponse.json({ success: true, uid, role, displayName, email, subscriptionTier });
    }

    const adminUid = await verifyAdmin(req);

    if (uid === adminUid) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }
    const { role, displayName, email, subscriptionTier } = body;

    const firestoreUpdate: Record<string, any> = {};

    if (role !== undefined) {
      if (!['admin', 'user'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      firestoreUpdate.role = role;
    }
    if (displayName !== undefined) firestoreUpdate.displayName = displayName;
    if (subscriptionTier !== undefined) firestoreUpdate.subscriptionTier = subscriptionTier;

    if (email !== undefined) {
      await admin.auth(adminApp!).updateUser(uid, { email });
    }
    if (displayName !== undefined) {
      await admin.auth(adminApp!).updateUser(uid, { displayName });
    }

    if (Object.keys(firestoreUpdate).length > 0) {
      await adminDb!.collection('users').doc(uid).set(firestoreUpdate, { merge: true });
    }

    return NextResponse.json({ success: true, uid, ...firestoreUpdate, email });
  } catch (error: any) {
    const status =
      error.message.includes('permissions') || error.message.includes('token') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

/**
 * DELETE /api/admin/users/[uid]
 * Deletes user from Firebase Auth and removes their Firestore profile.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;

    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ success: true, uid });
    }

    const adminUid = await verifyAdmin(req);

    if (uid === adminUid) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete from Firebase Auth
    await admin.auth(adminApp!).deleteUser(uid);

    // Remove Firestore profile
    await adminDb!.collection('users').doc(uid).delete();

    return NextResponse.json({ success: true, uid });
  } catch (error: any) {
    const status =
      error.message.includes('permissions') || error.message.includes('token') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
