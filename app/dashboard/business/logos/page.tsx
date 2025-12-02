'use client';

/**
 * Logos List Page
 * Shows all saved logos with preview and actions
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { listLogos, type Logo } from '@kimuntupro/db';
import { Plus, Eye, Loader2, AlertCircle, RefreshCw, Trash2, Star, Pencil } from 'lucide-react';
import { toast } from '@/components/ai/Toast';
import LogoCanvas from '../logo-studio/components/LogoCanvas';

export default function LogosPage() {
  const router = useRouter();
  const [logos, setLogos] = useState<Logo[]>([]);
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

  // Fetch logos
  useEffect(() => {
    async function fetchLogos() {
      if (!currentUserId) {
        console.log('[LogosList] No user ID yet, waiting...');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('[LogosList] Fetching logos for user:', currentUserId);
        const data = await listLogos('demo-tenant', currentUserId, 50);
        console.log('[LogosList] Fetched logos:', data.length, data);
        setLogos(data);
      } catch (error: any) {
        console.error('[LogosList] Failed to fetch logos:', error);
        setError(error?.message || 'Failed to load logos. Please try again.');
        toast.error('Failed to load logos');
      } finally {
        setLoading(false);
      }
    }

    fetchLogos();
  }, [currentUserId]);

  // Retry function
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    if (currentUserId) {
      listLogos('demo-tenant', currentUserId, 50)
        .then((data) => {
          setLogos(data);
          setLoading(false);
          toast.success('Logos loaded successfully');
        })
        .catch((err) => {
          setError(err?.message || 'Failed to load logos');
          setLoading(false);
          toast.error('Failed to load logos');
        });
    }
  };

  const handleDeleteLogo = async (logoId: string) => {
    if (!confirm('Are you sure you want to delete this logo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/logo/${logoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete logo');
      }

      // Remove from local state
      setLogos((prev) => prev.filter((l) => l.id !== logoId));
      toast.success('Logo deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete logo:', err);
      toast.error(err.message || 'Failed to delete logo');
    }
  };

  const handleSetPrimary = async (logoId: string) => {
    const toastId = toast.loading('Setting as primary logo...');

    try {
      // Find the logo to get all required fields
      const logo = logos.find((l) => l.id === logoId);
      if (!logo) {
        throw new Error('Logo not found');
      }

      const response = await fetch(`/api/logo/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logoId: logo.id,
          tenantId: logo.tenantId,
          userId: logo.userId,
          companyName: logo.companyName,
          currentSpec: logo.currentSpec,
          isPrimary: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to set primary logo');
      }

      // Update local state: unset other primary logos and set this one
      setLogos((prev) =>
        prev.map((l) => ({
          ...l,
          isPrimary: l.id === logoId,
        }))
      );

      toast.success('Primary logo updated successfully!', { id: toastId });
    } catch (err: any) {
      console.error('Failed to set primary logo:', err);
      toast.error(err.message || 'Failed to set primary logo', { id: toastId });
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
      <div className="aspect-square bg-gray-800/50" />
      <div className="p-4">
        <div className="h-5 bg-gray-800/50 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-800/50 rounded mb-4 w-1/2" />
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
              <h1 className="text-3xl font-bold text-white mb-2">My Logos</h1>
              <p className="text-gray-400">Manage your AI-generated logos</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/business/logo-studio')}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create New Logo
            </button>
          </div>

          {/* Skeleton Loaders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkeletonCard />
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
              <h1 className="text-3xl font-bold text-white mb-2">My Logos</h1>
              <p className="text-gray-400">Manage your AI-generated logos</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/business/logo-studio')}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create New Logo
            </button>
          </div>

          {/* Error State */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Logos</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">My Logos</h1>
            <p className="text-gray-400">Manage your AI-generated logos</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/business/logo-studio')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Logo
          </button>
        </div>

        {/* Empty State */}
        {logos.length === 0 && (
          <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No logos yet</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create your first AI-generated logo in minutes. Let Claude design your brand identity.
            </p>
            <button
              onClick={() => router.push('/dashboard/business/logo-studio')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Logo
            </button>
          </div>
        )}

        {/* Logos Grid */}
        {logos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="bg-white/5 backdrop-blur border border-gray-800 rounded-lg overflow-hidden hover:border-emerald-500/50 transition-colors"
              >
                {/* Logo Preview */}
                <div className="aspect-square p-6 relative">
                  {logo.isPrimary && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Primary
                    </div>
                  )}
                  <LogoCanvas spec={logo.currentSpec} className="w-full h-full" />
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1 truncate">
                    {logo.companyName}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">{formatDate(logo.createdAt)}</p>

                  {/* Metadata */}
                  {logo.generationMetadata && (
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span>{logo.generationMetadata.tokensUsed.toLocaleString()} tokens</span>
                      <span>${(logo.generationMetadata.costCents / 100).toFixed(3)}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/business/logos/${logo.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/business/logo-studio/edit/${logo.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLogo(logo.id)}
                        className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {!logo.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(logo.id)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/50 text-yellow-300 text-sm rounded-lg transition-colors"
                      >
                        <Star className="w-4 h-4" />
                        Set as Primary
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
