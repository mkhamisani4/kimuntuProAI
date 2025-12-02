'use client';

import React from 'react';
import { HelpCircle, Mail } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function SupportPage() {
    const { isDark } = useTheme();

    return (
        <div>
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${isDark
                    ? 'bg-white/5 backdrop-blur-xl border border-white/10'
                    : 'bg-white/60 backdrop-blur-xl border border-gray-200'
                    } rounded-2xl p-8 shadow-lg`}>
                    <HelpCircle className={`w-8 h-8 mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        FAQ
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Find answers to common questions about KimuntuPro AI.
                    </p>
                </div>
                <div className={`${isDark
                    ? 'bg-white/5 backdrop-blur-xl border border-white/10'
                    : 'bg-white/60 backdrop-blur-xl border border-gray-200'
                    } rounded-2xl p-8 shadow-lg`}>
                    <Mail className={`w-8 h-8 mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Contact Us
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        support@kimuntupro.com
                    </p>
                </div>
            </div>
        </div>
    );
}
