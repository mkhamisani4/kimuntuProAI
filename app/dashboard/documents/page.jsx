'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function DocumentsPage() {
    const { isDark } = useTheme();

    return (
        <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                My Documents
            </h2>
            <div className={`${isDark
                ? 'bg-white/5 backdrop-blur-xl border border-white/10'
                : 'bg-white/60 backdrop-blur-xl border border-gray-200'
                } rounded-2xl p-8 shadow-lg`}>
                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your documents will appear here
                </p>
                <button className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transition-all shadow-lg">
                    Create New Document
                </button>
            </div>
        </div>
    );
}
