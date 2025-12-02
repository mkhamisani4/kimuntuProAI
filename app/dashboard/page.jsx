'use client';

import React from 'react';
import { ChevronRight, FileText, Target, Zap, TrendingUp, Scale, Briefcase, Users, BookOpen } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function DashboardPage() {
    const { isDark } = useTheme();

    const stats = [
        { label: 'Documents Created', value: '12', icon: FileText, color: isDark ? 'bg-blue-500' : 'bg-blue-400' },
        { label: 'Job Matches', value: '48', icon: Target, color: isDark ? 'bg-purple-500' : 'bg-purple-400' },
        { label: 'AI Queries', value: '156', icon: Zap, color: isDark ? 'bg-pink-500' : 'bg-pink-400' },
    ];

    const actions = [
        {
            title: 'Create CV/Resume',
            desc: 'AI-powered resume builder',
            icon: FileText,
            bg: isDark ? 'bg-purple-500/10' : 'bg-purple-100',
            border: isDark ? 'border-purple-500/30' : 'border-purple-300',
            text: isDark ? 'text-purple-400' : 'text-purple-600'
        },
        {
            title: 'Business Plan',
            desc: 'Generate comprehensive plans',
            icon: TrendingUp,
            bg: isDark ? 'bg-blue-500/10' : 'bg-blue-100',
            border: isDark ? 'border-blue-500/30' : 'border-blue-300',
            text: isDark ? 'text-blue-400' : 'text-blue-600'
        },
        {
            title: 'Legal Assistant',
            desc: 'Get legal guidance',
            icon: Scale,
            bg: isDark ? 'bg-pink-500/10' : 'bg-pink-100',
            border: isDark ? 'border-pink-500/30' : 'border-pink-300',
            text: isDark ? 'text-pink-400' : 'text-pink-600'
        },
        {
            title: 'Job Matching',
            desc: 'Find perfect opportunities',
            icon: Briefcase,
            bg: isDark ? 'bg-orange-500/10' : 'bg-orange-100',
            border: isDark ? 'border-orange-500/30' : 'border-orange-300',
            text: isDark ? 'text-orange-400' : 'text-orange-600'
        },
        {
            title: 'Interview Prep',
            desc: 'Practice with AI coach',
            icon: Users,
            bg: isDark ? 'bg-teal-500/10' : 'bg-teal-100',
            border: isDark ? 'border-teal-500/30' : 'border-teal-300',
            text: isDark ? 'text-teal-400' : 'text-teal-600'
        },
        {
            title: 'Document Review',
            desc: 'AI contract analysis',
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
                    Dashboard Overview
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className={`relative group ${isDark
                                ? 'bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10'
                                : 'bg-white/60 backdrop-blur-xl border border-gray-200 hover:bg-white/80'
                                } rounded-2xl p-6 transition-all duration-300 shadow-lg`}
                        >
                            <div className={`absolute inset-0 rounded-2xl ${isDark
                                ? 'bg-gradient-to-br from-white/10 via-transparent to-transparent'
                                : 'bg-gradient-to-br from-white/40 via-transparent to-transparent'
                                } pointer-events-none`}></div>

                            <div className="relative z-10">
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
                            className={`group relative ${action.bg} backdrop-blur-xl border ${action.border} rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg`}
                        >
                            <div className={`absolute inset-0 rounded-2xl ${isDark
                                ? 'bg-gradient-to-br from-white/5 via-transparent to-transparent'
                                : 'bg-gradient-to-br from-white/30 via-transparent to-transparent'
                                } pointer-events-none`}></div>

                            <div className="relative z-10">
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
                                    Get Started
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
