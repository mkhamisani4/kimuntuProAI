'use client';

import { useState } from 'react';
import AssistantsTab from './AssistantsTab';
import WebsitesTab from './WebsitesTab';
import LogosTab from './LogosTab';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useTheme } from '@/components/providers/ThemeProvider';

interface RecentWorkPanelProps {
  tenantId: string;
  userId?: string;
}

type TabType = 'assistants' | 'websites' | 'logos';

export default function RecentWorkPanel({ tenantId, userId }: RecentWorkPanelProps) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('assistants');

  return (
    <div
      className={`rounded-lg border ${
        isDark
          ? 'bg-white/5 backdrop-blur border-gray-800'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      {/* Tab Headers */}
      <div className={isDark ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
        <div className="flex">
          <button
            onClick={() => setActiveTab('assistants')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === 'assistants'
                ? isDark
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-emerald-700 bg-emerald-50'
                : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <span>{t.biz_tabAssistants}</span>
            {/* Active indicator */}
            {activeTab === 'assistants' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('websites')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === 'websites'
                ? isDark
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-emerald-700 bg-emerald-50'
                : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <span>{t.biz_tabWebsites}</span>
            {/* Active indicator */}
            {activeTab === 'websites' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('logos')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === 'logos'
                ? isDark
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-purple-700 bg-purple-50'
                : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <span>{t.biz_tabLogos}</span>
            {/* Active indicator */}
            {activeTab === 'logos' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'assistants' && <AssistantsTab tenantId={tenantId} />}
        {activeTab === 'websites' && userId && <WebsitesTab tenantId={tenantId} userId={userId} />}
        {activeTab === 'websites' && !userId && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.biz_signInWebsites}
          </div>
        )}
        {activeTab === 'logos' && userId && <LogosTab tenantId={tenantId} userId={userId} />}
        {activeTab === 'logos' && !userId && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.biz_signInLogos}
          </div>
        )}
      </div>
    </div>
  );
}
