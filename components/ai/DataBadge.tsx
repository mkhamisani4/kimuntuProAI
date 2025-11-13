'use client';

/**
 * DataBadge Component (Phase 4)
 * Shows data freshness indicator: 📚 Knowledge Base or 🌐 Live Data
 * Uses date-fns for relative time formatting
 */

import { formatDistanceToNow } from 'date-fns';

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
        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium"
        data-testid="data-badge-live"
      >
        🌐 Live Data · {relativeTime}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium"
      data-testid="data-badge-knowledge"
    >
      📚 Knowledge Base
    </span>
  );
}
