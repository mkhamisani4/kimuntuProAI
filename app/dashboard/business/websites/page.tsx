'use client';

/**
 * Websites List Page
 * Shows all generated websites with status and actions
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { listWebsites, type Website } from '@kimuntupro/db';
import { Plus, Eye, Loader2, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ai/Toast';
import { sanitizeWebsiteHTML } from '@/lib/sanitize';

export default function WebsitesPage() {
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch websites
  useEffect(() => {
    async function fetchWebsites() {
      if (!currentUserId) {
        console.log('[WebsitesList] No user ID yet, waiting...');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('[WebsitesList] Fetching websites for user:', currentUserId);
        const data = await listWebsites('demo-tenant', currentUserId, 20);
        console.log('[WebsitesList] Fetched websites:', data.length, data);
        setWebsites(data);
      } catch (error: any) {
        console.error('[WebsitesList] Failed to fetch websites:', error);
        setError(error?.message || 'Failed to load websites. Please try again.');
        toast.error('Failed to load websites');
      } finally {
        setLoading(false);
      }
    }

    fetchWebsites();
  }, [currentUserId]);

  // Retry function
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    if (currentUserId) {
      listWebsites('demo-tenant', currentUserId, 20)
        .then((data) => {
          setWebsites(data);
          setLoading(false);
          toast.success('Websites loaded successfully');
        })
        .catch((err) => {
          setError(err?.message || 'Failed to load websites');
          setLoading(false);
          toast.error('Failed to load websites');
        });
    }
  };

  // Poll for generating websites
  useEffect(() => {
    const hasGenerating = websites.some((w) => w.status === 'generating');
    if (!hasGenerating || !currentUserId) return;

    const pollInterval = setInterval(async () => {
      try {
        const data = await listWebsites('demo-tenant', currentUserId, 20);
        setWebsites(data);
      } catch (error) {
        console.error('Failed to poll websites:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [websites, currentUserId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Ready
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-500/10 border border-gray-500/30 rounded-full text-gray-400 text-xs font-medium">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-500/10 border border-gray-500/30 rounded-full text-gray-400 text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-800/50" />
      <div className="p-4">
        <div className="h-6 bg-gray-800/50 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-800/50 rounded mb-4 w-1/2" />
        <div className="flex gap-4 mb-4">
          <div className="h-3 bg-gray-800/50 rounded w-20" />
          <div className="h-3 bg-gray-800/50 rounded w-16" />
        </div>
        <div className="h-10 bg-gray-800/50 rounded" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Websites</h1>
              <p className="text-gray-400">Manage your AI-generated websites</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/business/websites/new')}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Generate New Website
            </button>
          </div>

          {/* Skeleton Loaders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Websites</h1>
              <p className="text-gray-400">Manage your AI-generated websites</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/business/websites/new')}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Generate New Website
            </button>
          </div>

          {/* Error State */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Websites</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Websites</h1>
            <p className="text-gray-400">
              Manage your AI-generated websites
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/business/websites/new')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Generate New Website
          </button>
        </div>

        {/* Empty State */}
        {websites.length === 0 && (
          <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No websites yet</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create your first AI-generated website in minutes. Fill out the wizard and let Claude build your site.
            </p>
            <button
              onClick={() => router.push('/dashboard/business/websites/new')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Generate Your First Website
            </button>
          </div>
        )}

        {/* Websites Grid */}
        {websites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <div
                key={website.id}
                className="bg-white/5 backdrop-blur border border-gray-800 rounded-lg overflow-hidden hover:border-emerald-500/50 transition-colors"
              >
                {/* Thumbnail Preview */}
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                  {website.status === 'ready' && website.siteCode ? (
                    <div className="w-full h-full overflow-hidden relative">
                      <iframe
                        srcDoc={sanitizeWebsiteHTML(website.siteCode)}
                        className="absolute top-0 left-0 border-0 pointer-events-none"
                        style={{
                          width: '1200px',
                          height: '900px',
                          transform: 'scale(0.33)',
                          transformOrigin: 'top left',
                        }}
                        title={`Preview of ${website.title}`}
                        sandbox="allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      {website.status === 'generating' && <Loader2 className="w-12 h-12 animate-spin" />}
                      {website.status === 'failed' && <AlertCircle className="w-12 h-12" />}
                      {website.status === 'draft' && <Clock className="w-12 h-12" />}
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white truncate flex-1 mr-2">
                      {website.title}
                    </h3>
                    {getStatusBadge(website.status)}
                  </div>

                  <p className="text-sm text-gray-400 mb-4">
                    {formatDate(website.createdAt)}
                  </p>

                  {/* Metadata */}
                  {website.generationMetadata && (
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span>{website.generationMetadata.tokensUsed.toLocaleString()} tokens</span>
                      <span>${(website.generationMetadata.costCents / 100).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <button
                    onClick={() => router.push(`/dashboard/business/websites/${website.id}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {website.status === 'generating' ? 'View Progress' : 'View Website'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
