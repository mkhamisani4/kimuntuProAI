'use client';

import { useMemo } from 'react';
import Onboarding from '@/src/views/Onboarding';
import { useTheme } from '@/components/providers/ThemeProvider';
import { BarChart, Users, TrendingUp, FileText } from 'lucide-react';

export default function OnboardingPage() {
    const { isDark } = useTheme();

    // Memoize background to prevent re-renders
    const background = useMemo(() => (
        <div className="absolute inset-0 p-8 pointer-events-none">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className={`rounded-2xl p-6 ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
                }`}>
                    <div className={`h-8 w-64 rounded mb-4 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                    <div className={`h-4 w-full max-w-xl rounded ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { icon: BarChart, label: 'Analytics' },
                        { icon: Users, label: 'Users' },
                        { icon: TrendingUp, label: 'Growth' },
                        { icon: FileText, label: 'Reports' }
                    ].map((item, i) => (
                        <div
                            key={i}
                            className={`rounded-2xl p-6 ${
                                isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
                            }`}
                        >
                            <item.icon className={`w-8 h-8 mb-4 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                            <div className={`h-6 w-24 rounded mb-2 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                            <div className={`h-4 w-16 rounded ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`col-span-2 rounded-2xl p-6 ${
                        isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
                    }`}>
                        <div className={`h-6 w-48 rounded mb-6 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`h-16 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                            ))}
                        </div>
                    </div>
                    <div className={`rounded-2xl p-6 ${
                        isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
                    }`}>
                        <div className={`h-6 w-32 rounded mb-6 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`h-12 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ), [isDark]);

    return (
        <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} relative overflow-hidden`}>
            {background}
            <Onboarding key="onboarding-stable" />
        </div>
    );
}
