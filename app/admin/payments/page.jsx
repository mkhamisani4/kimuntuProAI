'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { DollarSign, ArrowUpRight, CheckCircle2, XCircle, Users, CreditCard } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { PLAN_LABELS, getPlanPrice, normalizePlanId } from '@/lib/accessControl';

const TIER_PRICES = {
  free: 0,
  career: 19.99,
  business: 29.99,
  legal: 29.99,
  innovation: 79.99,
  fullPackage: 99,
};

const MOCK_SUBSCRIBERS = [
  { uid: 'mock-001', email: 'james.okafor@gmail.com',      subscriptionTier: 'pro',      subscriptionStatus: 'active',   createdAt: '2024-09-03T10:22:00Z' },
  { uid: 'mock-002', email: 'amara.diallo@outlook.com',    subscriptionTier: 'pro',      subscriptionStatus: 'active',   createdAt: '2024-10-17T14:05:00Z' },
  { uid: 'mock-003', email: 'sofia.reyes@icloud.com',      subscriptionTier: 'free',     subscriptionStatus: null,       createdAt: '2024-11-22T09:47:00Z' },
  { uid: 'mock-004', email: 'marcus.lee@yahoo.com',        subscriptionTier: 'starter',  subscriptionStatus: 'active',   createdAt: '2025-01-08T16:33:00Z' },
  { uid: 'mock-005', email: 'priya.nair@gmail.com',        subscriptionTier: 'pro',      subscriptionStatus: 'active',   createdAt: '2025-02-14T12:00:00Z' },
  { uid: 'mock-006', email: 'david.mensah@hotmail.com',    subscriptionTier: 'free',     subscriptionStatus: null,       createdAt: '2025-03-01T08:10:00Z' },
  { uid: 'mock-007', email: 'fatima.al-hassan@gmail.com',  subscriptionTier: 'starter',  subscriptionStatus: 'active',   createdAt: '2025-03-19T17:55:00Z' },
  { uid: 'mock-008', email: 'ethan.carter@protonmail.com', subscriptionTier: 'free',     subscriptionStatus: null,       createdAt: '2025-04-05T11:22:00Z' },
  { uid: 'mock-009', email: 'yuki.tanaka@gmail.com',       subscriptionTier: 'pro',      subscriptionStatus: 'trialing', createdAt: '2025-05-12T13:40:00Z' },
  { uid: 'mock-010', email: 'chloe.dupont@gmail.com',      subscriptionTier: 'starter',  subscriptionStatus: 'active',   createdAt: '2025-06-28T10:15:00Z' },
  { uid: 'mock-011', email: 'kwame.asante@gmail.com',      subscriptionTier: 'free',     subscriptionStatus: null,       createdAt: '2025-07-04T09:00:00Z' },
  { uid: 'mock-012', email: 'isabella.rossi@gmail.com',    subscriptionTier: 'starter',  subscriptionStatus: 'canceled', createdAt: '2025-08-11T15:30:00Z' },
  { uid: 'mock-013', email: 'noah.ibrahim@gmail.com',      subscriptionTier: 'pro',      subscriptionStatus: 'past_due', createdAt: '2025-09-02T09:15:00Z' },
  { uid: 'mock-014', email: 'layla.kim@icloud.com',        subscriptionTier: 'starter',  subscriptionStatus: 'active',   createdAt: '2025-09-20T14:30:00Z' },
  { uid: 'mock-015', email: 'tom.nguyen@gmail.com',        subscriptionTier: 'free',     subscriptionStatus: null,       createdAt: '2025-10-05T11:00:00Z' },
];

