'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Globe, X, CheckCircle, ChevronDown, ChevronRight, Bookmark } from 'lucide-react';
import { saveKeyword, listKeywords, deleteKeyword, type MarketingKeyword } from '@kimuntupro/db';
import { toast } from '@/components/ai/Toast';
import { fetchAuthed } from '@/lib/api/fetchAuthed';

interface SEOToolsProps {
    tenantId: string;
    userId: string;
    selectedCampaignId?: string | null;
    initialSubTab?: 'keywords' | 'tracked' | 'audit';
}

export default function SEOTools({ tenantId, userId, selectedCampaignId, initialSubTab }: SEOToolsProps) {
    const [activeTab, setActiveTab] = useState(initialSubTab || 'keywords');

    // Respond when the parent forces a sub-tab switch (e.g. quick-action button).
    useEffect(() => {
        if (initialSubTab) setActiveTab(initialSubTab);
    }, [initialSubTab]);
    const [trackedKeywords, setTrackedKeywords] = useState<MarketingKeyword[]>([]);

    // Load tracked keywords from Firestore
    useEffect(() => {
        async function loadKeywords() {
            if (!tenantId || !userId) return;
            try {
                const data = await listKeywords(tenantId, userId, selectedCampaignId || undefined);
                setTrackedKeywords(data);
            } catch (error) {
                console.error('[SEOTools] Failed to load keywords:', error);
            }
        }
        loadKeywords();
    }, [tenantId, userId, selectedCampaignId]);

    const handleSaveKeyword = async (kw: { keyword: string; volume: number; difficulty: number; cpc: number }) => {
        try {
            const id = await saveKeyword({
                tenantId,
                userId,
                campaignId: selectedCampaignId || null,
                keyword: kw.keyword,
                volume: kw.volume,
                difficulty: kw.difficulty,
                cpc: kw.cpc,
            });
            setTrackedKeywords(prev => [{ id, ...kw, tenantId, userId, campaignId: selectedCampaignId || null }, ...prev]);
            toast.success(`Saved "${kw.keyword}"`);
        } catch (error) {
            toast.error('Failed to save keyword');
        }
    };

    const handleDeleteKeyword = async (keywordId: string) => {
        try {
            await deleteKeyword(keywordId);
            setTrackedKeywords(prev => prev.filter(k => k.id !== keywordId));
            toast.success('Keyword removed');
        } catch (error) {
            toast.error('Failed to remove keyword');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
                {[
                    { id: 'keywords', label: 'Keyword Research' },
                    { id: 'tracked', label: `Tracked Keywords (${trackedKeywords.length})` },
                    { id: 'audit', label: 'Site Audit' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            <div className={activeTab === 'keywords' ? 'block' : 'hidden'}>
                <KeywordResearch
                    trackedKeywords={trackedKeywords}
                    onSaveKeyword={handleSaveKeyword}
                />
            </div>
            <div className={activeTab === 'tracked' ? 'block' : 'hidden'}>
                <TrackedKeywords
                    trackedKeywords={trackedKeywords}
                    onDeleteKeyword={handleDeleteKeyword}
                />
            </div>
            <div className={activeTab === 'audit' ? 'block' : 'hidden'}>
                <SiteAudit />
            </div>
        </div>
    );
}

interface KeywordResult {
    keyword: string;
    search_volume: number;
    keyword_difficulty: number;
    cpc: number;
}

function KeywordResearch({ trackedKeywords, onSaveKeyword }: {
    trackedKeywords: MarketingKeyword[];
    onSaveKeyword: (kw: { keyword: string; volume: number; difficulty: number; cpc: number }) => void;
}) {
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('United States');
    const [results, setResults] = useState<KeywordResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [history, setHistory] = useState<Array<{ query: string; location: string; results: KeywordResult[]; at: number }>>([]);

    const HISTORY_KEY = 'kimuntupro:seo:keyword_history';
    const HISTORY_MAX = 20;

    // Hydrate history once from localStorage (client-only).
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(HISTORY_KEY);
            if (raw) setHistory(JSON.parse(raw));
        } catch { /* ignore */ }
    }, []);

    const saveHistory = (next: typeof history) => {
        setHistory(next);
        try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;
        setSearching(true);
        setResults([]);

        try {
            const response = await fetchAuthed('/api/marketing/keywords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: query, location }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Failed to fetch keywords');
                return;
            }

            const kws: KeywordResult[] = data.keywords || [];
            setResults(kws);
            if (kws.length === 0) {
                toast.error('No keyword suggestions found. Check your API credentials.');
            } else {
                // Dedupe by query+location, most recent first, cap at HISTORY_MAX.
                const entry = { query, location, results: kws, at: Date.now() };
                const deduped = [entry, ...history.filter((h) => !(h.query === query && h.location === location))].slice(0, HISTORY_MAX);
                saveHistory(deduped);
            }
        } catch (error) {
            toast.error('Network error fetching keywords');
        } finally {
            setSearching(false);
        }
    };

    const rehydrateFromHistory = (entry: typeof history[number]) => {
        setQuery(entry.query);
        setLocation(entry.location);
        setResults(entry.results);
    };

    const isTracked = (keyword: string) => trackedKeywords.some(k => k.keyword === keyword);

    const formatVolume = (vol: number) => {
        if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
        return String(vol);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Find New Keywords</h3>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Enter a keyword (e.g., 'digital marketing')"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                        />
                    </div>
                    <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="px-3 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm"
                    >
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                    </select>
                    <button
                        type="submit"
                        disabled={searching}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {searching ? 'Analyzing...' : 'Analyze'}
                    </button>
                </form>
                {history.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent searches</span>
                            <button
                                type="button"
                                onClick={() => saveHistory([])}
                                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {history.slice(0, 10).map((h, i) => (
                                <button
                                    key={`${h.query}-${h.at}-${i}`}
                                    type="button"
                                    onClick={() => rehydrateFromHistory(h)}
                                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 rounded-full transition-colors"
                                    title={`${h.results.length} results · ${h.location}`}
                                >
                                    {h.query}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {results.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keyword</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Volume</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">CPC</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {results.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.keyword}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatVolume(item.search_volume)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.keyword_difficulty > 70 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                item.keyword_difficulty > 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                            {Math.round(item.keyword_difficulty)} / 100
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${item.cpc.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => onSaveKeyword({
                                                keyword: item.keyword,
                                                volume: item.search_volume,
                                                difficulty: item.keyword_difficulty,
                                                cpc: item.cpc,
                                            })}
                                            disabled={isTracked(item.keyword)}
                                            className={`flex items-center gap-1 text-sm font-medium ${isTracked(item.keyword)
                                                    ? 'text-gray-400 cursor-default'
                                                    : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                                                }`}
                                        >
                                            <Bookmark className="w-3.5 h-3.5" />
                                            {isTracked(item.keyword) ? 'Saved' : 'Save'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function TrackedKeywords({ trackedKeywords, onDeleteKeyword }: {
    trackedKeywords: MarketingKeyword[];
    onDeleteKeyword: (id: string) => void;
}) {
    const formatVolume = (vol: number) => {
        if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
        return String(vol);
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tracked Keywords</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Keywords saved from your research.</p>
            </div>

            {trackedKeywords.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No keywords tracked yet.</p>
                    <p className="text-sm">Use the Keyword Research tab to find and save keywords.</p>
                </div>
            ) : (
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keyword</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Volume</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">CPC</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {trackedKeywords.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.keyword}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatVolume(item.volume)}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.difficulty > 70 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                            item.difficulty > 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        }`}>
                                        {Math.round(item.difficulty)} / 100
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${item.cpc.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => item.id && onDeleteKeyword(item.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

interface AuditResult {
    id: string;
    title: string;
    description: string;
    score: number | null;
    displayValue: string | null;
    scoreDisplayMode: string;
}

function SiteAudit() {
    const [url, setUrl] = useState('');
    const [score, setScore] = useState<number | null>(null);
    const [audits, setAudits] = useState<AuditResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedAudit, setExpandedAudit] = useState<string | null>(null);

    const handleAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        setLoading(true);
        setScore(null);
        setAudits([]);

        try {
            const response = await fetchAuthed('/api/marketing/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Audit failed');
                return;
            }

            setScore(data.score);
            setAudits(data.audits || []);
            toast.success(`SEO audit complete: ${data.score}/100`);
        } catch (error) {
            toast.error('Network error running audit');
        } finally {
            setLoading(false);
        }
    };

    const failingAudits = audits.filter(a => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'notApplicable');
    const passingAudits = audits.filter(a => a.score === 1 || a.score === null);

    return (
        <div className="space-y-6">
            {/* URL Input */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">SEO Site Audit</h3>
                <form onSubmit={handleAudit} className="flex gap-3">
                    <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Enter a URL (e.g., https://example.com)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Auditing...' : 'Run Audit'}
                    </button>
                </form>
            </div>

            {/* Results */}
            {score !== null && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Score Circle */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center shadow-sm">
                        <div className={`mx-auto w-24 h-24 rounded-full border-8 flex items-center justify-center mb-4 ${score >= 90 ? 'border-emerald-500' :
                                score >= 50 ? 'border-yellow-500' : 'border-red-500'
                            }`}>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{score}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">SEO Score</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {score >= 90 ? 'Excellent' : score >= 50 ? 'Needs Improvement' : 'Poor'}
                        </p>
                    </div>

                    {/* Audit Items */}
                    <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Audit Findings</h3>
                        <div className="space-y-3">
                            {failingAudits.length === 0 && passingAudits.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 text-emerald-500">
                                    <CheckCircle className="w-12 h-12 mb-2" />
                                    <p className="font-medium">All clear! No issues found.</p>
                                </div>
                            ) : (
                                <>
                                    {failingAudits.map((audit) => (
                                        <div key={audit.id} className="border border-red-100 dark:border-red-900/30 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => setExpandedAudit(expandedAudit === audit.id ? null : audit.id)}
                                                className="w-full flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 text-left"
                                            >
                                                <AlertTriangle className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">{audit.title}</h4>
                                                    {audit.displayValue && (
                                                        <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{audit.displayValue}</p>
                                                    )}
                                                </div>
                                                {expandedAudit === audit.id ? (
                                                    <ChevronDown className="w-4 h-4 text-red-400 mt-0.5" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-red-400 mt-0.5" />
                                                )}
                                            </button>
                                            {expandedAudit === audit.id && (
                                                <div className="p-3 bg-red-50/50 dark:bg-red-900/5 border-t border-red-100 dark:border-red-900/30">
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">{audit.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {passingAudits.length > 0 && (
                                        <div className="pt-2">
                                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                Passed ({passingAudits.length})
                                            </h4>
                                            {passingAudits.map((audit) => (
                                                <div key={audit.id} className="flex items-center gap-2 py-1.5">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">{audit.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
