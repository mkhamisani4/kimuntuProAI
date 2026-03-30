'use client';

import React, { useState, useMemo } from 'react';
import { BarChart3, Mail, MousePointerClick, AlertTriangle, UserMinus } from 'lucide-react';
import type { EmailCampaign } from '@kimuntupro/db';

interface EmailAnalyticsDashboardProps {
  tenantId: string;
  userId: string;
  campaigns: EmailCampaign[];
}

export default function EmailAnalyticsDashboard({
  tenantId,
  userId,
  campaigns,
}: EmailAnalyticsDashboardProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');

  const sentCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === 'sent'),
    [campaigns]
  );

  const aggregatedStats = useMemo(() => {
    const filtered = selectedCampaignId === 'all'
      ? sentCampaigns
      : sentCampaigns.filter((c) => c.id === selectedCampaignId);

    return filtered.reduce(
      (acc, c) => ({
        totalSent: acc.totalSent + c.recipientCount,
        opens: acc.opens + c.stats.opens,
        uniqueOpens: acc.uniqueOpens + c.stats.uniqueOpens,
        clicks: acc.clicks + c.stats.clicks,
        uniqueClicks: acc.uniqueClicks + c.stats.uniqueClicks,
        bounces: acc.bounces + c.stats.bounces,
        unsubscribes: acc.unsubscribes + c.stats.unsubscribes,
      }),
      { totalSent: 0, opens: 0, uniqueOpens: 0, clicks: 0, uniqueClicks: 0, bounces: 0, unsubscribes: 0 }
    );
  }, [sentCampaigns, selectedCampaignId]);

  const openRate = aggregatedStats.totalSent > 0
    ? ((aggregatedStats.uniqueOpens / aggregatedStats.totalSent) * 100).toFixed(1)
    : '0.0';

  const clickRate = aggregatedStats.uniqueOpens > 0
    ? ((aggregatedStats.uniqueClicks / aggregatedStats.uniqueOpens) * 100).toFixed(1)
    : '0.0';

  const bounceRate = aggregatedStats.totalSent > 0
    ? ((aggregatedStats.bounces / aggregatedStats.totalSent) * 100).toFixed(1)
    : '0.0';

  const stats = [
    {
      label: 'Total Sent',
      value: aggregatedStats.totalSent.toLocaleString(),
      icon: Mail,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Open Rate',
      value: `${openRate}%`,
      subtitle: `${aggregatedStats.uniqueOpens} unique opens`,
      icon: Mail,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Click Rate',
      value: `${clickRate}%`,
      subtitle: `${aggregatedStats.uniqueClicks} unique clicks`,
      icon: MousePointerClick,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Bounce Rate',
      value: `${bounceRate}%`,
      subtitle: `${aggregatedStats.bounces} bounces`,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Campaign filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Email Analytics</h2>
        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Campaigns</option>
          {sentCampaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Stats cards */}
      {sentCampaigns.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No analytics yet</h3>
          <p className="text-sm text-gray-500">Send your first email campaign to see analytics here.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
                )}
              </div>
            ))}
          </div>

          {/* Per-campaign breakdown */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-medium text-gray-900 dark:text-white">Campaign Performance</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Campaign</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sent</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Opens</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Clicks</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Bounces</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Unsubs</th>
                </tr>
              </thead>
              <tbody>
                {sentCampaigns.map((campaign) => {
                  const or = campaign.recipientCount > 0
                    ? ((campaign.stats.uniqueOpens / campaign.recipientCount) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={campaign.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{campaign.title}</div>
                        <div className="text-xs text-gray-500">
                          {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">{campaign.recipientCount}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                        {campaign.stats.uniqueOpens} <span className="text-xs text-gray-400">({or}%)</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">{campaign.stats.uniqueClicks}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">{campaign.stats.bounces}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">{campaign.stats.unsubscribes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Unsubscribe summary */}
          {aggregatedStats.unsubscribes > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex items-start gap-3">
              <UserMinus className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300">Unsubscribe Alert</h4>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  {aggregatedStats.unsubscribes} total unsubscribe(s) across your campaigns. Consider reviewing your email frequency and content relevance.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
