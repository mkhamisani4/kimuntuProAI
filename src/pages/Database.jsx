'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
    Database as DatabaseIcon,
    Layers,
    CheckCircle2,
    ShieldCheck,
    FileText,
    Tag,
    Workflow,
    Sparkles,
    ArrowUpRight,
    Scale
} from 'lucide-react';

const Database = () => {
    const { isDark } = useTheme();

    const entities = [
        {
            icon: Scale,
            title: 'Offenses',
            description: 'Elements, intent, grading, and penalties.'
        },
        {
            icon: ShieldCheck,
            title: 'Defenses',
            description: 'Justifications, excuses, burden shifts, and limitations.'
        },
        {
            icon: FileText,
            title: 'Case Law',
            description: 'Precedents, holdings, and key reasoning summaries.'
        },
        {
            icon: Tag,
            title: 'Procedural Rules',
            description: 'Arrest, bail, trial flow, and appeals.'
        },
        {
            icon: Layers,
            title: 'Sentencing',
            description: 'Guidelines, ranges, and mitigation factors.'
        },
        {
            icon: Sparkles,
            title: 'AI-Ready Notes',
            description: 'RAG-optimized summaries with citations.'
        }
    ];

    const pipelineSteps = [
        'Ingest primary sources and official updates',
        'Normalize by jurisdiction, topic, and offense type',
        'Extract elements, defenses, and penalties',
        'Attach citations and update timestamps',
        'Quality review with dual-source validation',
        'Publish to AI retrieval index'
    ];

    const dataQuality = [
        { label: 'Verified Sources', value: '92%', width: 'w-[92%]' },
        { label: 'Schema Completeness', value: '88%', width: 'w-[88%]' },
        { label: 'Update Recency', value: '95%', width: 'w-[95%]' }
    ];

    return (
        <PageWrapper title="Database">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <div className="mb-10">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${isDark
                        ? 'bg-white/5 border-white/10 text-emerald-300'
                        : 'bg-white/70 border-gray-200 text-emerald-600'
                        }`}>
                        <DatabaseIcon className="w-4 h-4" />
                        Criminal Law Database Population
                    </span>
                    <h2 className={`text-3xl md:text-4xl font-bold mt-4 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Structured Legal Knowledge Base
                    </h2>
                    <p className="text-lg max-w-3xl">
                        This section defines how criminal law research is transformed into a structured, queryable database. Each entry is normalized for fast retrieval, comparative analysis, and AI responses.
                    </p>
                </div>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Data Entities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {entities.map((entity, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl border transition-all ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                    <entity.icon className={`w-6 h-6 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                </div>
                                <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {entity.title}
                                </h4>
                                <p className="text-sm leading-relaxed">{entity.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Schema Snapshot
                    </h3>
                    <div className={`overflow-x-auto rounded-2xl border ${isDark
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/60 border-gray-200'
                        }`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'text-emerald-200' : 'text-emerald-700'}>
                                    <th className="px-4 py-3 text-left">Field</th>
                                    <th className="px-4 py-3 text-left">Purpose</th>
                                    <th className="px-4 py-3 text-left">Example</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['jurisdiction', 'Country + region', 'Canada / Ontario'],
                                    ['source_type', 'Statute, case, guideline', 'Case Law'],
                                    ['citation', 'Official reference', 'R v. Oakes, 1986'],
                                    ['summary', 'Plain-language overview', 'Reasoning + holding'],
                                    ['elements', 'Required elements', 'Actus reus + mens rea'],
                                    ['defenses', 'Applicable defenses', 'Self-defense, duress'],
                                    ['penalties', 'Sentencing range', 'Max 10 years'],
                                    ['tags', 'Taxonomy labels', 'assault, violent, youth']
                                ].map((row, index) => (
                                    <tr key={index} className={isDark ? 'border-t border-white/10' : 'border-t border-gray-200'}>
                                        <td className="px-4 py-3 font-medium">{row[0]}</td>
                                        <td className="px-4 py-3">{row[1]}</td>
                                        <td className="px-4 py-3">{row[2]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Population Workflow
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <Workflow className={`w-6 h-6 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    End-to-End Pipeline
                                </h4>
                            </div>
                            <ul className="space-y-3">
                                {pipelineSteps.map((step, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle2 className={`w-6 h-6 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Data Quality Gates
                                </h4>
                            </div>
                            <div className="space-y-4">
                                {dataQuality.map((metric, index) => (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2 text-sm">
                                            <span>{metric.label}</span>
                                            <span className={isDark ? 'text-emerald-200' : 'text-emerald-700'}>{metric.value}</span>
                                        </div>
                                        <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                            <div className={`h-2 rounded-full ${metric.width} ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className={`p-8 rounded-2xl border ${isDark
                    ? 'bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 border-white/10'
                    : 'bg-gradient-to-br from-emerald-100 via-white to-cyan-100 border-gray-200'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-white/80'}`}>
                            <ArrowUpRight className={`w-6 h-6 ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`} />
                        </div>
                        <div>
                            <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Next: Activate the AI Assistant
                            </h3>
                            <p className="mb-4 max-w-2xl">
                                The populated database powers the legal AI assistant for precise, grounded answers about criminal law.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="/chat"
                                    className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 transition-all"
                                >
                                    Launch Legal AI Demo
                                </a>
                                <a
                                    href="/research"
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${isDark
                                        ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                                        : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    Back to Research
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Database;
