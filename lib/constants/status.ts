/**
 * Centralized status label + styling maps for websites and logos.
 * The dashboard's <StatusBadge> component has its own light-theme variant;
 * these constants serve the dark-theme preview/detail pages that use custom styles.
 */

export type WebsiteStatus = 'ready' | 'generating' | 'failed' | 'draft';
export type LogoStatus = 'ready' | 'generating' | 'failed' | 'draft';

export type StatusPresentation = {
  label: string;
  /** Tailwind classes for a dark-theme pill background + border + text color. */
  pillClass: string;
};

export const WEBSITE_STATUS: Record<WebsiteStatus, StatusPresentation> = {
  ready: {
    label: 'Ready',
    pillClass: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
  },
  generating: {
    label: 'Generating...',
    pillClass: 'bg-blue-500/10 border border-blue-500/30 text-blue-400',
  },
  failed: {
    label: 'Failed',
    pillClass: 'bg-red-500/10 border border-red-500/30 text-red-400',
  },
  draft: {
    label: 'Draft',
    pillClass: 'bg-gray-500/10 border border-gray-500/30 text-gray-400',
  },
};

export const LOGO_STATUS: Record<LogoStatus, StatusPresentation> = {
  ready: {
    label: 'Ready',
    pillClass: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
  },
  generating: {
    label: 'Generating...',
    pillClass: 'bg-blue-500/10 border border-blue-500/30 text-blue-400',
  },
  failed: {
    label: 'Failed',
    pillClass: 'bg-red-500/10 border border-red-500/30 text-red-400',
  },
  draft: {
    label: 'Draft',
    pillClass: 'bg-gray-500/10 border border-gray-500/30 text-gray-400',
  },
};
