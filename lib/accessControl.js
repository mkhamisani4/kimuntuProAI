import { PLANS } from './payments';

export const PLAN_IDS = ['free', 'career', 'business', 'legal', 'innovation', 'fullPackage'];

export const PLAN_LABELS = {
  free: 'Free',
  career: 'Career Premium',
  business: 'Business Premium',
  legal: 'Legal Premium',
  innovation: 'Innovation Premium',
  fullPackage: 'Full Package',
};

export const TRACK_LABELS = {
  platform: 'Platform',
  career: 'Career',
  business: 'Business',
  legal: 'Legal',
  innovation: 'Innovation',
  documents: 'Documents',
};

export const DEFAULT_FEATURE_FLAGS = [
  {
    id: 'career-dashboard',
    track: 'career',
    name: 'Career Track Home',
    description: 'Main career dashboard and track overview.',
    enabled: true,
    requiredPlans: ['career', 'fullPackage'],
    routes: ['/dashboard/career'],
  },
  {
    id: 'career-resume-cover-letter',
    track: 'career',
    name: 'Resume & Cover Letter Builder',
    description: 'AI resume tailoring, cover letters, exports, and career document tools.',
    enabled: true,
    requiredPlans: ['career', 'fullPackage'],
    routes: ['/dashboard/career'],
  },
  {
    id: 'career-job-matching',
    track: 'career',
    name: 'Job Matching',
    description: 'AI job matching, recommendations, and application tracking.',
    enabled: true,
    requiredPlans: ['career', 'fullPackage'],
    routes: ['/dashboard/career/job-matching'],
  },
  {
    id: 'career-interview-coach',
    track: 'career',
    name: 'Interview Coach',
    description: 'Interview simulation, question generation, transcription, and feedback.',
    enabled: true,
    requiredPlans: ['career', 'fullPackage'],
    routes: ['/dashboard/career/interview'],
  },
  {
    id: 'career-personal-assistant',
    track: 'career',
    name: 'Career Personal Assistant',
    description: 'Document-aware career assistant with avatar support.',
    enabled: true,
    requiredPlans: ['career', 'fullPackage'],
    routes: ['/dashboard/career/personal-assistant'],
  },
  {
    id: 'business-dashboard',
    track: 'business',
    name: 'Business Track Home',
    description: 'Business dashboard, assistants, recent work, and quick actions.',
    enabled: true,
    requiredPlans: ['business', 'fullPackage'],
    routes: ['/dashboard/business'],
  },
  {
    id: 'business-planning',
    track: 'business',
    name: 'Business Planning Tools',
    description: 'Business plans, market analysis, financial overviews, and funding strategy.',
    enabled: true,
    requiredPlans: ['business', 'fullPackage'],
    routes: [
      '/dashboard/business/ai-assistant',
      '/dashboard/business/plan-generator',
      '/dashboard/business/streamlined-plan',
      '/dashboard/business/market-analysis',
      '/dashboard/business/financial-overview',
      '/dashboard/business/exec-summary',
      '/dashboard/business/funding-strategy',
      '/dashboard/business/competitor-analysis',
    ],
  },
  {
    id: 'business-logo-studio',
    track: 'business',
    name: 'Logo Studio',
    description: 'Logo generation, editing, saved brand marks, and export tools.',
    enabled: true,
    requiredPlans: ['business', 'fullPackage'],
    routes: ['/dashboard/business/logo-studio', '/dashboard/business/logos'],
  },
  {
    id: 'business-websites',
    track: 'business',
    name: 'Website Builder',
    description: 'AI website builder, generated sites, hosting-ready pages, and edits.',
    enabled: true,
    requiredPlans: ['business', 'fullPackage'],
    routes: ['/dashboard/business/websites', '/dashboard/business/website-builder'],
  },
  {
    id: 'business-marketing',
    track: 'business',
    name: 'Marketing Suite',
    description: 'Marketing dashboard, email campaigns, SEO, content calendar, and social tools.',
    enabled: true,
    requiredPlans: ['business', 'fullPackage'],
    routes: ['/dashboard/business/marketing', '/dashboard/business/marketing-suite'],
  },
  {
    id: 'legal-dashboard',
    track: 'legal',
    name: 'Legal Track Home',
    description: 'Legal dashboard, service catalog, and assistant launcher.',
    enabled: true,
    requiredPlans: ['legal', 'fullPackage'],
    routes: ['/dashboard/legal'],
  },
  {
    id: 'legal-document-analyzer',
    track: 'legal',
    name: 'Legal Document Analyzer',
    description: 'Upload and analyze legal documents with issue spotting and follow-up chat.',
    enabled: true,
    requiredPlans: ['legal', 'fullPackage'],
    routes: ['/dashboard/legal/document-analyzer'],
  },
  {
    id: 'legal-assistants',
    track: 'legal',
    name: 'Legal Assistants',
    description: 'Immigration, family, business, contracts, consumer, employment, litigation, and criminal assistants.',
    enabled: true,
    requiredPlans: ['legal', 'fullPackage'],
    routes: [
      '/dashboard/legal/ai-agent',
      '/dashboard/legal/immigration',
      '/dashboard/legal/family',
      '/dashboard/legal/business',
      '/dashboard/legal/contracts',
      '/dashboard/legal/consumer',
      '/dashboard/legal/employment',
      '/dashboard/legal/litigation',
      '/dashboard/legal/criminal',
    ],
  },
  {
    id: 'innovation-dashboard',
    track: 'innovation',
    name: 'Innovation Track',
    description: 'Innovation hub, research, patent, ESG, pitch, and future-intelligence tools.',
    enabled: true,
    requiredPlans: ['innovation', 'fullPackage'],
    routes: ['/dashboard/innovative'],
  },
  {
    id: 'documents-library',
    track: 'documents',
    name: 'Documents Library',
    description: 'Saved documents, exports, generated files, and document shortcuts.',
    enabled: true,
    requiredPlans: ['career', 'business', 'legal', 'innovation', 'fullPackage'],
    routes: ['/dashboard/documents'],
  },
];

