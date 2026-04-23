import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminApp, adminDb } from '@kimuntupro/db/firebase/admin';
import { DEFAULT_FEATURE_FLAGS, getPlanPrice, mergeFeatureDefaults, normalizePlanId } from '@/lib/accessControl';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) throw new Error('Missing authorization token');
  if (!adminApp || !adminDb) throw new Error('Admin SDK not initialized');

  const decoded = await admin.auth(adminApp).verifyIdToken(token);
  const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    throw new Error('Insufficient permissions');
  }
  return decoded.uid;
}

function iso(value: any) {
  return value?.toDate?.()?.toISOString?.() || value || null;
}

function getDateValue(value: any): Date | null {
  const resolved = value?.toDate?.() || value;
  if (!resolved) return null;
  const date = new Date(resolved);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDateParam(value: string | null, fallback: Date) {
  if (!value) return fallback;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function buildBuckets(start: Date, end: Date) {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000));
  const bucketCount = Math.min(12, Math.max(2, Math.ceil(days / 7)));
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = new Date(start);
    bucketStart.setDate(start.getDate() + Math.floor((index / bucketCount) * days));
    const bucketEnd = new Date(start);
    bucketEnd.setDate(start.getDate() + Math.floor(((index + 1) / bucketCount) * days));
    return {
      start: bucketStart,
      end: index === bucketCount - 1 ? end : bucketEnd,
      date: `${months[bucketStart.getMonth()]} ${bucketStart.getDate()}`,
      requests: 0,
      users: 0,
      revenue: 0,
    };
  });
}

function addToBucket(buckets: ReturnType<typeof buildBuckets>, date: Date | null, field: 'requests' | 'users' | 'revenue', amount = 1) {
  if (!date) return;
  const bucket = buckets.find((item) => date >= item.start && date <= item.end);
  if (bucket) bucket[field] += amount;
}

