'use client';

import QuickStats from './QuickStats';
import TipsWidget from './TipsWidget';
import { ExternalLink, Settings, MessageCircle, BookOpen } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ActivitySidebarProps {
  tenantId: string;
  userId?: string;
}

export default function ActivitySidebar({ tenantId, userId }: ActivitySidebarProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <QuickStats tenantId={tenantId} userId={userId} />

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          {t.biz_quickActions}
        </h3>
        <div className="space-y-3">
          <a
            href="/dashboard/business/websites"
            className="flex items-center justify-between text-sm text-gray-700 hover:text-blue-600 font-medium group transition-colors"
          >
            <span>{t.biz_viewAllWebsites}</span>
            <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </a>
          <a
            href="/dashboard/business/logos"
            className="flex items-center justify-between text-sm text-gray-700 hover:text-purple-600 font-medium group transition-colors"
          >
            <span>{t.biz_viewAllLogos}</span>
            <ExternalLink size={14} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
          </a>
          <a
            href="/dashboard/business/ai-assistant"
            className="flex items-center justify-between text-sm text-gray-700 hover:text-blue-600 font-medium group transition-colors"
          >
            <span>{t.biz_viewAllResults}</span>
            <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </a>
          <a
            href="/dashboard/business/streamlined-plan"
            className="flex items-center justify-between text-sm text-gray-700 hover:text-blue-600 font-medium group transition-colors"
          >
            <span>{t.biz_generateNewPlan}</span>
            <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </a>
        </div>
      </div>

      {/* Tips Widget */}
      <TipsWidget />

      {/* Help & Resources */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          {t.biz_helpResources}
        </h3>
        <div className="space-y-3">
          <a
            href="/docs"
            className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            <BookOpen size={16} className="text-gray-400" />
            <span>{t.biz_documentation}</span>
          </a>
          <a
            href="/dashboard/support"
            className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            <MessageCircle size={16} className="text-gray-400" />
            <span>{t.biz_contactSupport}</span>
          </a>
          <a
            href="/settings"
            className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            <Settings size={16} className="text-gray-400" />
            <span>{t.biz_accountSettings}</span>
          </a>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {t.biz_systemStatus}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700">{t.biz_allSystemsOperational}</span>
        </div>
      </div>
    </div>
  );
}
