'use client';

/**
 * LegalTaskForm Component
 * Input form for legal AI agent with document upload, case description, and prompt
 * Supports #187 (document + text intake), #57 (jurisdiction selection)
 */

import { useState, useEffect, useRef } from 'react';
import { Upload, X, FileText, ChevronDown } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { fetchAuthed } from '@/lib/api/fetchAuthed';
import { toast } from '@/components/ai/Toast';
import type { LegalResult } from './page';

interface LegalTaskFormProps {
  onResult: (result: LegalResult) => void;
  onError: (error: { type: 'quota' | 'auth' | 'server'; message: string; resetsAt?: string }) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

const JURISDICTIONS = [
  { value: '', label: 'Select jurisdiction (optional)' },
  { value: 'US-Federal', label: 'United States - Federal' },
  { value: 'US-State', label: 'United States - State' },
  { value: 'Canada-Federal', label: 'Canada - Federal' },
  { value: 'Canada-Provincial', label: 'Canada - Provincial' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'EU', label: 'European Union' },
  { value: 'International', label: 'International' },
  { value: 'Other', label: 'Other' },
];

const CASE_TYPES = [
  { value: '', label: 'Select case type (optional)' },
  { value: 'contract', label: 'Contract Dispute' },
  { value: 'employment', label: 'Employment / Labor' },
  { value: 'personal_injury', label: 'Personal Injury' },
  { value: 'family', label: 'Family Law' },
  { value: 'criminal', label: 'Criminal Defense' },
  { value: 'real_estate', label: 'Real Estate / Property' },
  { value: 'intellectual_property', label: 'Intellectual Property' },
  { value: 'business', label: 'Business / Corporate' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'consumer', label: 'Consumer Protection' },
  { value: 'other', label: 'Other' },
];

const MAX_INPUT_LENGTH = 5000;
const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;

export default function LegalTaskForm({ onResult, onError, onLoadingChange }: LegalTaskFormProps) {
  const [input, setInput] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [caseType, setCaseType] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);

    for (const file of newFiles) {
      if (!file.name.match(/\.(pdf|txt|md)$/i)) {
        toast.error(`${file.name}: Only PDF, TXT, and MD files are supported`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name}: File exceeds ${MAX_FILE_SIZE_MB}MB limit`);
        return;
      }
    }

    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    setFiles((prev) => [...prev, ...newFiles]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error('Please describe your legal situation or enter a prompt');
      return;
    }

    if (input.length > MAX_INPUT_LENGTH) {
      toast.error(`Description is too long. Maximum ${MAX_INPUT_LENGTH} characters`);
      return;
    }

    if (!currentUserId) {
      toast.error('Please sign in to use the Legal AI Agent');
      onError({ type: 'auth', message: 'Please sign in to use the Legal AI Agent' });
      return;
    }

    setIsLoading(true);
    onLoadingChange?.(true);

    const toastId = toast.loading('Analyzing your legal situation...');

    try {
      const formData = new FormData();
      formData.append('input', input.trim());
      formData.append('tenantId', currentUserId);
      formData.append('userId', currentUserId);

      if (jurisdiction) formData.append('jurisdiction', jurisdiction);
      if (caseType) formData.append('caseType', caseType);

      for (const file of files) {
        formData.append('files', file);
      }

      const response = await fetchAuthed('/api/ai/legal', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          onError({ type: 'quota', message: data.message || 'Quota exceeded', resetsAt: data.resetsAt });
        } else if (response.status === 401 || response.status === 403) {
          onError({ type: 'auth', message: data.message || 'Authentication required' });
        } else {
          onError({ type: 'server', message: data.message || 'Failed to generate analysis' });
        }
        toast.error('Failed to generate analysis', { id: toastId });
        return;
      }

      toast.success('Legal analysis complete', { id: toastId });
      onResult({
        sections: data.sections,
        sources: data.sources || [],
        meta: data.meta,
      });
    } catch (error: any) {
      toast.error('Failed to generate analysis', { id: toastId });
      onError({ type: 'server', message: error.message || 'Network error' });
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-1">
            Legal AI Agent
          </h3>
          <p className="text-sm text-gray-400">
            Upload documents and describe your legal situation for AI-powered analysis, outcome prediction, and action planning
          </p>
        </div>

        {/* Document Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Upload Documents (Optional)
          </label>
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-300">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, TXT, MD files (max {MAX_FILE_SIZE_MB}MB each, up to {MAX_FILES} files)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            multiple
            onChange={handleFileAdd}
            className="hidden"
            disabled={isLoading}
          />

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between bg-white/5 border border-gray-700 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <span className="text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Jurisdiction & Case Type */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Jurisdiction
            </label>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              disabled={isLoading}
            >
              {JURISDICTIONS.map((j) => (
                <option key={j.value} value={j.value}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Case Type
            </label>
            <select
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              disabled={isLoading}
            >
              {CASE_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Case Description / Prompt */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Describe Your Legal Situation
          </label>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: I signed a 2-year employment contract with a non-compete clause. My employer terminated me without cause after 6 months. The non-compete restricts me from working in my field for 18 months within a 50-mile radius. I want to know if the non-compete is enforceable and what my options are."
              rows={8}
              maxLength={MAX_INPUT_LENGTH}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                input.length > MAX_INPUT_LENGTH
                  ? 'border-red-500 focus:ring-red-500 bg-white/10 text-gray-100'
                  : 'border-gray-600 bg-white/10 text-gray-100 focus:ring-emerald-500'
              }`}
              disabled={isLoading}
              aria-label="Legal situation description"
            />
            <div
              className={`absolute bottom-2 right-2 text-xs ${
                input.length > MAX_INPUT_LENGTH
                  ? 'text-red-600 font-semibold'
                  : input.length > MAX_INPUT_LENGTH * 0.9
                  ? 'text-amber-600'
                  : 'text-gray-500'
              }`}
            >
              {input.length}/{MAX_INPUT_LENGTH}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !input.trim() || input.length > MAX_INPUT_LENGTH}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            isLoading || !input.trim() || input.length > MAX_INPUT_LENGTH
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
          aria-label="Analyze Legal Situation"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze Legal Situation'
          )}
        </button>

        {/* Disclaimer */}
        <p className="mt-3 text-xs text-gray-500 text-center">
          This tool provides AI-generated analysis for informational purposes only and does not constitute legal advice.
          Always consult a licensed attorney for professional legal counsel.
        </p>
      </form>
    </div>
  );
}
