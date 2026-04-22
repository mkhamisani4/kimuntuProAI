/**
 * Admin Users API
 * Lists all platform users with their Firestore profile data.
 * Requires a valid Firebase ID token from an admin user.
 */

import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminApp, adminDb } from '@kimuntupro/db';

/**
 * Verify request comes from an authenticated admin user.
 * Returns the decoded token uid on success, throws on failure.
 */
async function verifyAdmin(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new Error('Missing authorization token');
  }

  if (!adminApp) {
    throw new Error('Firebase Admin SDK not initialized. Set FIREBASE_SERVICE_ACCOUNT_KEY.');
  }

  const decoded = await admin.auth(adminApp).verifyIdToken(token);

  // Check admin role in Firestore
  if (!adminDb) {
    throw new Error('Admin Firestore not available');
  }
  const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  return decoded.uid;
}

const MOCK_USERS = [
  { uid: 'mock-001', email: 'james.okafor@gmail.com',      displayName: 'James Okafor',      disabled: false, createdAt: '2024-09-03T10:22:00Z', lastSignIn: '2026-04-12T08:14:00Z', role: 'admin',  subscriptionTier: 'pro',      subscriptionStatus: 'active' },
  { uid: 'mock-002', email: 'amara.diallo@outlook.com',    displayName: 'Amara Diallo',      disabled: false, createdAt: '2024-10-17T14:05:00Z', lastSignIn: '2026-04-11T19:30:00Z', role: 'user',   subscriptionTier: 'pro',      subscriptionStatus: 'active' },
  { uid: 'mock-003', email: 'sofia.reyes@icloud.com',      displayName: 'Sofia Reyes',       disabled: false, createdAt: '2024-11-22T09:47:00Z', lastSignIn: '2026-04-10T11:55:00Z', role: 'user',   subscriptionTier: 'free',     subscriptionStatus: null },
  { uid: 'mock-004', email: 'marcus.lee@yahoo.com',        displayName: 'Marcus Lee',        disabled: false, createdAt: '2025-01-08T16:33:00Z', lastSignIn: '2026-04-09T07:20:00Z', role: 'user',   subscriptionTier: 'starter',  subscriptionStatus: 'active' },
  { uid: 'mock-005', email: 'priya.nair@gmail.com',        displayName: 'Priya Nair',        disabled: false, createdAt: '2025-02-14T12:00:00Z', lastSignIn: '2026-04-08T15:45:00Z', role: 'user',   subscriptionTier: 'pro',      subscriptionStatus: 'active' },
  { uid: 'mock-006', email: 'david.mensah@hotmail.com',    displayName: 'David Mensah',      disabled: true,  createdAt: '2025-03-01T08:10:00Z', lastSignIn: '2026-03-20T10:00:00Z', role: 'user',   subscriptionTier: 'free',     subscriptionStatus: null },
  { uid: 'mock-007', email: 'fatima.al-hassan@gmail.com',  displayName: 'Fatima Al-Hassan',  disabled: false, createdAt: '2025-03-19T17:55:00Z', lastSignIn: '2026-04-07T09:10:00Z', role: 'user',   subscriptionTier: 'starter',  subscriptionStatus: 'active' },
  { uid: 'mock-008', email: 'ethan.carter@protonmail.com', displayName: 'Ethan Carter',      disabled: false, createdAt: '2025-04-05T11:22:00Z', lastSignIn: '2026-04-06T20:30:00Z', role: 'user',   subscriptionTier: 'free',     subscriptionStatus: null },
  { uid: 'mock-009', email: 'yuki.tanaka@gmail.com',       displayName: 'Yuki Tanaka',       disabled: false, createdAt: '2025-05-12T13:40:00Z', lastSignIn: '2026-04-05T14:00:00Z', role: 'user',   subscriptionTier: 'pro',      subscriptionStatus: 'trialing' },
  { uid: 'mock-010', email: 'chloe.dupont@gmail.com',      displayName: 'Chloe Dupont',      disabled: false, createdAt: '2025-06-28T10:15:00Z', lastSignIn: '2026-04-04T18:25:00Z', role: 'user',   subscriptionTier: 'starter',  subscriptionStatus: 'active' },
  { uid: 'mock-011', email: 'kwame.asante@gmail.com',      displayName: 'Kwame Asante',      disabled: false, createdAt: '2025-07-04T09:00:00Z', lastSignIn: '2026-04-03T12:10:00Z', role: 'user',   subscriptionTier: 'free',     subscriptionStatus: null },
  { uid: 'mock-012', email: 'isabella.rossi@gmail.com',    displayName: 'Isabella Rossi',    disabled: true,  createdAt: '2025-08-11T15:30:00Z', lastSignIn: '2026-02-14T08:00:00Z', role: 'user',   subscriptionTier: 'starter',  subscriptionStatus: 'canceled' },
];

/**
 * POST /api/admin/users
 * Body: { firstName, lastName, email, subscriptionTier }
 * Creates a new user in Firebase Auth and Firestore.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, subscriptionTier = 'free' } = body;

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    if (process.env.NODE_ENV !== 'production') {
      const newUser = {
        uid: `mock-${Date.now()}`,
        email,
        displayName: [firstName, lastName].filter(Boolean).join(' ') || email,
        disabled: false,
        createdAt: new Date().toISOString(),
        lastSignIn: null,
        role: 'user',
        subscriptionTier,
        subscriptionStatus: 'active',
      };
      return NextResponse.json({ user: newUser }, { status: 201 });
    }

    await verifyAdmin(req);
    if (!adminApp || !adminDb) return NextResponse.json({ error: 'Admin SDK not available' }, { status: 503 });

    const displayName = [firstName, lastName].filter(Boolean).join(' ') || undefined;
    const authUser = await admin.auth(adminApp).createUser({ email, displayName, password: Math.random().toString(36).slice(-10) });
    await adminDb.collection('users').doc(authUser.uid).set({ role: 'user', subscriptionTier, subscriptionStatus: 'active', displayName });

    return NextResponse.json({
      user: { uid: authUser.uid, email, displayName: displayName || null, disabled: false, createdAt: authUser.metadata.creationTime, lastSignIn: null, role: 'user', subscriptionTier, subscriptionStatus: 'active' },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/admin/users
 * Returns list of all Firebase Auth users merged with Firestore profile data.
 */
export async function GET(req: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ users: MOCK_USERS }, { status: 200 });
    }

    await verifyAdmin(req);

    if (!adminApp || !adminDb) {
      return NextResponse.json({ error: 'Admin SDK not available' }, { status: 503 });
    }

    // List all Auth users (up to 1000)
    const listResult = await admin.auth(adminApp).listUsers(1000);

    // Fetch Firestore profiles in parallel
    const profileSnapshots = await Promise.all(
      listResult.users.map((u) => adminDb!.collection('users').doc(u.uid).get())
    );

    const users = listResult.users.map((authUser, i) => {
      const profile = profileSnapshots[i].exists ? profileSnapshots[i].data() : {};
      return {
        uid: authUser.uid,
        email: authUser.email || null,
        displayName: authUser.displayName || profile?.displayName || null,
        disabled: authUser.disabled,
        createdAt: authUser.metadata.creationTime,
        lastSignIn: authUser.metadata.lastSignInTime,
        role: profile?.role || 'user',
        subscriptionTier: profile?.subscriptionTier || 'free',
        subscriptionStatus: profile?.subscriptionStatus || null,
      };
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    const status =
      error.message === 'Missing authorization token' ||
      error.message === 'Insufficient permissions'
        ? 403
        : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
