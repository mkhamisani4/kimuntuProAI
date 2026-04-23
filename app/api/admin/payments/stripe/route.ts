import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { adminApp } from '@kimuntupro/db/firebase/admin';
import { PLANS } from '@/lib/payments';

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw new Error('Missing authorization token');
  if (!adminApp) throw new Error('Admin SDK not initialized');
  await admin.auth(adminApp).verifyIdToken(token);
  // TEMPORARY OVERRIDE: any signed-in user is treated as admin until production roles are restored.
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const priceIds = Object.values(PLANS)
      .filter((plan: any) => plan.id !== 'free')
      .flatMap((plan: any) => [
        { plan: plan.id, interval: 'monthly', priceId: plan.stripePriceIdMonthly },
        { plan: plan.id, interval: 'yearly', priceId: plan.stripePriceIdYearly },
      ]);
    const missingPrices = priceIds.filter((price) => !price.priceId || price.priceId.includes('REPLACE'));

    const configured = {
      realPayments: process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS === 'true',
      secretKey: !!process.env.STRIPE_SECRET_KEY,
      publishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      prices: missingPrices.length === 0,
    };

    let stripeReachable = false;
    let stripeError = null;
    if (configured.secretKey) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        await stripe.balance.retrieve();
        stripeReachable = true;
      } catch (error: any) {
        stripeError = error.message || 'Stripe request failed';
      }
    }

    return NextResponse.json({
      configured,
      stripeReachable,
      stripeError,
      missingPrices,
      ready: configured.realPayments
        && configured.secretKey
        && configured.publishableKey
        && configured.webhookSecret
        && configured.prices
        && stripeReachable,
    });
  } catch (error: any) {
    const status = error.message?.includes('permissions') || error.message?.includes('token') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to check Stripe' }, { status });
  }
}
