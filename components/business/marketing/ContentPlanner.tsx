'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Plus, Image as ImageIcon, X, Eye, MousePointerClick, List, CalendarDays, Upload, Trash2 } from 'lucide-react';
import {
    createPost,
    listPosts,
    deletePost,
    uploadPostMedia,
    type MarketingPost,
    type MarketingCampaign,
} from '@kimuntupro/db';
import { toast } from '@/components/ai/Toast';
import CalendarView from './CalendarView';

interface ContentPlannerProps {
    tenantId: string;
    userId: string;
    campaigns: MarketingCampaign[];
    selectedCampaignId?: string | null;
    onDataChange: () => void;
}

export default function ContentPlanner({ tenantId, userId, campaigns, selectedCampaignId, onDataChange }: ContentPlannerProps) {
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [posts, setPosts] = useState<MarketingPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<MarketingPost | null>(null);

    const loadPosts = useCallback(async () => {
        if (!tenantId || !userId) return;
        setIsLoading(true);
        try {
            const data = await listPosts(tenantId, userId, selectedCampaignId || undefined);
            setPosts(data);
        } catch (error) {
            console.error('[ContentPlanner] Failed to load posts:', error);
        } finally {
            setIsLoading(false);
        }
    }, [tenantId, userId, selectedCampaignId]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const handleDeletePost = async (postId: string, ayrshareId?: string | null) => {
        try {
            // Delete from Ayrshare if it was scheduled there
            if (ayrshareId) {
                await fetch('/api/marketing/social/post', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ayrshareId }),
                });
            }
            await deletePost(postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
            setSelectedPost(null);
            toast.success('Post deleted');
            onDataChange();
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    const filteredPosts = posts.filter(post => {
        if (filter === 'all') return true;
        if (filter === 'scheduled') return post.status === 'scheduled';
        if (filter === 'draft') return post.status === 'draft';
        if (filter === 'posted') return post.status === 'posted';
        return true;
    });

    // Map posts to FullCalendar events
    const calendarEvents = posts
        .filter(p => p.scheduledAt)
        .map(p => ({
            id: p.id,
            title: p.content.slice(0, 50) + (p.content.length > 50 ? '...' : ''),
            date: p.scheduledAt instanceof Date ? p.scheduledAt.toISOString().split('T')[0] : '',
            color: p.platforms.includes('instagram') ? '#E1306C' :
                   p.platforms.includes('twitter') ? '#1DA1F2' :
                   p.platforms.includes('linkedin') ? '#0077B5' : '#10b981',
            extendedProps: { post: p },
        }));

    const statusColors: Record<string, string> = {
        scheduled: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        posted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        draft: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Content Calendar</h3>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
                        >
                            <List className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
                        >
                            <CalendarDays className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Post
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                {['all', 'scheduled', 'draft', 'posted'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f
                                                ? (f === 'all' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' :
                                                    f === 'scheduled' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500 dark:text-white' :
                                                    f === 'posted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500 dark:text-white' :
                                                    'bg-orange-100 text-orange-800 dark:bg-orange-500 dark:text-white')
                                                : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? 'Posts' : ''}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400" />
                                    </div>
                                ) : filteredPosts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No posts found.</p>
                                        <p className="text-sm mt-1">Create a post to get started.</p>
                                    </div>
                                ) : filteredPosts.map((post) => (
                                    <div key={post.id} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-800">
                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-lg flex flex-col items-center justify-center text-center">
                                            <CalendarIcon className="w-5 h-5 text-gray-500 mb-1" />
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                {post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Draft'}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {post.platforms.map((platform) => (
                                                        <span key={platform} className={`text-xs px-2 py-0.5 rounded-full border ${
                                                            platform === 'instagram' ? 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-900/50' :
                                                            platform === 'twitter' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/50' :
                                                            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-900/50'
                                                        }`}>
                                                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[post.status] || ''}`}>
                                                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 mb-2">
                                                {post.content}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                {post.mediaUrl && (
                                                    <span className="flex items-center gap-1">
                                                        <ImageIcon className="w-3 h-3" /> Media
                                                    </span>
                                                )}
                                                {post.metrics && (
                                                    <>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-3 h-3" /> {post.metrics.views}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MousePointerClick className="w-3 h-3" /> {post.metrics.clicks}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => post.id && handleDeletePost(post.id, post.ayrshareId)}
                                            className="text-gray-400 hover:text-red-500 self-start transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white text-center">
                            <h3 className="text-lg font-bold mb-2">Need Inspiration?</h3>
                            <p className="text-indigo-100 mb-6 text-sm">
                                Create posts and schedule them across social platforms.
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg text-sm font-medium transition-colors"
                            >
                                Create Post
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Total Posts</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{posts.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Scheduled</span>
                                    <span className="font-medium text-emerald-500">{posts.filter(p => p.status === 'scheduled').length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Drafts</span>
                                    <span className="font-medium text-orange-500">{posts.filter(p => p.status === 'draft').length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Published</span>
                                    <span className="font-medium text-blue-500">{posts.filter(p => p.status === 'posted').length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Calendar View */
                <CalendarView
                    events={calendarEvents}
                    onEventClick={(post: MarketingPost) => setSelectedPost(post)}
                />
            )}

            {/* Post Detail Dialog */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Post Details</h3>
                            <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-800 dark:text-gray-200">{selectedPost.content}</p>
                            <div className="flex items-center gap-2">
                                {selectedPost.platforms.map((p) => (
                                    <span key={p} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </span>
                                ))}
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[selectedPost.status] || ''}`}>
                                    {selectedPost.status.charAt(0).toUpperCase() + selectedPost.status.slice(1)}
                                </span>
                            </div>
                            {selectedPost.scheduledAt && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Scheduled: {new Date(selectedPost.scheduledAt).toLocaleString()}
                                </p>
                            )}
                            {selectedPost.metrics && (
                                <div className="flex gap-4 text-sm">
                                    <span className="flex items-center gap-1 text-gray-500">
                                        <Eye className="w-4 h-4" /> {selectedPost.metrics.views} views
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-500">
                                        <MousePointerClick className="w-4 h-4" /> {selectedPost.metrics.clicks} clicks
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => selectedPost.id && handleDeletePost(selectedPost.id, selectedPost.ayrshareId)}
                                    className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Post Modal */}
            {isModalOpen && (
                <CreatePostModal
                    tenantId={tenantId}
                    userId={userId}
                    campaigns={campaigns}
                    selectedCampaignId={selectedCampaignId}
                    onClose={() => setIsModalOpen(false)}
                    onCreated={() => {
                        setIsModalOpen(false);
                        loadPosts();
                        onDataChange();
                    }}
                />
            )}
        </div>
    );
}

