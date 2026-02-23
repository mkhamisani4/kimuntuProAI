'use client';

import React from 'react';
import { ChevronRight, FileText, Target, Zap, TrendingUp, Scale, Briefcase, Users, BookOpen } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function DashboardPage() {
    const { isDark } = useTheme();
    const { t } = useLanguage();

    const stats = [
        { label: t.documentsCreated, value: '12', icon: FileText, color: isDark ? 'bg-white' : 'bg-black' },
        { label: t.jobMatches, value: '48', icon: Target, color: isDark ? 'bg-white' : 'bg-black' },
        { label: t.aiQueries, value: '156', icon: Zap, color: isDark ? 'bg-white' : 'bg-black' },
    ];

    const actions = [
        {
            title: t.createCvResume,
            desc: t.cvResumeDesc,
            icon: FileText,
            bg: isDark ? 'bg-white/5' : 'bg-black/5',
            border: isDark ? 'border-white/10' : 'border-black/10',
            text: isDark ? 'text-white' : 'text-black'
        },
        {
            title: t.businessPlan,
            desc: t.businessPlanDesc,
            icon: TrendingUp,
            bg: isDark ? 'bg-white/5' : 'bg-black/5',
            border: isDark ? 'border-white/10' : 'border-black/10',
            text: isDark ? 'text-white' : 'text-black'
        },
        {
            title: t.legalAssistant,
            desc: t.legalAssistantDesc,
            icon: Scale,
            bg: isDark ? 'bg-white/5' : 'bg-black/5',
            border: isDark ? 'border-white/10' : 'border-black/10',
            text: isDark ? 'text-white' : 'text-black'
        },
        {
            title: t.jobMatching,
            desc: t.jobMatchingDesc,
            icon: Briefcase,
            bg: isDark ? 'bg-white/5' : 'bg-black/5',
            border: isDark ? 'border-white/10' : 'border-black/10',
            text: isDark ? 'text-white' : 'text-black'
        },
        {
            title: t.interviewPrep,
            desc: t.interviewPrepDesc,
            icon: Users,
            bg: isDark ? 'bg-white/5' : 'bg-black/5',
            border: isDark ? 'border-white/10' : 'border-black/10',
            text: isDark ? 'text-white' : 'text-black'
        },
        {
            title: t.documentReview,
            desc: t.documentReviewDesc,
            icon: BookOpen,
            bg: isDark ? 'bg-white/5' : 'bg-black/5',
            border: isDark ? 'border-white/10' : 'border-black/10',
            text: isDark ? 'text-white' : 'text-black'
        },
    ];

    return (
        <div>
            <div className="mb-10">
                <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.dashboardOverview}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className={`relative group ${isDark
                                ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                                : 'bg-black/5 border border-black/10 hover:bg-black/10'
                                } rounded-2xl p-6 transition-all duration-300 shadow-lg`}
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className={`text-sm mb-2 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                            {stat.label}
                                        </p>
                                        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                            {stat.value}
                                        </p>
                                    </div>
                                    <stat.icon className={`w-8 h-8 opacity-50 ${isDark ? 'text-white' : 'text-black'
                                        }`} />
                                </div>
                                <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-white/20' : 'bg-black/20'
                                    }`}>
                                    <div className={`${stat.color} h-full w-3/4`}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {actions.map((action, i) => (
                        <div
                            key={i}
                            className={`group relative ${action.bg} border ${action.border} rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg`}
                        >
                            <div>
                                <div className={`w-12 h-12 ${isDark ? 'bg-white/10' : 'bg-black/10'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                                    <action.icon className={`w-6 h-6 ${action.text}`} />
                                </div>
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                    {action.title}
                                </h3>
                                <p className={`text-sm mb-4 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                    {action.desc}
                                </p>
                                <div className={`flex items-center ${action.text} text-sm font-medium`}>
                                    {t.getStarted}
                                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
