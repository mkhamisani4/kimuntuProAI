'use client';

/**
 * LoadingSkeleton Component
 * Animated skeleton loader for AI assistant results
 * Displays 4-6 placeholder blocks with gradient animation
 */

interface LoadingSkeletonProps {
  sections?: number;
}

export default function LoadingSkeleton({ sections = 5 }: LoadingSkeletonProps) {
  return (
    <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6" data-testid="loading-skeleton">
      {/* Header Skeleton */}
      <div className="mb-6 pb-6 border-b border-gray-700">
        <div className="h-6 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-1/4 mb-4 animate-pulse"></div>
        <div className="flex gap-4 text-sm">
          <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-28 animate-pulse"></div>
        </div>
      </div>

      {/* Section Skeletons */}
      <div className="space-y-6">
        {Array.from({ length: sections }).map((_, index) => (
          <div key={index} className="pb-6 border-b border-gray-800 last:border-b-0">
            {/* Section Title */}
            <div className="h-5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>

            {/* Section Content Lines */}
            <div className="space-y-3">
              <div className="h-3 bg-gray-700 rounded w-full animate-pulse" style={{ animationDelay: `${index * 100}ms` }}></div>
              <div className="h-3 bg-gray-700 rounded w-11/12 animate-pulse" style={{ animationDelay: `${index * 100 + 50}ms` }}></div>
              <div className="h-3 bg-gray-700 rounded w-10/12 animate-pulse" style={{ animationDelay: `${index * 100 + 100}ms` }}></div>
              <div className="h-3 bg-gray-700 rounded w-9/12 animate-pulse" style={{ animationDelay: `${index * 100 + 150}ms` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Skeleton (Copy button area) */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="h-8 bg-gray-700 rounded w-32 animate-pulse"></div>
      </div>

      {/* Pulsing Indicator */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
          <svg className="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Generating your response...</span>
        </div>
      </div>
    </div>
  );
}
