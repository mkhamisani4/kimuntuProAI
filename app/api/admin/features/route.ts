/**
 * Admin Feature Flags API
 * GET  /api/admin/features – list all feature flags from Firestore
 * PUT  /api/admin/features – bulk update feature flags (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminApp, adminDb } from '@kimuntupro/db/firebase/admin';

const DEFAULT_FLAGS = [
  {
    id: 'legal-ai',
    name: 'Advanced Legal AI Model',
    description: 'Use the latest highly-accurate AI model for legal document analysis, case predictions, and outcome forecasting.',
    enabled: true,
    tier: 'Pro',
  },
  {
    id: 'immigration-assistant',
    name: 'Immigration Assistant',
    description: 'AI-powered immigration guidance including visa eligibility checks, form preparation, and step-by-step filing instructions.',
    enabled: true,
    tier: 'All',
  },
  {
    id: 'document-upload',
    name: 'Document Upload & Analysis',
    description: 'Allow users to upload PDFs and images for AI extraction and analysis. Supports contracts, court filings, and identity documents.',
    enabled: true,
    tier: 'Starter',
  },
  {
    id: 'judicial-prediction',
    name: 'Judicial Outcome Predictor',
    description: 'Predicts likely case outcomes based on historical rulings, judge profiles, and case similarity scoring.',
    enabled: true,
    tier: 'Pro',
  },
  {
    id: 'collaboration',
    name: 'Real-time Collaboration',
    description: 'Allow multiple users to review and annotate the same document or business plan simultaneously.',
    enabled: false,
    tier: 'Enterprise',
  },
  {
    id: 'analytics',
    name: 'Beta Analytics Dashboard',
    description: 'Early access to the new visual metrics dashboard showing usage trends, AI query volume, and feature adoption by tier.',
    enabled: true,
    tier: 'All',
  },
  {
    id: 'export-formats',
    name: 'Priority Export Formats',
    description: 'Export AI-generated reports, action plans, and case summaries to Word (.docx) and advanced PDF formats.',
    enabled: true,
    tier: 'Pro',
  },
  {
    id: 'ai-avatar',
    name: 'AI Legal Avatar',
    description: 'Interactive 3D avatar that walks users through their legal situation in plain language. Powered by HeyGen LiveAvatar.',
    enabled: false,
    tier: 'Enterprise',
  },
  {
    id: 'calendar-deadlines',
    name: 'Legal Deadline Calendar',
    description: 'Automatically extract filing deadlines and court dates from documents and sync them to the user\'s calendar.',
    enabled: true,
    tier: 'Starter',
  },
  {
    id: 'multi-language',
    name: 'Multi-language Support',
    description: 'Translate AI responses and UI into Spanish, French, Arabic, and Mandarin for non-English speaking users.',
    enabled: false,
    tier: 'All',
  },
];

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
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ features: DEFAULT_FLAGS });
    }

    await verifyAdmin(req);

    if (!adminDb) {
      return NextResponse.json({ features: DEFAULT_FLAGS });
    }

    const snap = await adminDb.collection('feature_flags').get();

    if (snap.empty) {
      // Seed defaults
      const batch = adminDb.batch();
      DEFAULT_FLAGS.forEach((flag) => {
        batch.set(adminDb!.collection('feature_flags').doc(flag.id), flag);
      });
      await batch.commit();
      return NextResponse.json({ features: DEFAULT_FLAGS });
    }

    const features = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ features });
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
      const ref = adminDb!.collection('feature_flags').doc(flag.id);
      batch.set(ref, {
        name: flag.name,
        description: flag.description,
        enabled: Boolean(flag.enabled),
        tier: flag.tier || 'All',
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
