'use client';

import { useRouter } from 'next/navigation';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'teal';
  disabled?: boolean;
  badge?: string;
}

export default function ToolCard({
  icon: Icon,
  title,
  description,
  route,
  color = 'blue',
  disabled = false,
  badge
}: ToolCardProps) {
  const router = useRouter();

  const getColorClasses = () => {
    switch (color) {
      case 'purple':
        return 'text-purple-600 bg-purple-50 group-hover:bg-purple-100';
      case 'green':
        return 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100';
      case 'orange':
        return 'text-orange-600 bg-orange-50 group-hover:bg-orange-100';
      case 'teal':
        return 'text-teal-600 bg-teal-50 group-hover:bg-teal-100';
      default:
        return 'text-blue-600 bg-blue-50 group-hover:bg-blue-100';
    }
  };

  return (
    <button
      onClick={() => !disabled && router.push(route)}
      disabled={disabled}
      className={`w-full p-3 sm:p-4 rounded-xl border border-gray-200 bg-white text-left transition-all group relative overflow-hidden shadow-sm ${disabled
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'
        }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Icon */}
        <div className={`p-2.5 sm:p-3 rounded-lg transition-colors shrink-0 ${getColorClasses()}`}>
          <Icon size={20} className="sm:w-6 sm:h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm sm:text-base leading-tight text-gray-900 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            {badge && (
              <span className="hidden sm:inline-flex text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium whitespace-nowrap">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 sm:line-clamp-2">
            {description}
          </p>
        </div>

        {/* Arrow */}
        {!disabled && (
          <div className="text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1 transition-all shrink-0">
            <ArrowRight size={18} className="sm:w-5 sm:h-5" />
          </div>
        )}
      </div>
    </button>
  );
}
