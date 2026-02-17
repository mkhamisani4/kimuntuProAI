'use client';

import { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionRoute?: string;
  secondaryLabel?: string;
  secondaryRoute?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionRoute,
  secondaryLabel,
  secondaryRoute
}: EmptyStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        {description}
      </p>

      {/* Actions */}
      {actionLabel && actionRoute && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push(actionRoute)}
            className="px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
          >
            {actionLabel}
          </button>
          {secondaryLabel && secondaryRoute && (
            <button
              onClick={() => router.push(secondaryRoute)}
              className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
