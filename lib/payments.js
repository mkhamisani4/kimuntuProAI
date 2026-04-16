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
// PLAN DEFINITIONS — 6-tier freemium-to-premium
// ──────────────────────────────────────────────
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    displayName: 'Kimuntu AI — Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    interval: null,
    savings: null,
    stripePriceId: null,
    features: [
      'Basic AI tools access across all 4 tracks (read-only previews)',
      '3 CV generations per month (ATS-basic, watermarked)',
      '1 Business Plan preview (executive summary only)',
      'Legal Chatbot: 5 questions/month (no document download)',
      'Live Avatar: 1 free 10-minute session (Career track only)',
      'Community access: Kimuntu AI Forum & Resource Hub',
    ],
  },
  career: {
    id: 'career',
    name: 'Career Premium',
    displayName: 'Kimuntu AI — Career Premium',
    monthlyPrice: 19.99,
    yearlyPrice: 191.90,
    interval: 'month',
    savings: 'Save 20%',
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_CAREER_MONTHLY_PRICE_ID || 'price_REPLACE_CAREER_MONTHLY',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_CAREER_YEARLY_PRICE_ID || 'price_REPLACE_CAREER_YEARLY',
    features: [
      'Unlimited CV & Resume Generation (ATS-optimized, 15+ templates)',
      'AI Job Matching Engine — 50,000+ US/Canada live job boards',
      'Personalized AI Career Roadmap (skills gap analysis + action plan)',
      'AI Career Accelerator: LinkedIn optimizer, salary negotiator',
      'Interview Prep Suite: industry-specific question banks (US & Canada)',
      'Live Avatar Interview Coaching: 2 free sessions (20 min) per month',
      'Pay-Per-Use: Additional Avatar sessions at $4.99 each (20 min)',
      'Bilingual documents: English + French auto-generated',
      'Priority email support (48-hour response)',
    ],
  },
  business: {
    id: 'business',
    name: 'Business Premium',
    displayName: 'Kimuntu AI — Business Premium',
    monthlyPrice: 29.99,
    yearlyPrice: 287.90,
    interval: 'month',
    savings: 'Save 20%',
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID || 'price_REPLACE_BUSINESS_MONTHLY',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID || 'price_REPLACE_BUSINESS_YEARLY',
    features: [
      'Full Business Plan Generator: Basic / Medium / Professional levels',
      'AI Financial Projections (3-year P&L, cash flow, break-even)',
      'Funding Opportunities Finder: US (SBA, SBIR) + Canada (BDC, IRAP)',
      'AI Website Builder: professional site in under 60 minutes',
      'Marketing Toolkit: AI ad copy, social media scheduler, email sequences',
      'Business Startup Accelerator: Kimuntu Connection Network',
      'AI Cold Outreach Engine (powered by Twilio integration)',
      'Business entity guidance: LLC (US) / Inc. (Canada) setup checklist',
      'Priority email support (48-hour response)',
    ],
  },
  legal: {
    id: 'legal',
    name: 'Legal Premium',
    displayName: 'Kimuntu AI — Legal Premium',
    monthlyPrice: 29.99,
    yearlyPrice: 287.90,
    interval: 'month',
    savings: 'Save 20%',
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_LEGAL_MONTHLY_PRICE_ID || 'price_REPLACE_LEGAL_MONTHLY',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_LEGAL_YEARLY_PRICE_ID || 'price_REPLACE_LEGAL_YEARLY',
    features: [
      'Full Legal Document Library: 50+ templates (US & Canada)',
      'AI Immigration Statement Builder (USCIS / IRCC)',
      'AI Family Cases, Business, Criminal (US/Canada)',
      'Virtual Lawyer Chatbot: unlimited questions (GPT-4 + legal RAG)',
      'Immigration Court Simulation: practice before real hearing',
      'AI Legal Match Finder: pro-bono and low-cost attorneys',
      'Contract Review Tool: flags risky clauses in plain language',
      'Live Avatar Legal Consultation: 2 free sessions (20 min) per month',
      'Pay-Per-Use: Additional Avatar sessions at $7.99 each (20 min)',
      'Priority email support (48-hour response)',
    ],
  },
  innovation: {
    id: 'innovation',
    name: 'Innovation Premium',
    displayName: 'Kimuntu AI — Innovation Premium',
    monthlyPrice: 79.99,
    yearlyPrice: 767.90,
    interval: 'month',
    savings: 'Save 20%',
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_INNOVATION_MONTHLY_PRICE_ID || 'price_REPLACE_INNOVATION_MONTHLY',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_INNOVATION_YEARLY_PRICE_ID || 'price_REPLACE_INNOVATION_YEARLY',
    features: [
      'AI Research & Innovation Lab: curated research databases',
      'Patent Intelligence Engine: prior art search + patent drafting (USPTO + CIPO)',
      'Idea Stress-Tester: AI validates business/invention viability',
      'Smart Policy Simulation: model regulatory impact on your business',
      'AI Learning Hub: personalized upskilling paths (US/Canada trends)',
      'ESG & Sustainability Suite: carbon footprint, CSR, B-Corp checklist',
      'Startup Pitch Coach: AI feedback on deck, financials, investor readiness',
      'Kimuntu AI Innovation Network: VCs, accelerators, universities',
      'Dedicated account manager + priority support (24-hour response)',
      'Early access to all new Kimuntu AI features',
    ],
  },
  fullPackage: {
    id: 'fullPackage',
    name: 'Full Package',
    displayName: 'Kimuntu AI — Full Package',
    monthlyPrice: 99,
    yearlyPrice: 950.40,
    interval: 'month',
    savings: 'Save 20%',
    bestSeller: true,
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_FULL_MONTHLY_PRICE_ID || 'price_REPLACE_FULL_MONTHLY',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_FULL_YEARLY_PRICE_ID || 'price_REPLACE_FULL_YEARLY',
    features: [
      'Career Premium — all features',
      'Business Premium — all features',
      'Legal Premium — all features',
      'Innovation Premium — all features',
      'All 50+ legal document templates',
      'AI funding finder (US + Canada)',
      'Patent intelligence engine',
      'ESG & sustainability suite',
      'Bilingual EN/FR + 50 languages',
      'All Live Avatar integrations',
    ],
    exclusiveFeatures: [
      'Priority AI Processing (2x faster response)',
      'Unlimited document generation across all tracks',
      'Advanced Analytics Dashboard (usage, insights, ROI)',
      'Live Avatar: 5 free sessions/month (20 min each)',
      'Pay-Per-Use Avatar: $3.99/session (discounted rate)',
      'Dedicated Account Manager',
      'White-label CV & documents (remove Kimuntu AI branding)',
      'API access (100 calls/month) for power users',
      'Early beta access to all new features',
      'Premium support: 12-hour response guarantee',
    ],
  },
};

