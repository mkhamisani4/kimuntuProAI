/**
 * POST /api/payments/cancel
 *
 * Cancels a user's Stripe subscription at period end.
 *
 * CURRENTLY: Returns mock response.
 * WHEN LIVE: Calls Stripe to cancel the subscription.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@kimuntupro/db/firebase/admin';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const useReal = process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS === 'true';

    if (useReal) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'STRIPE_SECRET_KEY is not configured' }, { status: 503 });
      }
      if (!adminDb) {
        return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 503 });
      }
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const stripeSubId = userDoc.data()?.stripeSubscriptionId;
      if (!stripeSubId) {
        return NextResponse.json({ error: 'No active Stripe subscription found' }, { status: 404 });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const subscription = await stripe.subscriptions.update(stripeSubId, {
        cancel_at_period_end: true,
      });

      await adminDb.collection('users').doc(userId).set({
        subscriptionStatus: 'canceled',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
      }, { merge: true });

      return NextResponse.json({ success: true, cancelsAt: 'end_of_period' });
    }

    // Mock mode
    return NextResponse.json({ success: true, mock: true });
  } catch (error) {
    console.error('Cancel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
