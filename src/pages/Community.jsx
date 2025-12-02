'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import { MessageCircle, Users, BookOpen, Sparkles } from 'lucide-react';

const Community = () => {
    const { isDark } = useTheme();

    const channels = [
        {
            icon: MessageCircle,
            title: 'Discord Community',
            description: 'Join thousands of professionals sharing tips and experiences',
            members: '10,000+',
            link: '#'
        },
        {
            icon: Users,
            title: 'User Forums',
            description: 'Ask questions and get help from the community',
            members: '5,000+',
            link: '#'
        },
        {
            icon: BookOpen,
            title: 'Knowledge Base',
            description: 'Community-contributed guides and tutorials',
            members: '1,000+ articles',
            link: '#'
        },
        {
            icon: Sparkles,
            title: 'Feature Requests',
            description: 'Share ideas and vote on upcoming features',
            members: '500+ ideas',
            link: '#'
        }
    ];

    return (
        <PageWrapper title="Community">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Join Our Community
                </h2>
                <p className="text-lg mb-10">
                    Connect with other professionals, share insights, and learn from the KimuntuPro AI community.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {channels.map((channel, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-2xl border ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                } transition-all cursor-pointer`}
                        >
                            <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                }`}>
                                <channel.icon className={`w-7 h-7 ${isDark ? 'text-purple-400' : 'text-purple-600'
                                    }`} />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {channel.title}
                            </h3>
                            <p className="mb-3">{channel.description}</p>
                            <p className={`text-sm font-medium mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                {channel.members}
                            </p>
                            <button className={`px-5 py-2 rounded-lg font-medium transition-all ${isDark
                                    ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}>
                                Join Now →
                            </button>
                        </div>
                    ))}
                </div>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Community Guidelines
                    </h3>
                    <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                        }`}>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                <span><strong>Be respectful:</strong> Treat everyone with kindness and professionalism</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                <span><strong>Share knowledge:</strong> Help others by sharing your experiences and insights</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                <span><strong>Stay on topic:</strong> Keep discussions relevant to the channel or forum</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                <span><strong>No spam:</strong> Avoid self-promotion and off-topic content</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                <span><strong>Protect privacy:</strong> Don't share personal or confidential information</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <div className={`p-8 rounded-2xl border text-center ${isDark
                        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
                    }`}>
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Connect on Social Media
                    </h3>
                    <p className="mb-6">
                        Follow us for the latest updates, tips, and community highlights.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className={`px-6 py-3 rounded-lg font-semibold transition-all ${isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                            }`}>
                            Twitter
                        </button>
                        <button className={`px-6 py-3 rounded-lg font-semibold transition-all ${isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                            }`}>
                            LinkedIn
                        </button>
                        <button className={`px-6 py-3 rounded-lg font-semibold transition-all ${isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                            }`}>
                            Instagram
                        </button>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Community;
