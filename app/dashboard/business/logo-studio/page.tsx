'use client';

/**
 * AI Logo Studio - Phase 1 MVP
 * Generate logo concepts from business plans or manual input
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Palette, FileText, Layout, Loader2 } from 'lucide-react';
import AssistantLayout from '@/components/ai/AssistantLayout';
import LogoWizard from './components/LogoWizard';
import TemplateSelector from './components/TemplateSelector';
import CompanyNameDialog from './components/CompanyNameDialog';
import { getAssistantResult, type AssistantResult, createLogo } from '@kimuntupro/db';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ai/Toast';
import type { LogoTemplate } from './templates/templates';

export default function LogoStudioPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get('planId');

  const [businessPlanId, setBusinessPlanId] = useState<string | null>(null);
  const [businessPlanData, setBusinessPlanData] = useState<AssistantResult | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showCompanyNameDialog, setShowCompanyNameDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LogoTemplate | null>(null);
  const [isCustomizingTemplate, setIsCustomizingTemplate] = useState(false);

  // Load business plan if planId is present
  useEffect(() => {
    async function loadBusinessPlan() {
      if (!planId) return;

      setIsLoadingPlan(true);
      try {
        console.log('[LogoStudio] Loading business plan:', planId);
        const result = await getAssistantResult(planId);

        if (!result) {
          console.error('[LogoStudio] Business plan not found:', planId);
          return;
        }

        console.log('[LogoStudio] Business plan loaded:', result);
        setBusinessPlanId(planId);
        setBusinessPlanData(result);
      } catch (error) {
        console.error('[LogoStudio] Failed to load business plan:', error);
      } finally {
        setIsLoadingPlan(false);
      }
    }

    loadBusinessPlan();
  }, [planId]);

  // Handle template selection - show company name dialog
  const handleTemplateSelect = (template: LogoTemplate) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Please sign in to create a logo from template');
      return;
    }

    setSelectedTemplate(template);
    setShowCompanyNameDialog(true);
  };

  // Handle company name submission and template customization
  const handleCompanyNameSubmit = async (companyName: string) => {
    if (!selectedTemplate) return;

    setShowCompanyNameDialog(false);
    setIsCustomizingTemplate(true);
    const toastId = toast.loading('Customizing template with AI...');

    const user = auth.currentUser;
    if (!user) {
      toast.error('Please sign in to create a logo from template');
      setIsCustomizingTemplate(false);
      return;
    }

    try {

      // Call AI customization API
      const response = await fetch('/api/logo/customize-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          userId: user.uid,
          templateSpec: selectedTemplate.spec,
          companyName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to customize template');
      }

      const data = await response.json();
      const customizedSpec = data.customizedSpec;

      // Save the customized logo (createLogo returns the logo ID)
      const logoData: any = {
        tenantId: 'demo-tenant',
        userId: user.uid,
        companyName,
        brief: {
          companyName,
          tagline: '',
          industry: '',
          targetAudience: '',
          logoType: selectedTemplate.category,
          colorPreferences: [],
          stylePreferences: [],
          keywords: [],
        },
        concepts: [customizedSpec],
        currentSpec: customizedSpec,
        isPrimary: false,
        generationMetadata: {
          model: 'claude-sonnet-4-5-20250929',
          tokensUsed: 0,
          latencyMs: 0,
          costCents: 0,
          generatedAt: new Date(),
        },
      };

      // Only include businessPlanId if it exists (Firestore doesn't accept undefined)
      if (businessPlanId) {
        logoData.businessPlanId = businessPlanId;
      }

      const logoId = await createLogo(logoData);

      toast.success('Template customized successfully!', { id: toastId });

      // Navigate to editor
      router.push(`/dashboard/business/logo-studio/edit/${logoId}`);
    } catch (error: any) {
      console.error('[LogoStudio] Template customization error:', error);
      toast.error(error.message || 'Failed to customize template', { id: toastId });
    } finally {
      setIsCustomizingTemplate(false);
    }
  };

  return (
    <AssistantLayout
      title="AI Logo Studio"
      description={businessPlanId ? "Generate a logo from your business plan" : "Create a professional logo with AI"}
      icon={businessPlanId ? <FileText className="w-16 h-16" /> : <Palette className="w-16 h-16" />}
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
                Claude will analyze your business plan to create a logo design brief tailored to your brand.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Template Quick Start */}
      <div className="mb-8 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border border-emerald-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-600 rounded-lg">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Quick Start: Use a Template
              </h3>
              <p className="text-sm text-gray-300">
                Start with a pre-designed template and customize it with AI to match your brand
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowTemplateSelector(true)}
            disabled={isCustomizingTemplate}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isCustomizingTemplate ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Customizing...
              </>
            ) : (
              <>
                <Layout className="w-5 h-5" />
                Browse Templates
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-sm text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
        <p className="text-center text-sm text-gray-400">
          Create a custom logo from scratch using our AI wizard
        </p>
      </div>

      <LogoWizard
        businessPlanId={businessPlanId}
        businessPlanData={businessPlanData}
        isLoadingPlan={isLoadingPlan}
      />

      {/* Template Selector Dialog */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
      />

      {/* Company Name Dialog */}
      <CompanyNameDialog
        isOpen={showCompanyNameDialog}
        onClose={() => {
          setShowCompanyNameDialog(false);
          setSelectedTemplate(null);
        }}
        onSubmit={handleCompanyNameSubmit}
        templateName={selectedTemplate?.name || ''}
      />
    </AssistantLayout>
  );
}
