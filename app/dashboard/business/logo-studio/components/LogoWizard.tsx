'use client';

/**
 * LogoWizard Component
 * 3-step wizard: Input → Brief → Concepts
 */

import { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import type { LogoDesignBrief, LogoSpec } from '@kimuntupro/shared';
import type { AssistantResult } from '@kimuntupro/db';
import Step1InputCompany from './Step1InputCompany';
import Step2ViewBrief from './Step2ViewBrief';
import Step3SelectConcept from './Step3SelectConcept';

interface LogoWizardProps {
  businessPlanId?: string | null;
  businessPlanData?: AssistantResult | null;
  isLoadingPlan?: boolean;
}

const STEPS = [
  { id: 1, name: 'Company Info', description: 'Name & context' },
  { id: 2, name: 'Design Brief', description: 'AI-generated brief' },
  { id: 3, name: 'Logo Concepts', description: 'Select & save' },
];

export default function LogoWizard({
  businessPlanId,
  businessPlanData,
  isLoadingPlan,
}: LogoWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // State for each step
  const [companyName, setCompanyName] = useState('');
  const [businessContext, setBusinessContext] = useState('');
  const [useTransparentBackground, setUseTransparentBackground] = useState(false);
  const [designBrief, setDesignBrief] = useState<LogoDesignBrief | null>(null);
  const [briefMetadata, setBriefMetadata] = useState<any>(null);
  const [concepts, setConcepts] = useState<LogoSpec[]>([]);
  const [conceptsMetadata, setConceptsMetadata] = useState<any>(null);

  const goToNextStep = () => {
    if (currentStep < STEPS.length) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    // Only allow going to previous steps or current step
    if (step <= currentStep || completedSteps.has(step - 1)) {
      setCurrentStep(step);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1InputCompany
            companyName={companyName}
            setCompanyName={setCompanyName}
            businessContext={businessContext}
            setBusinessContext={setBusinessContext}
            useTransparentBackground={useTransparentBackground}
            setUseTransparentBackground={setUseTransparentBackground}
            onNext={goToNextStep}
            businessPlanId={businessPlanId}
            businessPlanData={businessPlanData}
            isLoadingPlan={isLoadingPlan}
            setDesignBrief={setDesignBrief}
            setBriefMetadata={setBriefMetadata}
          />
        );
      case 2:
        return (
          <Step2ViewBrief
            companyName={companyName}
            designBrief={designBrief}
            briefMetadata={briefMetadata}
            useTransparentBackground={useTransparentBackground}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            setConcepts={setConcepts}
            setConceptsMetadata={setConceptsMetadata}
          />
        );
      case 3:
        return (
          <Step3SelectConcept
            companyName={companyName}
            designBrief={designBrief}
            briefMetadata={briefMetadata}
            concepts={concepts}
            conceptsMetadata={conceptsMetadata}
            onBack={goToPreviousStep}
            businessPlanId={businessPlanId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => goToStep(step.id)}
                disabled={step.id > currentStep && !completedSteps.has(step.id - 1)}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all
                  ${
                    currentStep === step.id
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30'
                      : completedSteps.has(step.id)
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer'
                      : step.id < currentStep
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 cursor-pointer'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }
                `}
                aria-label={`Go to ${step.name}`}
              >
                {completedSteps.has(step.id) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </button>

              {/* Line between steps */}
              {index < STEPS.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-2 transition-colors
                    ${completedSteps.has(step.id) ? 'bg-emerald-600' : 'bg-gray-700'}
                  `}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between mt-3">
          {STEPS.map((step) => (
            <div key={step.id} className="flex-1 text-center px-2">
              <p
                className={`
                  text-sm font-medium
                  ${currentStep === step.id ? 'text-emerald-400' : 'text-gray-400'}
                `}
              >
                {step.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
        {renderStep()}
      </div>
    </div>
  );
}
