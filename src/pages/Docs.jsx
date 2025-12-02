'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Book, Code, Lightbulb, Rocket } from 'lucide-react';

const Docs = () => {
    const { isDark } = useTheme();

    const sections = [
        {
            icon: Rocket,
            title: 'Getting Started',
            description: 'Quick start guide to begin using KimuntuPro AI',
            topics: [
                'Creating your account',
                'Setting up your profile',
                'Navigating the dashboard',
                'Understanding the tracks'
            ]
        },
        {
            icon: Lightbulb,
            title: 'Features Guide',
            description: 'Detailed guides for each feature',
            topics: [
                'Career Track features',
                'Business Track features',
                'Legal Track features',
                'Innovative Track features'
            ]
        },
        {
            icon: Code,
            title: 'Integrations',
            description: 'Connect with your favorite tools',
            topics: [
                'Google Workspace integration',
                'Slack integration',
                'API access',
                'Webhooks'
            ]
        },
        {
            icon: Book,
            title: 'Best Practices',
            description: 'Tips for getting the most out of the platform',
            topics: [
                'Writing effective prompts',
                'Organizing your projects',
                'Collaboration tips',
                'Security best practices'
            ]
        }
    ];

    return (
        <PageWrapper title="Documentation">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Documentation
                </h2>
                <p className="text-lg mb-10">
                    Comprehensive guides and tutorials to help you make the most of KimuntuPro AI.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-2xl border ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                } transition-all`}
                        >
                            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                }`}>
                                <section.icon className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'
                                    }`} />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {section.title}
                            </h3>
                            <p className="text-sm mb-4">{section.description}</p>
                            <ul className="space-y-2">
                                {section.topics.map((topic, idx) => (
                                    <li key={idx}>
                                        <button className={`text-sm transition-all ${isDark
                                                ? 'text-purple-400 hover:text-purple-300'
                                                : 'text-purple-600 hover:text-purple-700'
                                            } hover:underline`}>
                                            {topic} →
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className={`mt-12 p-8 rounded-2xl border ${isDark
                        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
                    }`}>
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Need Help?
                    </h3>
                    <p className="mb-4">
                        Can't find what you're looking for? Our support team is here to help.
                    </p>
                    <div className="flex gap-4">
                        <a
                            href="#/page/support"
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                            Contact Support
                        </a>
                        <button className={`px-6 py-3 rounded-xl font-semibold transition-all ${isDark
                                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                            }`}>
                            View API Docs
                        </button>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Docs;
