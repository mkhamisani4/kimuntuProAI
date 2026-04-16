'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
    FileText,
    Shield,
    Scale,
    Globe,
    Users,
    Briefcase,
    BadgeDollarSign,
    Gavel,
    ArrowRight,
    Sparkles,
    Bot,
    ChevronRight
} from 'lucide-react';
import { useAIAvatar, AIAvatar } from '@/components/AIAvatarCustomizer';
import { getLegalServices, getLegalAssistants } from '@/lib/legalAgents';

const SERVICE_ICONS = {
    Globe,
    FileText,
    Briefcase,
    Shield,
    Users,
    BadgeDollarSign,
    Gavel,
    Scale,
};

const ASSISTANT_BORDER_CLASSES = {
    blue: {
        dark: 'border-blue-500/25',
        light: 'border-blue-200/80',
    },
    purple: {
        dark: 'border-purple-500/25',
        light: 'border-purple-200/80',
    },
    amber: {
        dark: 'border-amber-500/25',
        light: 'border-amber-200/80',
    },
    pink: {
        dark: 'border-pink-500/25',
        light: 'border-pink-200/80',
    },
    emerald: {
        dark: 'border-emerald-500/25',
        light: 'border-emerald-200/80',
    },
    teal: {
        dark: 'border-teal-500/25',
        light: 'border-teal-200/80',
    },
    indigo: {
        dark: 'border-indigo-500/25',
        light: 'border-indigo-200/80',
    },
    slate: {
        dark: 'border-slate-500/25',
        light: 'border-slate-200/80',
    },
};

function AssistantAvatar({ assistantId }) {
    const { config } = useAIAvatar(assistantId);
    return <AIAvatar config={config} size="lg" className="shrink-0 transition-transform duration-300 group-hover:scale-105" />;
}

export default function LegalTrackPage() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { t } = useLanguage();

    const colorClasses = {
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
        emerald: {
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
        amber: {
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
        },
        slate: {
            bg: isDark
                ? 'bg-slate-500/8 border-slate-500/20 hover:bg-slate-500/15 hover:border-slate-400/35'
                : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100/80 hover:border-slate-300/80',
            text: isDark ? 'text-slate-300' : 'text-slate-700',
            icon: isDark ? 'text-slate-300' : 'text-slate-600',
            iconBg: isDark ? 'bg-slate-500/15' : 'bg-slate-100',
            glow: isDark ? 'hover:shadow-slate-500/10' : 'hover:shadow-slate-200/60'
        }
    };

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
                                    {t.legal_aiPlatform}
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
                            {t.legal_aiPowered}
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-3 mt-8">
                        {[
                            { label: t.legal_legalAreas, value: '8' },
                            { label: t.legal_activeAssistants, value: '8' },
                            { label: t.legal_jurisdictions, value: 'US & CA' }
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
                        {t.legal_legalServices}
                    </span>
                    <div className={`h-px flex-1 ${isDark ? 'bg-gray-800/80' : 'bg-gray-200'}`} />
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {getLegalServices(t).map((service) => {
                        const colors = colorClasses[service.color] || colorClasses.indigo;
                        const Icon = SERVICE_ICONS[service.icon] || Scale;

                        return (
                            <button
                                key={service.id}
                                onClick={() => router.push(service.path)}
                                className={`${colors.bg} border rounded-2xl p-5 text-left transition-all duration-300 group relative overflow-hidden ${
                                    `cursor-pointer hover:shadow-xl ${colors.glow} hover:-translate-y-1 active:translate-y-0`
                                }`}
                            >
                                {/* Top row: icon + badge */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                                        <Icon className={`w-5 h-5 ${colors.icon}`} />
                                    </div>
                                    {service.badge && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${isDark
                                            ? 'bg-white/10 text-white/75 border border-white/10'
                                            : 'bg-white/70 text-gray-700 border border-gray-200'
                                        }`}>
                                            {service.badge}
                                        </span>
                                    )}
                                </div>

                                <h3 className={`text-sm font-bold mb-1.5 ${colors.text}`}>
                                    {service.title}
                                </h3>

                                <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {service.description}
                                </p>

                                <div className="flex items-center gap-1">
                                    <span className={`text-xs font-semibold ${colors.text}`}>{t.legal_openAssistant}</span>
                                    <ArrowRight className={`w-3 h-3 ${colors.icon} transition-transform duration-300 group-hover:translate-x-1`} />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* ── AI Assistants Section ──────────────────── */}
                <div className="mt-14">
                    <div className="mb-6 flex items-center gap-3">
                        <Bot className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-[11px] font-bold uppercase tracking-[0.16em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {t.legal_aiAssistants}
                        </span>
                        <div className={`h-px flex-1 ${isDark ? 'bg-gray-800/80' : 'bg-gray-200'}`} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:grid-cols-3">
                        {getLegalAssistants(t).map((assistant) => {
                            const borderColor = ASSISTANT_BORDER_CLASSES[assistant.borderColor] || ASSISTANT_BORDER_CLASSES.slate;

                            return (
                                <div
                                    key={assistant.id}
                                    className={`rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 group border ${isDark ? borderColor.dark : borderColor.light} ${isDark
                                        ? 'bg-gray-900/80 backdrop-blur-sm'
                                        : 'bg-white shadow-sm shadow-gray-200/80'
                                    }`}
                                >
                                    {/* Vivid gradient accent strip */}
                                    <div className={`h-[3px] bg-gradient-to-r ${assistant.accentFrom} ${assistant.accentTo}`} />

                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            <AssistantAvatar assistantId={assistant.id} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    {assistant.eyebrow}
                                                </p>
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
                                                    {t.legal_tryAssistant}
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
                                {t.legal_disclaimer}
                            </h4>
                            <p className={`text-xs leading-relaxed ${isDark ? 'text-indigo-300/60' : 'text-indigo-700/70'}`}>
                                {t.legal_disclaimerText}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
