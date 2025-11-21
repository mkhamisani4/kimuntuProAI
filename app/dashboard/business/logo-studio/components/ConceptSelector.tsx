/**
 * ConceptSelector Component
 * Displays logo concepts as thumbnails with selection
 */

import { Check } from 'lucide-react';
import type { LogoSpec } from '@kimuntupro/shared';
import LogoCanvas from './LogoCanvas';

interface ConceptSelectorProps {
  concepts: LogoSpec[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function ConceptSelector({
  concepts,
  selectedIndex,
  onSelect,
}: ConceptSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {concepts.map((concept, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`
            relative bg-white/5 border-2 rounded-lg overflow-hidden transition-all hover:scale-105
            ${
              selectedIndex === index
                ? 'border-emerald-500 ring-4 ring-emerald-500/30'
                : 'border-gray-700 hover:border-gray-600'
            }
          `}
        >
          {/* Selection Indicator */}
          {selectedIndex === index && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center z-10">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Logo Preview */}
          <div className="aspect-square bg-white p-4">
            <LogoCanvas spec={concept} className="w-full h-full" />
          </div>

          {/* Concept Info */}
          <div className="p-3 bg-gray-800/50 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-white mb-1">
              {concept.metadata.conceptName}
            </h4>
            <p className="text-xs text-gray-400 line-clamp-2">
              {concept.metadata.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
