/**
 * POST /api/payments/create-checkout
 *
 * Creates a Stripe Checkout Session so the user can pay.
 *
 * CURRENTLY: Returns a mock response when USE_REAL_PAYMENTS is false.
 * WHEN LIVE: Uncomment the Stripe block below. No other changes needed.
 */

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { planId, userId, userEmail } = await request.json();

    // ─── Validate ───
    if (!planId || !userId) {
      return NextResponse.json({ error: 'Missing planId or userId' }, { status: 400 });
    }

    const useReal = process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS === 'true';

    if (useReal) {
      // ══════════════════════════════════════════════
      // REAL STRIPE — uncomment when you're ready
      // ══════════════════════════════════════════════
      //
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      //
      // const prices = {
      //   monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
      //   yearly: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
      // };
      //
      // const session = await stripe.checkout.sessions.create({
      //   mode: 'subscription',
      //   payment_method_types: ['card'],
      //   customer_email: userEmail,
      //   metadata: { userId, planId },
      //   line_items: [{ price: prices[planId], quantity: 1 }],
      //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pricing`,
      // });
      //
      // return NextResponse.json({ url: session.url });
      //
      // ══════════════════════════════════════════════

      return NextResponse.json(
        { error: 'Real payments enabled but Stripe code is still commented out. See PAYMENTS.md Step 5.' },
        { status: 501 }
      );
    }

    // ─── Mock mode ───
    return NextResponse.json({
      mock: true,
      message: 'Mock mode — no real charge. The checkout page handles everything client-side.',
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
