'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRecentResults, type AssistantResult } from '@kimuntupro/db';
import { FileText, RefreshCw, ExternalLink, Trash2 } from 'lucide-react';
import EmptyState from './shared/EmptyState';

interface AssistantsTabProps {
  tenantId: string;
  limit?: number;
}

export default function AssistantsTab({ tenantId, limit = 8 }: AssistantsTabProps) {
  const [results, setResults] = useState<AssistantResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchRecentResults() {
      try {
        setLoading(true);
        const recentResults = await getRecentResults(tenantId, limit);
        setResults(recentResults);
        setError(null);
      } catch (err: any) {
        console.error('[AssistantsTab] Failed to fetch results:', err);
        if (err.code === 'permission-denied' || err.message?.includes('permission')) {
          setResults([]);
          setError(null);
        } else {
          setError('Failed to load assistant results');
        }
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
      streamlined_plan: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      exec_summary: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      market_analysis: 'bg-green-500/20 text-green-400 border-green-500/30',
      financial_overview: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return colors[assistant] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

  const handleRegenerate = (result: AssistantResult) => {
    const route = getAssistantRoute(result.assistant);
    router.push(route);
  };

  const handleDelete = async (resultId: string, resultTitle: string) => {
    // Show confirmation dialog
    if (showDeleteConfirm !== resultId) {
      setShowDeleteConfirm(resultId);
      return;
    }

    try {
      setDeletingId(resultId);

      const response = await fetch(`/api/ai/results/${resultId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete result');
      }

      // Optimistically remove from UI
      setResults((prev) => prev.filter((r) => r.id !== resultId));
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('[AssistantsTab] Delete failed:', err);
      alert(`Failed to delete result: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // Filter results
  const filteredResults = filter === 'all'
    ? results
    : results.filter(r => r.assistant === filter);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-4 bg-white/5 rounded-lg border border-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-full"></div>
              </div>
              <div className="h-8 w-20 bg-gray-700 rounded ml-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  // Empty state
  if (results.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No AI Assistants Yet"
        description="Generate your first business plan or analysis to see results here. Our AI assistants can help you create comprehensive plans in minutes."
        actionLabel="Generate Business Plan"
        actionRoute="/dashboard/business/streamlined-plan"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Dropdown */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 text-sm bg-white/5 border border-gray-700 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Types</option>
          <option value="streamlined_plan">Streamlined Plan</option>
          <option value="exec_summary">Executive Summary</option>
          <option value="market_analysis">Market Analysis</option>
          <option value="financial_overview">Financial Overview</option>
        </select>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredResults.map((result) => (
          <div
            key={result.id}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-gray-800 transition-all cursor-pointer group"
            onClick={() => handleOpen(result)}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Badge and Time */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold border ${getAssistantColor(result.assistant)}`}>
                    {getAssistantLabel(result.assistant)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(result.createdAt)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-white truncate mb-1" title={result.title}>
                  {result.title}
                </h3>

                {/* Summary Preview */}
                {result.summary && (
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {result.summary}
                  </p>
                )}

                {/* Metadata */}
                {result.metadata && (
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    {result.metadata.tokensUsed && (
                      <span>{result.metadata.tokensUsed.toLocaleString()} tokens</span>
                    )}
                    {result.sources && result.sources.length > 0 && (
                      <span>{result.sources.length} sources</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpen(result);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <ExternalLink size={14} />
                  Open
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerate(result);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  <RefreshCw size={14} />
                  New
                </button>

                {/* Delete Button with Confirmation */}
                {showDeleteConfirm === result.id ? (
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(result.id!, result.title);
                      }}
                      disabled={deletingId === result.id}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingId === result.id ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelDelete();
                      }}
                      className="px-3 py-1.5 bg-gray-700 text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(result.id!, result.title);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-gray-700 hover:border-red-500/30 text-sm font-medium rounded-lg transition-colors"
                    title="Delete result"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {results.length >= limit && (
        <div className="pt-2 text-center">
          <button
            onClick={() => router.push('/dashboard/business/ai-assistant')}
            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
          >
            View All Results →
          </button>
        </div>
      )}
    </div>
  );
}