export const PUBLIC_DASHBOARD_ROUTES = [
  '/dashboard',
  '/dashboard/overview',
  '/dashboard/support',
  '/dashboard/settings',
  '/dashboard/pricing',
  '/dashboard/checkout',
  '/dashboard/subscription',
];

export function normalizePlanId(planId) {
  if (planId === 'pro') return 'fullPackage';
  if (planId === 'starter') return 'career';
  if (PLAN_IDS.includes(planId)) return planId;
  return 'free';
}

export function getPlanLabel(planId) {
  return PLAN_LABELS[normalizePlanId(planId)] || PLAN_LABELS.free;
}

export function getPlanPrice(planId) {
  const plan = PLANS[normalizePlanId(planId)] || PLANS.free;
  return plan.monthlyPrice || 0;
}

export function hasActivePlan(profile = {}) {
  const safeProfile = profile || {};
  const planId = normalizePlanId(safeProfile.subscriptionTier);
  if (planId === 'free') return true;
  return ['active', 'trialing'].includes(safeProfile.subscriptionStatus || 'active');
}

export function isFeatureAllowedForPlan(feature, planId, status = 'active') {
  if (!feature?.enabled) return false;
  const normalizedPlan = normalizePlanId(planId);
  if (normalizedPlan !== 'free' && !['active', 'trialing'].includes(status || 'active')) {
    return false;
  }
  const requiredPlans = Array.isArray(feature.requiredPlans) && feature.requiredPlans.length
    ? feature.requiredPlans.map(normalizePlanId)
    : ['free'];
  return requiredPlans.includes(normalizedPlan) || requiredPlans.includes('free');
}

export function featureMatchesPath(feature, pathname) {
  return (feature.routes || []).some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function getRouteFeature(pathname, features = DEFAULT_FEATURE_FLAGS) {
  const activeFeatures = Array.isArray(features) && features.length
    ? mergeFeatureDefaults(features)
    : DEFAULT_FEATURE_FLAGS;
  return activeFeatures
    .filter((feature) => featureMatchesPath(feature, pathname))
    .sort((a, b) => Math.max(...(b.routes || ['']).map((r) => r.length)) - Math.max(...(a.routes || ['']).map((r) => r.length)))[0] || null;
}

export function isPublicDashboardRoute(pathname) {
  return PUBLIC_DASHBOARD_ROUTES.some((route) => {
    if (route === '/dashboard') return pathname === route;
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

export function canAccessPath(pathname, profile = {}, features = DEFAULT_FEATURE_FLAGS) {
  if (!pathname?.startsWith('/dashboard')) return true;
  if (isPublicDashboardRoute(pathname)) return true;
  // TEMPORARY OVERRIDE: signed-in users are treated as fullPackage while production roles are repaired.
  if (profile?.uid) return true;
  const safeProfile = profile || {};
  const feature = getRouteFeature(pathname, features);
  if (!feature) return false;
  return isFeatureAllowedForPlan(feature, safeProfile.subscriptionTier, safeProfile.subscriptionStatus);
}

export function mergeFeatureDefaults(features = []) {
  const incoming = new Map(features.map((feature) => [feature.id, feature]));
  const merged = DEFAULT_FEATURE_FLAGS.map((base) => ({ ...base, ...(incoming.get(base.id) || {}) }));
  const known = new Set(DEFAULT_FEATURE_FLAGS.map((feature) => feature.id));
  features.forEach((feature) => {
    if (!known.has(feature.id)) merged.push(feature);
  });
  return merged;
}
