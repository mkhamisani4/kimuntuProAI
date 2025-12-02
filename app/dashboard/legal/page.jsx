'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function LegalTrackPage() {
    const { isDark } = useTheme();

    return (
        <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Legal Track
            </h2>
            <div className={`${isDark
                ? 'bg-white/5 backdrop-blur-xl border border-white/10'
                : 'bg-white/60 backdrop-blur-xl border border-gray-200'
                } rounded-2xl p-8 shadow-lg`}>
                <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Access legal guidance and document analysis.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {['Contract Review', 'Legal Templates', 'Compliance Check', 'Document Drafting'].map((item, i) => (
                        <div
                            key={i}
                            className={`${isDark
                                ? 'bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20'
                                : 'bg-pink-100 border border-pink-300 hover:bg-pink-200'
                                } backdrop-blur-xl rounded-lg p-4 cursor-pointer transition-all`}
                        >
                            <p className={`font-medium ${isDark ? 'text-pink-400' : 'text-pink-700'}`}>
                                {item}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
