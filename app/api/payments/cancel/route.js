/**
 * POST /api/payments/cancel
 *
 * Cancels a user's Stripe subscription at period end.
 *
 * CURRENTLY: Returns mock response.
 * WHEN LIVE: Calls Stripe to cancel the subscription.
 */

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const useReal = process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS === 'true';

    if (useReal) {
      // ══════════════════════════════════════════════
      // REAL MODE — uncomment when ready
      // ══════════════════════════════════════════════
      //
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // const { getFirestore } = require('firebase-admin/firestore');
      // const { initAdmin } = require('@/lib/firebaseAdmin');
      //
      // initAdmin();
      // const db = getFirestore();
      // const userDoc = await db.collection('users').doc(userId).get();
      // const stripeSubId = userDoc.data()?.stripeSubscriptionId;
      //
      // if (!stripeSubId) {
      //   return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
      // }
      //
      // // Cancel at end of billing period (not immediately)
      // await stripe.subscriptions.update(stripeSubId, {
      //   cancel_at_period_end: true,
      // });
      //
      // await db.collection('users').doc(userId).update({
      //   subscriptionStatus: 'cancelling',
      // });
      //
      // return NextResponse.json({ success: true, cancelsAt: 'end_of_period' });
      //
      // ══════════════════════════════════════════════

      return NextResponse.json(
        { error: 'Real payments enabled but Stripe code is still commented out.' },
        { status: 501 }
      );
    }

    // Mock mode
    return NextResponse.json({ success: true, mock: true });
  } catch (error) {
    console.error('Cancel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
