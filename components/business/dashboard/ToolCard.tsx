'use client';

import { useRouter } from 'next/navigation';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
  color?: string;
  disabled?: boolean;
  badge?: string;
}

export default function ToolCard({
  icon: Icon,
  title,
  description,
  route,
  color = 'emerald',
  disabled = false,
  badge
}: ToolCardProps) {
  const router = useRouter();

  const colorClasses = {
    emerald: 'text-emerald-400 bg-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    orange: 'text-orange-400 bg-orange-500/20',
    teal: 'text-teal-400 bg-teal-500/20'
  };

  const handleClick = () => {
    if (!disabled) {
      router.push(route);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full p-4 rounded-lg border text-left transition-all
        ${disabled
          ? 'border-gray-800 bg-white/5 opacity-50 cursor-not-allowed'
          : 'border-gray-800 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 cursor-pointer'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.emerald}`}>
          <Icon size={24} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">
              {title}
            </h3>
            {badge && (
              <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Arrow Icon */}
        {!disabled && (
          <ArrowRight
            size={20}
            className="text-gray-600 group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-1"
          />
        )}
      </div>
    </button>
  );
}
