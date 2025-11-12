'use client';

/**
 * ResultViewer Component
 * Displays assistant response sections and metadata
 */

import type { AssistantResult } from './page';
import SourceList from './SourceList';

interface ResultViewerProps {
  result: AssistantResult;
}

export default function ResultViewer({ result }: ResultViewerProps) {
  // Extract sections (excluding Sources if it exists as a section key)
  const sectionEntries = Object.entries(result.sections).filter(
    ([key]) => key.toLowerCase() !== 'sources'
  );

  // Format cost
  const costDollars = (result.meta.costCents / 100).toFixed(4);

  // Format latency
  const latencySeconds = (result.meta.latencyMs / 1000).toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with Metadata */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Results</h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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

      {/* Sections */}
      <div className="p-6 space-y-6">
        {sectionEntries.length === 0 ? (
          <p className="text-gray-500 italic">No sections returned</p>
        ) : (
          sectionEntries.map(([title, content]) => (
            <div key={title} className="pb-6 border-b border-gray-100 last:border-b-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {content}
              </div>
            </div>
          ))
        )}

        {/* Sources Section */}
        {result.sources && result.sources.length > 0 && (
          <div className="pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sources</h3>
            <SourceList sources={result.sources} />
          </div>
        )}
      </div>

      {/* Copy Button (nice-to-have) */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => {
            const text = sectionEntries.map(([title, content]) => `## ${title}\n\n${content}`).join('\n\n');
            navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
          }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          📋 Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
