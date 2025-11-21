'use client';

/**
 * Logo Detail Page
 * View and manage a single logo
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Trash2, Star, Pencil } from 'lucide-react';
import { toast } from '@/components/ai/Toast';
import type { Logo } from '@kimuntupro/db';
import LogoCanvas from '../../logo-studio/components/LogoCanvas';
import { logoSpecToSVGString } from '../../logo-studio/utils/svgRenderer';

export default function LogoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const logoId = params.id as string;

  const [logo, setLogo] = useState<Logo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch logo
  useEffect(() => {
    async function fetchLogo() {
      if (!logoId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/logo/${logoId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Logo not found');
          }
          throw new Error('Failed to load logo');
        }

        const data = await response.json();

        // Convert date strings to Date objects
        const logoData = data.logo;
        if (logoData.createdAt) {
          logoData.createdAt = new Date(logoData.createdAt);
        }
        if (logoData.updatedAt) {
          logoData.updatedAt = new Date(logoData.updatedAt);
        }
        if (logoData.generationMetadata?.generatedAt) {
          logoData.generationMetadata.generatedAt = new Date(logoData.generationMetadata.generatedAt);
        }

        setLogo(logoData);
      } catch (err: any) {
        console.error('[LogoDetail] Failed to fetch logo:', err);
        setError(err.message || 'Failed to load logo');
        toast.error(err.message || 'Failed to load logo');
      } finally {
        setLoading(false);
      }
    }

    fetchLogo();
  }, [logoId]);

  const handleDownloadSVG = () => {
    if (!logo) return;

    const svgString = logoSpecToSVGString(logo.currentSpec);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${logo.companyName.replace(/\s+/g, '-').toLowerCase()}-logo.svg`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded!');
  };

  const handleDelete = async () => {
    if (!logo || !confirm('Are you sure you want to delete this logo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/logo/${logoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete logo');
      }

      toast.success('Logo deleted successfully');
      router.push('/dashboard/business/logos');
    } catch (err: any) {
      console.error('[LogoDetail] Failed to delete logo:', err);
      toast.error(err.message || 'Failed to delete logo');
    }
  };

  const handleSetPrimary = async () => {
    if (!logo) return;

    const toastId = toast.loading('Setting as primary logo...');

    try {
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

      // Update local state
      setLogo((prev) => (prev ? { ...prev, isPrimary: true } : prev));

      toast.success('Primary logo updated successfully!', { id: toastId });
    } catch (err: any) {
      console.error('Failed to set primary logo:', err);
      toast.error(err.message || 'Failed to set primary logo', { id: toastId });
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-1/4" />
            <div className="aspect-square bg-gray-800 rounded-2xl" />
            <div className="h-64 bg-gray-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !logo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.push('/dashboard/business/logos')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Logos
          </button>

          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-12 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              {error || 'Logo not found'}
            </h2>
            <p className="text-gray-400 mb-6">
              The logo you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/dashboard/business/logos')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Logos
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/dashboard/business/logo-studio/edit/${logoId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit Logo
            </button>
            {!logo?.isPrimary && (
              <button
                onClick={handleSetPrimary}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                <Star className="w-4 h-4" />
                Set as Primary
              </button>
            )}
            <button
              onClick={handleDownloadSVG}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download SVG
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Logo Title */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{logo.companyName}</h1>
            {logo.isPrimary && (
              <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-gray-900 text-sm font-bold rounded-full">
                <Star className="w-4 h-4" />
                Primary
              </span>
            )}
          </div>
          <p className="text-gray-400">Created {formatDate(logo.createdAt)}</p>
        </div>

        {/* Logo Preview */}
        <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Logo Preview</h2>
          <div className="bg-white rounded-lg p-12">
            <LogoCanvas spec={logo.currentSpec} className="max-w-2xl mx-auto" />
          </div>
        </div>

        {/* Design Brief */}
        <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Design Brief</h2>
          <div className="space-y-4">
            {/* Brand Personality */}
            <div>
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">Brand Personality</h3>
              <p className="text-gray-300">{logo.brief.brandPersonality}</p>
            </div>

            {/* Brand Adjectives */}
            <div>
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">Brand Adjectives</h3>
              <div className="flex flex-wrap gap-2">
                {logo.brief.brandAdjectives.map((adj: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm"
                  >
                    {adj}
                  </span>
                ))}
              </div>
            </div>

            {/* Logo Type */}
            <div>
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">Logo Type</h3>
              <p className="text-gray-300 capitalize">{logo.brief.logoType}</p>
            </div>

            {/* Color Palette */}
            <div>
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">Color Palette</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(logo.brief.colorPalette).map(([name, color]) => (
                  <div key={name} className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded border border-gray-600 flex-shrink-0"
                      style={{ backgroundColor: color as string }}
                    />
                    <div>
                      <p className="text-xs text-gray-400 capitalize">{name}</p>
                      <p className="text-xs text-gray-300 font-mono">{color as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rationale */}
            <div>
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">Design Rationale</h3>
              <p className="text-gray-300">{logo.brief.rationale}</p>
            </div>
          </div>
        </div>

        {/* Concept Info */}
        <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Concept Details</h2>
          <div className="space-y-2">
            <p className="text-gray-300">
              <span className="text-gray-400">Concept:</span>{' '}
              <span className="font-semibold">{logo.currentSpec.metadata.conceptName}</span>
            </p>
            <p className="text-gray-300">
              <span className="text-gray-400">Description:</span>{' '}
              {logo.currentSpec.metadata.description}
            </p>
            <p className="text-gray-300">
              <span className="text-gray-400">Total Concepts Generated:</span> {logo.concepts.length}
            </p>
          </div>
        </div>

        {/* Generation Metadata */}
        {logo.generationMetadata && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">Generation Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
              <div>
                <p className="text-gray-400">Model</p>
                <p className="font-mono">{logo.generationMetadata.model}</p>
              </div>
              <div>
                <p className="text-gray-400">Tokens Used</p>
                <p>{logo.generationMetadata.tokensUsed.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Latency</p>
                <p>{logo.generationMetadata.latencyMs}ms</p>
              </div>
              <div>
                <p className="text-gray-400">Cost</p>
                <p>${(logo.generationMetadata.costCents / 100).toFixed(4)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
