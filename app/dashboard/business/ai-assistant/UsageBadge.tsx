'use client';

/**
 * UsageBadge Component
 * Displays usage quota information
 */

export default function UsageBadge() {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/[0.06] sm:w-auto">
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300">
        Per-Request Limits
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-gray-700 dark:text-white">
        <div>
          <span className="text-green-600">$0.50</span> max cost
        </div>
        <div className="border-l border-gray-300 pl-4 dark:border-white/20">
          <span className="text-blue-600">16K</span> max tokens
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-400 dark:text-gray-300">
        Daily: 100K tokens/user · 2M tokens/tenant
      </div>
    </div>
  );
}
