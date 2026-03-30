'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Users, BarChart3, Send } from 'lucide-react';
import MailchimpConnect from './MailchimpConnect';
import ContactManager from './ContactManager';
import CampaignList from './CampaignList';
import EmailAnalyticsDashboard from './EmailAnalyticsDashboard';
import {
  getMarketingSettings,
  listEmailCampaigns,
  type MarketingSettings,
  type EmailCampaign,
} from '@kimuntupro/db';
import { toast } from '@/components/ai/Toast';

interface EmailDashboardProps {
  userId: string;
  tenantId: string;
}

export default function EmailDashboard({ userId, tenantId }: EmailDashboardProps) {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [settings, setSettings] = useState<MarketingSettings | null>(null);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!userId || !tenantId) return;
    setIsLoading(true);
    try {
      const [settingsData, campaignsData] = await Promise.all([
        getMarketingSettings(tenantId, userId),
        listEmailCampaigns(tenantId, userId),
      ]);
      setSettings(settingsData);
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('[Email] Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, tenantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check for OAuth redirect params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      toast.success('Mailchimp connected successfully!');
      window.history.replaceState({}, '', window.location.pathname);
      loadData();
    }
    if (params.get('error')) {
      toast.error(`Connection error: ${params.get('error')}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadData]);

  const isConnected = !!settings?.mailchimpAccessToken;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!isConnected) {
    return <MailchimpConnect tenantId={tenantId} userId={userId} onConnected={loadData} />;
  }

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: Send },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Audience info */}
      {settings?.mailchimpListId && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Mail className="w-4 h-4" />
          <span>Connected to Mailchimp (server: {settings.mailchimpServer})</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeTab === tab.id
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        <div className={activeTab === 'campaigns' ? 'block' : 'hidden'}>
          <CampaignList
            tenantId={tenantId}
            userId={userId}
            campaigns={campaigns}
            settings={settings!}
            onDataChange={loadData}
          />
        </div>
        <div className={activeTab === 'contacts' ? 'block' : 'hidden'}>
          <ContactManager
            tenantId={tenantId}
            userId={userId}
            settings={settings!}
          />
        </div>
        <div className={activeTab === 'analytics' ? 'block' : 'hidden'}>
          <EmailAnalyticsDashboard
            tenantId={tenantId}
            userId={userId}
            campaigns={campaigns}
          />
        </div>
      </div>
    </div>
  );
}
