'use client';

/**
 * Step 1: Company Information Input
 * User enters company name and optional business context
 * Generates LogoDesignBrief via API
 */

import { useState } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ai/Toast';
import type { LogoDesignBrief } from '@kimuntupro/shared';
import type { AssistantResult } from '@kimuntupro/db';

interface Step1Props {
  companyName: string;
  setCompanyName: (name: string) => void;
  businessContext: string;
  setBusinessContext: (context: string) => void;
  onNext: () => void;
  businessPlanId?: string | null;
  businessPlanData?: AssistantResult | null;
  isLoadingPlan?: boolean;
  setDesignBrief: (brief: LogoDesignBrief) => void;
  setBriefMetadata: (metadata: any) => void;
}

export default function Step1InputCompany({
  companyName,
  setCompanyName,
  businessContext,
  setBusinessContext,
  onNext,
  businessPlanId,
  businessPlanData,
  isLoadingPlan,
  setDesignBrief,
  setBriefMetadata,
}: Step1Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateBrief = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Please sign in to generate logos');
      return;
    }

    if (!companyName.trim()) {
      toast.error('Please enter a company name');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Extract business plan text if available
      let businessPlanText = businessContext;
      if (businessPlanId && businessPlanData) {
        // Extract text from business plan sections (sections is a Record<string, string>)
        const sections = businessPlanData.sections || {};
        businessPlanText = Object.entries(sections)
          .map(([title, content]) => `${title}\n${content}`)
          .join('\n\n');
      }

      const response = await fetch('/api/logo/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          userId: user.uid,
          businessPlanId: businessPlanId || null,
          companyName: companyName.trim(),
          businessPlanText: businessPlanText || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate design brief');
      }

      const data = await response.json();
      console.log('[Step1] Brief generated:', data);

      setDesignBrief(data.brief);
      setBriefMetadata(data.metadata);

      toast.success('Design brief generated!');
      onNext();
    } catch (err: any) {
      console.error('[Step1] Failed to generate brief:', err);
      setError(err.message || 'Failed to generate design brief');
      toast.error(err.message || 'Failed to generate design brief');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Company Information</h2>
        <p className="text-gray-400">
          {businessPlanId
            ? "We'll use your business plan to create a tailored logo design."
            : 'Tell us about your company to get started.'}
        </p>
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g., Acme Corp, TechStart, Green Garden"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          disabled={isGenerating || isLoadingPlan}
        />
      </div>

      {/* Business Context (optional if business plan attached) */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Business Context {!businessPlanId && <span className="text-gray-500">(Optional)</span>}
        </label>
        <textarea
          value={businessContext}
          onChange={(e) => setBusinessContext(e.target.value)}
          placeholder={
            businessPlanId
              ? 'We already have your business plan. You can add extra context here if needed.'
              : 'What does your company do? What industry are you in? What makes you unique?'
          }
          rows={6}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          disabled={isGenerating || isLoadingPlan}
        />
        <p className="text-xs text-gray-500 mt-2">
          {businessPlanId
            ? 'Optional: Provide additional context not covered in your business plan'
            : 'The more details you provide, the better Claude can tailor your logo design'}
        </p>
      </div>

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

      {/* Generate Brief Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleGenerateBrief}
          disabled={isGenerating || isLoadingPlan || !companyName.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Brief...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Design Brief
            </>
          )}
        </button>
      </div>
    </div>
  );
}
