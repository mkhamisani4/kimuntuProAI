'use client';

import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import Footer from '@/components/Footer';

/**
 * PageWrapper Component
 * Wraps footer pages with consistent layout, navigation, and styling
 */
const PageWrapper = ({ children, title }) => {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen transition-all duration-500 ${isDark
            ? 'bg-black'
            : 'bg-gray-50'
            }`}>
            {/* Header with Back Button */}
            <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${isDark
                ? 'bg-black/60 border-white/10'
                : 'bg-white/60 border-black/5'
                }`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isDark
                            ? 'text-white/60 hover:text-white hover:bg-white/10'
                            : 'text-black/60 hover:text-black hover:bg-black/5'
                            }`}
                    >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">Back to Home</span>
                    </Link>

                    {title && (
                        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {title}
                        </h1>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className={`rounded-3xl p-8 md:p-10 border relative overflow-hidden ${isDark
                    ? 'glass-card'
                    : 'bg-white border-black/5 shadow-lg'
                    }`}>
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default PageWrapper;
