'use client';

/**
 * Step 2: View Design Brief
 * Displays the AI-generated design brief
 * User can proceed to generate logo concepts
 */

import { useState } from 'react';
import { ChevronLeft, Sparkles, Loader2, Palette, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ai/Toast';
import type { LogoDesignBrief, LogoSpec } from '@kimuntupro/shared';

interface Step2Props {
  companyName: string;
  designBrief: LogoDesignBrief | null;
  briefMetadata: any;
  onNext: () => void;
  onBack: () => void;
  setConcepts: (concepts: LogoSpec[]) => void;
  setConceptsMetadata: (metadata: any) => void;
}

export default function Step2ViewBrief({
  companyName,
  designBrief,
  briefMetadata,
  onNext,
  onBack,
  setConcepts,
  setConceptsMetadata,
}: Step2Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateConcepts = async () => {
    const user = auth.currentUser;
    if (!user || !designBrief) {
      toast.error('Missing required data');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/logo/spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          userId: user.uid,
          brief: designBrief,
          companyName,
          numConcepts: 3,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate logo concepts');
      }

      const data = await response.json();
      console.log('[Step2] Concepts generated:', data);

      setConcepts(data.concepts);
      setConceptsMetadata(data.metadata);

      toast.success('Logo concepts generated!');
      onNext();
    } catch (err: any) {
      console.error('[Step2] Failed to generate concepts:', err);
      setError(err.message || 'Failed to generate logo concepts');
      toast.error(err.message || 'Failed to generate logo concepts');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!designBrief) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No design brief available. Please go back and generate one.</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Logo Design Brief</h2>
        <p className="text-gray-400">
          Claude analyzed your business and created this design brief for {companyName}
        </p>
      </div>

      {/* Brief Content */}
      <div className="space-y-4">
        {/* Brand Personality */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-emerald-400 mb-2">Brand Personality</h3>
          <p className="text-gray-300">{designBrief.brandPersonality}</p>
        </div>

        {/* Brand Adjectives */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-emerald-400 mb-2">Brand Adjectives</h3>
          <div className="flex flex-wrap gap-2">
            {designBrief.brandAdjectives.map((adj, idx) => (
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
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-emerald-400 mb-2">Logo Type</h3>
          <p className="text-gray-300 capitalize">{designBrief.logoType}</p>
        </div>

        {/* Icon Concepts */}
        {designBrief.iconConcepts.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-emerald-400 mb-2">Icon Concepts</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {designBrief.iconConcepts.map((concept, idx) => (
                <li key={idx}>{concept}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Color Palette */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-emerald-400 mb-2">Color Palette</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(designBrief.colorPalette).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded border border-gray-600 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div>
                  <p className="text-xs text-gray-400 capitalize">{name}</p>
                  <p className="text-xs text-gray-300 font-mono">{color}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Font Suggestions */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-emerald-400 mb-2">Font Suggestions</h3>
          <div className="space-y-2">
            <p className="text-gray-300">
              <span className="text-gray-400 text-sm">Heading:</span>{' '}
              <span className="font-semibold">{designBrief.fontSuggestions.heading}</span>
            </p>
            {designBrief.fontSuggestions.tagline && (
              <p className="text-gray-300">
                <span className="text-gray-400 text-sm">Tagline:</span>{' '}
                <span className="font-semibold">{designBrief.fontSuggestions.tagline}</span>
              </p>
            )}
          </div>
        </div>

        {/* Rationale */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-emerald-400 mb-2">Design Rationale</h3>
          <p className="text-gray-300">{designBrief.rationale}</p>
        </div>
      </div>

      {/* Metadata */}
      {briefMetadata && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Model: {briefMetadata.model}</span>
            <span>{briefMetadata.tokensUsed.toLocaleString()} tokens</span>
            <span>${(briefMetadata.costCents / 100).toFixed(4)}</span>
            <span>{briefMetadata.latencyMs}ms</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-1">Generation Failed</h4>
            <p className="text-sm text-gray-300">{error}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleGenerateConcepts}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Concepts...
            </>
          ) : (
            <>
              <Palette className="w-5 h-5" />
              Generate Logo Concepts
            </>
          )}
        </button>
      </div>
    </div>
  );
}