async function listAuthUsers() {
  const users: admin.auth.UserRecord[] = [];
  let pageToken: string | undefined;
  do {
    const result = await admin.auth(adminApp!).listUsers(1000, pageToken);
    users.push(...result.users);
    pageToken = result.pageToken;
  } while (pageToken);
  return users;
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const today = new Date();
    const defaultStart = new Date(today);
    defaultStart.setDate(today.getDate() - 30);
    const startDate = parseDateParam(req.nextUrl.searchParams.get('start'), defaultStart);
    const endDate = parseDateParam(req.nextUrl.searchParams.get('end'), today);
    endDate.setHours(23, 59, 59, 999);

    const [authUsers, userProfilesSnap, supportSnap, featuresSnap, usageSnap] = await Promise.all([
      listAuthUsers(),
      adminDb!.collection('users').get(),
      adminDb!.collection('support_tickets').orderBy('createdAt', 'desc').limit(25).get(),
      adminDb!.collection('feature_flags').get(),
      adminDb!.collection('usage_logs').orderBy('createdAt', 'desc').limit(5000).get().catch(() => null),
    ]);

    const profiles = new Map(userProfilesSnap.docs.map((doc) => [doc.id, doc.data()]));
    const users = authUsers.map((authUser) => {
      const profile = profiles.get(authUser.uid) || {};
      const plan = normalizePlanId(profile.subscriptionTier);
      return {
        uid: authUser.uid,
        email: authUser.email || profile.email || null,
        displayName: authUser.displayName || profile.displayName || null,
        createdAt: authUser.metadata.creationTime,
        lastSignIn: authUser.metadata.lastSignInTime,
        disabled: authUser.disabled,
        role: profile.role || 'user',
        subscriptionTier: plan,
        subscriptionStatus: profile.subscriptionStatus || (plan === 'free' ? null : 'active'),
      };
    });

    const activePaidUsers = users.filter((user) => (
      user.subscriptionTier !== 'free' && ['active', 'trialing'].includes(user.subscriptionStatus || 'active')
    ));
    const mrr = activePaidUsers.reduce((sum, user) => sum + getPlanPrice(user.subscriptionTier), 0);
    const buckets = buildBuckets(startDate, endDate);
    users.forEach((user) => {
      const createdAt = getDateValue(user.createdAt);
      if (createdAt && createdAt >= startDate && createdAt <= endDate) {
        addToBucket(buckets, createdAt, 'users', 1);
        if (user.subscriptionTier !== 'free') addToBucket(buckets, createdAt, 'revenue', getPlanPrice(user.subscriptionTier));
      }
    });
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6);

    const features = featuresSnap.empty
      ? DEFAULT_FEATURE_FLAGS
      : mergeFeatureDefaults(featuresSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    const enabledFeatures = features.filter((feature) => feature.enabled).length;

    const tickets = supportSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const openTickets = tickets.filter((ticket: any) => !ticket.status || ticket.status === 'open').length;

    const byAssistant: Record<string, { requests: number; costCents: number; tokens: number }> = {};
    let totalRequests = 0;
    let totalCostCents = 0;
    usageSnap?.docs.forEach((doc) => {
      const row = doc.data();
      const createdAt = getDateValue(row.createdAt);
      if (createdAt && (createdAt < startDate || createdAt > endDate)) return;
      const assistant = row.assistant || 'unknown';
      totalRequests += 1;
      totalCostCents += row.costCents || 0;
      if (!byAssistant[assistant]) byAssistant[assistant] = { requests: 0, costCents: 0, tokens: 0 };
      byAssistant[assistant].requests += 1;
      byAssistant[assistant].costCents += row.costCents || 0;
      byAssistant[assistant].tokens += (row.tokensIn || 0) + (row.tokensOut || 0);
      addToBucket(buckets, createdAt, 'requests', 1);
    });

    const featureUsage = Object.entries(byAssistant)
      .sort((a, b) => b[1].requests - a[1].requests)
      .slice(0, 6)
      .map(([name, metrics]) => ({ name, requests: metrics.requests }));

    const stripeConfigured =
      process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS === 'true'
      && !!process.env.STRIPE_SECRET_KEY
      && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    const newUsersInRange = users.filter((user) => {
      const createdAt = getDateValue(user.createdAt);
      return createdAt && createdAt >= startDate && createdAt <= endDate;
    }).length;
    const activeUsers = users.filter((user) => {
      const lastSignIn = getDateValue(user.lastSignIn);
      return !user.disabled && lastSignIn && lastSignIn >= startDate && lastSignIn <= endDate;
    }).length;
    const inactiveUsers = Math.max(0, users.length - activeUsers - newUsersInRange);

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        newUsers: newUsersInRange,
        activeUsers,
        inactiveUsers,
        paidUsers: activePaidUsers.length,
        mrr,
        aiRequests: totalRequests,
        aiCostCents: totalCostCents,
        openTickets,
        enabledFeatures,
        stripeConfigured,
      },
      recentUsers,
      featureUsage,
      platformData: buckets.map(({ date, requests, users, revenue }) => ({ date, requests, users, revenue })),
      growthSlices: [
        { name: 'New Users', value: newUsersInRange, color: '#3b82f6' },
        { name: 'Active', value: activeUsers, color: '#8b5cf6' },
        { name: 'Inactive', value: inactiveUsers, color: '#d1d5db' },
      ],
      alerts: tickets.slice(0, 5).map((ticket: any) => ({
        id: ticket.id,
        type: ticket.priority === 'high' || ticket.priority === 'urgent' ? 'warning' : 'info',
        msg: ticket.subject || 'New support ticket',
        time: iso(ticket.createdAt) || new Date().toISOString(),
      })),
      source: 'firebase',
    });
  } catch (error: any) {
    const status = error.message?.includes('permissions') || error.message?.includes('token') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to load admin dashboard' }, { status });
  }
}
