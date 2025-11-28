'use client';

import QuickStats from './QuickStats';
import TipsWidget from './TipsWidget';
import { ExternalLink, Settings, MessageCircle, BookOpen } from 'lucide-react';

interface ActivitySidebarProps {
  tenantId: string;
  userId?: string;
}

export default function ActivitySidebar({ tenantId, userId }: ActivitySidebarProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <QuickStats tenantId={tenantId} userId={userId} />

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur rounded-lg border border-gray-800 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Quick Actions
        </h3>
        <div className="space-y-3">
          <a
            href="/dashboard/business/websites"
            className="flex items-center justify-between text-sm text-gray-300 hover:text-emerald-400 font-medium group transition-colors"
          >
            <span>View All Websites</span>
            <ExternalLink size={14} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
          </a>
          <a
            href="/dashboard/business/logos"
            className="flex items-center justify-between text-sm text-gray-300 hover:text-purple-400 font-medium group transition-colors"
          >
            <span>View All Logos</span>
            <ExternalLink size={14} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
          </a>
          <a
            href="/dashboard/business/ai-assistant"
            className="flex items-center justify-between text-sm text-gray-300 hover:text-emerald-400 font-medium group transition-colors"
          >
            <span>View All Results</span>
            <ExternalLink size={14} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
          </a>
          <a
            href="/dashboard/business/streamlined-plan"
            className="flex items-center justify-between text-sm text-gray-300 hover:text-emerald-400 font-medium group transition-colors"
          >
            <span>Generate New Plan</span>
            <ExternalLink size={14} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
          </a>
        </div>
      </div>

      {/* Tips Widget */}
      <TipsWidget />

      {/* Help & Resources */}
      <div className="bg-white/5 backdrop-blur rounded-lg border border-gray-800 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Help & Resources
        </h3>
        <div className="space-y-3">
          <a
            href="/docs"
            className="flex items-center gap-3 text-sm text-gray-300 hover:text-emerald-400 font-medium transition-colors"
          >
            <BookOpen size={16} className="text-gray-600" />
            <span>Documentation</span>
          </a>
          <a
            href="/dashboard/support"
            className="flex items-center gap-3 text-sm text-gray-300 hover:text-emerald-400 font-medium transition-colors"
          >
            <MessageCircle size={16} className="text-gray-600" />
            <span>Contact Support</span>
          </a>
          <a
            href="/settings"
            className="flex items-center gap-3 text-sm text-gray-300 hover:text-emerald-400 font-medium transition-colors"
          >
            <Settings size={16} className="text-gray-600" />
            <span>Account Settings</span>
          </a>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white/5 backdrop-blur rounded-lg border border-gray-800 p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          System Status
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">All systems operational</span>
        </div>
      </div>
    </div>
  );
}
