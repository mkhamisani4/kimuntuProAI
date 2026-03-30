/**
 * GET /api/payments/status?uid=xxx
 *
 * Returns the subscription status for a user.
 *
 * CURRENTLY: Always returns { active: false } (mock).
 * WHEN LIVE: Query Firestore for the user's Stripe subscription status.
 */

import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
  }

  const useReal = process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS === 'true';

  if (useReal) {
    // ══════════════════════════════════════════════
    // REAL MODE — uncomment when ready
    // ══════════════════════════════════════════════
    //
    // const { getFirestore } = require('firebase-admin/firestore');
    // const { initAdmin } = require('@/lib/firebaseAdmin');  // you'll create this
    //
    // initAdmin();
    // const db = getFirestore();
    // const userDoc = await db.collection('users').doc(uid).get();
    // const data = userDoc.data();
    //
    // return NextResponse.json({
    //   active: data?.subscriptionStatus === 'active',
    //   planId: data?.planId || null,
    //   currentPeriodEnd: data?.currentPeriodEnd || null,
    // });
    //
    // ══════════════════════════════════════════════

    return NextResponse.json({ active: false, mock: false });
  }

  // Mock mode
  return NextResponse.json({ active: false, mock: true });
}
