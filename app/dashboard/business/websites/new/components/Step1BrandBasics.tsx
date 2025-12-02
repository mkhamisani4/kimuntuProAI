'use client';

/**
 * Step 1: Brand Basics
 * Collects company name, tagline, brand voice, and logo
 */

import { useState, useEffect } from 'react';
import { ChevronRight, Upload, X, Image as ImageIcon, Sparkles, Palette } from 'lucide-react';
import { toast } from '@/components/ai/Toast';
import type { WizardInput } from '@kimuntupro/shared';
import { getPrimaryLogo } from '@kimuntupro/db';
import { auth } from '@/lib/firebase';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logoUrl || null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [hasPrimaryLogo, setHasPrimaryLogo] = useState(false);
  const [isLoadingPrimaryLogo, setIsLoadingPrimaryLogo] = useState(false);

  // Check if user has a primary logo
  useEffect(() => {
    async function checkPrimaryLogo() {
      const user = auth.currentUser;
      if (!user) {
        console.log('[Step1] No user logged in, cannot check for primary logo');
        return;
      }

      try {
        console.log('[Step1] Checking for primary logo for user:', user.uid);
        const primaryLogo = await getPrimaryLogo('demo-tenant', user.uid);
        console.log('[Step1] Primary logo found:', !!primaryLogo);
        setHasPrimaryLogo(!!primaryLogo);
      } catch (error) {
        console.error('[Step1] Failed to check primary logo:', error);
      }
    }

    checkPrimaryLogo();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous error
    setUploadError(null);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      const errorMsg = 'Invalid file type. Please upload an image (JPEG, PNG, GIF, SVG, WebP)';
      toast.error(errorMsg);
      setUploadError(errorMsg);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = 'File too large. Maximum size is 5MB';
      toast.error(errorMsg);
      setUploadError(errorMsg);
      return;
    }

    setIsUploadingLogo(true);
    setUploadProgress(0);
    const toastId = toast.loading('Uploading logo...');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Create preview with progress tracking
      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      reader.onloadend = () => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        setLogoPreview(reader.result as string);
        updateData({ logoUrl: reader.result as string });
        toast.success('Logo uploaded successfully', { id: toastId });
        setIsUploadingLogo(false);
      };

      reader.onerror = () => {
        clearInterval(progressInterval);
        const errorMsg = 'Failed to read file. Please try again.';
        setUploadError(errorMsg);
        toast.error(errorMsg, { id: toastId });
        setIsUploadingLogo(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to upload logo';
      setUploadError(errorMsg);
      toast.error(errorMsg, { id: toastId });
      console.error('Logo upload error:', error);
      setIsUploadingLogo(false);
      setUploadProgress(0);
    }
  };

  const handleRetryUpload = () => {
    setUploadError(null);
    setUploadProgress(0);
    // Trigger file input click
    document.getElementById('logo-upload-input')?.click();
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    updateData({ logoUrl: null });
    toast.success('Logo removed');
  };

  const handleUseMyLogo = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Please sign in to use your logo');
      return;
    }

    setIsLoadingPrimaryLogo(true);
    const toastId = toast.loading('Loading your logo...');

    try {
      const primaryLogo = await getPrimaryLogo('demo-tenant', user.uid);

      if (!primaryLogo) {
        toast.error('No primary logo found. Create one in Logo Studio first!', { id: toastId });
        return;
      }

      // Convert LogoSpec to SVG string
      const { logoSpecToSVGString } = await import('../../../logo-studio/utils/svgRenderer');
      const svgString = logoSpecToSVGString(primaryLogo.currentSpec);

      // Convert SVG to data URL
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create an image to convert to PNG data URL
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          toast.error('Failed to process logo', { id: toastId });
          return;
        }

        ctx.drawImage(img, 0, 0, 500, 500);
        const dataURL = canvas.toDataURL('image/png');

        URL.revokeObjectURL(svgUrl);

        setLogoPreview(dataURL);
        updateData({ logoUrl: dataURL });
        toast.success('Logo loaded successfully!', { id: toastId });
        setIsLoadingPrimaryLogo(false);
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        toast.error('Failed to load logo', { id: toastId });
        setIsLoadingPrimaryLogo(false);
      };

      img.src = svgUrl;
    } catch (error: any) {
      console.error('[Step1] Failed to load primary logo:', error);
      toast.error(error.message || 'Failed to load logo', { id: toastId });
      setIsLoadingPrimaryLogo(false);
    }
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
                  <div className="font-semibold text-white">Generate with AI</div>
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

          {hasPlanAttached && (
            <button
              type="button"
              onClick={() => updateData({ tagline: data.tagline === 'ai_fill' ? '' : 'ai_fill' })}
              className={`w-full mb-3 p-4 rounded-lg border-2 transition-all ${
                data.tagline === 'ai_fill'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-white/5 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-white">Generate with AI</div>
                  <div className="text-sm text-gray-400">Let AI create a tagline based on your business plan</div>
                </div>
              </div>
            </button>
          )}

          {data.tagline !== 'ai_fill' && (
            <input
              type="text"
              value={data.tagline === 'ai_fill' ? '' : (data.tagline || '')}
              onChange={(e) => updateData({ tagline: e.target.value })}
              placeholder="e.g., Innovation at its finest"
              className="w-full px-4 py-3 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              maxLength={150}
            />
          )}
        </div>

        {/* Brand Voice */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Brand Voice <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hasPlanAttached && (
              <button
                type="button"
                onClick={() => updateData({ brandVoice: data.brandVoice === 'ai_choose' ? undefined : 'ai_choose' })}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${
                    data.brandVoice === 'ai_choose'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-white/5 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <div className="font-semibold text-white">Let AI Choose</div>
                </div>
                <div className="text-sm text-gray-400">AI selects voice from your business plan</div>
              </button>
            )}
            {BRAND_VOICES.map((voice) => {
              const isAIMode = data.brandVoice === 'ai_choose';
              return (
                <button
                  key={voice.value}
                  type="button"
                  onClick={() => updateData({ brandVoice: voice.value })}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      isAIMode
                        ? 'border-gray-700 bg-gray-800/50 opacity-50 hover:opacity-75 cursor-pointer'
                        : data.brandVoice === voice.value
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-gray-700 bg-white/5 hover:border-gray-600'
                    }
                  `}
                >
                  <div className="font-semibold text-white mb-1">{voice.label}</div>
                  <div className="text-sm text-gray-400">{voice.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-200">
              Logo <span className="text-gray-500">(Optional)</span>
            </label>
            {hasPrimaryLogo && (
              <button
                type="button"
                onClick={handleUseMyLogo}
                disabled={isLoadingPrimaryLogo}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
              >
                {isLoadingPrimaryLogo ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Palette className="w-4 h-4" />
                    {logoPreview ? 'Replace with My Logo' : 'Use My Logo'}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Help text for users without primary logo */}
          {!hasPrimaryLogo && (
            <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300 mb-1">
                Don't have a logo yet? Create one in{' '}
                <a
                  href="/dashboard/business/logo-studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-200 font-semibold"
                >
                  Logo Studio
                </a>
                !
              </p>
              <p className="text-xs text-gray-400">
                Set your created logo as primary and it will appear here automatically.
              </p>
            </div>
          )}

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
            <div>
              <label className="cursor-pointer">
                <div className="w-48 h-48 rounded-lg border-2 border-dashed border-gray-700 bg-white/5 hover:bg-white/10 hover:border-gray-600 transition-all flex flex-col items-center justify-center">
                  {isUploadingLogo ? (
                    <div className="flex flex-col items-center w-full px-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3" />
                      <p className="text-sm text-gray-400 mb-2">Uploading...</p>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
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
                  id="logo-upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isUploadingLogo}
                />
              </label>
              {/* Error Message with Retry */}
              {uploadError && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 mb-2">{uploadError}</p>
                  <button
                    type="button"
                    onClick={handleRetryUpload}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
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
