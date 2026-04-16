'use client';

import React from 'react';
import { ChevronRight, FileText, Target, Zap, TrendingUp, Scale, Briefcase, Users, BookOpen, Sparkles } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function DashboardPage() {
    const { isDark } = useTheme();
    const { t } = useLanguage();

    const stats = [
        { label: t.documentsCreated, value: '12', icon: FileText, gradient: 'from-blue-500 to-cyan-500' },
        { label: t.jobMatches, value: '48', icon: Target, gradient: 'from-emerald-500 to-teal-500' },
        { label: t.aiQueries, value: '156', icon: Zap, gradient: 'from-violet-500 to-purple-500' },
    ];

    const actions = [
        { title: t.createCvResume, desc: t.cvResumeDesc, icon: FileText, gradient: 'from-emerald-500 to-teal-500', iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
        { title: t.businessPlan, desc: t.businessPlanDesc, icon: TrendingUp, gradient: 'from-blue-500 to-cyan-500', iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10' },
        { title: t.legalAssistant, desc: t.legalAssistantDesc, icon: Scale, gradient: 'from-violet-500 to-purple-500', iconColor: 'text-violet-400', iconBg: 'bg-violet-500/10' },
        { title: t.jobMatching, desc: t.jobMatchingDesc, icon: Briefcase, gradient: 'from-amber-500 to-orange-500', iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10' },
        { title: t.interviewPrep, desc: t.interviewPrepDesc, icon: Users, gradient: 'from-pink-500 to-rose-500', iconColor: 'text-pink-400', iconBg: 'bg-pink-500/10' },
        { title: t.documentReview, desc: t.documentReviewDesc, icon: BookOpen, gradient: 'from-indigo-500 to-blue-500', iconColor: 'text-indigo-400', iconBg: 'bg-indigo-500/10' },
    ];

    return (
        <div>
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-8">
                    <Sparkles className={`w-7 h-7 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t.dashboardOverview}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className={`rounded-2xl p-6 transition-all card-hover ${isDark
                                ? 'glass-card hover:bg-white/[0.08]'
                                : 'bg-white border border-black/5 shadow-sm hover:shadow-lg'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className={`text-sm mb-2 ${isDark ? 'text-white/50' : 'text-black'}`}>
                                        {stat.label}
                                    </p>
                                    <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                                    <stat.icon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                            </div>
                            <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                                <div className={`bg-gradient-to-r ${stat.gradient} h-full w-3/4 rounded-full`} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {actions.map((action, i) => (
                        <div
                            key={i}
                            className={`group rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer card-hover overflow-hidden relative ${isDark
                                ? 'glass-card hover:bg-white/[0.08]'
                                : 'bg-white border border-black/5 shadow-sm hover:shadow-lg'
                            }`}
                        >
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className={`w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border ${isDark ? 'border-white/10' : 'border-black/5'}`}>
                                <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                            </div>
                            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                {action.title}
                            </h3>
                            <p className={`text-sm mb-4 ${isDark ? 'text-white/50' : 'text-black'}`}>
                                {action.desc}
                            </p>
                            <div className={`flex items-center text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                {t.getStarted}
                                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
