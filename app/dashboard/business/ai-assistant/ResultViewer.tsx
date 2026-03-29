'use client';

/**
 * ResultViewer Component
 * Displays assistant response sections and metadata
 * Enhanced with loading skeleton, retry functionality, and animations
 */

import { useState } from 'react';
import { Copy, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AssistantResult } from './page';
import SourceList from './SourceList';
import LoadingSkeleton from '@/components/ai/LoadingSkeleton';
import ExportDropdown from '@/components/ai/ExportDropdown';
import DataBadge from '@/components/ai/DataBadge';
import { toast } from '@/components/ai/Toast';

interface ResultViewerProps {
  result: AssistantResult | null;
  isLoading?: boolean;
  error?: { message: string; type: string } | null;
  onRetry?: () => void;
  assistantType?: string;
  resultId?: string | null;
}

export default function ResultViewer({ result, isLoading, error, onRetry, assistantType = 'streamlined_plan', resultId }: ResultViewerProps) {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  // Debug logging for Turn Into Website button
  console.log('[ResultViewer] Props:', { assistantType, resultId, hasResult: !!result });

  const handleConvertToWebsite = () => {
    if (resultId) {
      router.push(`/dashboard/business/websites/new?planId=${resultId}`);
    } else {
      toast.error('Unable to load business plan. Please save the result first.');
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return <LoadingSkeleton sections={5} />;
  }

  // Show error state with retry
  if (error && !result) {
    return (
      <div className="bg-white/5 backdrop-blur border border-red-500/50 rounded-2xl p-8 text-center">
        <div className="text-red-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">Generation Failed</h3>
          <p className="text-sm text-gray-400">{error.message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            data-testid="retry-button"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // No result yet
  if (!result) {
    return null;
  }

  // Extract sections (excluding Sources if it exists as a section key)
  const sectionEntries = Object.entries(result.sections).filter(
    ([key]) => key.toLowerCase() !== 'sources'
  );

  // Format cost
  const costDollars = (result.meta.costCents / 100).toFixed(4);

  // Format latency
  const latencySeconds = (result.meta.latencyMs / 1000).toFixed(2);

  // Copy to clipboard handler
  const handleCopy = () => {
    const text = sectionEntries.map(([title, content]) => `## ${title}\n\n${content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('✓ Copied to clipboard');
  };

  return (
    <div className="bg-white/5 backdrop-blur border border-gray-700 rounded-2xl shadow-lg">
      {/* Header with Metadata */}
      <div className="p-6 border-b border-gray-700 bg-white/5">
        <h2 className="text-xl font-semibold text-white mb-3">Results</h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
          <div>
            <span className="font-medium">Model:</span> {result.meta.model}
          </div>
          <div>
            <span className="font-medium">Tokens:</span> {result.meta.tokensIn}
          </div>
          <div>
            <span className="font-medium">Cost:</span> ${costDollars}
          </div>
          <div>
            <span className="font-medium">Latency:</span> {latencySeconds}s
          </div>
        </div>
      </div>

      {/* Sections with fade-in animation */}
      <div className="p-6 space-y-6">
        {sectionEntries.length === 0 ? (
          <p className="text-gray-400 italic">No sections returned</p>
        ) : (
          sectionEntries.map(([title, content], index) => (
            <div
              key={title}
              className="pb-6 border-b border-gray-700 last:border-b-0 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
              <div className="prose prose-sm max-w-none text-gray-300 whitespace-pre-wrap">
                {content}
              </div>
            </div>
          ))
        )}

        {/* Sources Section with Data Badge */}
        {result.sources && result.sources.length > 0 && (
          <div className="pt-6 border-t-2 border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Sources</h3>
              <DataBadge
                timestamp={result.meta.timestamp}
                isLive={result.sources.some(s => s.type === 'web')}
              />
            </div>
            <SourceList sources={result.sources} />
          </div>
        )}
      </div>

      {/* Export Actions */}
      <div className="p-4 border-t border-gray-700 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            data-testid="copy-button"
          >
            <Copy className="w-4 h-4" />
            Copy to Clipboard
          </button>

          {/* Turn into Website button (only for business plans) */}
          {assistantType === 'streamlined_plan' && resultId && (
            <button
              onClick={handleConvertToWebsite}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
              data-testid="convert-to-website-button"
            >
              <Globe className="w-4 h-4" />
              Turn into Website
            </button>
          )}
        </div>

        <ExportDropdown
          sections={result.sections}
          metadata={{
            assistantType,
            model: result.meta.model,
            generatedAt: new Date(),
          }}
        />
      </div>
    </div>
  );
}
