'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Calendar, User, ArrowRight } from 'lucide-react';

const Blog = () => {
    const { isDark } = useTheme();

    const posts = [
        {
            title: 'The Future of AI-Powered Career Development',
            author: 'Dr. Sarah Chen',
            date: 'November 20, 2024',
            excerpt: 'Exploring how artificial intelligence is transforming the way professionals navigate their career paths and achieve their goals.',
            category: 'Career'
        },
        {
            title: '10 Ways AI Can Accelerate Your Business Growth',
            author: 'Marcus Johnson',
            date: 'November 15, 2024',
            excerpt: 'Discover practical applications of AI that can help small and medium businesses scale faster and more efficiently.',
            category: 'Business'
        },
        {
            title: 'Understanding AI in Legal Document Analysis',
            author: 'Emma Rodriguez',
            date: 'November 10, 2024',
            excerpt: 'How machine learning is revolutionizing contract review and legal compliance for businesses of all sizes.',
            category: 'Legal'
        },
        {
            title: 'From Idea to Launch: AI-Powered Innovation',
            author: 'Aisha Patel',
            date: 'November 5, 2024',
            excerpt: 'A comprehensive guide to leveraging AI tools for rapid prototyping and bringing innovative ideas to market.',
            category: 'Innovation'
        }
    ];

    return (
        <PageWrapper title="Blog">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Latest from Our Blog
                </h2>
                <p className="text-lg mb-10">
                    Insights, tips, and news about AI, professional development, and innovation.
                </p>

                <div className="space-y-6">
                    {posts.map((post, index) => (
                        <article
                            key={index}
                            className={`p-6 rounded-2xl border ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                } transition-all cursor-pointer`}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDark
                                        ? 'bg-purple-500/20 text-purple-400'
                                        : 'bg-purple-100 text-purple-700'
                                    }`}>
                                    {post.category}
                                </span>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>{post.date}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4" />
                                    <span>{post.author}</span>
                                </div>
                            </div>
                            <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {post.title}
                            </h3>
                            <p className="mb-4">{post.excerpt}</p>
                            <button className={`flex items-center gap-2 font-medium transition-all ${isDark
                                    ? 'text-purple-400 hover:text-purple-300'
                                    : 'text-purple-600 hover:text-purple-700'
                                }`}>
                                Read More <ArrowRight className="w-4 h-4" />
                            </button>
                        </article>
                    ))}
                </div>

                <div className={`mt-12 p-8 rounded-2xl border text-center ${isDark
                        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
                    }`}>
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Subscribe to Our Newsletter
                    </h3>
                    <p className="mb-6">
                        Get the latest articles, insights, and updates delivered to your inbox.
                    </p>
                    <div className="flex gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className={`flex-1 px-4 py-3 rounded-lg ${isDark
                                    ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                        />
                        <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Blog;
