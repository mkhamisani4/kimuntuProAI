'use client';

import { useRouter } from 'next/navigation';
import { LucideIcon, ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
}

export default function FeaturedToolCard({
  icon: Icon,
  title,
  description,
  route
}: FeaturedToolCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(route)}
      className="w-full p-6 rounded-xl border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-left transition-all hover:border-purple-400 hover:bg-purple-500/20 hover:-translate-y-1 cursor-pointer group relative overflow-hidden backdrop-blur"
    >
      {/* Animated Sparkle Icon */}
      <div className="absolute top-3 right-3">
        <Sparkles className="text-purple-400 animate-pulse" size={20} />
      </div>

      {/* Main Content */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
          <Icon size={32} />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white">
              {title}
            </h3>
            <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded-full font-semibold">
              FEATURED
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            {description}
          </p>
          <div className="flex items-center gap-2 text-purple-400 font-semibold">
            <span>Get Started</span>
            <ArrowRight
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
    </button>
  );
}
