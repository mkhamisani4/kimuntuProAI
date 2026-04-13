'use client';

import React, { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import Image from 'next/image';
import {
    FileText, Plus, Search, FolderOpen,
    Clock, Download, Trash2, MoreHorizontal,
    File, FileSpreadsheet, Presentation
} from 'lucide-react';

export default function DocumentsPage() {
    const { isDark } = useTheme();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    // Placeholder documents (empty state for now)
    const documents = [];

    return (
        <div className="max-w-5xl mx-auto py-4 relative">
            {/* Aurora background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-20 -left-32 w-96 h-96 rounded-full blur-[120px] ${isDark ? 'bg-emerald-500/8' : 'bg-emerald-500/5'}`} />
                <div className={`absolute bottom-20 -right-32 w-80 h-80 rounded-full blur-[120px] ${isDark ? 'bg-teal-500/8' : 'bg-teal-500/5'}`} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                            <FileText className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                    </div>
                    <div>
                        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.myDocuments}
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-white/40' : 'text-black'}`}>
                            All your generated documents in one place
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className={`relative rounded-2xl p-4 mb-6 overflow-hidden ${
                isDark
                    ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl'
                    : 'bg-white border border-black/5 shadow-lg'
            }`}>
                {isDark && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />}
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/30' : 'text-black'}`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search documents..."
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                                isDark
                                    ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                                    : 'bg-gray-50 border border-gray-200 text-black placeholder-black/30 focus:bg-white focus:border-emerald-500/50 focus:ring-emerald-500/20'
                            }`}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-emerald-500/25">
                        <Plus className="w-4 h-4" />
                        {t.createNewDocument}
                    </button>
                </div>
            </div>

            {/* Document Type Filters */}
            <div className="flex items-center gap-2 mb-6 relative z-10 overflow-x-auto pb-1">
                {[
                    { label: 'All', icon: FolderOpen, active: true },
                    { label: 'PDFs', icon: FileText, active: false },
                    { label: 'Spreadsheets', icon: FileSpreadsheet, active: false },
                    { label: 'Presentations', icon: Presentation, active: false },
                    { label: 'Other', icon: File, active: false },
                ].map((filter, i) => (
                    <button
                        key={i}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                            filter.active
                                ? isDark
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isDark
                                    ? 'bg-white/[0.03] text-white/50 hover:bg-white/5 hover:text-white/70 border border-white/5'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100'
                        }`}
                    >
                        <filter.icon className="w-3.5 h-3.5" />
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Empty State */}
            {documents.length === 0 && (
                <div className={`relative rounded-3xl p-16 overflow-hidden text-center ${
                    isDark
                        ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl'
                        : 'bg-white border border-black/5 shadow-2xl'
                }`}>
                    {isDark && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />}

                    <div className="relative z-10">
                        <div className="relative inline-block mb-6">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto ${
                                isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-100'
                            }`}>
                                <FolderOpen className={`w-10 h-10 ${isDark ? 'text-white/20' : 'text-black'}`} />
                            </div>
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-2xl" />
                        </div>

                        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            No Documents Yet
                        </h3>
                        <p className={`text-sm mb-8 max-w-sm mx-auto leading-relaxed ${isDark ? 'text-white/40' : 'text-black'}`}>
                            {t.documentsWillAppear}
                        </p>

                        {/* Quick start cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                            {[
                                { icon: FileText, label: 'Business Plan', desc: 'Generate a complete plan', gradient: 'from-emerald-500 to-teal-500' },
                                { icon: File, label: 'Resume / CV', desc: 'Build your professional CV', gradient: 'from-blue-500 to-cyan-500' },
                                { icon: FileSpreadsheet, label: 'Legal Document', desc: 'Draft contracts & more', gradient: 'from-violet-500 to-purple-500' },
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    className={`group p-5 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] ${
                                        isDark
                                            ? 'bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/20 hover:bg-white/[0.05]'
                                            : 'bg-gray-50 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${item.gradient} bg-opacity-10`}
                                        style={{ background: isDark ? `linear-gradient(135deg, rgba(16,185,129,0.1), rgba(20,184,166,0.1))` : `linear-gradient(135deg, rgba(16,185,129,0.08), rgba(20,184,166,0.08))` }}
                                    >
                                        <item.icon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    </div>
                                    <p className={`text-sm font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-black'}`}>{item.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity (placeholder) */}
            <div className={`relative rounded-3xl p-8 mt-6 overflow-hidden ${
                isDark
                    ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl'
                    : 'bg-white border border-black/5 shadow-2xl'
            }`}>
                {isDark && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />}

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                        <Clock className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Recent Activity
                        </h3>
                    </div>
                    <div className={`text-center py-8 ${isDark ? 'text-white/30' : 'text-black'}`}>
                        <p className="text-sm">Your recent document activity will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
