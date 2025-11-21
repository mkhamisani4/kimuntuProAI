'use client';

/**
 * RefinementDialog Component
 * Modal dialog for AI logo refinement and variations
 */

import { useState } from 'react';
import { X, Sparkles, Loader2, Shuffle, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ai/Toast';
import { auth } from '@/lib/firebase';
import type { LogoSpec } from '@kimuntupro/shared';
import LogoCanvas from './LogoCanvas';

interface RefinementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSpec: LogoSpec;
  companyName: string;
  onRefinementComplete: (refinedSpec: LogoSpec, metadata: any) => void;
  onVariationsComplete: (variations: LogoSpec[], metadata: any) => void;
}

type Mode = 'refine' | 'variations';

export default function RefinementDialog({
  isOpen,
  onClose,
  currentSpec,
  companyName,
  onRefinementComplete,
  onVariationsComplete,
}: RefinementDialogProps) {
  const [mode, setMode] = useState<Mode>('refine');
  const [feedback, setFeedback] = useState('');
  const [numVariations, setNumVariations] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefine = async () => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback for refinement');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error('Please sign in to refine logos');
      return;
    }

    setIsProcessing(true);
    setError(null);
    const toastId = toast.loading('Refining your logo with AI...');

    try {
      const response = await fetch('/api/logo/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          userId: user.uid,
          currentSpec,
          feedback,
          companyName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to refine logo');
      }

      const data = await response.json();
      toast.success('Logo refined successfully!', { id: toastId });
      onRefinementComplete(data.refinedConcept, data.metadata);
      onClose();
    } catch (err: any) {
      console.error('[RefinementDialog] Refine error:', err);
      setError(err.message || 'Failed to refine logo');
      toast.error(err.message || 'Failed to refine logo', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateVariations = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Please sign in to generate variations');
      return;
    }

    setIsProcessing(true);
    setError(null);
    const toastId = toast.loading('Generating logo variations...');

    try {
      const response = await fetch('/api/logo/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          userId: user.uid,
          currentSpec,
          companyName,
          numVariations,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate variations');
      }

      const data = await response.json();
      toast.success(`Generated ${data.variations.length} variations!`, { id: toastId });
      onVariationsComplete(data.variations, data.metadata);
      onClose();
    } catch (err: any) {
      console.error('[RefinementDialog] Variations error:', err);
      setError(err.message || 'Failed to generate variations');
      toast.error(err.message || 'Failed to generate variations', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">AI Logo Enhancement</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Logo Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Current Logo</h3>
            <div className="rounded-lg p-6 max-w-xs mx-auto">
              <LogoCanvas spec={currentSpec} className="w-full" />
            </div>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setMode('refine')}
              disabled={isProcessing}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                mode === 'refine'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-white/5 hover:border-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-white">Refine with Feedback</span>
              </div>
              <p className="text-sm text-gray-400">
                Tell AI what to improve or change
              </p>
            </button>

            <button
              onClick={() => setMode('variations')}
              disabled={isProcessing}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                mode === 'variations'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-700 bg-white/5 hover:border-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shuffle className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-white">Generate Variations</span>
              </div>
              <p className="text-sm text-gray-400">
                Create different color/layout options
              </p>
            </button>
          </div>

          {/* Refine Mode */}
          {mode === 'refine' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  What would you like to change? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={isProcessing}
                  placeholder="e.g., Make the colors brighter, adjust the spacing, use a bolder font, etc."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{feedback.length}/500 characters</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Refinement Tips:</h4>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  <li>Be specific about what you want to change</li>
                  <li>Mention colors, shapes, fonts, or layout adjustments</li>
                  <li>AI will maintain the core concept while applying your feedback</li>
                </ul>
              </div>
            </div>
          )}

          {/* Variations Mode */}
          {mode === 'variations' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  Number of Variations
                </label>
                <div className="flex gap-3">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNumVariations(num)}
                      disabled={isProcessing}
                      className={`px-6 py-3 rounded-lg border-2 font-semibold transition-all ${
                        numVariations === num
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-gray-700 bg-white/5 text-gray-400 hover:border-gray-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Variations will explore:</h4>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  <li>Different color schemes (complementary, analogous, monochrome)</li>
                  <li>Alternative layouts and spacing</li>
                  <li>Typography variations (fonts, weights, sizes)</li>
                  <li>The core concept will remain recognizable</li>
                </ul>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-1">Enhancement Failed</h4>
                <p className="text-sm text-gray-300">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={mode === 'refine' ? handleRefine : handleGenerateVariations}
            disabled={isProcessing || (mode === 'refine' && !feedback.trim())}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {mode === 'refine' ? 'Refining...' : 'Generating...'}
              </>
            ) : (
              <>
                {mode === 'refine' ? <Sparkles className="w-5 h-5" /> : <Shuffle className="w-5 h-5" />}
                {mode === 'refine' ? 'Refine Logo' : 'Generate Variations'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
