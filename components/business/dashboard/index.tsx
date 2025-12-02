'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import DashboardHero from './DashboardHero';
import ToolsPanel from './ToolsPanel';
import RecentWorkPanel from './RecentWorkPanel';
import ActivitySidebar from './ActivitySidebar';

interface BusinessDashboardProps {
  userName?: string;
  tenantId: string;
  userId?: string;
  loading?: boolean;
}

export default function BusinessDashboard({
  userName,
  tenantId,
  userId,
  loading = false
}: BusinessDashboardProps) {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
      : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'
      }`}>
      {/* Hero Section - Full Width */}
      <DashboardHero userName={userName} tenantId={tenantId} userId={userId} />

      {/* Main Dashboard Content - 3 Column Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tools Panel (30% - 4 cols) */}
          <div className="lg:col-span-4">
            <ToolsPanel />
          </div>

          {/* Center Column: Recent Work (45% - 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Work
            </h2>

            {/* Phase 2: Enhanced tabbed interface with filters and actions */}
            {!loading && (
              <RecentWorkPanel tenantId={tenantId} userId={userId} />
            )}

            {/* Loading State */}
            {loading && (
              <div className={`backdrop-blur rounded-lg border p-6 ${isDark
                ? 'bg-white/5 border-gray-700'
                : 'bg-white/60 border-gray-200'
                }`}>
                <div className="space-y-4">
                  <div className={`h-32 rounded-lg animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`} />
                  <div className={`h-32 rounded-lg animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`} />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Activity Sidebar (25% - 3 cols) */}
          <div className="lg:col-span-3">
            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Overview
            </h2>

            {/* Phase 3: Activity sidebar with stats, actions, and tips */}
            {!loading && (
              <ActivitySidebar tenantId={tenantId} userId={userId} />
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                <div className={`backdrop-blur rounded-lg border p-6 ${isDark
                  ? 'bg-white/5 border-gray-700'
                  : 'bg-white/60 border-gray-200'
                  }`}>
                  <div className={`h-32 rounded-lg animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
