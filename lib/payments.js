/**
 * ============================================================
 * KIMUNTU PRO AI — PAYMENT CONFIGURATION
 * ============================================================
 *
 * This is the single source of truth for all payment settings.
 * Both the mock system and real Stripe read from here.
 *
 * To switch from mock to real payments, change USE_REAL_PAYMENTS
 * to true (or set the env var). Everything else is automatic.
 * ============================================================
 */

// ──────────────────────────────────────────────
// MASTER SWITCH — flip this to enable real Stripe
// ──────────────────────────────────────────────
export const USE_REAL_PAYMENTS =
  process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS === 'true';

// ──────────────────────────────────────────────
// PLAN DEFINITIONS
// ──────────────────────────────────────────────
export const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    displayName: 'Kimuntu Pro AI — Monthly',
    price: 19.99,
    interval: 'month',
    savings: null,
    // Replace with your real Stripe Price ID after setup (Step 3 in PAYMENTS.md)
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_REPLACE_ME_MONTHLY',
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly',
    displayName: 'Kimuntu Pro AI — Yearly',
    price: 199.99,
    interval: 'year',
    savings: 'Save $39.89/year',
    // Replace with your real Stripe Price ID after setup (Step 3 in PAYMENTS.md)
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_REPLACE_ME_YEARLY',
  },
};

// ──────────────────────────────────────────────
// PRO FEATURES LIST (shown on pricing + checkout)
// ──────────────────────────────────────────────
export const PRO_FEATURES = [
  'Unlimited AI-powered tools',
  'All 4 professional tracks',
  'Unlimited business plans & documents',
  'Advanced interview simulator',
  'Priority support',
  'No watermarks on exports',
  'Unlimited tokens',
];

// ──────────────────────────────────────────────
// HELPERS — used by checkout + subscription pages
// ──────────────────────────────────────────────

/**
 * Get the current user's subscription from localStorage (mock mode)
 * or from the server (real mode — you'll call the API instead).
 */
export function getMockSubscription(uid) {
  if (typeof window === 'undefined' || !uid) return null;
  const stored = localStorage.getItem(`kimuntu_subscription_${uid}`);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Save a mock subscription to localStorage.
 */
export function saveMockSubscription(uid, subscription) {
  if (typeof window === 'undefined' || !uid) return;
  localStorage.setItem(`kimuntu_subscription_${uid}`, JSON.stringify(subscription));
}

/**
 * Check if a user has an active Pro subscription.
 * Works in both mock and real mode.
 */
export async function hasActiveSubscription(uid) {
  if (USE_REAL_PAYMENTS) {
    // In real mode, call your API endpoint
    try {
      const res = await fetch(`/api/payments/status?uid=${uid}`);
      const data = await res.json();
      return data.active === true;
    } catch {
      return false;
    }
  }
  // Mock mode — check localStorage
  const sub = getMockSubscription(uid);
  return sub?.status === 'active';
}
