'use client';

/**
 * TemplateSelector Component
 * Browse and select logo templates by category
 * Phase 3: Feature 3 - Templates
 */

import { useState } from 'react';
import { X, Check, FileText, Circle, Box, Layers } from 'lucide-react';
import type { LogoSpec } from '@kimuntupro/shared';
import { LOGO_TEMPLATES, TEMPLATE_CATEGORIES, type LogoTemplate } from '../templates/templates';
import LogoCanvas from './LogoCanvas';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: LogoTemplate) => void;
}

type Category = 'wordmark' | 'lettermark' | 'icon' | 'combination';

const CATEGORY_ICONS = {
  wordmark: FileText,
  lettermark: Circle,
  icon: Box,
  combination: Layers,
};

export default function TemplateSelector({
  isOpen,
  onClose,
  onSelect,
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('wordmark');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTemplates = TEMPLATE_CATEGORIES[selectedCategory].templates;
  const selectedTemplate = selectedTemplateId
    ? LOGO_TEMPLATES.find((t) => t.id === selectedTemplateId)
    : null;

  const handleSelect = () => {
    if (!selectedTemplate) return;
    onSelect(selectedTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Choose a Template</h2>
            <p className="text-gray-400 text-sm mt-1">
              Select a pre-designed template to customize
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-800/50">
          {(Object.keys(TEMPLATE_CATEGORIES) as Category[]).map((category) => {
            const Icon = CATEGORY_ICONS[category];
            const categoryData = TEMPLATE_CATEGORIES[category];
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedTemplateId(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                  selectedCategory === category
                    ? 'text-white bg-gray-900 border-b-2 border-emerald-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {categoryData.name}
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                  {categoryData.templates.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Category Description */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-gray-300">
              <strong className="text-blue-400">
                {TEMPLATE_CATEGORIES[selectedCategory].name}:
              </strong>{' '}
              {TEMPLATE_CATEGORIES[selectedCategory].description}
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`relative group rounded-lg overflow-hidden transition-all ${
                  selectedTemplateId === template.id
                    ? 'ring-4 ring-emerald-500 shadow-lg shadow-emerald-500/50'
                    : 'ring-2 ring-gray-700 hover:ring-gray-600'
                }`}
              >
                {/* Template Preview */}
                <div className="p-8 aspect-square">
                  <LogoCanvas spec={template.spec} className="w-full h-full" />
                </div>

                {/* Selected Indicator */}
                {selectedTemplateId === template.id && (
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white rounded-full p-2 shadow-lg">
                    <Check className="w-5 h-5" />
                  </div>
                )}

                {/* Template Info Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-white">
                    <p className="font-semibold text-lg">{template.name}</p>
                    <p className="text-xs text-gray-300 mt-1">{template.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Template Details */}
          {selectedTemplate && (
            <div className="mt-6 bg-white/5 backdrop-blur border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                {selectedTemplate.name}
              </h3>
              <p className="text-gray-400 text-sm mb-3">{selectedTemplate.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-gray-400">
                    {selectedTemplate.spec.shapes.length} shape
                    {selectedTemplate.spec.shapes.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-400">
                    {selectedTemplate.spec.texts.length} text element
                    {selectedTemplate.spec.texts.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSelect}
            disabled={!selectedTemplateId}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            <Check className="w-5 h-5" />
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
}
