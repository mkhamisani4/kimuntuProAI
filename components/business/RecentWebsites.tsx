'use client';

/**
 * Recent Websites Component
 * Displays the last 5 generated websites for quick access
 * Phase 5 - UX Polish
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listWebsites, type Website } from '@kimuntupro/db';
import { Loader2, CheckCircle, AlertCircle, Clock, Eye } from 'lucide-react';

interface RecentWebsitesProps {
  tenantId: string;
  userId: string;
  limit?: number;
}

export default function RecentWebsites({ tenantId, userId, limit = 5 }: RecentWebsitesProps) {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchWebsites() {
      try {
        setLoading(true);
        const recentWebsites = await listWebsites(tenantId, userId, limit);
        setWebsites(recentWebsites);
        setError(null);
      } catch (err: any) {
        console.error('[RecentWebsites] Failed to fetch websites:', err);
        // Handle permission errors gracefully
        if (err.code === 'permission-denied' || err.message?.includes('permission')) {
          console.log('[RecentWebsites] No access to websites yet - this is normal for new users');
          setWebsites([]);
          setError(null);
        } else {
          setError('Failed to load recent websites');
        }
      } finally {
        setLoading(false);
      }
    }

    if (tenantId && userId) {
      fetchWebsites();
    }
  }, [tenantId, userId, limit]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Ready
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
      default:
        return null;
    }
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

  const handleOpen = (website: Website) => {
    router.push(`/dashboard/business/websites/${website.id}`);
  };

  const handleViewAll = () => {
    router.push('/dashboard/business/websites');
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Recent Websites</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-white/10 rounded-lg">
              <div className="flex-1">
                <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-white/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Recent Websites</h2>
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Recent Websites</h2>
        <div className="text-gray-400 text-sm py-8 text-center">
          No websites yet. Generate your first AI-powered website to get started!
        </div>
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/dashboard/business/websites/new')}
            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
          >
            Generate Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-100">Recent Websites</h2>
        <button
          onClick={handleViewAll}
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          View All
        </button>
      </div>
      <div className="space-y-3">
        {websites.map((website) => (
          <div
            key={website.id}
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            onClick={() => handleOpen(website)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge(website.status)}
                <span className="text-xs text-gray-400">
                  {formatRelativeTime(website.createdAt)}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-100 truncate" title={website.title}>
                {website.title}
              </h3>
              {website.generationMetadata && (
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span>{website.generationMetadata.tokensUsed.toLocaleString()} tokens</span>
                  <span>${(website.generationMetadata.costCents / 100).toFixed(2)}</span>
                </div>
              )}
            </div>
            <button
              className="ml-4 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors flex-shrink-0 flex items-center gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                handleOpen(website);
              }}
            >
              <Eye className="w-4 h-4" />
              {website.status === 'generating' ? 'View Progress' : 'View'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
