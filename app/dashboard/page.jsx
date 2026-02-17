'use client';

import React from 'react';
import { ChevronRight, FileText, Target, Zap, TrendingUp, Scale, Briefcase, Users, BookOpen } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function DashboardPage() {
    const { isDark } = useTheme();
    const { t } = useLanguage();

    const stats = [
        { label: t.documentsCreated, value: '12', icon: FileText, color: isDark ? 'bg-blue-500' : 'bg-blue-400' },
        { label: t.jobMatches, value: '48', icon: Target, color: isDark ? 'bg-purple-500' : 'bg-purple-400' },
        { label: t.aiQueries, value: '156', icon: Zap, color: isDark ? 'bg-pink-500' : 'bg-pink-400' },
    ];

    const actions = [
        {
            title: t.createCvResume,
            desc: t.cvResumeDesc,
            icon: FileText,
            bg: isDark ? 'bg-purple-500/10' : 'bg-purple-100',
            border: isDark ? 'border-purple-500/30' : 'border-purple-300',
            text: isDark ? 'text-purple-400' : 'text-purple-600'
        },
        {
            title: t.businessPlan,
            desc: t.businessPlanDesc,
            icon: TrendingUp,
            bg: isDark ? 'bg-blue-500/10' : 'bg-blue-100',
            border: isDark ? 'border-blue-500/30' : 'border-blue-300',
            text: isDark ? 'text-blue-400' : 'text-blue-600'
        },
        {
            title: t.legalAssistant,
            desc: t.legalAssistantDesc,
            icon: Scale,
            bg: isDark ? 'bg-pink-500/10' : 'bg-pink-100',
            border: isDark ? 'border-pink-500/30' : 'border-pink-300',
            text: isDark ? 'text-pink-400' : 'text-pink-600'
        },
        {
            title: t.jobMatching,
            desc: t.jobMatchingDesc,
            icon: Briefcase,
            bg: isDark ? 'bg-orange-500/10' : 'bg-orange-100',
            border: isDark ? 'border-orange-500/30' : 'border-orange-300',
            text: isDark ? 'text-orange-400' : 'text-orange-600'
        },
        {
            title: t.interviewPrep,
            desc: t.interviewPrepDesc,
            icon: Users,
            bg: isDark ? 'bg-teal-500/10' : 'bg-teal-100',
            border: isDark ? 'border-teal-500/30' : 'border-teal-300',
            text: isDark ? 'text-teal-400' : 'text-teal-600'
        },
        {
            title: t.documentReview,
            desc: t.documentReviewDesc,
            icon: BookOpen,
            bg: isDark ? 'bg-indigo-500/10' : 'bg-indigo-100',
            border: isDark ? 'border-indigo-500/30' : 'border-indigo-300',
            text: isDark ? 'text-indigo-400' : 'text-indigo-600'
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
                                ? 'bg-gray-800/80 border border-gray-700 hover:bg-gray-700'
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                                } rounded-2xl p-6 transition-all duration-300 shadow-lg`}
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {stat.label}
                                        </p>
                                        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {stat.value}
                                        </p>
                                    </div>
                                    <stat.icon className={`w-8 h-8 opacity-50 ${isDark ? 'text-purple-400' : 'text-purple-600'
                                        }`} />
                                </div>
                                <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-300'
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
                                <div className={`w-12 h-12 ${action.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                                    <action.icon className={`w-6 h-6 ${action.text}`} />
                                </div>
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {action.title}
                                </h3>
                                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
