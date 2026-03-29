'use client';

/**
 * ExportDialog Component
 * Dialog for exporting logos in various formats
 * Phase 2: Editing & Export
 */

import { useState } from 'react';
import { X, Download, FileText, Image, Loader2 } from 'lucide-react';
import type { LogoSpec } from '@kimuntupro/shared';
import { exportAsSVG, exportAsPNG, exportAsPNGMultipleSizes } from '../utils/svgExport';
import { toast } from '@/components/ai/Toast';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  spec: LogoSpec | null;
  logoName: string;
}

export default function ExportDialog({ isOpen, onClose, spec, logoName }: ExportDialogProps) {
  const [format, setFormat] = useState<'svg' | 'png'>('svg');
  const [pngSize, setPngSize] = useState<'512' | '1024' | '2048' | 'all'>('1024');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !spec) return null;

  const handleExport = async () => {
    if (!spec) return;

    setIsExporting(true);

    try {
      const fileName = logoName.replace(/\s+/g, '-').toLowerCase();

      if (format === 'svg') {
        exportAsSVG(spec, fileName);
        toast.success('SVG exported successfully!');
      } else {
        if (pngSize === 'all') {
          await exportAsPNGMultipleSizes(spec, fileName, [512, 1024, 2048]);
          toast.success('PNG files exported at all sizes!');
        } else {
          await exportAsPNG(spec, fileName, parseInt(pngSize, 10));
          toast.success(`PNG exported at ${pngSize}px!`);
        }
      }

      onClose();
    } catch (error: any) {
      console.error('[ExportDialog] Export failed:', error);
      toast.error(error.message || 'Failed to export logo');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Export Logo</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat('svg')}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    format === 'svg'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">SVG</div>
                    <div className="text-xs text-gray-400">Vector format</div>
                  </div>
                </button>

                <button
                  onClick={() => setFormat('png')}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    format === 'png'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <Image className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">PNG</div>
                    <div className="text-xs text-gray-400">Raster format</div>
                  </div>
                </button>
              </div>
            </div>

            {/* PNG Size Options */}
            {format === 'png' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Image Size
                </label>
                <div className="space-y-2">
                  {[
                    { value: '512', label: '512×512px', description: 'Small (web icons)' },
                    { value: '1024', label: '1024×1024px', description: 'Standard (recommended)' },
                    { value: '2048', label: '2048×2048px', description: 'Large (print quality)' },
                    { value: 'all', label: 'All sizes', description: 'Export all three sizes' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPngSize(option.value as typeof pngSize)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                        pngSize === option.value
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium text-white">{option.label}</div>
                        <div className="text-xs text-gray-400">{option.description}</div>
                      </div>
                      {pngSize === option.value && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Format Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-xs text-gray-300">
                {format === 'svg' ? (
                  <>
                    <strong className="text-blue-400">SVG</strong> is a vector format that scales
                    perfectly to any size. Best for logos, web graphics, and print designs.
                  </>
                ) : (
                  <>
                    <strong className="text-blue-400">PNG</strong> is a raster format with
                    transparent background. Best for social media, presentations, and web use.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
