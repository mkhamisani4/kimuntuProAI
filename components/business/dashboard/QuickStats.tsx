'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Globe, Zap, DollarSign, Palette } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { fetchAuthed } from '@/lib/api/fetchAuthed';

interface QuickStatsProps {
  tenantId: string;
  userId?: string;
}

interface Stats {
  thisMonth: {
    plansGenerated: number;
    websitesBuilt: number;
    logosCreated: number;
    tokensUsed: number;
    costCents: number;
  };
  allTime: {
    totalPlans: number;
    totalWebsites: number;
    totalLogos: number;
    primaryLogos: number;
    tokensUsed: number;
    costCents: number;
  };
  quota: {
    used: number;
    limit: number;
    resetsAt: string;
  };
}

export default function QuickStats({ tenantId, userId }: QuickStatsProps) {
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const params = new URLSearchParams({ tenantId });
        if (userId) params.append('userId', userId);

        const response = await fetchAuthed(`/api/user/stats?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch stats');
        }

        setStats(data.stats);
        setError(null);
      } catch (err: any) {
        console.error('[QuickStats] Failed to fetch stats:', err);
        setError('__failedLoadStats__');
      } finally {
        setLoading(false);
      }
    }

    if (tenantId) {
      fetchStats();
    }
  }, [tenantId, userId]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur rounded-lg border border-gray-800 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          {t.biz_thisMonth}
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
              <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !stats) {
    return (
      <div className="bg-white/5 backdrop-blur rounded-lg border border-gray-800 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          {t.biz_thisMonth}
        </h3>
        <div className="text-sm text-red-400">{error === '__failedLoadStats__' ? t.biz_failedLoadStats : (error || t.biz_noDataAvailable)}</div>
      </div>
    );
  }

  const formatCost = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1_000_000) {
      return `${(tokens / 1_000_000).toFixed(1)}M`;
    } else if (tokens >= 1_000) {
      return `${(tokens / 1_000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  return (
    <div className="space-y-4">
      {/* This Month Stats */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          {t.biz_thisMonth}
        </h3>
        <div className="space-y-4">
          {/* Plans Generated */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.thisMonth.plansGenerated}
                </div>
                <div className="text-xs text-gray-500">{t.biz_plansGenerated}</div>
              </div>
            </div>
          </div>

          {/* Websites Built */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Globe size={20} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.thisMonth.websitesBuilt}
                </div>
                <div className="text-xs text-gray-500">{t.biz_websitesBuilt}</div>
              </div>
            </div>
          </div>

          {/* Logos Created */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Palette size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.thisMonth.logosCreated}
                </div>
                <div className="text-xs text-gray-500">{t.biz_logosCreated}</div>
              </div>
            </div>
          </div>

          {/* Usage & Cost */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-orange-500" />
                <span className="text-sm text-gray-500">{t.biz_tokensUsed}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatTokens(stats.thisMonth.tokensUsed)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-sm text-gray-500">{t.biz_usageCost}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatCost(stats.thisMonth.costCents)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* All Time Stats */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide mb-4">
          {t.biz_allTime}
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.allTime.totalPlans}
            </div>
            <div className="text-xs text-emerald-700">{t.biz_totalPlans}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.allTime.totalWebsites}
            </div>
            <div className="text-xs text-emerald-700">{t.biz_totalWebsites}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.allTime.totalLogos}
            </div>
            <div className="text-xs text-emerald-700">{t.biz_totalLogos}</div>
          </div>
        </div>
        <div className="pt-4 border-t border-emerald-200">
          <div className="text-sm text-emerald-800">
            {t.biz_totalSpent} <span className="font-semibold">{formatCost(stats.allTime.costCents)}</span>
          </div>
        </div>
      </div>

      {/* Quota Status - Always show when there's any usage */}
      {(stats.quota.used > 0 || stats.thisMonth.tokensUsed > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {t.biz_monthlyQuota}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{t.biz_usage}</span>
              <span className="font-semibold text-gray-900">
                {stats.quota.used}% of {stats.quota.limit}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${stats.quota.used >= 90
                    ? 'bg-red-500'
                    : stats.quota.used >= 70
                      ? 'bg-orange-500'
                      : 'bg-emerald-500'
                  }`}
                style={{ width: `${Math.min(100, stats.quota.used)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {t.biz_resets} {new Date(stats.quota.resetsAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