// ──────────────────────────────────────────────
// CREDIT BUNDLE PRICING (Pay-Per-Use)
// ──────────────────────────────────────────────
export const CREDIT_BUNDLES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 5,
    price: 19.99,
    perCredit: 4.00,
    savings: null,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_STARTER_PRICE_ID || 'price_REPLACE_CREDITS_STARTER',
  },
  {
    id: 'standard',
    name: 'Standard Pack',
    credits: 15,
    price: 44.99,
    perCredit: 3.00,
    savings: 'Save 25%',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_STANDARD_PRICE_ID || 'price_REPLACE_CREDITS_STANDARD',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 40,
    price: 99.99,
    perCredit: 2.50,
    savings: 'Save 38%',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_PRO_PRICE_ID || 'price_REPLACE_CREDITS_PRO',
  },
  {
    id: 'team',
    name: 'Team Pack',
    credits: 100,
    price: 199.99,
    perCredit: 2.00,
    savings: 'Save 50%',
    bestValue: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_TEAM_PRICE_ID || 'price_REPLACE_CREDITS_TEAM',
  },
];

// ──────────────────────────────────────────────
// CREDIT USAGE — what 1 credit buys
// ──────────────────────────────────────────────
export const CREDIT_ACTIONS = [
  { action: 'Live Avatar Session — 20 min (Career or Business)', credits: 1 },
  { action: 'Live Avatar Legal Consultation — 20 min', credits: 1 },
  { action: 'On-Demand Legal Document Generation (complex)', credits: 1 },
  { action: 'Full Business Plan — Professional Level (standalone)', credits: 2 },
  { action: 'Patent Drafting Assistant Session', credits: 2 },
  { action: 'AI Cold Calling Campaign (up to 50 contacts)', credits: 3 },
  { action: 'Immigration Court Simulation — Full Session', credits: 2 },
];

// ──────────────────────────────────────────────
// PRO FEATURES LIST (shown on landing page)
// ──────────────────────────────────────────────
export const PRO_FEATURES = [
  'All 4 tracks fully unlocked',
  'Unlimited document generation',
  'Priority AI Processing (2x faster)',
  'Live Avatar: 5 free sessions/month',
  'Advanced Analytics Dashboard',
  'Dedicated Account Manager',
  'Premium support: 12-hour response',
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
