'use client';

import React, { useState, useEffect } from 'react';
import { Mail, ExternalLink, CheckCircle, List } from 'lucide-react';
import { getMarketingSettings, updateMarketingSettings } from '@kimuntupro/db';
import { toast } from '@/components/ai/Toast';

interface MailchimpConnectProps {
  tenantId: string;
  userId: string;
  onConnected: () => void;
}

export default function MailchimpConnect({ tenantId, userId, onConnected }: MailchimpConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAudienceSelector, setShowAudienceSelector] = useState(false);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [loadingAudiences, setLoadingAudiences] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/marketing/email/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to start OAuth flow');
      }

      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect Mailchimp');
      setIsConnecting(false);
    }
  };

  const loadAudiences = async () => {
    setLoadingAudiences(true);
    try {
      const settings = await getMarketingSettings(tenantId, userId);
      if (!settings?.mailchimpAccessToken || !settings?.mailchimpServer) return;

      const response = await fetch(
        `https://${settings.mailchimpServer}.api.mailchimp.com/3.0/lists?count=100`,
        { headers: { Authorization: `Bearer ${settings.mailchimpAccessToken}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setAudiences(data.lists || []);
        setShowAudienceSelector(true);
      }
    } catch (error) {
      console.error('Failed to load audiences:', error);
      toast.error('Failed to load Mailchimp audiences');
    } finally {
      setLoadingAudiences(false);
    }
  };

  const selectAudience = async (listId: string) => {
    try {
      await updateMarketingSettings(tenantId, userId, { mailchimpListId: listId });
      toast.success('Audience selected!');
      onConnected();
    } catch (error: any) {
      toast.error('Failed to save audience selection');
    }
  };

  // If token exists but no list selected, show audience selector
  useEffect(() => {
    const checkSettings = async () => {
      const settings = await getMarketingSettings(tenantId, userId);
      if (settings?.mailchimpAccessToken && !settings?.mailchimpListId) {
        loadAudiences();
      }
    };
    checkSettings();
  }, [tenantId, userId]);

  if (showAudienceSelector) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mailchimp Connected!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Select an audience to use for your email campaigns.</p>

          {loadingAudiences ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto" />
          ) : (
            <div className="space-y-3">
              {audiences.map((audience) => (
                <button
                  key={audience.id}
                  onClick={() => selectAudience(audience.id)}
                  className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors text-left"
                >
                  <List className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{audience.name}</div>
                    <div className="text-sm text-gray-500">{audience.stats?.member_count || 0} contacts</div>
                  </div>
                </button>
              ))}
              {audiences.length === 0 && (
                <p className="text-gray-500 text-sm">No audiences found. Create one in Mailchimp first.</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm text-center">
        <div className="mx-auto w-16 h-16 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Connect Mailchimp</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Connect your Mailchimp account to create and send email campaigns, manage contacts, and track analytics.
        </p>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Connect Mailchimp
            </>
          )}
        </button>
      </div>
    </div>
  );
}