interface CreatePostModalProps {
    tenantId: string;
    userId: string;
    campaigns: MarketingCampaign[];
    selectedCampaignId?: string | null;
    onClose: () => void;
    onCreated: () => void;
}

function CreatePostModal({ tenantId, userId, campaigns, selectedCampaignId, onClose, onCreated }: CreatePostModalProps) {
    const [content, setContent] = useState('');
    const [platforms, setPlatforms] = useState<string[]>(['instagram']);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('10:00');
    const [campaignId, setCampaignId] = useState(selectedCampaignId || '');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const togglePlatform = (platform: string) => {
        setPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content || platforms.length === 0) {
            toast.error('Content and at least one platform are required');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Creating post...');

        try {
            // Determine schedule date
            let scheduledAt: Date | null = null;
            if (date) {
                scheduledAt = new Date(`${date}T${time || '10:00'}`);
            }

            // Create Firestore doc first to get ID for media upload
            const postId = await createPost({
                tenantId,
                userId,
                campaignId: campaignId || null,
                ayrshareId: null,
                content,
                mediaUrl: null,
                platforms,
                scheduledAt,
                status: scheduledAt ? 'scheduled' : 'draft',
                metrics: null,
            });

            // Upload media if provided
            let mediaUrl: string | null = null;
            if (mediaFile) {
                mediaUrl = await uploadPostMedia(mediaFile, tenantId, postId);
            }

            // Schedule via Ayrshare if scheduled
            let ayrshareId: string | null = null;
            if (scheduledAt) {
                try {
                    const response = await fetch('/api/marketing/social/post', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            post: content,
                            platforms,
                            mediaUrls: mediaUrl ? [mediaUrl] : undefined,
                            scheduleDate: scheduledAt.toISOString(),
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        ayrshareId = data.data?.id || null;
                    }
                } catch (err) {
                    // Ayrshare scheduling failed but post is saved in Firestore
                    console.error('[ContentPlanner] Ayrshare scheduling failed:', err);
                }
            }

            // Update post with media URL and ayrshare ID if we got them
            if (mediaUrl || ayrshareId) {
                const { updatePost } = await import('@kimuntupro/db');
                await updatePost(postId, {
                    ...(mediaUrl ? { mediaUrl } : {}),
                    ...(ayrshareId ? { ayrshareId } : {}),
                });
            }

            toast.success('Post created successfully!', { id: toastId });
            onCreated();
        } catch (error: any) {
            console.error('[ContentPlanner] Failed to create post:', error);
            toast.error(error.message || 'Failed to create post', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Post</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Platforms */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platforms</label>
                        <div className="flex gap-3">
                            {['instagram', 'twitter', 'linkedin'].map((platform) => (
                                <button
                                    key={platform}
                                    type="button"
                                    onClick={() => togglePlatform(platform)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${platforms.includes(platform)
                                            ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-500/50'
                                            : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Media Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Media (optional)</label>
                        <label className={`flex items-center justify-center gap-2 w-full p-3 rounded-xl border cursor-pointer transition-colors ${mediaFile
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/50'
                                : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Upload className="w-5 h-5" />
                            {mediaFile ? mediaFile.name : 'Upload Image or Video'}
                            <input
                                type="file"
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                            />
                        </label>
                    </div>

                    {/* Schedule */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                            <input
                                type="date"
                                value={date}
                                className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
                            <input
                                type="time"
                                value={time}
                                className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Campaign */}
                    {campaigns.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign (optional)</label>
                            <select
                                value={campaignId}
                                onChange={(e) => setCampaignId(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
                            >
                                <option value="">No campaign</option>
                                {campaigns.map((c) => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating...' : date ? 'Schedule Post' : 'Save as Draft'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
