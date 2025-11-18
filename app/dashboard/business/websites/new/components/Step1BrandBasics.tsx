'use client';

/**
 * Step 1: Brand Basics
 * Collects company name, tagline, brand voice, and logo
 */

import { useState } from 'react';
import { ChevronRight, Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { toast } from '@/components/ai/Toast';
import type { WizardInput } from '@kimuntupro/shared';

interface Step1Props {
  data: WizardInput;
  updateData: (updates: Partial<WizardInput>) => void;
  onNext: () => void;
  hasPlanAttached?: boolean;
}

const BRAND_VOICES = [
  { value: 'professional', label: 'Professional', description: 'Formal, credible, trustworthy' },
  { value: 'casual', label: 'Casual', description: 'Friendly, approachable, conversational' },
  { value: 'luxury', label: 'Luxury', description: 'Elegant, sophisticated, premium' },
  { value: 'playful', label: 'Playful', description: 'Fun, energetic, creative' },
  { value: 'friendly', label: 'Friendly', description: 'Warm, welcoming, helpful' },
] as const;

export default function Step1BrandBasics({ data, updateData, onNext, hasPlanAttached = false }: Step1Props) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logoUrl || null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image (JPEG, PNG, GIF, SVG, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB');
      return;
    }

    setIsUploadingLogo(true);
    const toastId = toast.loading('Uploading logo...');

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server (will be implemented in integration phase)
      // For now, just store the preview URL
      updateData({ logoUrl: reader.result as string });

      toast.success('Logo uploaded successfully', { id: toastId });
    } catch (error: any) {
      toast.error('Failed to upload logo', { id: toastId });
      console.error('Logo upload error:', error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    updateData({ logoUrl: null });
    toast.success('Logo removed');
  };

  const handleNext = () => {
    // Validation: Company name is required (unless AI Choose in plan mode)
    if (!data.companyName?.trim() && !(hasPlanAttached && data.companyName === 'ai_choose')) {
      toast.error('Please enter your company name or select AI Choose');
      return;
    }

    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Brand Basics</h2>
      <p className="text-gray-400 mb-8">
        Let's start with your brand identity. This helps create a cohesive website.
      </p>

      <div className="space-y-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Company Name {!hasPlanAttached && <span className="text-red-400">*</span>}
            {hasPlanAttached && <span className="text-gray-500">(Optional in plan mode)</span>}
          </label>

          {hasPlanAttached && (
            <button
              type="button"
              onClick={() => updateData({ companyName: data.companyName === 'ai_choose' ? '' : 'ai_choose' })}
              className={`w-full mb-3 p-4 rounded-lg border-2 transition-all ${
                data.companyName === 'ai_choose'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-white/5 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-white">AI Choose</div>
                  <div className="text-sm text-gray-400">Let AI extract company name from your business plan</div>
                </div>
              </div>
            </button>
          )}

          {data.companyName !== 'ai_choose' && (
            <input
              type="text"
              value={data.companyName === 'ai_choose' ? '' : (data.companyName || '')}
              onChange={(e) => updateData({ companyName: e.target.value })}
              placeholder="e.g., Acme Inc"
              className="w-full px-4 py-3 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              maxLength={100}
            />
          )}
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Tagline <span className="text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={data.tagline || ''}
            onChange={(e) => updateData({ tagline: e.target.value })}
            placeholder="e.g., Innovation at its finest"
            className="w-full px-4 py-3 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            maxLength={150}
          />
        </div>

        {/* Brand Voice */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Brand Voice <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BRAND_VOICES.map((voice) => (
              <button
                key={voice.value}
                type="button"
                onClick={() => updateData({ brandVoice: voice.value })}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${
                    data.brandVoice === voice.value
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-700 bg-white/5 hover:border-gray-600'
                  }
                `}
              >
                <div className="font-semibold text-white mb-1">{voice.label}</div>
                <div className="text-sm text-gray-400">{voice.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Logo <span className="text-gray-500">(Optional)</span>
          </label>

          {logoPreview ? (
            // Logo Preview
            <div className="relative inline-block">
              <div className="w-48 h-48 rounded-lg border-2 border-gray-700 bg-white/10 p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                aria-label="Remove logo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // Upload Button
            <label className="cursor-pointer">
              <div className="w-48 h-48 rounded-lg border-2 border-dashed border-gray-700 bg-white/5 hover:bg-white/10 hover:border-gray-600 transition-all flex flex-col items-center justify-center">
                {isUploadingLogo ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3" />
                    <p className="text-sm text-gray-400">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-300 mb-1">Click to upload</p>
                    <p className="text-xs text-gray-500">PNG, JPG, SVG up to 5MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={isUploadingLogo}
              />
            </label>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-8 pt-6 border-t border-gray-700">
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
