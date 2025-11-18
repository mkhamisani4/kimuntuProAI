'use client';

/**
 * AI Website Builder - Wizard Page
 * 6-step wizard to generate custom business websites with Claude Sonnet 4.5
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Globe, FileText } from 'lucide-react';
import AssistantLayout from '@/components/ai/AssistantLayout';
import WizardContainer from './components/WizardContainer';
import { getAssistantResult } from '@kimuntupro/db';
import type { WizardInput } from '@kimuntupro/shared';

export default function WebsiteBuilderPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');

  const [wizardData, setWizardData] = useState<WizardInput>({
    enabledSections: {
      features: true,
      services: true,
      about: true,
      testimonials: false,
      pricing: false,
      faq: false,
      contact: true,
    },
  });
  const [businessPlanId, setBusinessPlanId] = useState<string | null>(null);
  const [businessPlanData, setBusinessPlanData] = useState<any>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  // Load business plan if planId is present
  useEffect(() => {
    async function loadBusinessPlan() {
      if (!planId) return;

      setIsLoadingPlan(true);
      try {
        console.log('[WebsiteBuilder] Loading business plan:', planId);
        const result = await getAssistantResult(planId);

        if (!result) {
          console.error('[WebsiteBuilder] Business plan not found:', planId);
          return;
        }

        console.log('[WebsiteBuilder] Business plan loaded:', result);
        setBusinessPlanId(planId);
        setBusinessPlanData(result);

        // Pre-fill wizard data from business plan if available
        if (result.input?.businessName) {
          setWizardData((prev) => ({
            ...prev,
            companyName: result.input.businessName,
          }));
        }
      } catch (error) {
        console.error('[WebsiteBuilder] Failed to load business plan:', error);
      } finally {
        setIsLoadingPlan(false);
      }
    }

    loadBusinessPlan();
  }, [planId]);

  return (
    <AssistantLayout
      title="AI Website Builder"
      description={businessPlanId ? "Create a website from your business plan" : "Create a professional business website in 6 simple steps"}
      icon={businessPlanId ? <FileText className="w-16 h-16" /> : <Globe className="w-16 h-16" />}
      backHref="/dashboard/business"
    >
      {/* Business Plan Mode Banner */}
      {businessPlanId && (
        <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-400 mb-1">
                Business Plan Mode Enabled
              </h3>
              <p className="text-sm text-gray-300">
                Fields you leave blank will be automatically filled by AI using your business plan. You can also choose "AI Choose" for colors and fonts.
              </p>
            </div>
          </div>
        </div>
      )}

      <WizardContainer
        wizardData={wizardData}
        setWizardData={setWizardData}
        businessPlanId={businessPlanId}
        businessPlanData={businessPlanData}
        isLoadingPlan={isLoadingPlan}
      />
    </AssistantLayout>
  );
}
