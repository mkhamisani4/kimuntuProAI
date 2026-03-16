'use client';

import { useMemo } from 'react';
import Onboarding from '@/src/views/Onboarding';
import { useTheme } from '@/components/providers/ThemeProvider';
import { BarChart, Users, TrendingUp, FileText, Brain, Zap } from 'lucide-react';

export default function OnboardingPage() {
    const { isDark } = useTheme();

    const background = useMemo(() => (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Aurora blobs */}
            <div
                className={`absolute w-[500px] h-[500px] rounded-full blur-[120px] animate-aurora ${isDark ? 'bg-emerald-600/10' : 'bg-emerald-400/8'}`}
                style={{ top: '5%', left: '15%' }}
            />
            <div
                className={`absolute w-[400px] h-[400px] rounded-full blur-[100px] animate-aurora-slow ${isDark ? 'bg-teal-600/8' : 'bg-teal-400/6'}`}
                style={{ bottom: '10%', right: '10%', animationDelay: '4s' }}
            />

            {/* Skeleton dashboard preview */}
            <div className="absolute inset-0 p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-black/[0.02] border border-black/5'}`}>
                        <div className={`h-8 w-64 rounded-lg mb-4 ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                        <div className={`h-4 w-full max-w-xl rounded ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'}`} />
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
                                className={`rounded-2xl p-6 ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-black/[0.02] border border-black/5'}`}
                            >
                                <item.icon className={`w-8 h-8 mb-4 ${isDark ? 'text-white/20' : 'text-black/20'}`} />
                                <div className={`h-6 w-24 rounded-lg mb-2 ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                                <div className={`h-4 w-16 rounded ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'}`} />
                            </div>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`col-span-2 rounded-2xl p-6 ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-black/[0.02] border border-black/5'}`}>
                            <div className={`h-6 w-48 rounded-lg mb-6 ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`h-16 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'}`} />
                                ))}
                            </div>
                        </div>
                        <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-black/[0.02] border border-black/5'}`}>
                            <div className={`h-6 w-32 rounded-lg mb-6 ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`h-12 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ), [isDark]);

    return (
        <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'} relative overflow-hidden`}>
            {background}
            <Onboarding key="onboarding-stable" />
        </div>
    );
}
