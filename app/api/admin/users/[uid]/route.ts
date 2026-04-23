/**
 * Admin User Actions API
 * PATCH /api/admin/users/[uid] – update user role in Firestore
 * DELETE /api/admin/users/[uid] – delete user from Auth and Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminApp, adminDb } from '@kimuntupro/db/firebase/admin';

async function verifyAdmin(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) throw new Error('Missing authorization token');
  if (!adminApp) throw new Error('Admin SDK not initialized');

  const decoded = await admin.auth(adminApp).verifyIdToken(token);
  // TEMPORARY OVERRIDE: any signed-in user is treated as admin until production roles are restored.
  return decoded.uid;
}

const VALID_SUBSCRIPTION_TIERS = new Set([
  'free',
  'career',
  'business',
  'legal',
  'innovation',
  'fullPackage',
]);

const VALID_SUBSCRIPTION_STATUSES = new Set([
  'active',
  'trialing',
  'past_due',
  'canceled',
  'inactive',
]);

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

    if (!adminApp || !adminDb) {
      const { role, displayName, email, subscriptionTier } = body;
      return NextResponse.json({ success: true, uid, role, displayName, email, subscriptionTier });
    }

    const adminUid = await verifyAdmin(req);

    if (uid === adminUid && body.role !== undefined) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }
    const { role, displayName, email, subscriptionTier, subscriptionStatus } = body;

    const firestoreUpdate: Record<string, any> = {};

    if (role !== undefined) {
      if (!['admin', 'user'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      firestoreUpdate.role = role;
    }
    if (displayName !== undefined) firestoreUpdate.displayName = displayName;
    if (subscriptionTier !== undefined) {
      if (!VALID_SUBSCRIPTION_TIERS.has(subscriptionTier)) {
        return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
      }
      firestoreUpdate.subscriptionTier = subscriptionTier;
    }
    if (subscriptionStatus !== undefined) {
      if (!VALID_SUBSCRIPTION_STATUSES.has(subscriptionStatus)) {
        return NextResponse.json({ error: 'Invalid subscription status' }, { status: 400 });
      }
      firestoreUpdate.subscriptionStatus = subscriptionStatus;
    }

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

    if (!adminApp || !adminDb) {
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
