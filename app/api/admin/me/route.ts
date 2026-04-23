/**
 * Admin identity API
 * Verifies whether the signed-in Firebase user has the Firestore admin role.
 */

import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminApp, adminDb } from '@kimuntupro/db/firebase/admin';
import { DEFAULT_FEATURE_FLAGS, mergeFeatureDefaults, normalizePlanId } from '@/lib/accessControl';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ isAdmin: false, error: 'Missing authorization token' }, { status: 401 });
    }

    if (!adminApp || !adminDb) {
      return NextResponse.json(
        { isAdmin: false, error: 'Firebase Admin SDK not initialized' },
        { status: 503 }
      );
    }

    const decoded = await admin.auth(adminApp).verifyIdToken(token);
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const profile = userDoc.exists ? userDoc.data() : null;
    const isAdmin = profile?.role === 'admin';
    const flagsSnap = await adminDb.collection('feature_flags').get();
    const features = flagsSnap.empty
      ? DEFAULT_FEATURE_FLAGS
      : mergeFeatureDefaults(flagsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

    return NextResponse.json({
      isAdmin,
      uid: decoded.uid,
      email: decoded.email || null,
      role: profile?.role || 'user',
      profile: {
        uid: decoded.uid,
        email: decoded.email || null,
        role: profile?.role || 'user',
        subscriptionTier: normalizePlanId(profile?.subscriptionTier),
        subscriptionStatus: profile?.subscriptionStatus || (profile?.subscriptionTier && profile.subscriptionTier !== 'free' ? 'active' : null),
      },
      features,
    });
  } catch (error: any) {
    return NextResponse.json(
      { isAdmin: false, error: error.message || 'Failed to verify admin status' },
      { status: 401 }
    );
  }
}
