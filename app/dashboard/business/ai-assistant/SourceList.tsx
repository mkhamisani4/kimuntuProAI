'use client';

/**
 * SourceList Component
 * Displays grouped RAG and web sources with links
 */

import { FileText, Globe } from 'lucide-react';

interface Source {
  type: 'rag' | 'web';
  title?: string;
  url?: string;
  snippet?: string;
}

interface SourceListProps {
  sources: Source[];
}

export default function SourceList({ sources }: SourceListProps) {
  // Group sources by type
  const ragSources = sources.filter((s) => s.type === 'rag');
  const webSources = sources.filter((s) => s.type === 'web');

  // Remove duplicates by URL
  const uniqueSources = (sourceList: Source[]) => {
    const seen = new Set<string>();
    return sourceList.filter((source) => {
      const key = source.url || source.title || source.snippet || '';
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const uniqueRagSources = uniqueSources(ragSources);
  const uniqueWebSources = uniqueSources(webSources);

  if (uniqueRagSources.length === 0 && uniqueWebSources.length === 0) {
    return <p className="text-sm text-gray-400 italic">No sources available</p>;
  }

  return (
    <div className="space-y-6">
      {/* RAG Sources */}
      {uniqueRagSources.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Internal Documents ({uniqueRagSources.length})
          </h4>
          <div className="space-y-3">
            {uniqueRagSources.map((source, idx) => (
              <div
                key={idx}
                className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
              >
                {source.title && (
                  <div className="font-medium text-blue-300 mb-1">{source.title}</div>
                )}
                {source.snippet && (
                  <div className="text-sm text-blue-200">{source.snippet}</div>
                )}
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline mt-1 block transition-colors"
                  >
                    View document →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Web Sources */}
      {uniqueWebSources.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wide flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Web Sources ({uniqueWebSources.length})
          </h4>
          <div className="space-y-3">
            {uniqueWebSources.map((source, idx) => (
              <div
                key={idx}
                className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
              >
                {source.title && (
                  <div className="font-medium text-emerald-300 mb-1">{source.title}</div>
                )}
                {source.snippet && (
                  <div className="text-sm text-emerald-200 mb-2">{source.snippet}</div>
                )}
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center transition-colors"
                  >
                    {source.url} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
