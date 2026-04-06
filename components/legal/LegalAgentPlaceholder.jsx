'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { AIAvatar, useAIAvatar } from '@/components/AIAvatarCustomizer';
import { ArrowLeft, ChevronRight, Clock3, Scale, Sparkles } from 'lucide-react';

const THEMES = {
    blue: {
        hero: 'from-slate-900 via-blue-950/70 to-slate-900',
        badge: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
        panel: 'border-blue-500/20 bg-blue-500/5',
        chip: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
        button: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 hover:shadow-blue-500/40',
    },
    purple: {
        hero: 'from-slate-900 via-purple-950/70 to-slate-900',
        badge: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
        panel: 'border-purple-500/20 bg-purple-500/5',
        chip: 'border-purple-500/20 bg-purple-500/10 text-purple-300',
        button: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30 hover:shadow-purple-500/40',
    },
    amber: {
        hero: 'from-slate-900 via-amber-950/70 to-slate-900',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
        panel: 'border-amber-500/20 bg-amber-500/5',
        chip: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
        button: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30 hover:shadow-amber-500/40',
    },
    pink: {
        hero: 'from-slate-900 via-pink-950/70 to-slate-900',
        badge: 'bg-pink-500/15 text-pink-300 border-pink-400/30',
        panel: 'border-pink-500/20 bg-pink-500/5',
        chip: 'border-pink-500/20 bg-pink-500/10 text-pink-300',
        button: 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/30 hover:shadow-pink-500/40',
    },
    emerald: {
        hero: 'from-slate-900 via-emerald-950/70 to-slate-900',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
        panel: 'border-emerald-500/20 bg-emerald-500/5',
        chip: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
        button: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 hover:shadow-emerald-500/40',
    },
    teal: {
        hero: 'from-slate-900 via-teal-950/70 to-slate-900',
        badge: 'bg-teal-500/15 text-teal-300 border-teal-400/30',
        panel: 'border-teal-500/20 bg-teal-500/5',
        chip: 'border-teal-500/20 bg-teal-500/10 text-teal-300',
        button: 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/30 hover:shadow-teal-500/40',
    },
    indigo: {
        hero: 'from-slate-900 via-indigo-950/70 to-slate-900',
        badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
        panel: 'border-indigo-500/20 bg-indigo-500/5',
        chip: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300',
        button: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 hover:shadow-indigo-500/40',
    },
    slate: {
        hero: 'from-slate-900 via-slate-800 to-slate-950',
        badge: 'bg-slate-500/20 text-slate-200 border-slate-400/20',
        panel: 'border-slate-500/20 bg-slate-500/5',
        chip: 'border-slate-500/20 bg-slate-500/10 text-slate-200',
        button: 'bg-slate-700 hover:bg-slate-600 shadow-slate-700/30 hover:shadow-slate-600/40',
    },
};

export default function LegalAgentPlaceholder({ agent }) {
    const router = useRouter();
    const { isDark } = useTheme();
    const { config } = useAIAvatar(agent.id);
    const theme = THEMES[agent.theme] || THEMES.slate;

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-[#f5f7fb]'}`}>
            <div className={`relative overflow-hidden bg-gradient-to-br ${theme.hero}`}>
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
                <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-8 pb-12">
                    <button
                        onClick={() => router.push('/dashboard/legal')}
                        className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Legal Track
                    </button>

                    <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-center gap-4">
                            <AIAvatar config={config} size="lg" className="shrink-0" />
                            <div>
                                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${theme.badge}`}>
                                    <Sparkles className="w-3 h-3" />
                                    {agent.badge}
                                </div>
                                <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-dm-serif, Georgia, serif)' }}>
                                    {agent.title}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm md:text-base text-white/75">
                                    {agent.subtitle}
                                </p>
                            </div>
                        </div>

                        <div className={`rounded-2xl border px-4 py-3 ${theme.panel} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Clock3 className="w-4 h-4" />
                                Placeholder Experience
                            </div>
                            <p className="mt-1 text-xs text-white/65">
                                This route is live so the dashboard reflects the intended legal agent catalog while deeper workflows are connected.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-5 md:px-10 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6">
                    <section className={`rounded-3xl border p-6 ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Scale className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Planned Coverage</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {agent.categories.map((category) => (
                                <div
                                    key={category}
                                    className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? theme.chip : 'border-gray-200 bg-gray-50 text-gray-700'}`}
                                >
                                    {category}
                                </div>
                            ))}
                        </div>

                        <div className={`mt-6 rounded-2xl border p-5 ${isDark ? 'border-gray-800 bg-gray-950/60' : 'border-gray-200 bg-gray-50'}`}>
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>What this placeholder does now</h3>
                            <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                It gives the legal track a stable route for this assistant, sets expectations for the future workflow, and preserves navigation while the full RAG or guided-question flow is built.
                            </p>
                        </div>
                    </section>

                    <aside className={`rounded-3xl border p-6 ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Starter Prompts</h2>
                        <div className="mt-4 space-y-3">
                            {agent.prompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    type="button"
                                    className={`w-full text-left rounded-2xl border px-4 py-3 text-sm transition-colors ${isDark ? 'border-gray-800 bg-gray-950/60 text-gray-300 hover:bg-gray-900' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        {agent.links?.length ? (
                            <div className="mt-6">
                                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Available right now</h3>
                                <div className="mt-3 space-y-3">
                                    {agent.links.map((link) => (
                                        <button
                                            key={link.path}
                                            type="button"
                                            onClick={() => router.push(link.path)}
                                            className={`w-full inline-flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-all shadow-lg ${theme.button}`}
                                        >
                                            {link.label}
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </aside>
                </div>
            </div>
        </div>
    );
}
