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
  /** True if the result includes at least one web-sourced citation. */
  isLive?: boolean;
  /** Preferred name — same meaning as `isLive`. */
  hasWebSources?: boolean;
}

/**
 * DataBadge displays whether the result used knowledge-base sources or live web sources.
 * The "web-sourced" label is static — it reflects what was used at generation time, not real-time data.
 */
export default function DataBadge({ timestamp, isLive, hasWebSources }: DataBadgeProps) {
  const webSourced = hasWebSources ?? isLive ?? false;

  if (webSourced) {
    const relativeTime = timestamp
      ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
      : 'just now';

    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-medium border border-emerald-500/30"
        data-testid="data-badge-live"
      >
        <Globe className="w-3 h-3" />
        Web-sourced · {relativeTime}
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
