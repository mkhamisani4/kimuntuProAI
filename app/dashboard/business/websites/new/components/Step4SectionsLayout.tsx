'use client';

/**
 * Step 4: Sections & Layout
 * Allows users to toggle website sections and choose layout style
 */

import { ChevronRight, ChevronLeft, Check, Sparkles, LayoutGrid, Palette, Smile } from 'lucide-react';
import type { WizardInput } from '@kimuntupro/shared';

interface Step4Props {
  hasPlanAttached?: boolean;
  data: WizardInput;
  updateData: (updates: Partial<WizardInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SECTIONS = [
  { key: 'features', label: 'Features', description: 'Highlight key product/service features' },
  { key: 'services', label: 'Services', description: 'List what you offer' },
  { key: 'about', label: 'About Us', description: 'Tell your story' },
  { key: 'testimonials', label: 'Testimonials', description: 'Customer reviews and feedback' },
  { key: 'pricing', label: 'Pricing', description: 'Plans and pricing tiers' },
  { key: 'faq', label: 'FAQ', description: 'Frequently asked questions' },
  { key: 'contact', label: 'Contact', description: 'Contact form and information' },
] as const;

const LAYOUT_STYLES = [
  {
    value: 'minimal',
    label: 'Minimal',
    icon: Sparkles,
    description: 'Clean, spacious, lots of whitespace',
  },
  {
    value: 'modern',
    label: 'Modern',
    icon: LayoutGrid,
    description: 'Balanced, professional, grid-based',
  },
  {
    value: 'bold',
    label: 'Bold',
    icon: Palette,
    description: 'Eye-catching, vibrant, impactful',
  },
  {
    value: 'playful',
    label: 'Playful',
    icon: Smile,
    description: 'Fun, creative, unique shapes',
  },
] as const;

export default function Step4SectionsLayout({ data, updateData, onNext, onBack, hasPlanAttached }: Step4Props) {
  const toggleSection = (sectionKey: keyof WizardInput['enabledSections']) => {
    // When manually toggling, set mode to manual
    updateData({
      sectionsMode: 'manual',
      enabledSections: {
        ...data.enabledSections,
        [sectionKey]: !data.enabledSections[sectionKey],
      },
    });
  };

  const handleAIChooseSections = () => {
    if (data.sectionsMode === 'ai_choose') {
      // If already in AI mode, switch back to manual
      updateData({ sectionsMode: 'manual' });
    } else {
      // Switch to AI choose mode
      updateData({ sectionsMode: 'ai_choose' });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Sections & Layout</h2>
      <p className="text-gray-400 mb-8">
        Choose which sections to include on your website and select a layout style.
      </p>

      <div className="space-y-8">
        {/* Website Sections */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Website Sections</h3>
          <p className="text-sm text-gray-400 mb-4">
            {hasPlanAttached
              ? 'Select the sections you want to include, or let AI choose based on your business plan'
              : 'Select the sections you want to include on your website'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* AI Choose Button */}
            {hasPlanAttached && (
              <button
                type="button"
                onClick={handleAIChooseSections}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${
                    data.sectionsMode === 'ai_choose'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-white/5 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 mt-0.5 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white mb-1">Let AI Choose</div>
                    <div className="text-sm text-gray-400">AI selects sections from your business plan</div>
                  </div>
                </div>
              </button>
            )}
            {SECTIONS.map((section) => {
              const isEnabled = data.enabledSections[section.key];
              const isAIMode = data.sectionsMode === 'ai_choose';
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all relative
                    ${
                      isAIMode
                        ? 'border-gray-700 bg-gray-800/50 opacity-50 hover:opacity-75 cursor-pointer'
                        : isEnabled
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-gray-700 bg-white/5 hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">{section.label}</div>
                      <div className="text-sm text-gray-400">{section.description}</div>
                    </div>
                    {isEnabled && (
                      <div className="ml-3 flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout Style */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Layout Style</h3>
          <p className="text-sm text-gray-400 mb-4">
            Choose the overall visual style for your website
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hasPlanAttached && (
              <button
                type="button"
                onClick={() => updateData({ layoutStyle: data.layoutStyle === 'ai_choose' ? undefined : 'ai_choose' })}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${
                    data.layoutStyle === 'ai_choose'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-white/5 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 mt-0.5 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white mb-1">Let AI Choose</div>
                    <div className="text-sm text-gray-400">AI selects style from your business plan</div>
                  </div>
                </div>
              </button>
            )}
            {LAYOUT_STYLES.map((style) => {
              const Icon = style.icon;
              const isAIMode = data.layoutStyle === 'ai_choose';
              return (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => updateData({ layoutStyle: style.value })}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      isAIMode
                        ? 'border-gray-700 bg-gray-800/50 opacity-50 hover:opacity-75 cursor-pointer'
                        : data.layoutStyle === style.value
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-gray-700 bg-white/5 hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`w-5 h-5 mt-0.5 ${
                        data.layoutStyle === style.value ? 'text-emerald-400' : 'text-gray-400'
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-white mb-1">{style.label}</div>
                      <div className="text-sm text-gray-400">{style.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          Next Step
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
