'use client';

/**
 * Website Preview/Status Page
 * Shows generation status and preview of generated website
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getWebsite, type Website } from '@kimuntupro/db';
import { ArrowLeft, Download, ExternalLink, Loader2, AlertCircle, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ai/Toast';

export default function WebsitePage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;

  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
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

  useEffect(() => {
    async function fetchWebsite() {
      try {
        setLoading(true);
        const data = await getWebsite(websiteId);

        if (!data) {
          setError('Website not found');
          return;
        }

        setWebsite(data);
        setError(null);

        // If still generating, poll for updates
        if (data.status === 'generating') {
          const pollInterval = setInterval(async () => {
            const updated = await getWebsite(websiteId);
            if (updated && updated.status !== 'generating') {
              setWebsite(updated);
              clearInterval(pollInterval);
            }
          }, 3000); // Poll every 3 seconds

          return () => clearInterval(pollInterval);
        }
      } catch (err: any) {
        console.error('Failed to fetch website:', err);
        setError(err.message || 'Failed to load website');
      } finally {
        setLoading(false);
      }
    }

    if (websiteId) {
      fetchWebsite();
    }
  }, [websiteId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generating':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Ready
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-500/10 border border-gray-500/30 rounded-full text-gray-400 text-sm">
            {status}
          </span>
        );
    }
  };

  const handleDownload = () => {
    if (!website?.siteCode) return;

    const blob = new Blob([website.siteCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${website.title.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!websiteId) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete website');
      }

      // Redirect to websites list after successful deletion
      router.push('/dashboard/business/websites');
    } catch (err: any) {
      console.error('Failed to delete website:', err);
      alert(`Failed to delete website: ${err.message}`);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRegenerate = async () => {
    if (!website || !currentUserId) {
      toast.error('Cannot regenerate: missing website or user info');
      return;
    }

    setRegenerating(true);
    const toastId = toast.loading('Starting regeneration...');

    try {
      const response = await fetch(`/api/websites/${websiteId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          userId: currentUserId,
          wizardInput: website.wizardInput,
          businessPlan: website.businessPlanId ? { id: website.businessPlanId } : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        // Handle quota errors specially
        if (response.status === 429 || data.error === 'quota_exceeded') {
          const quotaMessage = data.message || 'You have reached your usage quota. Please upgrade your plan or wait until your quota resets.';
          toast.error(quotaMessage, { id: toastId, duration: 6000 });
          setRegenerating(false);
          return;
        }

        throw new Error(data.error || 'Failed to start regeneration');
      }

      toast.success('Regeneration started! This typically takes 1-2 minutes.', { id: toastId });

      // Update local state to show generating status
      setWebsite({ ...website, status: 'generating', errorMessage: null });

      // Start polling for updates
      const pollInterval = setInterval(async () => {
        const updated = await getWebsite(websiteId);
        if (updated) {
          setWebsite(updated);
          if (updated.status !== 'generating') {
            clearInterval(pollInterval);
            setRegenerating(false);
            if (updated.status === 'ready') {
              toast.success('Website regenerated successfully!');
            } else if (updated.status === 'failed') {
              toast.error('Regeneration failed');
            }
          }
        }
      }, 3000);

      // Clean up polling after 5 minutes max
      setTimeout(() => clearInterval(pollInterval), 300000);
    } catch (err: any) {
      console.error('Failed to regenerate website:', err);
      toast.error(`Failed to regenerate: ${err.message}`, { id: toastId });
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/dashboard/business/websites/new')}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Generator
          </button>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-red-400">Error</h2>
            </div>
            <p className="text-gray-300">{error || 'Website not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/business/websites/new')}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Generator
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{website.title}</h1>
              <p className="text-gray-400">
                Created {website.createdAt?.toLocaleDateString()} at {website.createdAt?.toLocaleTimeString()}
              </p>
            </div>
            {getStatusBadge(website.status)}
          </div>
        </div>

        {/* Generation in Progress */}
        {website.status === 'generating' && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              <h2 className="text-xl font-semibold text-blue-400">Generating Your Website</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Claude is creating your website based on your inputs. This typically takes 1-2 minutes.
            </p>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Generation Failed */}
        {website.status === 'failed' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-red-400">Generation Failed</h2>
            </div>
            <p className="text-gray-300 mb-2">An error occurred during website generation:</p>
            <code className="block bg-black/30 rounded p-3 text-sm text-red-300 mb-4">
              {website.errorMessage || 'Unknown error'}
            </code>
            <div className="flex gap-3">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {regenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </>
                )}
              </button>
              <button
                onClick={() => router.push('/dashboard/business/websites/new')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Create New Website
              </button>
            </div>
          </div>
        )}

        {/* Generation Complete */}
        {website.status === 'ready' && website.siteCode && (
          <>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-semibold text-emerald-400">Website Generated Successfully!</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Your website is ready. You can preview it below or download the HTML file.
              </p>

              {/* Metadata */}
              {website.generationMetadata && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white/5 rounded p-3">
                    <div className="text-xs text-gray-400 mb-1">Model</div>
                    <div className="text-sm text-white font-medium">{website.generationMetadata.model}</div>
                  </div>
                  <div className="bg-white/5 rounded p-3">
                    <div className="text-xs text-gray-400 mb-1">Tokens Used</div>
                    <div className="text-sm text-white font-medium">{website.generationMetadata.tokensUsed.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/5 rounded p-3">
                    <div className="text-xs text-gray-400 mb-1">Generation Time</div>
                    <div className="text-sm text-white font-medium">{(website.generationMetadata.latencyMs / 1000).toFixed(1)}s</div>
                  </div>
                  <div className="bg-white/5 rounded p-3">
                    <div className="text-xs text-gray-400 mb-1">Cost</div>
                    <div className="text-sm text-white font-medium">${(website.generationMetadata.costCents / 100).toFixed(2)}</div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download HTML
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white/5 border border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
                <h3 className="text-white font-semibold">Preview</h3>
                <span className="text-xs text-gray-400">Scroll to see full website</span>
              </div>
              <div className="bg-white">
                <iframe
                  srcDoc={website.siteCode}
                  className="w-full h-[800px] border-0"
                  title="Website Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Website?</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{website?.title}"? This will permanently remove the website and all associated data.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
