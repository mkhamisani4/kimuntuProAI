'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';
import { canAccessPath, getPlanLabel, getRouteFeature } from '@/lib/accessControl';

export default function DashboardAccessGate({ children }) {
  const pathname = usePathname();
  const { isDark } = useTheme();
  const { loading, profile, features } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const allowed = canAccessPath(pathname, profile, features);
  if (allowed) return children;

  const feature = getRouteFeature(pathname, features);
  const required = (feature?.requiredPlans || []).map(getPlanLabel).join(' or ');

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className={`max-w-lg w-full rounded-2xl border p-8 text-center ${
        isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-black/5 shadow-sm'
      }`}>
        <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <Lock className="h-7 w-7 text-emerald-500" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-white/45' : 'text-black/45'}`}>
            Plan Locked
          </p>
        </div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          {feature?.name || 'This tool'} is not included in your current plan.
        </h1>
        <p className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-white/55' : 'text-black/60'}`}>
          Your current plan is {getPlanLabel(profile?.subscriptionTier)}. This tool requires {required || 'an upgraded plan'}.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/pricing" className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600">
            View Plans
          </Link>
          <Link href="/dashboard" className={`rounded-xl border px-5 py-3 text-sm font-semibold ${
            isDark ? 'border-white/10 text-white/70 hover:bg-white/5' : 'border-black/10 text-black/70 hover:bg-black/5'
          }`}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
