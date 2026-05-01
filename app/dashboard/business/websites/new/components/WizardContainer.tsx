'use client';

/**
 * WizardContainer Component
 * Manages wizard state, navigation, and step rendering
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { WizardInput } from '@kimuntupro/shared';
import Step1BrandBasics from './Step1BrandBasics';
import Step2BusinessOverview from './Step2BusinessOverview';
import Step3HeroCta from './Step3HeroCta';
import Step4SectionsLayout from './Step4SectionsLayout';
import Step5ContactSocial from './Step5ContactSocial';
import Step6VisualStyle from './Step6VisualStyle';

interface WizardContainerProps {
  wizardData: WizardInput;
  setWizardData: React.Dispatch<React.SetStateAction<WizardInput>>;
  businessPlanId?: string | null;
  businessPlanData?: any;
  isLoadingPlan?: boolean;
}

const STEPS = [
  { id: 1, name: 'Brand Basics', description: 'Company name, tagline, logo' },
  { id: 2, name: 'Business Overview', description: 'About your business' },
  { id: 3, name: 'Hero & CTA', description: 'Homepage messaging' },
  { id: 4, name: 'Sections & Layout', description: 'Choose what to include' },
  { id: 5, name: 'Contact & Social', description: 'How to reach you' },
  { id: 6, name: 'Visual Style', description: 'Colors and fonts' },
];

export default function WizardContainer({
  wizardData,
  setWizardData,
  businessPlanId,
  businessPlanData,
  isLoadingPlan
}: WizardContainerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const updateData = (updates: Partial<WizardInput>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  };

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
    setCurrentStep(step);
  };

  const renderStep = () => {
    const hasPlanAttached = !!businessPlanId;

    switch (currentStep) {
      case 1:
        return <Step1BrandBasics data={wizardData} updateData={updateData} onNext={goToNextStep} hasPlanAttached={hasPlanAttached} />;
      case 2:
        return <Step2BusinessOverview data={wizardData} updateData={updateData} onNext={goToNextStep} onBack={goToPreviousStep} hasPlanAttached={hasPlanAttached} />;
      case 3:
        return <Step3HeroCta data={wizardData} updateData={updateData} onNext={goToNextStep} onBack={goToPreviousStep} hasPlanAttached={hasPlanAttached} />;
      case 4:
        return <Step4SectionsLayout data={wizardData} updateData={updateData} onNext={goToNextStep} onBack={goToPreviousStep} hasPlanAttached={hasPlanAttached} />;
      case 5:
        return <Step5ContactSocial data={wizardData} updateData={updateData} onNext={goToNextStep} onBack={goToPreviousStep} hasPlanAttached={hasPlanAttached} />;
      case 6:
        return (
          <Step6VisualStyle
            data={wizardData}
            updateData={updateData}
            onBack={goToPreviousStep}
            businessPlanId={businessPlanId}
            businessPlanData={businessPlanData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Progress Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-2 sm:gap-0">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex min-w-0 flex-1 items-center">
              {/* Step Circle */}
              <button
                onClick={() => goToStep(step.id)}
                className={`
                  relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all sm:h-10 sm:w-10 sm:text-base
                  ${
                    currentStep === step.id
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30'
                      : completedSteps.has(step.id)
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
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
                    mx-1 h-1 min-w-0 flex-1 transition-colors sm:mx-2
                    ${completedSteps.has(step.id) ? 'bg-emerald-600' : 'bg-gray-700'}
                  `}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="mt-3 hidden justify-between sm:flex">
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
      <div className="rounded-2xl border border-gray-800 bg-white/5 p-4 backdrop-blur sm:p-6 lg:p-8">
        {renderStep()}
      </div>
    </div>
  );
}
