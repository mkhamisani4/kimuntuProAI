'use client';

/**
 * Step 3: Hero & CTA
 * Collects hero headline, subheadline, CTA text, and main goal
 */

import { ChevronRight, ChevronLeft, Target, ShoppingCart, UserPlus, Mail, BookOpen } from 'lucide-react';
import type { WizardInput } from '@kimuntupro/shared';

interface Step3Props {
  hasPlanAttached?: boolean;
  data: WizardInput;
  updateData: (updates: Partial<WizardInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

const MAIN_GOALS = [
  {
    value: 'consult',
    label: 'Book a Consultation',
    icon: Target,
    description: 'Drive visitors to schedule a call or meeting',
  },
  {
    value: 'buy',
    label: 'Purchase Product',
    icon: ShoppingCart,
    description: 'Sell products or services directly',
  },
  {
    value: 'signup',
    label: 'Sign Up / Register',
    icon: UserPlus,
    description: 'Get users to create an account',
  },
  {
    value: 'contact',
    label: 'Contact Us',
    icon: Mail,
    description: 'Encourage visitors to reach out',
  },
  {
    value: 'learn_more',
    label: 'Learn More',
    icon: BookOpen,
    description: 'Educate visitors about your offering',
  },
] as const;

export default function Step3HeroCta({ data, updateData, onNext, onBack, hasPlanAttached = false }: Step3Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Hero & Call-to-Action</h2>
      <p className="text-gray-400 mb-8">
        Craft compelling homepage messaging that captures attention and drives action.
      </p>

      <div className="space-y-6">
        {/* Hero Headline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-200">
              Hero Headline <span className="text-gray-500">(Optional)</span>
            </label>
            {hasPlanAttached && (
              <label className="flex items-center gap-2 text-sm text-purple-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.heroHeadline === 'ai_fill'}
                  onChange={(e) => updateData({ heroHeadline: e.target.checked ? 'ai_fill' : '' })}
                  className="w-4 h-4 rounded border-gray-600 bg-white/10 text-purple-500 focus:ring-purple-500"
                />
                Auto-fill from plan
              </label>
            )}
          </div>
          {data.heroHeadline !== 'ai_fill' ? (
            <>
              <input
                type="text"
                value={data.heroHeadline === 'ai_fill' ? '' : (data.heroHeadline || '')}
                onChange={(e) => updateData({ heroHeadline: e.target.value })}
                placeholder="e.g., Build Your Dream Website in Minutes"
                className="w-full px-4 py-3 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                The main headline visitors see first on your homepage
              </p>
            </>
          ) : (
            <div className="px-4 py-3 border border-purple-500/50 bg-purple-500/10 text-purple-300 rounded-lg text-sm">
              ✨ AI will generate this content from your business plan
            </div>
          )}
        </div>

        {/* Hero Subheadline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-200">
              Hero Subheadline <span className="text-gray-500">(Optional)</span>
            </label>
            {hasPlanAttached && (
              <label className="flex items-center gap-2 text-sm text-purple-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.heroSubheadline === 'ai_fill'}
                  onChange={(e) => updateData({ heroSubheadline: e.target.checked ? 'ai_fill' : '' })}
                  className="w-4 h-4 rounded border-gray-600 bg-white/10 text-purple-500 focus:ring-purple-500"
                />
                Auto-fill from plan
              </label>
            )}
          </div>
          {data.heroSubheadline !== 'ai_fill' ? (
            <>
              <textarea
                value={data.heroSubheadline === 'ai_fill' ? '' : (data.heroSubheadline || '')}
                onChange={(e) => updateData({ heroSubheadline: e.target.value })}
                placeholder="e.g., No coding required. AI-powered design. Launch in under 5 minutes."
                rows={3}
                maxLength={250}
                className="w-full px-4 py-3 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(data.heroSubheadline && data.heroSubheadline !== 'ai_fill' ? data.heroSubheadline.length : 0)}/250 - Supporting text below the headline
              </p>
            </>
          ) : (
            <div className="px-4 py-3 border border-purple-500/50 bg-purple-500/10 text-purple-300 rounded-lg text-sm">
              ✨ AI will generate this content from your business plan
            </div>
          )}
        </div>

        {/* Primary CTA Text */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-200">
              Primary Button Text <span className="text-gray-500">(Optional)</span>
            </label>
            {hasPlanAttached && (
              <label className="flex items-center gap-2 text-sm text-purple-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.primaryCtaText === 'ai_fill'}
                  onChange={(e) => updateData({ primaryCtaText: e.target.checked ? 'ai_fill' : '' })}
                  className="w-4 h-4 rounded border-gray-600 bg-white/10 text-purple-500 focus:ring-purple-500"
                />
                Auto-fill from plan
              </label>
            )}
          </div>
          {data.primaryCtaText !== 'ai_fill' ? (
            <>
              <input
                type="text"
                value={data.primaryCtaText === 'ai_fill' ? '' : (data.primaryCtaText || '')}
                onChange={(e) => updateData({ primaryCtaText: e.target.value })}
                placeholder="e.g., Get Started Free, Book a Demo, Shop Now"
                className="w-full px-4 py-3 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                The text on your main call-to-action button
              </p>
            </>
          ) : (
            <div className="px-4 py-3 border border-purple-500/50 bg-purple-500/10 text-purple-300 rounded-lg text-sm">
              ✨ AI will generate this content from your business plan
            </div>
          )}
        </div>

        {/* Main Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Main Website Goal <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MAIN_GOALS.map((goal) => {
              const Icon = goal.icon;
              return (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => updateData({ mainGoal: goal.value })}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      data.mainGoal === goal.value
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-gray-700 bg-white/5 hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`w-5 h-5 mt-0.5 ${
                        data.mainGoal === goal.value ? 'text-emerald-400' : 'text-gray-400'
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-white mb-1">{goal.label}</div>
                      <div className="text-sm text-gray-400">{goal.description}</div>
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
