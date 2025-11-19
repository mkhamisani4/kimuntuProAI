'use client';

/**
 * Step 2: Business Overview
 * Collects short description, about us, industry, and key services
 */

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Plus, X, Sparkles } from 'lucide-react';
import { toast } from '@/components/ai/Toast';
import type { WizardInput } from '@kimuntupro/shared';

interface Step2Props {
  data: WizardInput;
  updateData: (updates: Partial<WizardInput>) => void;
  onNext: () => void;
  onBack: () => void;
  hasPlanAttached?: boolean;
}

export default function Step2BusinessOverview({ data, updateData, onNext, onBack, hasPlanAttached = false }: Step2Props) {
  const [newService, setNewService] = useState('');

  const addService = () => {
    if (!newService.trim()) {
      toast.error('Please enter a service name');
      return;
    }

    const currentServices = Array.isArray(data.keyServices) ? data.keyServices : [];
    if (currentServices.length >= 10) {
      toast.error('Maximum 10 services allowed');
      return;
    }

    updateData({ keyServices: [...currentServices, newService.trim()] });
    setNewService('');
  };

  const removeService = (index: number) => {
    const currentServices = Array.isArray(data.keyServices) ? data.keyServices : [];
    updateData({ keyServices: currentServices.filter((_, i) => i !== index) });
  };

  const handleNext = () => {
    // Optional validation - could require at least short description
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Business Overview</h2>
      <p className="text-gray-400 mb-8">
        Tell us about your business. This helps create meaningful content for your website.
      </p>

      <div className="space-y-6">
        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Short Description <span className="text-gray-500">(Optional)</span>
          </label>

          {hasPlanAttached && (
            <button
              type="button"
              onClick={() => updateData({ shortDescription: data.shortDescription === 'ai_fill' ? '' : 'ai_fill' })}
              className={`w-full mb-3 p-4 rounded-lg border-2 transition-all ${
                data.shortDescription === 'ai_fill'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-white/5 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-white">Generate with AI</div>
                  <div className="text-sm text-gray-400">Let AI create this from your business plan</div>
                </div>
              </div>
            </button>
          )}

          {data.shortDescription !== 'ai_fill' && (
            <>
              <textarea
                value={data.shortDescription === 'ai_fill' ? '' : (data.shortDescription || '')}
                onChange={(e) => updateData({ shortDescription: e.target.value })}
                placeholder="e.g., We help startups build beautiful, high-converting websites in minutes"
                rows={3}
                maxLength={250}
                className="w-full px-4 py-3 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(data.shortDescription && data.shortDescription !== 'ai_fill' ? data.shortDescription.length : 0)}/250 characters
              </p>
            </>
          )}
        </div>

        {/* About Us */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            About Us <span className="text-gray-500">(Optional)</span>
          </label>

          {hasPlanAttached && (
            <button
              type="button"
              onClick={() => updateData({ aboutUs: data.aboutUs === 'ai_fill' ? '' : 'ai_fill' })}
              className={`w-full mb-3 p-4 rounded-lg border-2 transition-all ${
                data.aboutUs === 'ai_fill'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-white/5 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-white">Generate with AI</div>
                  <div className="text-sm text-gray-400">Let AI create this from your business plan</div>
                </div>
              </div>
            </button>
          )}

          {data.aboutUs !== 'ai_fill' && (
            <>
              <textarea
                value={data.aboutUs === 'ai_fill' ? '' : (data.aboutUs || '')}
                onChange={(e) => updateData({ aboutUs: e.target.value })}
                placeholder="e.g., Founded in 2024, we're on a mission to democratize web design for small businesses..."
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(data.aboutUs && data.aboutUs !== 'ai_fill' ? data.aboutUs.length : 0)}/1000 characters
              </p>
            </>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Industry <span className="text-gray-500">(Optional)</span>
          </label>

          {hasPlanAttached && (
            <button
              type="button"
              onClick={() => updateData({ industry: data.industry === 'ai_fill' ? '' : 'ai_fill' })}
              className={`w-full mb-3 p-4 rounded-lg border-2 transition-all ${
                data.industry === 'ai_fill'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-white/5 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-white">Generate with AI</div>
                  <div className="text-sm text-gray-400">Let AI create this from your business plan</div>
                </div>
              </div>
            </button>
          )}

          {data.industry !== 'ai_fill' && (
            <input
              type="text"
              value={data.industry === 'ai_fill' ? '' : (data.industry || '')}
              onChange={(e) => updateData({ industry: e.target.value })}
              placeholder="e.g., SaaS, E-commerce, Consulting, Healthcare"
              className="w-full px-4 py-3 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              maxLength={100}
            />
          )}
        </div>

        {/* Key Services */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Key Services <span className="text-gray-500">(Optional)</span>
          </label>

          {hasPlanAttached && (
            <button
              type="button"
              onClick={() => updateData({ keyServices: data.keyServices === 'ai_fill' ? [] : 'ai_fill' })}
              className={`w-full mb-3 p-4 rounded-lg border-2 transition-all ${
                data.keyServices === 'ai_fill'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-white/5 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-white">Generate with AI</div>
                  <div className="text-sm text-gray-400">Let AI create this from your business plan</div>
                </div>
              </div>
            </button>
          )}

          {data.keyServices !== 'ai_fill' && (
            <>
              <p className="text-sm text-gray-500 mb-3">
                List the main services or products you offer (up to 10)
              </p>

              {/* Service List */}
              {data.keyServices && Array.isArray(data.keyServices) && data.keyServices.length > 0 && (
                <div className="mb-3 space-y-2">
                  {data.keyServices.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/10 border border-gray-700 rounded-lg"
                    >
                      <span className="text-gray-200">{service}</span>
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        aria-label={`Remove ${service}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Service Input */}
              {(!data.keyServices || !Array.isArray(data.keyServices) || data.keyServices.length < 10) && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addService();
                      }
                    }}
                    placeholder="e.g., Web Design"
                    className="flex-1 px-4 py-2 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    onClick={addService}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              )}
            </>
          )}
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
          onClick={handleNext}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          Next Step
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
