/**
 * GET /api/payments/status?uid=xxx
 *
 * Returns the subscription status for a user.
 *
 * CURRENTLY: Always returns { active: false } (mock).
 * WHEN LIVE: Query Firestore for the user's Stripe subscription status.
 */

import { NextResponse } from 'next/server';
import { adminDb } from '@kimuntupro/db/firebase/admin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
  }

  const useReal = process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS === 'true';

  if (useReal) {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 503 });
    }
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const data = userDoc.exists ? userDoc.data() : {};
    const planId = data?.subscriptionTier || data?.planId || 'free';
    const status = data?.subscriptionStatus || (planId === 'free' ? null : 'active');
    return NextResponse.json({
      active: ['active', 'trialing'].includes(status),
      planId,
      status,
      price: data?.subscriptionPrice || null,
      currentPeriodEnd: data?.currentPeriodEnd || null,
      stripeCustomerId: data?.stripeCustomerId || null,
      stripeSubscriptionId: data?.stripeSubscriptionId || null,
      mock: false,
    });
  }

  // Mock mode
  return NextResponse.json({ active: false, mock: true });
}
