'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, Plus, X, Edit2, Trash2, Save, FileText, Hash } from 'lucide-react';
import {
    createCampaign,
    listCampaigns,
    updateCampaign,
    deleteCampaign,
    type MarketingCampaign,
    type MarketingPost,
    type MarketingKeyword,
} from '@kimuntupro/db';
import { toast } from '@/components/ai/Toast';

interface CampaignManagerProps {
    tenantId: string;
    userId: string;
    posts: MarketingPost[];
    keywords: MarketingKeyword[];
    onCampaignSelect: (id: string | null) => void;
    onDataChange: () => void;
}

export default function CampaignManager({ tenantId, userId, posts, keywords, onCampaignSelect, onDataChange }: CampaignManagerProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadCampaigns = useCallback(async () => {
        if (!tenantId || !userId) return;
        setIsLoading(true);
        try {
            const data = await listCampaigns(tenantId, userId);
            setCampaigns(data);
        } catch (error) {
            console.error('[CampaignManager] Failed to load campaigns:', error);
        } finally {
            setIsLoading(false);
        }
    }, [tenantId, userId]);

    useEffect(() => {
        loadCampaigns();
    }, [loadCampaigns]);

    const [newCampaign, setNewCampaign] = useState({ title: '', description: '' });

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCampaign.title) return;

        const toastId = toast.loading('Creating campaign...');
        try {
            await createCampaign({
                tenantId,
                userId,
                title: newCampaign.title,
                description: newCampaign.description,
                status: 'active',
            });
            toast.success('Campaign created!', { id: toastId });
            setIsCreateModalOpen(false);
            setNewCampaign({ title: '', description: '' });
            loadCampaigns();
            onDataChange();
        } catch (error) {
            toast.error('Failed to create campaign', { id: toastId });
        }
    };

    const handleUpdateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCampaign?.id) return;

        const toastId = toast.loading('Updating campaign...');
        try {
            await updateCampaign(editingCampaign.id, {
                title: editingCampaign.title,
                description: editingCampaign.description,
                status: editingCampaign.status,
            });
            toast.success('Campaign updated!', { id: toastId });
            setEditingCampaign(null);
            loadCampaigns();
            onDataChange();
        } catch (error) {
            toast.error('Failed to update campaign', { id: toastId });
        }
    };

    const handleDeleteCampaign = async (id: string) => {
        try {
            await deleteCampaign(id);
            toast.success('Campaign deleted');
            setEditingCampaign(null);
            loadCampaigns();
            onDataChange();
        } catch (error) {
            toast.error('Failed to delete campaign');
        }
    };

    // Count posts/keywords per campaign
    const getCampaignCounts = (campaignId: string) => {
        const postCount = posts.filter(p => p.campaignId === campaignId).length;
        const keywordCount = keywords.filter(k => k.campaignId === campaignId).length;
        return { postCount, keywordCount };
    };

    const statusColors: Record<string, string> = {
        active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        ended: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Campaigns</h3>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Campaign
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400" />
                </div>
            ) : campaigns.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center shadow-sm">
                    <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No campaigns yet.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Create your first campaign to organize posts and keywords.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {campaigns.map((campaign) => {
                        const { postCount, keywordCount } = getCampaignCounts(campaign.id!);
                        return (
                            <div key={campaign.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                        <Megaphone className="w-5 h-5" />
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status] || ''}`}>
                                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{campaign.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                    {campaign.description || 'No description'}
                                </p>

                                {/* Aggregate counts */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <FileText className="w-4 h-4" />
                                        <span>{postCount} post{postCount !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Hash className="w-4 h-4" />
                                        <span>{keywordCount} keyword{keywordCount !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onCampaignSelect(campaign.id!)}
                                        className="flex-1 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-200 dark:border-gray-800"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => setEditingCampaign(campaign)}
                                        className="py-2 px-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg transition-colors border border-gray-200 dark:border-gray-800"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Campaign Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Campaign</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Summer Sale 2025"
                                    value={newCampaign.title}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe your campaign goals..."
                                    value={newCampaign.description}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-purple-600/20"
                                >
                                    Create Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Campaign Modal */}
            {editingCampaign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Campaign</h3>
                            <button onClick={() => setEditingCampaign(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCampaign} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editingCampaign.title}
                                    onChange={(e) => setEditingCampaign({ ...editingCampaign, title: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={editingCampaign.description}
                                    onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                <select
                                    value={editingCampaign.status}
                                    onChange={(e) => setEditingCampaign({ ...editingCampaign, status: e.target.value as 'active' | 'paused' | 'ended' })}
                                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white"
                                >
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="ended">Ended</option>
                                </select>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    type="button"
                                    onClick={() => editingCampaign.id && handleDeleteCampaign(editingCampaign.id)}
                                    className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-purple-600/20 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
