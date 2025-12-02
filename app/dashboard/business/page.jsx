'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function BusinessTrackPage() {
    const { isDark } = useTheme();

    return (
        <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Business Track
            </h2>
            <div className={`${isDark
                ? 'bg-white/5 backdrop-blur-xl border border-white/10'
                : 'bg-white/60 backdrop-blur-xl border border-gray-200'
                } rounded-2xl p-8 shadow-lg`}>
                <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Build and scale your business with AI-driven insights.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {['Business Plan Generator', 'Market Analysis', 'Financial Forecasting', 'Growth Strategy'].map((item, i) => (
                        <div
                            key={i}
                            className={`${isDark
                                ? 'bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20'
                                : 'bg-blue-100 border border-blue-300 hover:bg-blue-200'
                                } backdrop-blur-xl rounded-lg p-4 cursor-pointer transition-all`}
                        >
                            <p className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                                {item}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
