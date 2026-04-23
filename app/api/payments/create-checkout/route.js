/**
 * POST /api/payments/create-checkout
 *
 * Creates a Stripe Checkout Session so the user can pay.
 *
 * CURRENTLY: Returns a mock response when USE_REAL_PAYMENTS is false.
 * WHEN LIVE: Uncomment the Stripe block below. No other changes needed.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PLANS } from '@/lib/payments';

export async function POST(request) {
  try {
    const { planId, userId, userEmail, billingCycle = 'monthly' } = await request.json();

    // ─── Validate ───
    if (!planId || !userId) {
      return NextResponse.json({ error: 'Missing planId or userId' }, { status: 400 });
    }

    const useReal = process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS === 'true';

    if (useReal) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'STRIPE_SECRET_KEY is not configured' }, { status: 503 });
      }
      const plan = PLANS[planId];
      if (!plan || plan.id === 'free') {
        return NextResponse.json({ error: 'Invalid paid plan' }, { status: 400 });
      }
      const priceId = billingCycle === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
      if (!priceId || priceId.includes('REPLACE')) {
        return NextResponse.json({ error: `Stripe price ID is missing for ${plan.name} (${billingCycle})` }, { status: 503 });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: userEmail,
        metadata: { userId, planId, billingCycle },
        subscription_data: {
          metadata: { userId, planId, billingCycle },
        },
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/dashboard/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard/pricing?checkout=cancelled`,
      });

      return NextResponse.json({ url: session.url });
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
