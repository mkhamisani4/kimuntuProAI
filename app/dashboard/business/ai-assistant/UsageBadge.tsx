'use client';

/**
 * UsageBadge Component
 * Displays usage quota information
 */

export default function UsageBadge() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
        Per-Request Limits
      </div>
      <div className="flex gap-4 text-sm font-medium text-gray-700">
        <div>
          <span className="text-green-600">$0.50</span> max cost
        </div>
        <div className="border-l border-gray-300 pl-4">
          <span className="text-blue-600">16K</span> max tokens
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-400">
        Daily: 100K tokens/user · 2M tokens/tenant
      </div>
    </div>
  );
}
