'use client';

/**
 * CompanyNameDialog Component
 * Modal dialog for entering company name when customizing templates
 */

import { useState } from 'react';
import { X, Building2, Sparkles } from 'lucide-react';

interface CompanyNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (companyName: string) => void;
  templateName: string;
}

export default function CompanyNameDialog({
  isOpen,
  onClose,
  onSubmit,
  templateName,
}: CompanyNameDialogProps) {
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    if (companyName.trim().length < 2) {
      setError('Company name must be at least 2 characters');
      return;
    }

    onSubmit(companyName.trim());
    setCompanyName('');
    setError('');
  };

  const handleClose = () => {
    setCompanyName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Customize Template</h2>
              <p className="text-sm text-gray-400 mt-0.5">{templateName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-1">
                    AI Customization
                  </h3>
                  <p className="text-sm text-gray-300">
                    Our AI will personalize this template with your company name and adjust
                    colors to create a professional logo.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  setError('');
                }}
                placeholder="e.g., Acme Inc., Tech Solutions, Your Brand"
                className={`w-full px-4 py-3 bg-gray-800 border ${
                  error ? 'border-red-500' : 'border-gray-700'
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors`}
                autoFocus
                maxLength={50}
              />
              {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
              <p className="text-xs text-gray-500 mt-2">
                {companyName.length}/50 characters
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!companyName.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Customize Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
