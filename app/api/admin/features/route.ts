/**
 * Admin Feature Flags API
 * GET  /api/admin/features – list all feature flags from Firestore
 * PUT  /api/admin/features – bulk update feature flags (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminApp, adminDb } from '@kimuntupro/db/firebase/admin';
import { DEFAULT_FEATURE_FLAGS, PLAN_IDS, mergeFeatureDefaults } from '@/lib/accessControl';

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
 * GET /api/admin/features
 * Returns all feature flags. Seeds defaults if collection is empty.
 */
export async function GET(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ features: DEFAULT_FEATURE_FLAGS, source: 'defaults' });
    }

    await verifyAdmin(req);

    const snap = await adminDb.collection('feature_flags').get();

    if (snap.empty) {
      // Seed defaults
      const batch = adminDb.batch();
      DEFAULT_FEATURE_FLAGS.forEach((flag) => {
        batch.set(adminDb!.collection('feature_flags').doc(flag.id), flag);
      });
      await batch.commit();
      return NextResponse.json({ features: DEFAULT_FEATURE_FLAGS, source: 'seeded' });
    }

    const features = mergeFeatureDefaults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    return NextResponse.json({ features, source: 'firebase' });
  } catch (error: any) {
    const status =
      error.message.includes('permissions') || error.message.includes('token') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

/**
 * PUT /api/admin/features
 * Body: { features: FeatureFlag[] }
 * Batch-writes all feature flags.
 */
export async function PUT(req: NextRequest) {
  try {
    await verifyAdmin(req);

    if (!adminDb) {
      return NextResponse.json({ error: 'Admin SDK not available' }, { status: 503 });
    }

    const body = await req.json();
    const { features } = body;

    if (!Array.isArray(features)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const batch = adminDb.batch();
    features.forEach((flag: any) => {
      const requiredPlans = Array.isArray(flag.requiredPlans)
        ? flag.requiredPlans.filter((plan: string) => PLAN_IDS.includes(plan))
        : [];
      const ref = adminDb!.collection('feature_flags').doc(flag.id);
      batch.set(ref, {
        name: flag.name,
        description: flag.description,
        track: flag.track || 'platform',
        enabled: Boolean(flag.enabled),
        requiredPlans,
        routes: Array.isArray(flag.routes) ? flag.routes : [],
      });
    });
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status =
      error.message.includes('permissions') || error.message.includes('token') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
