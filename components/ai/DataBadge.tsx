'use client';

/**
 * DataBadge Component (Phase 4)
 * Shows data freshness indicator: Knowledge Base or Live Data
 * Uses date-fns for relative time formatting
 */

import { formatDistanceToNow } from 'date-fns';
import { Globe, Book } from 'lucide-react';

export interface DataBadgeProps {
  timestamp?: string;
  isLive: boolean;
}

/**
 * DataBadge displays data source and freshness
 * @param timestamp - ISO timestamp of when data was retrieved
 * @param isLive - True if data is from live web search
 */
export default function DataBadge({ timestamp, isLive }: DataBadgeProps) {
  if (isLive) {
    // Format relative time
    const relativeTime = timestamp
      ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
      : 'just now';

    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-medium border border-emerald-500/30"
        data-testid="data-badge-live"
      >
        <Globe className="w-3 h-3" />
        Live Data · {relativeTime}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full font-medium border border-gray-500/30"
      data-testid="data-badge-knowledge"
    >
      <Book className="w-3 h-3" />
      Knowledge Base
    </span>
  );
}
