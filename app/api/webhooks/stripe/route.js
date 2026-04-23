/**
 * POST /api/webhooks/stripe
 *
 * Stripe sends events here (payment succeeded, subscription cancelled, etc.)
 * This is how your app stays in sync with Stripe.
 *
 * CURRENTLY: Placeholder — logs the event and returns 200.
 * WHEN LIVE: Uncomment the real handler below.
 *
 * IMPORTANT: This endpoint must NOT use the default body parser.
 * Stripe sends a raw body that must be verified with a webhook secret.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@kimuntupro/db/firebase/admin';

export async function POST(request) {
  const useReal = process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS === 'true';

  if (!useReal) {
    return NextResponse.json({ received: true, mock: true });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !adminDb) {
    return NextResponse.json({ error: 'Stripe webhook is not configured' }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const updateUserBySubscription = async (subscriptionId, update) => {
    const snap = await adminDb
      .collection('users')
      .where('stripeSubscriptionId', '==', subscriptionId)
      .limit(1)
      .get();
    if (!snap.empty) {
      await snap.docs[0].ref.set(update, { merge: true });
    }
  };

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      if (userId && planId) {
        await adminDb.collection('users').doc(userId).set({
          subscriptionTier: planId,
          planId,
          subscriptionStatus: 'active',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          billingCycle: session.metadata?.billingCycle || 'monthly',
          subscribedAt: new Date().toISOString(),
        }, { merge: true });
      }
      break;
    }
    case 'invoice.paid': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await updateUserBySubscription(invoice.subscription, { subscriptionStatus: 'active' });
      }
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await updateUserBySubscription(invoice.subscription, { subscriptionStatus: 'past_due' });
      }
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      await updateUserBySubscription(subscription.id, {
        subscriptionStatus: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
      });
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await updateUserBySubscription(subscription.id, {
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
        cancelAtPeriodEnd: false,
      });
      break;
    }
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
