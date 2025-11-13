'use client';

/**
 * Recent Activity Component
 * Displays the last 5 assistant results for quick access
 * Phase B - Firebase Recent Activity
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRecentResults, type AssistantResult } from '@kimuntupro/db';

interface RecentActivityProps {
  tenantId: string;
  limit?: number;
}

export default function RecentActivity({ tenantId, limit = 5 }: RecentActivityProps) {
  const [results, setResults] = useState<AssistantResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchRecentResults() {
      try {
        setLoading(true);
        const recentResults = await getRecentResults(tenantId, limit);
        setResults(recentResults);
        setError(null);
      } catch (err: any) {
        console.error('[RecentActivity] Failed to fetch results:', err);
        setError('Failed to load recent activity');
      } finally {
        setLoading(false);
      }
    }

    if (tenantId) {
      fetchRecentResults();
    }
  }, [tenantId, limit]);

  const getAssistantLabel = (assistant: string): string => {
    const labels: Record<string, string> = {
      streamlined_plan: 'Streamlined Plan',
      exec_summary: 'Executive Summary',
      market_analysis: 'Market Analysis',
      financial_overview: 'Financial Overview',
    };
    return labels[assistant] || assistant;
  };

  const getAssistantColor = (assistant: string): string => {
    const colors: Record<string, string> = {
      streamlined_plan: 'bg-blue-100 text-blue-800',
      exec_summary: 'bg-purple-100 text-purple-800',
      market_analysis: 'bg-green-100 text-green-800',
      financial_overview: 'bg-orange-100 text-orange-800',
    };
    return colors[assistant] || 'bg-gray-100 text-gray-800';
  };

  const getAssistantRoute = (assistant: string): string => {
    const routes: Record<string, string> = {
      streamlined_plan: '/dashboard/business/streamlined-plan',
      exec_summary: '/dashboard/business/exec-summary',
      market_analysis: '/dashboard/business/market-analysis',
      financial_overview: '/dashboard/business/financial-overview',
    };
    return routes[assistant] || '/dashboard/business';
  };

  const formatRelativeTime = (date: Date | undefined): string => {
    if (!date) return 'Unknown';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleOpen = (result: AssistantResult) => {
    const route = getAssistantRoute(result.assistant);
    router.push(`${route}?resultId=${result.id}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-gray-500 text-sm py-8 text-center">
          No activity yet. Generate your first business plan or analysis to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={result.id}
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            onClick={() => handleOpen(result)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getAssistantColor(
                    result.assistant
                  )}`}
                >
                  {getAssistantLabel(result.assistant)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(result.createdAt)}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 truncate" title={result.title}>
                {result.title}
              </h3>
              {result.summary && (
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {result.summary}
                </p>
              )}
            </div>
            <button
              className="ml-4 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleOpen(result);
              }}
            >
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
