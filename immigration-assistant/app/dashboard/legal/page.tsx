'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
    FileText,
    FileCheck,
    Shield,
    Scale,
    Globe,
    Users,
    Briefcase,
    ArrowRight,
    Sparkles,
    Bot,
    ChevronRight
} from 'lucide-react';
import { useAIAvatar, AIAvatar } from '@/components/AIAvatarCustomizer';

export default function LegalTrackPage() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { t } = useLanguage();

    const { config: immigrationAvatar } = useAIAvatar('immigration');
    const { config: businessAvatar } = useAIAvatar('business');
    const { config: contractsAvatar } = useAIAvatar('contracts');
    const { config: consumerAvatar } = useAIAvatar('consumer');

    const avatarConfigs: Record<string, any> = {
        immigration: immigrationAvatar,
        business: businessAvatar,
        contracts: contractsAvatar,
        consumer: consumerAvatar,
    };

    const legalServices = [
        {
            id: 'immigration',
            icon: Globe,
            title: 'Immigration Law',
            description: 'US & Canada immigration guidance, visa information, and process assistance',
            path: '/dashboard/legal/immigration',
            color: 'blue',
            new: true
        },
        {
            id: 'family',
            icon: Users,
            title: 'Family Law',
            description: 'Family legal matters, custody, divorce, and domestic relations',
            path: '/dashboard/legal/family',
            color: 'purple',
            comingSoon: true
        },
        {
            id: 'contract',
            icon: FileText,
            title: 'Contract Review',
            description: 'AI-powered contract analysis and risk assessment',
            path: '/dashboard/legal/contracts',
            color: 'pink'
        },
        {
            id: 'business',
            icon: Briefcase,
            title: 'Business Law',
            description: 'Business formation, corporate compliance, and commercial law guidance',
            path: '/dashboard/legal/business',
            color: 'yellow'
        },
        {
            id: 'consumer',
            icon: Shield,
            title: 'Consumer Law',
            description: 'Consumer rights, warranty disputes, and fraud protection',
            path: '/dashboard/legal/consumer',
            color: 'green'
        },
        {
            id: 'templates',
            icon: FileCheck,
            title: 'Legal Templates',
            description: 'Professional legal document templates',
            path: '/dashboard/legal/templates',
            color: 'teal',
            comingSoon: true
        },
        {
            id: 'compliance',
            icon: Shield,
            title: 'Compliance Check',
            description: 'GDPR, CCPA, and regulatory compliance verification',
            path: '/dashboard/legal/compliance',
            color: 'yellow',
            comingSoon: true
        },
        {
            id: 'document',
            icon: Scale,
            title: 'Document Drafting',
            description: 'AI-assisted legal document creation',
            path: '/dashboard/legal/drafting',
            color: 'indigo',
            comingSoon: true
        }
    ];

    const colorClasses: Record<string, any> = {
        blue: {
            bg: isDark
                ? 'bg-blue-500/8 border-blue-500/20 hover:bg-blue-500/15 hover:border-blue-400/35'
                : 'bg-blue-50 border-blue-200/70 hover:bg-blue-100/80 hover:border-blue-300/80',
            text: isDark ? 'text-blue-400' : 'text-blue-700',
            icon: isDark ? 'text-blue-400' : 'text-blue-600',
            iconBg: isDark ? 'bg-blue-500/15' : 'bg-blue-100',
            glow: isDark ? 'hover:shadow-blue-500/10' : 'hover:shadow-blue-200/60'
        },
        purple: {
            bg: isDark
                ? 'bg-purple-500/8 border-purple-500/20 hover:bg-purple-500/15 hover:border-purple-400/35'
                : 'bg-purple-50 border-purple-200/70 hover:bg-purple-100/80 hover:border-purple-300/80',
            text: isDark ? 'text-purple-400' : 'text-purple-700',
            icon: isDark ? 'text-purple-400' : 'text-purple-600',
            iconBg: isDark ? 'bg-purple-500/15' : 'bg-purple-100',
            glow: isDark ? 'hover:shadow-purple-500/10' : 'hover:shadow-purple-200/60'
        },
        pink: {
            bg: isDark
                ? 'bg-pink-500/8 border-pink-500/20 hover:bg-pink-500/15 hover:border-pink-400/35'
                : 'bg-pink-50 border-pink-200/70 hover:bg-pink-100/80 hover:border-pink-300/80',
            text: isDark ? 'text-pink-400' : 'text-pink-700',
            icon: isDark ? 'text-pink-400' : 'text-pink-600',
            iconBg: isDark ? 'bg-pink-500/15' : 'bg-pink-100',
            glow: isDark ? 'hover:shadow-pink-500/10' : 'hover:shadow-pink-200/60'
        },
        green: {
            bg: isDark
                ? 'bg-emerald-500/8 border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-400/35'
                : 'bg-emerald-50 border-emerald-200/70 hover:bg-emerald-100/80 hover:border-emerald-300/80',
            text: isDark ? 'text-emerald-400' : 'text-emerald-700',
            icon: isDark ? 'text-emerald-400' : 'text-emerald-600',
            iconBg: isDark ? 'bg-emerald-500/15' : 'bg-emerald-100',
            glow: isDark ? 'hover:shadow-emerald-500/10' : 'hover:shadow-emerald-200/60'
        },
        teal: {
            bg: isDark
                ? 'bg-teal-500/8 border-teal-500/20 hover:bg-teal-500/15 hover:border-teal-400/35'
                : 'bg-teal-50 border-teal-200/70 hover:bg-teal-100/80 hover:border-teal-300/80',
            text: isDark ? 'text-teal-400' : 'text-teal-700',
            icon: isDark ? 'text-teal-400' : 'text-teal-600',
            iconBg: isDark ? 'bg-teal-500/15' : 'bg-teal-100',
            glow: isDark ? 'hover:shadow-teal-500/10' : 'hover:shadow-teal-200/60'
        },
        yellow: {
            bg: isDark
                ? 'bg-amber-500/8 border-amber-500/20 hover:bg-amber-500/15 hover:border-amber-400/35'
                : 'bg-amber-50 border-amber-200/70 hover:bg-amber-100/80 hover:border-amber-300/80',
            text: isDark ? 'text-amber-400' : 'text-amber-700',
            icon: isDark ? 'text-amber-400' : 'text-amber-600',
            iconBg: isDark ? 'bg-amber-500/15' : 'bg-amber-100',
            glow: isDark ? 'hover:shadow-amber-500/10' : 'hover:shadow-amber-200/60'
        },
        indigo: {
            bg: isDark
                ? 'bg-indigo-500/8 border-indigo-500/20 hover:bg-indigo-500/15 hover:border-indigo-400/35'
                : 'bg-indigo-50 border-indigo-200/70 hover:bg-indigo-100/80 hover:border-indigo-300/80',
            text: isDark ? 'text-indigo-400' : 'text-indigo-700',
            icon: isDark ? 'text-indigo-400' : 'text-indigo-600',
            iconBg: isDark ? 'bg-indigo-500/15' : 'bg-indigo-100',
            glow: isDark ? 'hover:shadow-indigo-500/10' : 'hover:shadow-indigo-200/60'
        }
    };

    const lawAssistants = [
        {
            id: 'immigration',
            icon: Globe,
            title: 'Immigration Law Assistant',
            description: 'Expert guidance on US and Canadian immigration law, visas, work permits, permanent residence, and citizenship.',
            path: '/dashboard/legal/immigration',
            accentFrom: 'from-blue-500',
            accentTo: 'to-indigo-600',
            borderColor: isDark ? 'border-blue-500/25' : 'border-blue-200/80',
            iconBg: isDark ? 'bg-blue-500/15' : 'bg-blue-100',
            iconColor: isDark ? 'text-blue-400' : 'text-blue-600',
            buttonBg: 'bg-blue-600 hover:bg-blue-500',
            buttonShadow: 'shadow-blue-600/30 hover:shadow-blue-500/40'
        },
        {
            id: 'business',
            icon: Briefcase,
            title: 'Business Law Assistant',
            description: 'Guidance on business formation, corporate compliance, intellectual property, employment law, and commercial regulations.',
            path: '/dashboard/legal/business',
            accentFrom: 'from-amber-500',
            accentTo: 'to-orange-500',
            borderColor: isDark ? 'border-amber-500/25' : 'border-amber-200/80',
            iconBg: isDark ? 'bg-amber-500/15' : 'bg-amber-100',
            iconColor: isDark ? 'text-amber-400' : 'text-amber-600',
            buttonBg: 'bg-amber-600 hover:bg-amber-500',
            buttonShadow: 'shadow-amber-600/30 hover:shadow-amber-500/40'
        },
        {
            id: 'contracts',
            icon: FileText,
            title: 'Contract Law Assistant',
            description: 'AI-powered contract analysis, risk assessment, and guidance on contract terms, negotiations, and legal implications.',
            path: '/dashboard/legal/contracts',
            accentFrom: 'from-pink-500',
            accentTo: 'to-rose-500',
            borderColor: isDark ? 'border-pink-500/25' : 'border-pink-200/80',
            iconBg: isDark ? 'bg-pink-500/15' : 'bg-pink-100',
            iconColor: isDark ? 'text-pink-400' : 'text-pink-600',
            buttonBg: 'bg-pink-600 hover:bg-pink-500',
            buttonShadow: 'shadow-pink-600/30 hover:shadow-pink-500/40'
        },
        {
            id: 'consumer',
            icon: Shield,
            title: 'Consumer Law Assistant',
            description: 'Help with consumer rights, warranty disputes, fraud protection, debt collection, and product liability issues.',
            path: '/dashboard/legal/consumer',
            accentFrom: 'from-emerald-500',
            accentTo: 'to-teal-500',
            borderColor: isDark ? 'border-emerald-500/25' : 'border-emerald-200/80',
            iconBg: isDark ? 'bg-emerald-500/15' : 'bg-emerald-100',
            iconColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
            buttonBg: 'bg-emerald-600 hover:bg-emerald-500',
            buttonShadow: 'shadow-emerald-600/30 hover:shadow-emerald-500/40'
        }
    ];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-[#f5f7fb]'}`}>

            {/* ── Hero Header ─────────────────────────────── */}
            <div className={`relative overflow-hidden ${isDark
                ? 'bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900'
                : 'bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-800'
            }`}>
                {/* Decorative blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl" />
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-purple-400/10 blur-3xl" />
                    {/* Subtle dot grid */}
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '28px 28px'
                        }}
                    />
                </div>

                <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-10 pb-14">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-5">
                            {/* Icon badge */}
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shrink-0 ${isDark
                                ? 'bg-white/10 backdrop-blur-sm border border-white/20'
                                : 'bg-white/25 backdrop-blur-sm border border-white/40'
                            }`}>
                                <Scale className="w-7 h-7 text-white drop-shadow" />
                            </div>
                            <div>
                                <p className={`text-xs font-semibold uppercase tracking-[0.18em] mb-1 ${isDark ? 'text-indigo-300/70' : 'text-indigo-100/80'}`}>
                                    AI Legal Platform
                                </p>
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight"
                                    style={{ fontFamily: 'var(--font-dm-serif, Georgia, serif)' }}>
                                    {t.legalTrackTitle || 'Legal Track'}
                                </h1>
                                <p className={`mt-1.5 text-sm ${isDark ? 'text-indigo-200/70' : 'text-indigo-100/85'}`}>
                                    {t.legalTrackDesc || 'Comprehensive legal assistance powered by AI'}
                                </p>
                            </div>
                        </div>

                        <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shrink-0 ${isDark
                            ? 'bg-white/10 backdrop-blur-sm border border-white/15 text-white'
                            : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white'
                        }`}>
                            <Sparkles className="w-3.5 h-3.5" />
                            AI-Powered
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-3 mt-8">
                        {[
                            { label: 'Legal Areas', value: '8' },
                            { label: 'Active Assistants', value: '4' },
                            { label: 'Jurisdictions', value: 'US & CA' }
                        ].map((stat) => (
                            <div key={stat.label} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${isDark
                                ? 'bg-white/6 backdrop-blur-sm border border-white/10'
                                : 'bg-white/15 backdrop-blur-sm border border-white/25'
                            }`}>
                                <span className="text-xl font-bold text-white">{stat.value}</span>
                                <span className={`text-xs ${isDark ? 'text-indigo-200/60' : 'text-indigo-100/80'}`}>{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main Content ─────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-5 md:px-10 pt-8 pb-14">

                {/* Section label */}
                <div className="mb-6 flex items-center gap-3">
                    <span className={`text-[11px] font-bold uppercase tracking-[0.16em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Legal Services
                    </span>
                    <div className={`h-px flex-1 ${isDark ? 'bg-gray-800/80' : 'bg-gray-200'}`} />
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {legalServices.map((service) => {
                        const colors = colorClasses[service.color] || colorClasses.indigo;
                        const Icon = service.icon;

                        return (
                            <button
                                key={service.id}
                                onClick={() => !service.comingSoon && router.push(service.path)}
                                disabled={service.comingSoon}
                                className={`${colors.bg} border rounded-2xl p-5 text-left transition-all duration-300 group relative overflow-hidden ${
                                    service.comingSoon
                                        ? 'opacity-45 cursor-not-allowed'
                                        : `cursor-pointer hover:shadow-xl ${colors.glow} hover:-translate-y-1 active:translate-y-0`
                                }`}
                            >
                                {/* Top row: icon + badge */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                                        <Icon className={`w-5 h-5 ${colors.icon}`} />
                                    </div>
                                    {service.new && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${isDark
                                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        }`}>
                                            New
                                        </span>
                                    )}
                                    {service.comingSoon && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${isDark
                                            ? 'bg-gray-700/50 text-gray-500 border border-gray-600/30'
                                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                                        }`}>
                                            Soon
                                        </span>
                                    )}
                                </div>

                                <h3 className={`text-sm font-bold mb-1.5 ${colors.text}`}>
                                    {service.title}
                                </h3>

                                <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {service.description}
                                </p>

                                {!service.comingSoon && (
                                    <div className="flex items-center gap-1">
                                        <span className={`text-xs font-semibold ${colors.text}`}>Get Started</span>
                                        <ArrowRight className={`w-3 h-3 ${colors.icon} transition-transform duration-300 group-hover:translate-x-1`} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── AI Assistants Section ──────────────────── */}
                <div className="mt-14">
                    <div className="mb-6 flex items-center gap-3">
                        <Bot className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-[11px] font-bold uppercase tracking-[0.16em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            AI Law Assistants
                        </span>
                        <div className={`h-px flex-1 ${isDark ? 'bg-gray-800/80' : 'bg-gray-200'}`} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lawAssistants.map((assistant) => {
                            return (
                                <div
                                    key={assistant.id}
                                    className={`rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 group border ${assistant.borderColor} ${isDark
                                        ? 'bg-gray-900/80 backdrop-blur-sm'
                                        : 'bg-white shadow-sm shadow-gray-200/80'
                                    }`}
                                >
                                    {/* Vivid gradient accent strip */}
                                    <div className={`h-[3px] bg-gradient-to-r ${assistant.accentFrom} ${assistant.accentTo}`} />

                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            <AIAvatar
                                                config={avatarConfigs[assistant.id]}
                                                size="lg"
                                                className="shrink-0 transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-base font-bold mb-1.5 leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}
                                                    style={{ fontFamily: 'var(--font-dm-serif, Georgia, serif)' }}>
                                                    {assistant.title}
                                                </h4>
                                                <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {assistant.description}
                                                </p>
                                                <button
                                                    onClick={() => router.push(assistant.path)}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm transition-all duration-200 shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${assistant.buttonBg} ${assistant.buttonShadow}`}
                                                >
                                                    Try Assistant
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Disclaimer ────────────────────────────── */}
                <div className={`mt-10 rounded-2xl p-5 border ${isDark
                    ? 'bg-indigo-950/20 border-indigo-500/15'
                    : 'bg-indigo-50/60 border-indigo-200/50'
                }`}>
                    <div className="flex items-start gap-3">
                        <Shield className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
                        <div>
                            <h4 className={`text-sm font-semibold mb-1 ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>
                                Legal Disclaimer
                            </h4>
                            <p className={`text-xs leading-relaxed ${isDark ? 'text-indigo-300/60' : 'text-indigo-700/70'}`}>
                                All legal tools provide general information only and do not constitute legal advice.
                                For specific legal matters, please consult with a licensed attorney in the relevant jurisdiction.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
