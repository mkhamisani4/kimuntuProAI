'use client';

/**
 * Step 5: Contact & Social
 * Collects contact information and social media links
 */

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Mail, Phone, MapPin, Instagram, Linkedin, Twitter, Facebook, AlertCircle } from 'lucide-react';
import type { WizardInput } from '@kimuntupro/shared';

interface Step5Props {
  hasPlanAttached?: boolean;
  data: WizardInput;
  updateData: (updates: Partial<WizardInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Validation helpers
const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function Step5ContactSocial({ data, updateData, onNext, onBack, hasPlanAttached = false }: Step5Props) {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [urlErrors, setUrlErrors] = useState<Record<string, string | null>>({});

  const updateSocialLink = (platform: keyof NonNullable<WizardInput['socialLinks']>, value: string) => {
    // Validate URL
    if (value && !isValidUrl(value)) {
      setUrlErrors((prev) => ({ ...prev, [platform]: 'Please enter a valid URL (e.g., https://...)' }));
    } else {
      setUrlErrors((prev) => ({ ...prev, [platform]: null }));
    }

    updateData({
      socialLinks: {
        ...data.socialLinks,
        [platform]: value || undefined,
      },
    });
  };

  const handleEmailChange = (value: string) => {
    if (value && !isValidEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
    updateData({ contactEmail: value });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Contact & Social</h2>
      <p className="text-gray-400 mb-8">
        Add your contact information and social media links so visitors can connect with you.
      </p>

      <div className="space-y-8">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-200">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email <span className="text-gray-500">(Optional)</span>
                </label>
                {hasPlanAttached && (
                  <label className="flex items-center gap-2 text-sm text-purple-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.contactEmail === 'ai_fill'}
                      onChange={(e) => updateData({ contactEmail: e.target.checked ? 'ai_fill' : '' })}
                      className="w-4 h-4 rounded border-gray-600 bg-white/10 text-purple-500 focus:ring-purple-500"
                    />
                    Auto-fill from plan
                  </label>
                )}
              </div>
              {data.contactEmail !== 'ai_fill' ? (
                <>
                  <input
                    type="email"
                    value={data.contactEmail === 'ai_fill' ? '' : (data.contactEmail || '')}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="e.g., hello@yourcompany.com"
                    className={`w-full px-4 py-3 border ${
                      emailError ? 'border-red-500' : 'border-gray-600'
                    } bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  />
                  {emailError && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {emailError}
                    </div>
                  )}
                </>
              ) : (
                <div className="px-4 py-3 border border-purple-500/50 bg-purple-500/10 text-purple-300 rounded-lg text-sm">
                  ✨ AI will generate this content from your business plan
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-200">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Phone <span className="text-gray-500">(Optional)</span>
                </label>
                {hasPlanAttached && (
                  <label className="flex items-center gap-2 text-sm text-purple-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.contactPhone === 'ai_fill'}
                      onChange={(e) => updateData({ contactPhone: e.target.checked ? 'ai_fill' : '' })}
                      className="w-4 h-4 rounded border-gray-600 bg-white/10 text-purple-500 focus:ring-purple-500"
                    />
                    Auto-fill from plan
                  </label>
                )}
              </div>
              {data.contactPhone !== 'ai_fill' ? (
                <input
                  type="tel"
                  value={data.contactPhone === 'ai_fill' ? '' : (data.contactPhone || '')}
                  onChange={(e) => updateData({ contactPhone: e.target.value })}
                  placeholder="e.g., (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              ) : (
                <div className="px-4 py-3 border border-purple-500/50 bg-purple-500/10 text-purple-300 rounded-lg text-sm">
                  ✨ AI will generate this content from your business plan
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-200">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Location <span className="text-gray-500">(Optional)</span>
                </label>
                {hasPlanAttached && (
                  <label className="flex items-center gap-2 text-sm text-purple-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.location === 'ai_fill'}
                      onChange={(e) => updateData({ location: e.target.checked ? 'ai_fill' : '' })}
                      className="w-4 h-4 rounded border-gray-600 bg-white/10 text-purple-500 focus:ring-purple-500"
                    />
                    Auto-fill from plan
                  </label>
                )}
              </div>
              {data.location !== 'ai_fill' ? (
                <input
                  type="text"
                  value={data.location === 'ai_fill' ? '' : (data.location || '')}
                  onChange={(e) => updateData({ location: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-4 py-3 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              ) : (
                <div className="px-4 py-3 border border-purple-500/50 bg-purple-500/10 text-purple-300 rounded-lg text-sm">
                  ✨ AI will generate this content from your business plan
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Social Media</h3>
          <p className="text-sm text-gray-400 mb-4">
            Add links to your social media profiles (all optional)
          </p>
          <div className="space-y-4">
            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <Instagram className="inline w-4 h-4 mr-2" />
                Instagram
              </label>
              <input
                type="url"
                value={data.socialLinks?.instagram || ''}
                onChange={(e) => updateSocialLink('instagram', e.target.value)}
                placeholder="https://instagram.com/yourcompany"
                className={`w-full px-4 py-3 border ${
                  urlErrors.instagram ? 'border-red-500' : 'border-gray-600'
                } bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              {urlErrors.instagram && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {urlErrors.instagram}
                </div>
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <Linkedin className="inline w-4 h-4 mr-2" />
                LinkedIn
              </label>
              <input
                type="url"
                value={data.socialLinks?.linkedin || ''}
                onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
                className={`w-full px-4 py-3 border ${
                  urlErrors.linkedin ? 'border-red-500' : 'border-gray-600'
                } bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              {urlErrors.linkedin && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {urlErrors.linkedin}
                </div>
              )}
            </div>

            {/* Twitter */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <Twitter className="inline w-4 h-4 mr-2" />
                Twitter / X
              </label>
              <input
                type="url"
                value={data.socialLinks?.twitter || ''}
                onChange={(e) => updateSocialLink('twitter', e.target.value)}
                placeholder="https://twitter.com/yourcompany"
                className={`w-full px-4 py-3 border ${
                  urlErrors.twitter ? 'border-red-500' : 'border-gray-600'
                } bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              {urlErrors.twitter && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {urlErrors.twitter}
                </div>
              )}
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <Facebook className="inline w-4 h-4 mr-2" />
                Facebook
              </label>
              <input
                type="url"
                value={data.socialLinks?.facebook || ''}
                onChange={(e) => updateSocialLink('facebook', e.target.value)}
                placeholder="https://facebook.com/yourcompany"
                className={`w-full px-4 py-3 border ${
                  urlErrors.facebook ? 'border-red-500' : 'border-gray-600'
                } bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              {urlErrors.facebook && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {urlErrors.facebook}
                </div>
              )}
            </div>
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
