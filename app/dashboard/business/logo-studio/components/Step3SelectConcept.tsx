'use client';

/**
 * Step 3: Select & Save Logo Concept
 * User views generated concepts, selects one, and saves it
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Loader2, AlertCircle, CheckCircle, Star } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ai/Toast';
import type { LogoDesignBrief, LogoSpec } from '@kimuntupro/shared';
import ConceptSelector from './ConceptSelector';
import LogoCanvas from './LogoCanvas';
import { logoSpecToSVGString } from '../utils/svgRenderer';

interface Step3Props {
  companyName: string;
  designBrief: LogoDesignBrief | null;
  briefMetadata: any;
  concepts: LogoSpec[];
  conceptsMetadata: any;
  onBack: () => void;
  businessPlanId?: string | null;
}

export default function Step3SelectConcept({
  companyName,
  designBrief,
  briefMetadata,
  concepts,
  conceptsMetadata,
  onBack,
  businessPlanId,
}: Step3Props) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);

  const handleSaveLogo = async () => {
    const user = auth.currentUser;
    if (!user || !designBrief || concepts.length === 0) {
      toast.error('Missing required data');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const selectedConcept = concepts[selectedIndex];

      // Combine brief metadata + concepts metadata
      const combinedMetadata = {
        model: conceptsMetadata.model,
        tokensUsed: (briefMetadata?.tokensUsed || 0) + (conceptsMetadata?.tokensUsed || 0),
        latencyMs: (briefMetadata?.latencyMs || 0) + (conceptsMetadata?.latencyMs || 0),
        costCents: (briefMetadata?.costCents || 0) + (conceptsMetadata?.costCents || 0),
        generatedAt: new Date(),
      };

      const response = await fetch('/api/logo/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          userId: user.uid,
          businessPlanId: businessPlanId || null,
          companyName,
          brief: designBrief,
          concepts: concepts,
          currentSpec: selectedConcept,
          isPrimary: isPrimary,
          generationMetadata: combinedMetadata,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save logo');
      }

      const data = await response.json();
      console.log('[Step3] Logo saved:', data);

      setSaved(true);
      toast.success('Logo saved successfully!');

      // Redirect to logos list after a short delay
      setTimeout(() => {
        router.push('/dashboard/business/logos');
      }, 2000);
    } catch (err: any) {
      console.error('[Step3] Failed to save logo:', err);
      setError(err.message || 'Failed to save logo');
      toast.error(err.message || 'Failed to save logo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadSVG = () => {
    if (concepts.length === 0) return;

    const selectedConcept = concepts[selectedIndex];
    const svgString = logoSpecToSVGString(selectedConcept);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${companyName.replace(/\s+/g, '-').toLowerCase()}-logo.svg`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded!');
  };

  if (concepts.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No logo concepts available. Please go back and generate some.</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const selectedConcept = concepts[selectedIndex];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Select Your Logo</h2>
        <p className="text-gray-400">
          Choose your favorite design from {concepts.length} AI-generated concept{concepts.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Success State */}
      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-emerald-400 mb-1">Logo Saved!</h4>
            <p className="text-sm text-gray-300">Redirecting to your logos...</p>
          </div>
        </div>
      )}

      {/* Concept Selector Grid */}
      <ConceptSelector
        concepts={concepts}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
      />

      {/* Selected Concept Preview */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Preview: {selectedConcept.metadata.conceptName}</h3>
        <div className="bg-white rounded-lg p-8 mb-4">
          <LogoCanvas spec={selectedConcept} className="max-w-md mx-auto" />
        </div>
        <p className="text-gray-400 text-sm">{selectedConcept.metadata.description}</p>
      </div>

      {/* Metadata */}
      {conceptsMetadata && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Model: {conceptsMetadata.model}</span>
            <span>
              Total: {((briefMetadata?.tokensUsed || 0) + conceptsMetadata.tokensUsed).toLocaleString()} tokens
            </span>
            <span>
              ${(((briefMetadata?.costCents || 0) + conceptsMetadata.costCents) / 100).toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-1">Save Failed</h4>
            <p className="text-sm text-gray-300">{error}</p>
          </div>
        </div>
      )}

      {/* Set as Primary Option */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            disabled={isSaving || saved}
            className="w-5 h-5 rounded border-2 border-yellow-500 bg-gray-800 checked:bg-yellow-500 checked:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold text-yellow-300">Set as Primary Logo</span>
            </div>
            <p className="text-sm text-gray-400">
              Make this your primary logo. It will appear in your dashboard and be available in the website builder.
            </p>
          </div>
        </label>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          disabled={isSaving || saved}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleDownloadSVG}
            disabled={isSaving || saved}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Download SVG
          </button>

          <button
            onClick={handleSaveLogo}
            disabled={isSaving || saved}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Logo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
