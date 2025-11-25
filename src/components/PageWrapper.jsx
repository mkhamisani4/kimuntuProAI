import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { navigateTo } from '../utils/router';
import Footer from './Footer';

/**
 * Reusable wrapper component for all footer/static pages
 * Provides consistent layout, navigation, and styling
 */
const PageWrapper = ({ title, children }) => {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen transition-all duration-500 ${isDark
                ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
                : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
            }`}>
            {/* Navigation Header */}
            <div className={`sticky top-0 z-40 backdrop-blur-2xl border-b ${isDark
                    ? 'bg-black/40 border-white/10'
                    : 'bg-white/30 border-gray-200'
                }`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigateTo('/')}
                            className={`p-2 rounded-lg transition-all ${isDark
                                    ? 'hover:bg-white/10 text-gray-300 hover:text-white'
                                    : 'hover:bg-white/50 text-gray-600 hover:text-gray-900'
                                }`}
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {title}
                        </h1>
                    </div>
                    <button
                        onClick={() => navigateTo('/')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                : 'bg-white/60 hover:bg-white border border-gray-200 text-gray-900'
                            }`}
                    >
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">Home</span>
                    </button>
                </div>
            </div>

            {/* Page Content */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className={`rounded-3xl p-8 md:p-12 ${isDark
                        ? 'bg-white/5 backdrop-blur-2xl border border-white/10'
                        : 'bg-white/60 backdrop-blur-2xl border border-gray-200'
                    }`}>
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 rounded-3xl ${isDark
                            ? 'bg-gradient-to-br from-white/5 via-transparent to-transparent'
                            : 'bg-gradient-to-br from-white/40 via-transparent to-transparent'
                        } pointer-events-none`}></div>

                    {/* Content */}
                    <div className={`relative z-10 prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''
                        }`}>
                        {children}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default PageWrapper;
