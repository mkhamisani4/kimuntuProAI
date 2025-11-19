'use client';

import { useRouter } from 'next/navigation';
import { Globe, TrendingUp } from 'lucide-react';

interface DashboardHeroProps {
  userName?: string;
}

export default function DashboardHero({ userName }: DashboardHeroProps) {
  const router = useRouter();

  // Get current date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="w-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Greeting */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1 text-white">
            {userName ? `Welcome back, ${userName}` : 'Welcome to Business Track'}
          </h1>
          <p className="text-emerald-300 text-lg mb-1">
            Your AI-Powered Business Command Center
          </p>
          <p className="text-gray-400 text-sm">
            {today}
          </p>
        </div>

        {/* Right Side: CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/dashboard/business/streamlined-plan')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors shadow-lg"
          >
            <TrendingUp size={20} />
            Generate Business Plan
          </button>
          <button
            onClick={() => router.push('/dashboard/business/websites/new')}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors shadow-lg"
          >
            <Globe size={20} />
            Build AI Website
          </button>
        </div>
      </div>
    </div>
  );
}
