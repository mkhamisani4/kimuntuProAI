'use client';

/**
 * SourceList Component
 * Displays grouped RAG and web sources with links
 */

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
    return <p className="text-sm text-gray-500 italic">No sources available</p>;
  }

  return (
    <div className="space-y-6">
      {/* RAG Sources */}
      {uniqueRagSources.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            📄 Internal Documents ({uniqueRagSources.length})
          </h4>
          <div className="space-y-3">
            {uniqueRagSources.map((source, idx) => (
              <div
                key={idx}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                {source.title && (
                  <div className="font-medium text-blue-900 mb-1">{source.title}</div>
                )}
                {source.snippet && (
                  <div className="text-sm text-blue-800">{source.snippet}</div>
                )}
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 block"
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
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            🌐 Web Sources ({uniqueWebSources.length})
          </h4>
          <div className="space-y-3">
            {uniqueWebSources.map((source, idx) => (
              <div
                key={idx}
                className="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                {source.title && (
                  <div className="font-medium text-green-900 mb-1">{source.title}</div>
                )}
                {source.snippet && (
                  <div className="text-sm text-green-800 mb-2">{source.snippet}</div>
                )}
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:underline inline-flex items-center"
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
