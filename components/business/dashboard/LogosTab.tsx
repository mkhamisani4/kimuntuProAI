'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listLogos, type Logo } from '@kimuntupro/db';
import { Palette, Pencil, Download, Eye, Star, Trash2, Clock } from 'lucide-react';
import StatusBadge, { StatusType } from './shared/StatusBadge';
import EmptyState from './shared/EmptyState';
import LogoCanvas from '@/app/dashboard/business/logo-studio/components/LogoCanvas';
import { toast } from '@/components/ai/Toast';

interface LogosTabProps {
  tenantId: string;
  userId: string;
  limit?: number;
}

export default function LogosTab({ tenantId, userId, limit = 6 }: LogosTabProps) {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchLogos() {
      try {
        setLoading(true);
        const recentLogos = await listLogos(tenantId, userId, limit);
        setLogos(recentLogos);
        setError(null);
      } catch (err: any) {
        console.error('[LogosTab] Failed to fetch logos:', err);
        if (err.code === 'permission-denied' || err.message?.includes('permission')) {
          setLogos([]);
          setError(null);
        } else {
          setError('Failed to load logos');
        }
      } finally {
        setLoading(false);
      }
    }

    if (tenantId && userId) {
      fetchLogos();
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

  const getLogoStatus = (logo: Logo): StatusType => {
    if (logo.isPrimary) return 'ready';
    if (logo.versions && logo.versions.length > 0) return 'generating'; // Has versions = being edited
    return 'ready'; // Default to ready
  };

  const getStatusLabel = (logo: Logo): string => {
    if (logo.isPrimary) return 'Primary';
    if (logo.versions && logo.versions.length > 0) return 'Draft';
    return 'Ready';
  };

  const handleView = (logo: Logo) => {
    router.push(`/dashboard/business/logos/${logo.id}`);
  };

  const handleEdit = (logo: Logo, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/business/logo-studio/edit/${logo.id}`);
  };

  const handleExport = async (logo: Logo, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      // Generate SVG from logo spec
      const svg = generateSVG(logo.currentSpec);

      // Create download
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${logo.companyName.replace(/\s+/g, '-').toLowerCase()}-logo.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Logo exported successfully!');
    } catch (err: any) {
      console.error('[LogosTab] Export failed:', err);
      toast.error('Failed to export logo');
    }
  };

  const handleSetPrimary = async (logo: Logo, e: React.MouseEvent) => {
    e.stopPropagation();

    const toastId = toast.loading('Setting as primary...');

    try {
      const response = await fetch('/api/logo/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        const data = await response.json();
        throw new Error(data.message || 'Failed to set primary logo');
      }

      // Update local state
      setLogos((prev) =>
        prev.map((l) => ({
          ...l,
          isPrimary: l.id === logo.id,
        }))
      );

      toast.success('Primary logo updated!', { id: toastId });
    } catch (err: any) {
      console.error('[LogosTab] Set primary failed:', err);
      toast.error(err.message || 'Failed to set primary logo', { id: toastId });
    }
  };

  const handleDelete = async (logoId: string, companyName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Show confirmation
    if (showDeleteConfirm !== logoId) {
      setShowDeleteConfirm(logoId);
      return;
    }

    try {
      setDeletingId(logoId);

      const response = await fetch(`/api/logo/${logoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete logo');
      }

      // Remove from UI
      setLogos((prev) => prev.filter((l) => l.id !== logoId));
      setShowDeleteConfirm(null);
      toast.success('Logo deleted successfully');
    } catch (err: any) {
      console.error('[LogosTab] Delete failed:', err);
      toast.error(err.message || 'Failed to delete logo');
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(null);
  };

  // Helper to generate SVG from spec
  const generateSVG = (spec: any): string => {
    const { canvas, shapes, texts } = spec;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">`;

    // Background
    if (canvas.backgroundColor !== 'transparent') {
      svgContent += `<rect width="${canvas.width}" height="${canvas.height}" fill="${canvas.backgroundColor}" />`;
    }

    // Shapes
    shapes.forEach((shape: any) => {
      if (shape.type === 'rectangle') {
        svgContent += `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${shape.fill}" ${shape.rx ? `rx="${shape.rx}"` : ''} />`;
      } else if (shape.type === 'circle') {
        svgContent += `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${shape.fill}" />`;
      } else if (shape.type === 'ellipse') {
        svgContent += `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" fill="${shape.fill}" />`;
      } else if (shape.type === 'polygon') {
        svgContent += `<polygon points="${shape.points}" fill="${shape.fill}" />`;
      } else if (shape.type === 'path') {
        svgContent += `<path d="${shape.d}" fill="${shape.fill}" ${shape.stroke ? `stroke="${shape.stroke}"` : ''} ${shape.strokeWidth ? `stroke-width="${shape.strokeWidth}"` : ''} />`;
      } else if (shape.type === 'line') {
        svgContent += `<line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" />`;
      }
    });

    // Texts
    texts.forEach((text: any) => {
      svgContent += `<text x="${text.x}" y="${text.y}" font-family="${text.fontFamily}" font-size="${text.fontSize}" font-weight="${text.fontWeight}" fill="${text.fill}" text-anchor="${text.textAnchor || 'start'}" ${text.letterSpacing ? `letter-spacing="${text.letterSpacing}"` : ''}>${text.content}</text>`;
    });

    svgContent += '</svg>';
    return svgContent;
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-4 bg-white/5 rounded-lg border border-gray-800">
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
  if (logos.length === 0) {
    return (
      <EmptyState
        icon={Palette}
        title="No Logos Yet"
        description="Create a professional logo for your brand in minutes. AI generates concepts, you refine and export in multiple formats. Link your business plan for even better suggestions!"
        actionLabel="Create Your First Logo"
        actionRoute="/dashboard/business/logo-studio"
      />
    );
  }

  const primaryLogo = logos.find((l) => l.isPrimary);
  const hasNoPrimary = !primaryLogo && logos.length > 0;

  return (
    <div className="space-y-4">
      {/* Count and prompt */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {logos.length} logo{logos.length !== 1 ? 's' : ''}
        </div>
        {hasNoPrimary && (
          <div className="text-xs text-yellow-400 flex items-center gap-1">
            <Star className="w-3 h-3" />
            Set a primary logo
          </div>
        )}
      </div>

      {/* Logos List */}
      <div className="space-y-3">
        {logos.map((logo) => (
          <div
            key={logo.id}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-gray-800 transition-all cursor-pointer group"
            onClick={() => handleView(logo)}
          >
            <div className="flex items-start gap-4">
              {/* Logo Preview */}
              <div className="relative w-20 h-20 flex-shrink-0 bg-white border-2 border-gray-700 rounded-lg overflow-hidden p-2">
                <LogoCanvas spec={logo.currentSpec} className="w-full h-full" />

                {/* Primary Badge */}
                {logo.isPrimary && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-gray-900" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Status and Time */}
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={getLogoStatus(logo)} size="sm" customLabel={getStatusLabel(logo)} />
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(logo.updatedAt || logo.createdAt)}
                  </span>
                </div>

                {/* Company Name */}
                <h3 className="text-base font-semibold text-white truncate mb-1" title={logo.companyName}>
                  {logo.companyName}
                </h3>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {logo.versions && logo.versions.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {logo.versions.length} version{logo.versions.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {logo.generationMetadata?.tokensUsed && (
                    <span>{logo.generationMetadata.tokensUsed.toLocaleString()} tokens</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={(e) => handleEdit(logo, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={(e) => handleExport(logo, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Download size={14} />
                  Export
                </button>

                {/* Set Primary / Delete */}
                {!logo.isPrimary && (
                  <button
                    onClick={(e) => handleSetPrimary(logo, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600/20 border border-yellow-500/50 text-yellow-300 text-xs font-medium rounded-lg hover:bg-yellow-600/30 transition-colors"
                  >
                    <Star size={12} />
                    Primary
                  </button>
                )}

                {/* Delete with Confirmation */}
                {showDeleteConfirm === logo.id ? (
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={(e) => handleDelete(logo.id!, logo.companyName, e)}
                      disabled={deletingId === logo.id}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingId === logo.id ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="px-3 py-1.5 bg-gray-700 text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleDelete(logo.id!, logo.companyName, e)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-gray-700 hover:border-red-500/30 text-sm font-medium rounded-lg transition-colors"
                    title="Delete logo"
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
      {logos.length >= limit && (
        <div className="pt-2 text-center">
          <button
            onClick={() => router.push('/dashboard/business/logos')}
            className="text-sm text-purple-400 hover:text-purple-300 font-medium"
          >
            View All Logos →
          </button>
        </div>
      )}
    </div>
  );
}