async function getAdminHeaders() {
  const user = auth.currentUser || await new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      unsubscribe();
      resolve(currentUser);
    });
  });
  const token = user ? await user.getIdToken() : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function StatCard({ label, value, sub, icon: Icon }) {
  const { isDark } = useTheme();
  return (
    <div className={`rounded-2xl p-6 border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.02] border-black/5'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-black/50'}`}>{label}</h3>
        <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
          <Icon className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
      <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{value}</p>
      {sub && (
        <div className="flex items-center gap-1 mt-2 text-sm text-emerald-500">
          <ArrowUpRight className="w-4 h-4" />
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

export default function AdminPaymentsPage() {
  const { isDark } = useTheme();
  const [subscribers, setSubscribers] = useState([]);
  const [stripeHealth, setStripeHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = await getAdminHeaders();
        const [usersRes, stripeRes] = await Promise.all([
          fetch('/api/admin/users', { headers }),
          fetch('/api/admin/payments/stripe', { headers }),
        ]);
        const usersData = await usersRes.json().catch(() => ({}));
        const stripeData = await stripeRes.json().catch(() => ({}));
        if (!usersRes.ok) throw new Error(usersData.error || 'Failed to load users');
        setSubscribers(usersData.users || MOCK_SUBSCRIBERS);
        setStripeHealth(stripeData);
      } catch (err) {
        setError(err.message);
        setSubscribers(MOCK_SUBSCRIBERS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const paid = subscribers.filter((u) => normalizePlanId(u.subscriptionTier) !== 'free');
  const mrr = paid.reduce((sum, u) => sum + getPlanPrice(u.subscriptionTier), 0);
  const active = paid.filter((u) => !u.subscriptionStatus || u.subscriptionStatus === 'active').length;

  const th = `py-4 px-6 text-left text-sm font-semibold ${isDark ? 'text-white/50' : 'text-black/50'}`;

  return (
    <div>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Payments & Subscriptions</h1>
        <p className={`mt-1 ${isDark ? 'text-white/50' : 'text-black/50'}`}>Manage user tiers and view billing overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Est. Monthly Revenue" value={`$${mrr.toLocaleString()}`} sub="Based on active subscriptions" icon={DollarSign} />
        <StatCard label="Paid Subscribers" value={active} sub={`${paid.length} total with a plan`} icon={CheckCircle2} />
        <StatCard label="Total Users" value={subscribers.length} sub={`${subscribers.length - paid.length} on free tier`} icon={Users} />
      </div>

      {stripeHealth && (
        <div className={`rounded-2xl border p-5 mb-8 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-sm'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${stripeHealth.ready ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                <CreditCard className={`w-5 h-5 ${stripeHealth.ready ? 'text-emerald-500' : 'text-amber-500'}`} />
              </div>
              <div>
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Stripe Integration</h2>
                <p className={`text-sm ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                  {stripeHealth.ready
                    ? 'Stripe is configured and reachable.'
                    : stripeHealth.stripeError || 'Stripe setup is incomplete.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stripeHealth.configured || {}).map(([key, ok]) => (
                <span key={key} className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                  ok ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {key}: {ok ? 'ok' : 'missing'}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" />
        </div>
      )}

      {error && (
        <div className={`rounded-xl p-4 text-sm mb-6 border ${
          isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-black/5'}`}>
          <div className={`px-6 py-5 border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Subscription Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDark ? 'divide-white/10' : 'divide-black/5'}`}>
              <thead className={isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}>
                <tr>
                  <th className={th}>User</th>
                  <th className={th}>Plan</th>
                  <th className={th}>Amount / mo</th>
                  <th className={th}>Status</th>
                  <th className={th}>Joined</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`py-12 text-center text-sm ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                      No user data found.
                    </td>
                  </tr>
                ) : subscribers.map((user) => {
                  const tier = normalizePlanId(user.subscriptionTier);
                  const price = TIER_PRICES[tier] || 0;
                  const status = user.subscriptionStatus || (tier === 'free' ? 'free' : 'active');
                  return (
                    <tr key={user.uid} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]'}`}>
                      <td className={`py-4 px-6 text-sm ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                        {user.email || user.uid}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium border capitalize ${
                          isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {PLAN_LABELS[tier] || tier}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                        {price === 0 ? 'Free' : `$${price}.00`}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {status === 'active' ? (
                          <span className="flex items-center gap-1.5 text-emerald-500">
                            <CheckCircle2 className="w-4 h-4" /> Active
                          </span>
                        ) : status === 'trialing' ? (
                          <span className="flex items-center gap-1.5 text-sky-400">
                            <CheckCircle2 className="w-4 h-4" /> Trialing
                          </span>
                        ) : status === 'past_due' ? (
                          <span className="flex items-center gap-1.5 text-red-400">
                            <XCircle className="w-4 h-4" /> Past Due
                          </span>
                        ) : status === 'canceled' ? (
                          <span className="flex items-center gap-1.5 text-red-400">
                            <XCircle className="w-4 h-4" /> Canceled
                          </span>
                        ) : (
                          <span className={isDark ? 'text-white/30' : 'text-black/30'}>—</span>
                        )}
                      </td>
                      <td className={`py-4 px-6 text-sm ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
