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

export async function POST(request) {
  const useReal = process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS === 'true';

  if (!useReal) {
    return NextResponse.json({ received: true, mock: true });
  }

  // ══════════════════════════════════════════════════════════
  // REAL STRIPE WEBHOOK — uncomment when ready (Step 6 in PAYMENTS.md)
  // ══════════════════════════════════════════════════════════
  //
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const { getFirestore } = require('firebase-admin/firestore');
  // const { initAdmin } = require('@/lib/firebaseAdmin');
  //
  // initAdmin();
  // const db = getFirestore();
  //
  // const body = await request.text();
  // const signature = request.headers.get('stripe-signature');
  //
  // let event;
  // try {
  //   event = stripe.webhooks.constructEvent(
  //     body,
  //     signature,
  //     process.env.STRIPE_WEBHOOK_SECRET
  //   );
  // } catch (err) {
  //   console.error('Webhook signature verification failed:', err.message);
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  // }
  //
  // // Handle the event
  // switch (event.type) {
  //
  //   case 'checkout.session.completed': {
  //     const session = event.data.object;
  //     const userId = session.metadata.userId;
  //     const planId = session.metadata.planId;
  //
  //     await db.collection('users').doc(userId).update({
  //       subscriptionStatus: 'active',
  //       planId: planId,
  //       stripeCustomerId: session.customer,
  //       stripeSubscriptionId: session.subscription,
  //       subscribedAt: new Date().toISOString(),
  //     });
  //     break;
  //   }
  //
  //   case 'invoice.paid': {
  //     // Recurring payment succeeded — keep subscription active
  //     const invoice = event.data.object;
  //     const subId = invoice.subscription;
  //     // Find user by stripeSubscriptionId and update
  //     // (you'd query Firestore for this)
  //     break;
  //   }
  //
  //   case 'invoice.payment_failed': {
  //     // Payment failed — mark as past_due
  //     const invoice = event.data.object;
  //     // Find user and update subscriptionStatus to 'past_due'
  //     break;
  //   }
  //
  //   case 'customer.subscription.deleted': {
  //     // Subscription fully cancelled
  //     const subscription = event.data.object;
  //     // Find user and update subscriptionStatus to 'cancelled'
  //     break;
  //   }
  //
  //   case 'customer.subscription.updated': {
  //     // Plan changed, or cancel_at_period_end toggled
  //     const subscription = event.data.object;
  //     // Update user's planId, status, etc.
  //     break;
  //   }
  //
  //   default:
  //     console.log(`Unhandled event type: ${event.type}`);
  // }
  //
  // return NextResponse.json({ received: true });
  //
  // ══════════════════════════════════════════════════════════

  return NextResponse.json({ received: true, mock: true });
}
