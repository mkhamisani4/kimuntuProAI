'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Target, Zap, TrendingUp, Scale, Briefcase, Users, BookOpen, Sparkles, Lock, Globe, Palette, Bot } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/hooks/useAuth';
import { canAccessPath, getPlanLabel, getRouteFeature } from '@/lib/accessControl';

export default function DashboardPage() {
    const { isDark } = useTheme();
    const { t } = useLanguage();
    const { user, profile, features, loading } = useAuth();
    const [overview, setOverview] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function loadOverview() {
            if (!user) return;
            setStatsLoading(true);
            try {
                const token = await user.getIdToken();
                const res = await fetch('/api/dashboard/overview', {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                });
                const data = await res.json().catch(() => ({}));
                if (!cancelled && res.ok) setOverview(data.stats || null);
            } catch {
                if (!cancelled) setOverview(null);
            } finally {
                if (!cancelled) setStatsLoading(false);
            }
        }
        loadOverview();
        return () => { cancelled = true; };
    }, [user]);

    const formatNumber = (value) => {
        if (statsLoading) return '...';
        return Number(value || 0).toLocaleString();
    };

    const progressWidth = (value, max = 25) => {
        if (statsLoading) return '18%';
        const pct = Math.max(8, Math.min(100, Math.round(((value || 0) / max) * 100)));
        return `${pct}%`;
    };

    const stats = [
        {
            label: t.documentsCreated,
            value: formatNumber(overview?.documentsCreated),
            width: progressWidth(overview?.documentsCreated, 20),
            icon: FileText,
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            label: t.jobMatches,
            value: formatNumber(overview?.jobMatches),
            width: progressWidth(overview?.jobMatches, 50),
            icon: Target,
            gradient: 'from-emerald-500 to-teal-500',
        },
        {
            label: t.aiQueries,
            value: formatNumber(overview?.aiQueries),
            width: progressWidth(overview?.aiQueries, 100),
            icon: Zap,
            gradient: 'from-violet-500 to-purple-500',
        },
    ];

    const actions = [
        { title: 'Resume Builder', desc: 'Tailor resumes and cover letters', icon: FileText, href: '/dashboard/career', gradient: 'from-emerald-500 to-teal-500', iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
        { title: 'Job Matching', desc: 'Find matched opportunities', icon: Briefcase, href: '/dashboard/career/job-matching', gradient: 'from-amber-500 to-orange-500', iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10' },
        { title: 'Interview Coach', desc: 'Practice with AI feedback', icon: Users, href: '/dashboard/career/interview', gradient: 'from-pink-500 to-rose-500', iconColor: 'text-pink-400', iconBg: 'bg-pink-500/10' },
        { title: 'Business AI Assistant', desc: 'Generate plans and analysis', icon: Bot, href: '/dashboard/business/ai-assistant', gradient: 'from-blue-500 to-cyan-500', iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10' },
        { title: 'Website Builder', desc: 'Create AI business websites', icon: Globe, href: '/dashboard/business/websites/new', gradient: 'from-teal-500 to-emerald-500', iconColor: 'text-teal-400', iconBg: 'bg-teal-500/10' },
        { title: 'Logo Studio', desc: 'Design and edit brand logos', icon: Palette, href: '/dashboard/business/logo-studio', gradient: 'from-fuchsia-500 to-pink-500', iconColor: 'text-fuchsia-400', iconBg: 'bg-fuchsia-500/10' },
        { title: 'Legal Document Analyzer', desc: 'Review legal documents with AI', icon: BookOpen, href: '/dashboard/legal/document-analyzer', gradient: 'from-indigo-500 to-blue-500', iconColor: 'text-indigo-400', iconBg: 'bg-indigo-500/10' },
        { title: 'Immigration Assistant', desc: 'Prepare immigration questions', icon: Scale, href: '/dashboard/legal/immigration', gradient: 'from-violet-500 to-purple-500', iconColor: 'text-violet-400', iconBg: 'bg-violet-500/10' },
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
                                <div className={`bg-gradient-to-r ${stat.gradient} h-full rounded-full transition-all`} style={{ width: stat.width }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {actions.map((action, i) => {
                        const locked = !loading && !canAccessPath(action.href, profile, features);
                        const feature = getRouteFeature(action.href, features);
                        const required = (feature?.requiredPlans || []).map(getPlanLabel).join(' or ');
                        const card = (
                            <div
                                className={`group rounded-2xl p-6 text-left transition-all duration-300 overflow-hidden relative border ${
                                    locked
                                        ? isDark
                                            ? 'bg-white/[0.02] border-white/5 opacity-55 grayscale cursor-not-allowed'
                                            : 'bg-gray-50 border-black/5 opacity-60 grayscale cursor-not-allowed'
                                        : isDark
                                            ? 'glass-card hover:bg-white/[0.08] cursor-pointer card-hover border-transparent'
                                            : 'bg-white border-black/5 shadow-sm hover:shadow-lg cursor-pointer card-hover'
                                }`}
                                title={locked ? `Locked. Requires ${required || 'an upgraded plan'}.` : action.title}
                            >
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            {locked && (
                                <div className={`absolute top-4 right-4 rounded-full p-2 ${isDark ? 'bg-white/10 text-white/60' : 'bg-black/5 text-black/50'}`}>
                                    <Lock className="w-4 h-4" />
                                </div>
                            )}
                            <div className={`w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border ${isDark ? 'border-white/10' : 'border-black/5'}`}>
                                <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                            </div>
                            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                {action.title}
                            </h3>
                            <p className={`text-sm mb-4 ${isDark ? 'text-white/50' : 'text-black'}`}>
                                {action.desc}
                            </p>
                            <div className={`flex items-center text-sm font-medium ${
                                locked
                                    ? isDark ? 'text-white/35' : 'text-black/35'
                                    : isDark ? 'text-emerald-400' : 'text-emerald-600'
                            }`}>
                                {locked ? `Requires ${required || 'upgrade'}` : t.getStarted}
                                {locked ? <Lock className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />}
                            </div>
                            </div>
                        );
                        return locked ? <div key={i}>{card}</div> : <Link key={i} href={action.href}>{card}</Link>;
                    })}
                </div>
            </div>
        </div>
    );
}
