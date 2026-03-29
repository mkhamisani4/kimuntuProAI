'use client';

/**
 * Immigration Law AI Assistant — "Legal Dispatch" redesign
 * Provides guidance on US and Canadian immigration law
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    AlertTriangle,
    X,
    Globe,
    Shield,
    CheckCircle,
    Sparkles,
    ExternalLink,
    ChevronRight,
    Send,
    BookOpen,
    Scale,
    FileText
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAIAvatar, AIAvatar, AvatarCustomizerModal } from '@/components/AIAvatarCustomizer';
import { PromptSuggestion } from '@/components/ui/prompt-suggestion';

interface ImmigrationResult {
    answer: string;
    jurisdiction: 'US' | 'Canada' | 'Both';
    category: string;
    sources: Array<{
        type: 'legal' | 'official' | 'case';
        title: string;
        url?: string;
        citation?: string;
    }>;
    relatedTopics: string[];
    disclaimer: string;
}

/* ─── Render HTML from API via ref (avoids dangerouslySetInnerHTML in JSX) ─── */
function HtmlContent({ html, className }: { html: string; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.innerHTML = html;
    }, [html]);
    return <div ref={ref} className={className} />;
}

export default function ImmigrationLawAssistant() {
    const router = useRouter();
    const { isDark } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImmigrationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);
    const { config: avatarConfig, updateConfig: updateAvatar, resetConfig: resetAvatar } = useAIAvatar('immigration');
    const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);

    const [category, setCategory] = useState('');
    const [question, setQuestion] = useState('');

    useEffect(() => {
        setMounted(true);
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (result && resultRef.current) {
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    }, [result]);

    const categories = [
        'Visa Types (H-1B, F-1, etc.)',
        'Green Card / Permanent Residence',
        'Citizenship & Naturalization',
        'Family-Based Immigration',
        'Employment-Based Immigration',
        'Asylum & Refugee Status',
        'Deportation & Removal',
        'Work Authorization (EAD)',
        'Travel Documents',
        'Immigration Court Procedures',
        'Express Entry System',
        'Provincial Nominee Program (PNP)',
        'Work Permits',
        'Study Permits',
        'Family Sponsorship',
        'Permanent Residence',
        'Refugee Claims',
        'Inadmissibility Issues',
        'Appeals & Reviews',
        'Cross-Border Work',
        'Dual Citizenship',
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !category) {
            setError('Please provide both a category and question.');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (user) {
                const token = await user.getIdToken().catch(() => null);
                if (token) headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch('/api/legal/immigration/ask', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    category,
                    question: question.trim(),
                    userId: user?.uid || 'anonymous',
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to get immigration law guidance');
            setResult(data);
        } catch (err: any) {
            setError(err?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const quickQuestions = [
        { question: 'What are the requirements for an H-1B visa?', category: 'Visa Types (H-1B, F-1, etc.)' },
        { question: 'How does the Express Entry system work?', category: 'Express Entry System' },
        { question: 'Can I work while my green card is pending?', category: 'Work Authorization (EAD)' },
        { question: 'What is the Provincial Nominee Program?', category: 'Provincial Nominee Program (PNP)' },
    ];

    /* ── Design tokens ── */
    const D = {
        bg:       isDark ? '#080d1a'                         : '#f2f4f9',
        surface:  isDark ? 'rgba(15,23,42,0.9)'              : 'rgba(255,255,255,0.95)',
        border:   isDark ? 'rgba(30,50,90,0.8)'              : 'rgba(203,213,225,0.8)',
        gold:     isDark ? '#c9a253'                         : '#8b6a14',
        goldBg:   isDark ? 'rgba(201,162,83,0.08)'           : 'rgba(139,106,20,0.06)',
        goldBorder:isDark? 'rgba(201,162,83,0.25)'           : 'rgba(139,106,20,0.2)',
        text:     isDark ? '#e2e8f0'                         : '#0f172a',
        textMuted:isDark ? '#6b8aad'                         : '#64748b',
        input:    isDark ? 'rgba(10,17,35,0.8)'              : '#ffffff',
        inputBorder:isDark? 'rgba(30,55,100,0.9)'            : 'rgba(203,213,225,1)',
        hover:    isDark ? 'rgba(201,162,83,0.06)'           : 'rgba(139,106,20,0.04)',
    };

    const serif = "var(--font-dm-serif, 'Georgia', serif)";

    return (
        <div style={{ minHeight: '100vh', background: D.bg, fontFamily: "var(--font-dm-sans, system-ui, sans-serif)" }}>

            {/* ─── HEADER ─── */}
            <header style={{
                background: isDark
                    ? 'linear-gradient(135deg, #04080f 0%, #0a1628 45%, #060c1a 100%)'
                    : 'linear-gradient(135deg, #1e3a6e 0%, #1e40af 45%, #1d3461 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Diagonal rule lines */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: `repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 24px,
                        rgba(255,255,255,0.6) 24px,
                        rgba(255,255,255,0.6) 25px
                    )`,
                    pointerEvents: 'none',
                }} />
                {/* Gold glow orbs */}
                <div style={{ position: 'absolute', top: '-60px', right: '10%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,83,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-40px', left: '5%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '20px 40px 36px' }}>
                    {/* Back nav */}
                    <button
                        onClick={() => router.push('/dashboard/legal')}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            color: 'rgba(201,162,83,0.7)', fontSize: '13px', fontWeight: 500,
                            background: 'none', border: 'none', cursor: 'pointer',
                            marginBottom: '28px', padding: 0,
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#c9a253')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(201,162,83,0.7)')}
                    >
                        <ArrowLeft size={13} />
                        Back to Legal Track
                    </button>

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            {/* Avatar */}
                            <AIAvatar
                                config={avatarConfig}
                                size="lg"
                                onClick={() => setShowAvatarCustomizer(true)}
                                className="cursor-pointer shrink-0"
                            />
                            <div>
                                {/* Gold eyebrow */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <div style={{ width: '20px', height: '1px', background: '#c9a253', opacity: 0.6 }} />
                                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a253', opacity: 0.8 }}>
                                        Immigration Law
                                    </span>
                                    <div style={{ width: '20px', height: '1px', background: '#c9a253', opacity: 0.6 }} />
                                </div>
                                <h1 style={{
                                    fontFamily: serif,
                                    fontSize: 'clamp(26px, 4vw, 36px)',
                                    fontWeight: 400,
                                    color: '#ffffff',
                                    lineHeight: 1.2,
                                    margin: 0,
                                }}>
                                    Immigration Law Assistant
                                </h1>
                                <p style={{ fontSize: '14px', color: 'rgba(226,232,240,0.55)', marginTop: '6px' }}>
                                    AI-powered guidance on US and Canadian immigration law
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Bottom rule */}
                    <div style={{ marginTop: '28px', height: '1px', background: 'linear-gradient(to right, rgba(201,162,83,0.4), rgba(201,162,83,0.1), transparent)' }} />
                </div>
            </header>

            {/* ─── MAIN ─── */}
            <main style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 40px 64px' }}>

                {/* Error */}
                {error && (
                    <div style={{
                        marginBottom: '20px',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        background: isDark ? 'rgba(127,29,29,0.25)' : '#fef2f2',
                        border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`,
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                        color: isDark ? '#fca5a5' : '#991b1b',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '13px', margin: 0 }}>Error</p>
                                <p style={{ fontSize: '13px', margin: '2px 0 0', opacity: 0.8 }}>{error}</p>
                            </div>
                        </div>
                        <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, color: 'inherit', padding: 0 }}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>

                    {/* ─── FORM + RESULTS ─── */}
                    <div>
                        {/* Case File Form */}
                        <div style={{
                            background: D.surface,
                            border: `1px solid ${D.border}`,
                            borderRadius: '14px',
                            overflow: 'hidden',
                            backdropFilter: 'blur(12px)',
                            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
                        }}>
                            {/* Card Header */}
                            <div style={{
                                padding: '18px 24px',
                                borderBottom: `1px solid ${D.border}`,
                                background: D.goldBg,
                                display: 'flex', alignItems: 'center', gap: '12px',
                            }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: D.goldBg, border: `1px solid ${D.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FileText size={15} color={D.gold} />
                                </div>
                                <div>
                                    <h2 style={{ fontFamily: serif, fontSize: '16px', fontWeight: 400, color: D.text, margin: 0 }}>
                                        Submit Your Case
                                    </h2>
                                    <p style={{ fontSize: '12px', color: D.textMuted, margin: '2px 0 0' }}>
                                        Select a topic and describe your situation
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

                                {/* Category */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: D.textMuted, marginBottom: '10px' }}>
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '11px 14px',
                                            borderRadius: '10px',
                                            border: `1px solid ${D.inputBorder}`,
                                            background: D.input,
                                            color: category ? D.text : D.textMuted,
                                            fontSize: '14px',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            appearance: 'auto',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={(e) => (e.currentTarget.style.borderColor = D.gold)}
                                        onBlur={(e) => (e.currentTarget.style.borderColor = D.inputBorder)}
                                    >
                                        <option value="">Select a category…</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Question */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: D.textMuted, marginBottom: '10px' }}>
                                        Your Question
                                    </label>
                                    <textarea
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        required
                                        rows={4}
                                        placeholder="e.g., What documents do I need to apply for a work permit?"
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            border: `1px solid ${D.inputBorder}`,
                                            background: D.input,
                                            color: D.text,
                                            fontSize: '14px',
                                            lineHeight: '1.6',
                                            resize: 'vertical',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            boxSizing: 'border-box',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={(e) => (e.currentTarget.style.borderColor = D.gold)}
                                        onBlur={(e) => (e.currentTarget.style.borderColor = D.inputBorder)}
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading || !question.trim() || !category}
                                    style={{
                                        width: '100%',
                                        padding: '13px 24px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        cursor: loading || !question.trim() || !category ? 'not-allowed' : 'pointer',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s',
                                        background: loading || !question.trim() || !category
                                            ? isDark ? 'rgba(30,50,90,0.4)' : '#e2e8f0'
                                            : 'linear-gradient(135deg, #8b6a14 0%, #c9a253 60%, #a07820 100%)',
                                        color: loading || !question.trim() || !category
                                            ? D.textMuted
                                            : '#ffffff',
                                        boxShadow: loading || !question.trim() || !category
                                            ? 'none'
                                            : '0 4px 20px rgba(201,162,83,0.35)',
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} viewBox="0 0 24 24">
                                                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Analyzing your question…
                                        </>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            Request Guidance
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* ─── RESULTS ─── */}
                        {result && (
                            <div
                                ref={resultRef}
                                style={{
                                    marginTop: '24px',
                                    background: D.surface,
                                    border: `1px solid ${D.border}`,
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    backdropFilter: 'blur(12px)',
                                    boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
                                    animation: 'fadeSlideUp 0.4s ease forwards',
                                }}
                            >
                                {/* Result Header — "Legal Opinion" style */}
                                <div style={{
                                    padding: '20px 28px',
                                    borderBottom: `1px solid ${D.border}`,
                                    background: isDark
                                        ? 'linear-gradient(135deg, rgba(8,13,26,0.9), rgba(15,23,42,0.7))'
                                        : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <AIAvatar config={avatarConfig} size="sm" />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <div style={{ width: '16px', height: '1px', background: D.gold, opacity: 0.5 }} />
                                                <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: D.gold, opacity: 0.8 }}>Legal Opinion</span>
                                            </div>
                                            <h3 style={{ fontFamily: serif, fontSize: '18px', fontWeight: 400, color: D.text, margin: 0 }}>
                                                Immigration Law Guidance
                                            </h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500, background: isDark ? 'rgba(30,50,90,0.4)' : 'rgba(226,232,240,0.8)', border: `1px solid ${D.border}`, color: D.textMuted }}>
                                                    {result.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Answer body */}
                                <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                                    {/* Gold left-border accent on answer */}
                                    <div style={{ borderLeft: `3px solid ${D.gold}`, paddingLeft: '20px', opacity: 0.9 }}>
                                        <HtmlContent
                                            html={result.answer}
                                            className={[
                                                'immigration-answer',
                                                isDark ? 'answer-dark' : 'answer-light',
                                            ].join(' ')}
                                        />
                                    </div>

                                    {/* Sources */}
                                    {result.sources.length > 0 && (
                                        <div style={{ borderRadius: '10px', border: `1px solid ${D.border}`, overflow: 'hidden' }}>
                                            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}`, background: D.goldBg, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <BookOpen size={13} color={D.gold} />
                                                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: D.gold }}>
                                                    Legal Sources & References
                                                </span>
                                            </div>
                                            <div style={{ padding: '8px' }}>
                                                {result.sources.map((source, idx) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', borderRadius: '8px' }}>
                                                        <CheckCircle size={13} style={{ flexShrink: 0, marginTop: '2px', color: isDark ? '#34d399' : '#059669' }} />
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{ fontSize: '13px', fontWeight: 600, color: D.text, margin: 0 }}>{source.title}</p>
                                                            {source.citation && (
                                                                <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: D.textMuted, margin: '3px 0 0' }}>{source.citation}</p>
                                                            )}
                                                            {source.url && (
                                                                <a href={source.url} target="_blank" rel="noopener noreferrer"
                                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: D.gold, textDecoration: 'none', marginTop: '4px' }}>
                                                                    View source <ExternalLink size={10} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Related Topics */}
                                    {result.relatedTopics.length > 0 && (
                                        <div>
                                            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: D.textMuted, marginBottom: '10px' }}>
                                                Related Topics
                                            </p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {result.relatedTopics.map((topic, idx) => (
                                                    <PromptSuggestion
                                                        key={idx}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setQuestion(topic)}
                                                        className={`rounded-full text-xs ${isDark
                                                            ? 'border-[rgba(201,162,83,0.25)] text-[#c9a253] hover:bg-[rgba(201,162,83,0.1)] hover:text-[#dfc27a]'
                                                            : 'border-[rgba(139,106,20,0.2)] text-[#8b6a14] hover:bg-[rgba(139,106,20,0.06)]'
                                                        }`}
                                                    >
                                                        {topic}
                                                    </PromptSuggestion>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Disclaimer */}
                                    <div style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                                        padding: '14px 16px', borderRadius: '10px',
                                        background: isDark ? 'rgba(120,53,15,0.12)' : 'rgba(254,243,199,0.6)',
                                        border: `1px solid ${isDark ? 'rgba(234,179,8,0.2)' : 'rgba(234,179,8,0.3)'}`,
                                        color: isDark ? 'rgba(253,224,71,0.7)' : '#92400e',
                                    }}>
                                        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                                        <p style={{ fontSize: '12px', lineHeight: '1.6', margin: 0 }}>{result.disclaimer}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── SIDEBAR ─── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>

                        {/* Quick Questions */}
                        <div style={{
                            background: D.surface,
                            border: `1px solid ${D.border}`,
                            borderRadius: '14px',
                            overflow: 'hidden',
                            backdropFilter: 'blur(12px)',
                            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
                        }}>
                            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${D.border}`, background: D.goldBg, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={13} color={D.gold} />
                                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.gold }}>
                                    Quick Questions
                                </span>
                            </div>
                            <div style={{ padding: '6px' }}>
                                {quickQuestions.map((q, idx) => (
                                    <PromptSuggestion
                                        key={idx}
                                        highlight={question}
                                        onClick={() => { setCategory(q.category); setQuestion(q.question); }}
                                        className={isDark
                                            ? 'text-gray-300 hover:text-white rounded-xl'
                                            : 'text-gray-700 rounded-xl'
                                        }
                                    >
                                        {q.question}
                                    </PromptSuggestion>
                                ))}
                            </div>
                        </div>

                        {/* Official Resources */}
                        <div style={{
                            background: D.surface,
                            border: `1px solid ${D.border}`,
                            borderRadius: '14px',
                            overflow: 'hidden',
                            backdropFilter: 'blur(12px)',
                            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
                        }}>
                            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Globe size={13} color={D.textMuted} />
                                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.textMuted }}>
                                    Official Resources
                                </span>
                            </div>
                            <div style={{ padding: '6px' }}>
                                {[
                                    { href: 'https://www.uscis.gov', flag: '🇺🇸', name: 'USCIS', sub: 'U.S. Citizenship & Immigration', bg: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(239,246,255,0.8)' },
                                    { href: 'https://www.canada.ca/en/immigration-refugees-citizenship.html', flag: '🇨🇦', name: 'IRCC', sub: 'Immigration, Refugees & Citizenship Canada', bg: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(255,241,242,0.8)' },
                                ].map(r => (
                                    <a key={r.name} href={r.href} target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '9px', textDecoration: 'none', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = D.hover)}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                    >
                                        <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                                            {r.flag}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '13px', fontWeight: 700, color: D.text, margin: 0 }}>{r.name}</p>
                                            <p style={{ fontSize: '11px', color: D.textMuted, margin: '2px 0 0', lineHeight: 1.3 }}>{r.sub}</p>
                                        </div>
                                        <ExternalLink size={12} color={D.textMuted} style={{ opacity: 0.4, flexShrink: 0 }} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Legal Disclaimer card */}
                        <div style={{
                            padding: '18px',
                            borderRadius: '14px',
                            border: `1px solid ${D.goldBorder}`,
                            background: D.goldBg,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <Shield size={14} color={D.gold} style={{ flexShrink: 0, marginTop: '1px' }} />
                                <div>
                                    <h4 style={{ fontFamily: serif, fontSize: '14px', fontWeight: 400, color: D.gold, margin: '0 0 6px' }}>
                                        Legal Disclaimer
                                    </h4>
                                    <p style={{ fontSize: '12px', lineHeight: '1.65', color: isDark ? 'rgba(201,162,83,0.55)' : 'rgba(139,106,20,0.7)', margin: 0 }}>
                                        This tool provides general information only and is not legal advice.
                                        For specific immigration matters, consult a licensed immigration attorney.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ─── Avatar Modal ─── */}
            {showAvatarCustomizer && (
                <AvatarCustomizerModal
                    config={avatarConfig}
                    onUpdate={updateAvatar}
                    onReset={resetAvatar}
                    onClose={() => setShowAvatarCustomizer(false)}
                    assistantName="Immigration Law Assistant"
                />
            )}

            {/* ─── Keyframes ─── */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 768px) {
                    main { padding: 20px 16px 48px !important; }
                    header > div { padding: 16px 20px 28px !important; }
                    [style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                }

                /* Answer HTML styling */
                .immigration-answer { font-size: 14px; line-height: 1.75; }
                .immigration-answer h3 {
                    font-family: var(--font-dm-serif, Georgia, serif);
                    font-size: 16px;
                    font-weight: 400;
                    margin: 16px 0 8px;
                }
                .immigration-answer p { margin: 0 0 12px; }
                .immigration-answer ul { margin: 0 0 12px; padding-left: 20px; }
                .immigration-answer li { margin-bottom: 6px; }
                .immigration-answer strong { font-weight: 700; }
                .answer-dark { color: #cbd5e1; }
                .answer-dark h3 { color: #e2e8f0; }
                .answer-light { color: #334155; }
                .answer-light h3 { color: #0f172a; }
            `}</style>
        </div>
    );
}
