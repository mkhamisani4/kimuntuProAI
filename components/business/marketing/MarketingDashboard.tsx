'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    BarChart3,
    Search,
    Calendar,
    Megaphone,
    FileText,
    Hash,
    Link2,
    ExternalLink,
    Mail,
} from 'lucide-react';
import SEOTools from './SEOTools';
import ContentPlanner from './ContentPlanner';
import CampaignManager from './CampaignManager';
import {
    listPosts,
    listCampaigns,
    listKeywords,
    getMarketingSettings,
    type MarketingPost,
    type MarketingCampaign,
    type MarketingKeyword,
    type MarketingSettings,
} from '@kimuntupro/db';
import { toast } from '@/components/ai/Toast';

interface MarketingDashboardProps {
    userId: string;
    tenantId: string;
}

export default function MarketingDashboard({ userId, tenantId }: MarketingDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

    // Aggregated data for overview
    const [posts, setPosts] = useState<MarketingPost[]>([]);
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [keywords, setKeywords] = useState<MarketingKeyword[]>([]);
    const [settings, setSettings] = useState<MarketingSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!userId || !tenantId) return;
        setIsLoading(true);
        try {
            const [postsData, campaignsData, keywordsData, settingsData] = await Promise.all([
                listPosts(tenantId, userId),
                listCampaigns(tenantId, userId),
                listKeywords(tenantId, userId),
                getMarketingSettings(tenantId, userId),
            ]);
            setPosts(postsData);
            setCampaigns(campaignsData);
            setKeywords(keywordsData);
            setSettings(settingsData);
        } catch (error) {
            console.error('[Marketing] Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId, tenantId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleConnectSocials = async () => {
        try {
            const toastId = toast.loading('Generating connect link...');
            const response = await fetch('/api/marketing/social/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to get connect URL');
            }

            const data = await response.json();
            if (data.profileUrl) {
                window.open(data.profileUrl, '_blank');
                toast.success('Connect page opened in new tab', { id: toastId });
            } else {
                toast.error('No connect URL returned', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to connect social accounts');
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'seo', label: 'SEO Tools', icon: Search },
        { id: 'content', label: 'Content Planner', icon: Calendar },
        { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    ];

    return (
        <div className="space-y-6">
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

            {/* Content Area */}
            <div className="min-h-[500px]">
                <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
                    <OverviewTab
                        setActiveTab={setActiveTab}
                        posts={posts}
                        campaigns={campaigns}
                        keywords={keywords}
                        settings={settings}
                        isLoading={isLoading}
                        onConnectSocials={handleConnectSocials}
                    />
                </div>
                <div className={activeTab === 'seo' ? 'block' : 'hidden'}>
                    <SEOTools
                        tenantId={tenantId}
                        userId={userId}
                        selectedCampaignId={selectedCampaignId}
                    />
                </div>
                <div className={activeTab === 'content' ? 'block' : 'hidden'}>
                    <ContentPlanner
                        tenantId={tenantId}
                        userId={userId}
                        campaigns={campaigns}
                        selectedCampaignId={selectedCampaignId}
                        onDataChange={loadData}
                    />
                </div>
                <div className={activeTab === 'campaigns' ? 'block' : 'hidden'}>
                    <CampaignManager
                        tenantId={tenantId}
                        userId={userId}
                        posts={posts}
                        keywords={keywords}
                        onCampaignSelect={(id) => setSelectedCampaignId(id)}
                        onDataChange={loadData}
                    />
                </div>
            </div>
        </div>
    );
}

interface OverviewTabProps {
    setActiveTab: (tab: string) => void;
    posts: MarketingPost[];
    campaigns: MarketingCampaign[];
    keywords: MarketingKeyword[];
    settings: MarketingSettings | null;
    isLoading: boolean;
    onConnectSocials: () => void;
}

function OverviewTab({ setActiveTab, posts, campaigns, keywords, settings, isLoading, onConnectSocials }: OverviewTabProps) {
    const totalPosts = posts.length;
    const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const savedKeywords = keywords.length;
    const failedPosts = posts.filter(p => p.status === 'failed');

    const stats = [
        {
            label: 'Total Posts',
            value: isLoading ? '...' : String(totalPosts),
            icon: FileText,
            color: 'blue'
        },
        {
            label: 'Scheduled',
            value: isLoading ? '...' : String(scheduledPosts),
            icon: Calendar,
            color: 'purple'
        },
        {
            label: 'Active Campaigns',
            value: isLoading ? '...' : String(activeCampaigns),
            icon: Megaphone,
            color: 'emerald'
        },
        {
            label: 'Saved Keywords',
            value: isLoading ? '...' : String(savedKeywords),
            icon: Hash,
            color: 'orange'
        },
    ];

    // Dynamic alerts
    const alerts: { title: string; desc: string; type: 'warning' | 'success' | 'info' }[] = [];
    if (failedPosts.length > 0) {
        alerts.push({
            title: 'Failed Posts',
            desc: `${failedPosts.length} post(s) failed to publish. Check the Content Planner for details.`,
            type: 'warning',
        });
    }
    if (campaigns.length > 0 && activeCampaigns === 0) {
        alerts.push({
            title: 'No Active Campaigns',
            desc: 'All campaigns are paused or ended. Consider launching a new campaign.',
            type: 'info',
        });
    }
    if (totalPosts === 0 && campaigns.length === 0) {
        alerts.push({
            title: 'Get Started',
            desc: 'Create your first campaign or schedule a social post to get started!',
            type: 'info',
        });
    }
    if (activeCampaigns > 0 && failedPosts.length === 0) {
        alerts.push({
            title: 'All Systems Go',
            desc: `${activeCampaigns} active campaign(s) running smoothly.`,
            type: 'success',
        });
    }

    return (
        <div className="space-y-6">
            {/* Connect Mailchimp Banner */}
            {!settings?.mailchimpAccessToken && (
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-yellow-500" />
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Connect Mailchimp</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Set up email campaigns to reach your audience directly</p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/business/marketing/email"
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Set Up
                    </Link>
                </div>
            )}

            {/* Email Campaigns Card */}
            <Link
                href="/dashboard/business/marketing/email"
                className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">Email Campaigns</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {settings?.mailchimpAccessToken
                        ? 'Create and send email campaigns with Mailchimp'
                        : 'Connect Mailchimp to start sending email campaigns'}
                </p>
            </Link>

            {/* Connect Socials Banner */}
            {!settings?.ayrshareProfileKey && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link2 className="w-5 h-5 text-blue-400" />
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Connect Social Accounts</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Link your social platforms to schedule and publish posts</p>
                        </div>
                    </div>
                    <button
                        onClick={onConnectSocials}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Connect
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alerts */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Marketing Alerts</h3>
                    <div className="space-y-4">
                        {alerts.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No alerts at this time.</p>
                        ) : alerts.map((alert, i) => (
                            <div key={i} className="flex gap-4 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${alert.type === 'warning' ? 'bg-orange-500' :
                                        alert.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                                    }`} />
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{alert.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setActiveTab('seo')}
                            className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-center group"
                        >
                            <Search className="w-6 h-6 mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Keyword Audit</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('campaigns')}
                            className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-center group"
                        >
                            <Megaphone className="w-6 h-6 mx-auto mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Create Campaign</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('content')}
                            className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-center group"
                        >
                            <Calendar className="w-6 h-6 mx-auto mb-2 text-emerald-500 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule Post</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('seo')}
                            className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-center group"
                        >
                            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-orange-500 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Site Audit</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
