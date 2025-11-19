'use client';

import { useState } from 'react';
import AssistantsTab from './AssistantsTab';
import WebsitesTab from './WebsitesTab';

interface RecentWorkPanelProps {
  tenantId: string;
  userId?: string;
}

type TabType = 'assistants' | 'websites';

export default function RecentWorkPanel({ tenantId, userId }: RecentWorkPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('assistants');

  return (
    <div className="bg-white/5 backdrop-blur rounded-lg border border-gray-800">
      {/* Tab Headers */}
      <div className="border-b border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab('assistants')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'assistants'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <span>AI Assistants</span>
            {/* Active indicator */}
            {activeTab === 'assistants' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('websites')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'websites'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <span>Websites</span>
            {/* Active indicator */}
            {activeTab === 'websites' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'assistants' && <AssistantsTab tenantId={tenantId} />}
        {activeTab === 'websites' && userId && <WebsitesTab tenantId={tenantId} userId={userId} />}
        {activeTab === 'websites' && !userId && (
          <div className="text-center py-8 text-gray-400">
            Sign in to view your websites
          </div>
        )}
      </div>
    </div>
  );
}
