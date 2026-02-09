'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
    Globe,
    Scale,
    BookOpen,
    Library,
    Gavel,
    ShieldCheck,
    Radar,
    Sparkles,
    FileText,
    Map,
} from 'lucide-react';

const Research = () => {
    const { isDark } = useTheme();

    const pillars = [
        {
            icon: Globe,
            title: 'Bi-National Scope',
            description: 'Canada + United States criminal law coverage with comparative analysis.'
        },
        {
            icon: Library,
            title: 'Primary Sources',
            description: 'Statutes, case law, sentencing guidance, and procedural rules.'
        },
        {
            icon: ShieldCheck,
            title: 'Defenses + Rights',
            description: 'Constitutional protections, defenses, and due process safeguards.'
        },
        {
            icon: Radar,
            title: 'Continuous Updates',
            description: 'Versioned research with change logs and review checkpoints.'
        }
    ];

    const focusAreas = [
        'Offense elements and mental states (mens rea)',
        'Defenses, exceptions, and justifications',
        'Procedure: arrest, bail, trial, appeals',
        'Sentencing frameworks and mitigation factors',
        'Evidence standards and admissibility',
        'Youth, cybercrime, and organized crime',
        'Victim rights and restitution',
        'Cross-border considerations'
    ];

    const jurisdictions = [
        {
            title: 'Canada',
            highlights: [
                'Criminal Code (federal)',
                'Charter rights and freedoms',
                'Supreme Court of Canada precedent',
                'Provincial procedure rules'
            ]
        },
        {
            title: 'United States',
            highlights: [
                'Title 18 U.S. Code (federal)',
                'State criminal statutes + MPC influence',
                'Constitutional protections (4th, 5th, 6th Amend.)',
                'Federal + state sentencing guidance'
            ]
        }
    ];

    const deliverables = [
        {
            icon: FileText,
            title: 'Research Dossiers',
            detail: 'Topic briefs with citations, elements, defenses, and case summaries.'
        },
        {
            icon: Map,
            title: 'Comparative Matrices',
            detail: 'Side-by-side mappings of Canada vs US rules and definitions.'
        },
        {
            icon: BookOpen,
            title: 'Source Index',
            detail: 'Curated primary and secondary sources with freshness dates.'
        },
        {
            icon: Sparkles,
            title: 'AI-Ready Notes',
            detail: 'Structured notes optimized for retrieval and question answering.'
        }
    ];

    return (
        <PageWrapper title="Research">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <div className="mb-10">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${isDark
                        ? 'bg-white/5 border-white/10 text-purple-300'
                        : 'bg-white/70 border-gray-200 text-purple-600'
                        }`}>
                        <Scale className="w-4 h-4" />
                        Criminal Law Research Program
                    </span>
                    <h2 className={`text-3xl md:text-4xl font-bold mt-4 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Canada + US Criminal Law Research
                    </h2>
                    <p className="text-lg max-w-3xl">
                        A structured, citation-forward research program designed to power the Kimuntu Legal Track and AI assistant. This page outlines scope, sources, methodology, and how the findings are prepared for database population.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {pillars.map((pillar, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-2xl border transition-all ${isDark
                                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                                <pillar.icon className={`w-6 h-6 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {pillar.title}
                            </h3>
                            <p className="text-sm leading-relaxed">{pillar.description}</p>
                        </div>
                    ))}
                </div>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Research Coverage
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                            }`}>
                            <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Focus Areas
                            </h4>
                            <ul className="space-y-3">
                                {focusAreas.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
                            : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200'
                            }`}>
                            <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Jurisdiction Highlights
                            </h4>
                            <div className="space-y-6">
                                {jurisdictions.map((jurisdiction, index) => (
                                    <div key={index}>
                                        <p className={`font-semibold mb-2 ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
                                            {jurisdiction.title}
                                        </p>
                                        <ul className="space-y-2">
                                            {jurisdiction.highlights.map((item, idx) => (
                                                <li key={idx} className="text-sm flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white/60' : 'bg-purple-600'}`}></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Comparative Snapshot
                    </h3>
                    <div className={`overflow-x-auto rounded-2xl border ${isDark
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/60 border-gray-200'
                        }`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'text-purple-200' : 'text-purple-700'}>
                                    <th className="px-4 py-3 text-left">Category</th>
                                    <th className="px-4 py-3 text-left">Canada</th>
                                    <th className="px-4 py-3 text-left">United States</th>
                                </tr>
                            </thead>
                            <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                <tr className={isDark ? 'border-t border-white/10' : 'border-t border-gray-200'}>
                                    <td className="px-4 py-3 font-medium">Primary Statute</td>
                                    <td className="px-4 py-3">Criminal Code (federal)</td>
                                    <td className="px-4 py-3">Title 18 U.S. Code + state codes</td>
                                </tr>
                                <tr className={isDark ? 'border-t border-white/10' : 'border-t border-gray-200'}>
                                    <td className="px-4 py-3 font-medium">Constitutional Rights</td>
                                    <td className="px-4 py-3">Charter rights</td>
                                    <td className="px-4 py-3">4th/5th/6th Amendments</td>
                                </tr>
                                <tr className={isDark ? 'border-t border-white/10' : 'border-t border-gray-200'}>
                                    <td className="px-4 py-3 font-medium">Sentencing Guidance</td>
                                    <td className="px-4 py-3">Judicial guidance + principles</td>
                                    <td className="px-4 py-3">Federal and state guidelines</td>
                                </tr>
                                <tr className={isDark ? 'border-t border-white/10' : 'border-t border-gray-200'}>
                                    <td className="px-4 py-3 font-medium">Case Law Authority</td>
                                    <td className="px-4 py-3">Supreme Court of Canada</td>
                                    <td className="px-4 py-3">U.S. Supreme Court + state courts</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Methodology
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                            }`}>
                            <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Source Strategy
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                    Primary statutes and official legislation portals
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                    High-court decisions and official reporters
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                    Sentencing guidance and procedural rules
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                    Secondary sources for summaries and commentary
                                </li>
                            </ul>
                        </div>
                        <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                            }`}>
                            <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                QA & Review
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                    Dual-source verification for each entry
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                    Change tracking with update timestamps
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                    Legal review checklist for high-impact topics
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                    Structured data capture for AI retrieval
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Research Deliverables
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {deliverables.map((item, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl border ${isDark
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-white/60 border-gray-200'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                                    <item.icon className={`w-6 h-6 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                                </div>
                                <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {item.title}
                                </h4>
                                <p className="text-sm leading-relaxed">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={`p-8 rounded-2xl border ${isDark
                    ? 'bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 border-white/10'
                    : 'bg-gradient-to-br from-purple-100 via-white to-pink-100 border-gray-200'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-white/80'}`}>
                            <Gavel className={`w-6 h-6 ${isDark ? 'text-purple-200' : 'text-purple-700'}`} />
                        </div>
                        <div>
                            <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Ready for Database Population
                            </h3>
                            <p className="mb-4 max-w-2xl">
                                Research outputs are structured for direct ingestion into the Kimuntu legal database, enabling fast retrieval, comparative analysis, and grounded AI responses.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="/database"
                                    className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
                                >
                                    View Database Plan
                                </a>
                                <a
                                    href="/chat"
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${isDark
                                        ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                                        : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    Try Legal AI Demo
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Research;
