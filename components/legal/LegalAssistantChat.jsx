'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Loader2, Scale, Sparkles } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { AIAvatar, useAIAvatar } from '@/components/AIAvatarCustomizer';

const THEMES = {
    blue: {
        hero: 'from-slate-900 via-blue-950/70 to-slate-900',
        badge: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
        border: 'border-blue-500/20',
        button: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 hover:shadow-blue-500/40',
        accent: 'text-blue-300',
    },
    purple: {
        hero: 'from-slate-900 via-purple-950/70 to-slate-900',
        badge: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
        border: 'border-purple-500/20',
        button: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30 hover:shadow-purple-500/40',
        accent: 'text-purple-300',
    },
    amber: {
        hero: 'from-slate-900 via-amber-950/70 to-slate-900',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
        border: 'border-amber-500/20',
        button: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30 hover:shadow-amber-500/40',
        accent: 'text-amber-300',
    },
    pink: {
        hero: 'from-slate-900 via-pink-950/70 to-slate-900',
        badge: 'bg-pink-500/15 text-pink-300 border-pink-400/30',
        border: 'border-pink-500/20',
        button: 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/30 hover:shadow-pink-500/40',
        accent: 'text-pink-300',
    },
    emerald: {
        hero: 'from-slate-900 via-emerald-950/70 to-slate-900',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
        border: 'border-emerald-500/20',
        button: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 hover:shadow-emerald-500/40',
        accent: 'text-emerald-300',
    },
    teal: {
        hero: 'from-slate-900 via-teal-950/70 to-slate-900',
        badge: 'bg-teal-500/15 text-teal-300 border-teal-400/30',
        border: 'border-teal-500/20',
        button: 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/30 hover:shadow-teal-500/40',
        accent: 'text-teal-300',
    },
    indigo: {
        hero: 'from-slate-900 via-indigo-950/70 to-slate-900',
        badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
        border: 'border-indigo-500/20',
        button: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 hover:shadow-indigo-500/40',
        accent: 'text-indigo-300',
    },
    slate: {
        hero: 'from-slate-900 via-slate-800 to-slate-950',
        badge: 'bg-slate-500/20 text-slate-200 border-slate-400/20',
        border: 'border-slate-500/20',
        button: 'bg-slate-700 hover:bg-slate-600 shadow-slate-700/30 hover:shadow-slate-600/40',
        accent: 'text-slate-200',
    },
};

