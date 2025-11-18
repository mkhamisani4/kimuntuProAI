'use client';

/**
 * Step 6: Visual Style
 * Collects color theme and font style preferences, and initiates website generation
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Sparkles, Check } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ai/Toast';
import type { WizardInput } from '@kimuntupro/shared';

interface Step6Props {
  data: WizardInput;
  updateData: (updates: Partial<WizardInput>) => void;
  onBack: () => void;
  businessPlanId?: string | null;
  businessPlanData?: any;
}

const COLOR_THEMES = [
  {
    value: 'ocean',
    label: 'Ocean Blue',
    colors: ['#0EA5E9', '#06B6D4', '#E0F2FE'],
  },
  {
    value: 'forest',
    label: 'Forest Green',
    colors: ['#10B981', '#059669', '#D1FAE5'],
  },
  {
    value: 'sunset',
    label: 'Sunset Orange',
    colors: ['#F59E0B', '#EF4444', '#FEF3C7'],
  },
  {
    value: 'lavender',
    label: 'Lavender Purple',
    colors: ['#A78BFA', '#8B5CF6', '#EDE9FE'],
  },
  {
    value: 'rose',
    label: 'Rose Pink',
    colors: ['#F472B6', '#EC4899', '#FCE7F3'],
  },
  {
    value: 'slate',
    label: 'Slate Gray',
    colors: ['#64748B', '#475569', '#F1F5F9'],
  },
];

const FONT_STYLES = [
  { value: 'modern', label: 'Modern Sans', description: 'Inter, Helvetica, clean and professional' },
  { value: 'classic', label: 'Classic Serif', description: 'Georgia, Times, traditional and elegant' },
  { value: 'tech', label: 'Tech Mono', description: 'JetBrains Mono, Courier, technical and precise' },
  { value: 'friendly', label: 'Friendly Rounded', description: 'Nunito, Quicksand, approachable and warm' },
];

export default function Step6VisualStyle({ data, updateData, onBack, businessPlanId, businessPlanData }: Step6Props) {
  const hasPlanAttached = !!businessPlanId;
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current Firebase user
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

  const handleGenerate = async () => {
    // Validation
    if (!data.companyName?.trim()) {
      toast.error('Please go back and enter your company name');
      return;
    }

    if (!currentUserId) {
      toast.error('Please sign in to generate a website');
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Generating your website...');

    try {
      // Call the generation API
      const response = await fetch('/api/websites/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: 'demo-tenant', // Use default tenant for demo
          userId: currentUserId,
          businessPlanId: businessPlanId || null,
          businessPlan: businessPlanData || null, // Send full business plan object
          wizardInput: data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429 || result.error === 'quota_exceeded') {
          const quotaMessage = result.message || 'You have reached your usage quota. Please upgrade your plan or wait until your quota resets.';
          toast.error(quotaMessage, { id: toastId, duration: 6000 });
          return;
        }
        if (result.error === 'validation_failed') {
          toast.error(`Validation error: ${result.message}`, { id: toastId });
          return;
        }
        throw new Error(result.message || 'Failed to generate website');
      }

      toast.success('Website generation started! Redirecting...', { id: toastId });

      // Redirect to the website preview page
      setTimeout(() => {
        router.push(`/dashboard/business/websites/${result.websiteId}`);
      }, 1000);

    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate website', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Visual Style</h2>
      <p className="text-gray-400 mb-8">
        Choose your website's color palette and typography to complete your design.
      </p>

      <div className="space-y-8">
        {/* Color Theme */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Color Theme</h3>
          <p className="text-sm text-gray-400 mb-4">
            {hasPlanAttached ? 'Select a color palette, or let AI choose based on your business plan' : 'Select a color palette for your website'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* AI Choose option (only in plan mode) */}
            {hasPlanAttached && (
              <button
                type="button"
                onClick={() => updateData({ colorTheme: 'ai_choose' })}
                className={`
                  p-4 rounded-lg border-2 transition-all relative
                  ${
                    data.colorTheme === 'ai_choose'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-700 bg-white/5 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-sm font-medium text-white text-left">
                  AI Choose
                </div>
                {data.colorTheme === 'ai_choose' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            )}

            {/* Predefined themes */}
            {COLOR_THEMES.map((theme) => (
              <button
                key={theme.value}
                type="button"
                onClick={() => updateData({ colorTheme: theme.value })}
                className={`
                  p-4 rounded-lg border-2 transition-all relative
                  ${
                    data.colorTheme === theme.value
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-700 bg-white/5 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-3">
                  {theme.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border border-gray-700"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="text-sm font-medium text-white text-left">
                  {theme.label}
                </div>
                {data.colorTheme === theme.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font Style */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Font Style</h3>
          <p className="text-sm text-gray-400 mb-4">
            {hasPlanAttached ? 'Choose typography, or let AI choose based on your business plan' : 'Choose the typography for your website'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* AI Choose option (only in plan mode) */}
            {hasPlanAttached && (
              <button
                type="button"
                onClick={() => updateData({ fontStyle: 'ai_choose' })}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all relative
                  ${
                    data.fontStyle === 'ai_choose'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-700 bg-white/5 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <div className="font-semibold text-white">AI Choose</div>
                </div>
                <div className="text-sm text-gray-400">Let AI select the best font based on your business</div>
              </button>
            )}

            {/* Predefined fonts */}
            {FONT_STYLES.map((font) => (
              <button
                key={font.value}
                type="button"
                onClick={() => updateData({ fontStyle: font.value })}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${
                    data.fontStyle === font.value
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-700 bg-white/5 hover:border-gray-600'
                  }
                `}
              >
                <div className="font-semibold text-white mb-1">{font.label}</div>
                <div className="text-sm text-gray-400">{font.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-3">Ready to Generate!</h3>
          <p className="text-gray-300 text-sm mb-4">
            {hasPlanAttached
              ? 'Your website will be generated using AI based on your wizard inputs and business plan. This typically takes 1-2 minutes.'
              : 'Your website will be generated using AI based on your inputs. This typically takes 1-2 minutes.'}
          </p>
          <ul className="text-sm text-gray-400 space-y-2">
            {hasPlanAttached && (
              <li className="flex items-start">
                <Check className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                <span>AI will auto-fill any blank fields using your business plan</span>
              </li>
            )}
            <li className="flex items-start">
              <Check className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
              <span>Pure HTML website with modern, responsive design</span>
            </li>
            <li className="flex items-start">
              <Check className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
              <span>Generated using Claude Sonnet 4.5 AI</span>
            </li>
            <li className="flex items-start">
              <Check className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
              <span>Ready to preview, download, or deploy</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
        <button
          onClick={onBack}
          disabled={isGenerating}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Website
            </>
          )}
        </button>
      </div>
    </div>
  );
}
