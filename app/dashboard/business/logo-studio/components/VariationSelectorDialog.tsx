'use client';

/**
 * VariationSelectorDialog Component
 * Shows all generated logo variations and allows user to select one
 */

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { LogoSpec } from '@kimuntupro/shared';
import LogoCanvas from './LogoCanvas';

interface VariationSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variations: LogoSpec[];
  onSelect: (variation: LogoSpec) => void;
}

export default function VariationSelectorDialog({
  isOpen,
  onClose,
  variations,
  onSelect,
}: VariationSelectorDialogProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!isOpen || variations.length === 0) return null;

  const handleSelect = () => {
    onSelect(variations[selectedIndex]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Choose a Variation</h2>
            <p className="text-gray-400 text-sm mt-1">
              Select which variation you'd like to use
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Variations Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {variations.map((variation, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative group rounded-lg overflow-hidden transition-all ${
                  selectedIndex === index
                    ? 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/50'
                    : 'ring-2 ring-gray-700 hover:ring-gray-600'
                }`}
              >
                {/* Variation Preview */}
                <div className="bg-white p-8 aspect-square">
                  <LogoCanvas spec={variation} className="w-full h-full" />
                </div>

                {/* Selected Indicator */}
                {selectedIndex === index && (
                  <div className="absolute top-3 right-3 bg-purple-600 text-white rounded-full p-2 shadow-lg">
                    <Check className="w-5 h-5" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-white">
                    <p className="font-semibold">Variation {index + 1}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {variation.metadata.conceptName}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Variation Details */}
          <div className="bg-white/5 backdrop-blur border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Variation {selectedIndex + 1}: {variations[selectedIndex].metadata.conceptName}
            </h3>
            <p className="text-gray-400 text-sm">
              {variations[selectedIndex].metadata.description}
            </p>
          </div>
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
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Check className="w-5 h-5" />
            Use This Variation
          </button>
        </div>
      </div>
    </div>
  );
}
