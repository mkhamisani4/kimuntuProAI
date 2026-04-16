'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listWebsites, type Website } from '@kimuntupro/db';
import { Globe, Eye, Edit, Download, RefreshCw, Copy, Trash2 } from 'lucide-react';
import StatusBadge, { StatusType } from './shared/StatusBadge';
import EmptyState from './shared/EmptyState';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface WebsitesTabProps {
  tenantId: string;
  userId: string;
  limit?: number;
}

export default function WebsitesTab({ tenantId, userId, limit = 8 }: WebsitesTabProps) {
  const { t } = useLanguage();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchWebsites() {
      try {
        setLoading(true);
        const recentWebsites = await listWebsites(tenantId, userId, limit);
        setWebsites(recentWebsites);
        setError(null);
      } catch (err: any) {
        console.error('[WebsitesTab] Failed to fetch websites:', err);
        if (err.code === 'permission-denied' || err.message?.includes('permission')) {
          setWebsites([]);
          setError(null);
        } else {
          setError('Failed to load websites');
        }
      } finally {
        setLoading(false);
      }
    }

    if (tenantId && userId) {
      fetchWebsites();
    }
  }, [tenantId, userId, limit]);

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

  const handleView = (website: Website) => {
    router.push(`/dashboard/business/websites/${website.id}`);
  };

  const handleEdit = (website: Website, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/business/websites/${website.id}/edit`);
  };

  const handleRetry = (website: Website, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement retry logic
    console.log('Retry website generation:', website.id);
  };

  const handleCreateSimilar = (website: Website, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push('/dashboard/business/websites/new');
  };

  const handleDownload = (website: Website, e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a blob from the HTML content
    const blob = new Blob([website.siteCode || ''], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${website.title || 'website'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (websiteId: string, websiteTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Show confirmation dialog
    if (showDeleteConfirm !== websiteId) {
      setShowDeleteConfirm(websiteId);
      return;
    }

    try {
      setDeletingId(websiteId);

      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete website');
      }

      // Optimistically remove from UI
      setWebsites((prev) => prev.filter((w) => w.id !== websiteId));
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('[WebsitesTab] Delete failed:', err);
      alert(`Failed to delete website: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-700 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-full"></div>
              </div>
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
  if (websites.length === 0) {
    return (
      <EmptyState
        icon={Globe}
        title={t.biz_noWebsitesTitle}
        description={t.biz_noWebsitesDesc}
        actionLabel={t.biz_buildYourWebsite}
        actionRoute="/dashboard/business/websites/new"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Count */}
      <div className="text-sm text-gray-500">
        {websites.length} {websites.length !== 1 ? t.biz_websites : t.biz_website}
      </div>

      {/* Websites List */}
      <div className="space-y-3">
        {websites.map((website) => (
          <div
            key={website.id}
            className="p-4 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
            onClick={() => handleView(website)}
          >
            <div className="flex items-start gap-4">
              {/* Enhanced Thumbnail Preview */}
              <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 border-2 border-white shadow-sm rounded-lg overflow-hidden">
                {website.status === 'ready' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
                    {/* Company Initial */}
                    <div className="text-2xl font-bold text-gray-400 mb-1">
                      {(website.title || website.wizardInput?.companyName || 'W').charAt(0).toUpperCase()}
                    </div>
                    <Globe size={20} className="text-emerald-500" />
                  </div>
                ) : website.status === 'generating' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                    <RefreshCw size={32} className="text-blue-500 animate-spin" />
                  </div>
                ) : website.status === 'failed' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                    <div className="text-2xl font-bold text-red-300 mb-1">
                      {(website.title || website.wizardInput?.companyName || 'W').charAt(0).toUpperCase()}
                    </div>
                    <Globe size={20} className="text-red-400" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Globe size={32} className="text-gray-300" />
                  </div>
                )}

                {/* Status Indicator Badge */}
                {website.status === 'ready' && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                )}
                {website.status === 'failed' && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Status and Time */}
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={website.status as StatusType} size="sm" />
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(website.createdAt)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-gray-900 truncate mb-1" title={website.title}>
                  {website.title || 'Untitled Website'}
                </h3>

                {/* Description */}
                {website.wizardInput?.companyName && (
                  <p className="text-sm text-gray-500 mb-2">
                    {website.wizardInput.companyName}
                  </p>
                )}

                {/* Progress Bar for Generating */}
                {website.status === 'generating' && (
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                    <div className="bg-orange-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {website.wizardInput?.enabledSections && (
                    <span>{Object.keys(website.wizardInput.enabledSections).filter(k => website.wizardInput.enabledSections[k]).length} sections</span>
                  )}
                  {website.generationMetadata?.tokensUsed && (
                    <span>{website.generationMetadata.tokensUsed.toLocaleString()} tokens</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {website.status === 'ready' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(website);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      <Eye size={14} />
                      {t.biz_view}
                    </button>
                    <button
                      onClick={(e) => handleEdit(website, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Edit size={14} />
                      {t.biz_edit}
                    </button>
                    <button
                      onClick={(e) => handleDownload(website, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Download size={14} />
                      {t.biz_export}
                    </button>
                  </>
                )}
                {website.status === 'generating' && (
                  <div className="text-xs text-gray-500 px-3 py-1.5 bg-gray-50 rounded-lg">
                    {t.biz_processing}
                  </div>
                )}
                {website.status === 'failed' && (
                  <button
                    onClick={(e) => handleRetry(website, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <RefreshCw size={14} />
                    {t.biz_retry}
                  </button>
                )}

                {/* Delete Button with Confirmation - Available for all statuses */}
                {showDeleteConfirm === website.id ? (
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={(e) => handleDelete(website.id!, website.title, e)}
                      disabled={deletingId === website.id}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingId === website.id ? t.biz_deleting : t.biz_confirm}
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t.biz_cancel}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleDelete(website.id!, website.title, e)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 text-sm font-medium rounded-lg transition-colors"
                    title="Delete website"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Hover Actions */}
            <div className="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleCreateSimilar(website, e)}
                className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Copy size={12} />
                {t.biz_createSimilarWebsite}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {websites.length >= limit && (
        <div className="pt-2 text-center">
          <button
            onClick={() => router.push('/dashboard/business/websites')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {t.biz_viewAllWebsites_link}
          </button>
        </div>
      )}
    </div>
  );
}