function AssistantBubble({ message, isDark, accentClass }) {
    if (message.role === 'user') {
        return (
            <div className="flex justify-end">
                <div className="max-w-3xl rounded-2xl rounded-tr-sm bg-emerald-600 px-4 py-3 text-sm leading-relaxed text-white shadow-lg">
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl border px-4 py-4 ${isDark ? 'border-gray-800 bg-gray-950/70' : 'border-gray-200 bg-gray-50'}`}>
            <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {message.content}
            </div>

            {message.sources?.length ? (
                <div className="mt-4">
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${accentClass}`}>Retrieved Sources</p>
                    <div className="mt-2 space-y-2">
                        {message.sources.map((source) => (
                            <div key={`${source.title}-${source.citation || ''}`} className={`rounded-xl border px-3 py-2 text-xs ${isDark ? 'border-gray-800 bg-gray-900/60 text-gray-300' : 'border-gray-200 bg-white text-gray-700'}`}>
                                <div className="font-semibold">{source.title}</div>
                                {source.citation ? <div className="mt-1 opacity-80">{source.citation}</div> : null}
                                {source.url ? (
                                    <a href={source.url} target="_blank" rel="noreferrer" className="mt-1 inline-block underline opacity-80">
                                        {source.url}
                                    </a>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {message.relatedTopics?.length ? (
                <div className="mt-4">
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${accentClass}`}>Suggested Follow-Ups</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {message.relatedTopics.map((topic) => (
                            <span key={topic} className={`rounded-full border px-3 py-1 text-xs ${isDark ? 'border-gray-700 bg-gray-900 text-gray-300' : 'border-gray-200 bg-white text-gray-700'}`}>
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {message.disclaimer ? (
                <p className={`mt-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{message.disclaimer}</p>
            ) : null}
        </div>
    );
}

export default function LegalAssistantChat({ agent }) {
    const router = useRouter();
    const { isDark } = useTheme();
    const { config } = useAIAvatar(agent.id);
    const theme = THEMES[agent.theme] || THEMES.slate;

    const [category, setCategory] = useState(agent.categories[0] || '');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `${agent.title}\n\n${agent.subtitle}\n\nAsk a question or use one of the starter prompts to begin.`,
            relatedTopics: agent.prompts,
        },
    ]);

    const routePath = useMemo(() => `/api/legal/${agent.id}/ask`, [agent.id]);

    const sendMessage = async (rawQuestion, overrideCategory) => {
        const question = rawQuestion.trim();
        const activeCategory = overrideCategory || category;

        if (!question) return;

        const nextHistory = [...messages, { role: 'user', content: question }];
        setMessages(nextHistory);
        setInput('');
        setError('');
        setLoading(true);

        try {
            const response = await fetch(routePath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: activeCategory,
                    question,
                    userId: 'anonymous',
                    history: nextHistory.map((message) => ({
                        role: message.role,
                        content: message.content,
                    })),
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get assistant response');
            }

            setMessages((current) => [
                ...current,
                {
                    role: 'assistant',
                    content: data.answer,
                    sources: data.sources,
                    relatedTopics: data.relatedTopics,
                    disclaimer: data.disclaimer,
                },
            ]);
        } catch (err) {
            setError(err?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

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

                    <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
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

                        <div className={`rounded-2xl border px-4 py-3 ${theme.border} bg-white/5 text-white`}>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Scale className="w-4 h-4" />
                                OpenAI + Retrieval
                            </div>
                            <p className="mt-1 text-xs text-white/65">
                                Responses are generated with retrieved legal context for this practice area.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-5 md:px-10 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                    <section className={`rounded-3xl border p-6 ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between gap-4">
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Legal Chat</h2>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={`rounded-xl border px-3 py-2 text-sm ${isDark ? 'border-gray-700 bg-gray-950 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                            >
                                {agent.categories.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-6 space-y-4">
                            {messages.map((message, index) => (
                                <AssistantBubble
                                    key={`${message.role}-${index}`}
                                    message={message}
                                    isDark={isDark}
                                    accentClass={theme.accent}
                                />
                            ))}

                            {loading ? (
                                <div className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-gray-800 bg-gray-950/70 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating answer from retrieved legal context...
                                </div>
                            ) : null}
                        </div>

                        {error ? (
                            <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-red-500/30 bg-red-950/30 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                {error}
                            </div>
                        ) : null}

                        <div className="mt-6">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                rows={4}
                                placeholder="Ask a legal question, describe your situation, or request a checklist..."
                                className={`w-full rounded-2xl border px-4 py-3 text-sm resize-none ${isDark ? 'border-gray-700 bg-gray-950 text-white placeholder:text-gray-500' : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400'}`}
                            />
                            <div className="mt-3 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => sendMessage(input)}
                                    disabled={loading || !input.trim()}
                                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white transition-all shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${theme.button}`}
                                >
                                    Ask Assistant
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </section>

                    <aside className={`rounded-3xl border p-6 ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Starter Prompts</h2>
                        <div className="mt-4 space-y-3">
                            {agent.prompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    type="button"
                                    onClick={() => sendMessage(prompt)}
                                    disabled={loading}
                                    className={`w-full text-left rounded-2xl border px-4 py-3 text-sm transition-colors ${isDark ? 'border-gray-800 bg-gray-950/60 text-gray-300 hover:bg-gray-900' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        {agent.links?.length ? (
                            <div className="mt-6">
                                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Related Tools</h3>
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
