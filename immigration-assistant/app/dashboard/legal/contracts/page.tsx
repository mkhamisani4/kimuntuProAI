'use client';

/**
 * Contract Law AI Assistant
 * Provides guidance on contract analysis, risk assessment, terms, and negotiations
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    AlertTriangle,
    X,
    FileText,
    CheckCircle,
    Shield,
    Bot
} from 'lucide-react';
import { ClaudeChatInput } from '@/components/ui/claude-style-ai-input';
import { PromptSuggestion } from '@/components/ui/prompt-suggestion';
import { useTheme } from '@/components/providers/ThemeProvider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAIAvatar, AIAvatar, AvatarCustomizerModal } from '@/components/AIAvatarCustomizer';

interface ContractResult {
    answer: string;
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

export default function ContractLawAssistant() {
    const router = useRouter();
    const { isDark } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ContractResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { config: avatarConfig, updateConfig: updateAvatar, resetConfig: resetAvatar } = useAIAvatar('contracts');
    const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
    const [category, setCategory] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const categories = [
        'Contract Formation & Validity',
        'Contract Terms & Interpretation',
        'Breach of Contract',
        'Remedies & Damages',
        'Contract Negotiation',
        'NDAs & Confidentiality',
        'Service Agreements',
        'Lease & Real Estate Contracts',
        'Employment Contracts',
        'Consumer Contracts'
    ];

    const handleChatSend = async (message: string, categoryOverride?: string) => {
        const activeCategory = categoryOverride ?? category;
        if (!message.trim() || !activeCategory) {
            setError('Please select a category before asking a question');
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

            const response = await fetch('/api/legal/contracts/ask', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    category: activeCategory,
                    question: message.trim(),
                    context: '',
                    userId: user?.uid || 'anonymous'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get contract law guidance');
            }

            setResult(data);
        } catch (err: any) {
            setError(err?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    function HtmlContent({ html, className }: { html: string; className?: string }) {
        const ref = useRef<HTMLDivElement>(null);
        useEffect(() => {
            if (ref.current) ref.current.innerHTML = html;
        }, [html]);
        return <div ref={ref} className={className} />;
    }

    const quickQuestions = [
        { question: 'What makes a contract legally binding?', category: 'Contract Formation & Validity' },
        { question: 'What are the key terms to look for in a contract?', category: 'Contract Terms & Interpretation' },
        { question: 'What happens if someone breaches a contract?', category: 'Breach of Contract' },
        { question: 'What should be included in an NDA?', category: 'NDAs & Confidentiality' }
    ];

    return (
        <div className={`min-h-screen p-4 md:p-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard/legal')}
                        className={`flex items-center gap-2 mb-4 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Legal Track
                    </button>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <AIAvatar
                                config={avatarConfig}
                                size="lg"
                                onClick={() => setShowAvatarCustomizer(true)}
                                className="cursor-pointer"
                            />
                            <div>
                                <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Contract Law Assistant
                                </h1>
                                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    AI-powered contract analysis, risk assessment, and legal guidance
                                </p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-pink-500/20 border border-pink-500/40' : 'bg-pink-50 border border-pink-200'}`}>
                            <span className={`font-medium ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>Contracts & Agreements</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-500/40 text-red-300' : 'bg-red-50 border-red-200 text-red-900'}`}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="font-semibold flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Error
                                </p>
                                <p className="mt-1 text-sm">{error}</p>
                            </div>
                            <button onClick={() => setError(null)} className="ml-4">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900/80 border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg`}>
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Contract Law Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                                    >
                                        <option value="">Select a category...</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <ClaudeChatInput
                                    onSendMessage={(msg) => handleChatSend(msg)}
                                    disabled={loading}
                                    placeholder="e.g., What clauses should I look for when reviewing a service agreement?"
                                    models={[]}
                                />
                            </div>
                        </div>

                        {result && (
                            <div className={`mt-6 rounded-2xl p-6 ${isDark ? 'bg-gray-900/80 border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg`}>
                                <div className="flex items-start gap-4 mb-4">
                                    <AIAvatar config={avatarConfig} size="md" />
                                    <div className="flex-1">
                                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            Contract Law Guidance
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-pink-500/20 text-pink-300' : 'bg-pink-50 text-pink-700'}`}>
                                            {result.category}
                                        </span>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-800/50 text-gray-200' : 'bg-white border border-gray-200 text-gray-900'}`}>
                                    <HtmlContent
                                        html={result.answer}
                                        className="max-w-none text-sm leading-relaxed [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-3 [&_h3]:mt-1 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-1.5 [&_strong]:font-semibold"
                                    />
                                </div>

                                {result.sources.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Legal Sources & References</h4>
                                        <div className="space-y-2">
                                            {result.sources.map((source, idx) => (
                                                <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{source.title}</p>
                                                            {source.citation && <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{source.citation}</p>}
                                                            {source.url && (
                                                                <a href={source.url} target="_blank" rel="noopener noreferrer" className={`text-xs mt-1 inline-block ${isDark ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'}`}>
                                                                    View source →
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.relatedTopics.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Related Topics</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.relatedTopics.map((topic, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleChatSend(topic)}
                                                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${isDark ? 'border-pink-500/30 text-pink-300 hover:bg-pink-500/10 hover:text-pink-200' : 'border-pink-200 text-pink-700 hover:bg-pink-50'}`}
                                                >
                                                    {topic}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={`p-4 rounded-lg border ${isDark ? 'bg-yellow-900/20 border-yellow-500/40 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-900'}`}>
                                    <p className="text-sm flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{result.disclaimer}</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-900/80 border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg`}>
                            <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 px-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Quick Questions</h3>
                            <div className="flex flex-col gap-0.5">
                                {quickQuestions.map((q, idx) => (
                                    <PromptSuggestion
                                        key={idx}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setCategory(q.category); handleChatSend(q.question, q.category); }}
                                        className={`w-full justify-start h-auto whitespace-normal text-left py-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700'}`}
                                    >
                                        {q.question}
                                    </PromptSuggestion>
                                ))}
                            </div>
                        </div>

                        <div className={`rounded-2xl p-6 ${isDark ? 'bg-pink-900/20 border border-pink-500/40' : 'bg-pink-50 border border-pink-200'}`}>
                            <div className="flex items-start gap-3">
                                <Shield className={`w-6 h-6 mt-1 flex-shrink-0 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                                <div>
                                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-pink-300' : 'text-pink-900'}`}>Legal Disclaimer</h4>
                                    <p className={`text-sm ${isDark ? 'text-pink-200' : 'text-pink-800'}`}>
                                        This tool provides general information only and is not legal advice. For contract review, please consult with a licensed attorney.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAvatarCustomizer && (
                <AvatarCustomizerModal
                    config={avatarConfig}
                    onUpdate={updateAvatar}
                    onReset={resetAvatar}
                    onClose={() => setShowAvatarCustomizer(false)}
                    assistantName="Contract Law Assistant"
                />
            )}
        </div>
    );
}
