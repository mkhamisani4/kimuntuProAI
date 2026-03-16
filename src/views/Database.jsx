'use client';

import React, { useState } from 'react';
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
    Scale,
    Globe,
    BookOpen,
    Search,
    Upload,
    Filter,
    Link2,
    ShieldAlert,
    Printer,
    ChevronDown,
    ChevronUp,
    BarChart3,
    Gavel,
    Hash,
    Clock,
    BadgeCheck
} from 'lucide-react';

const Database = () => {
    const { isDark } = useTheme();
    const [expandedEntry, setExpandedEntry] = useState(null);

    const toggleEntry = (index) => {
        setExpandedEntry(expandedEntry === index ? null : index);
    };

    const stats = [
        { value: '1,200+', label: 'Legal Entries', icon: DatabaseIcon },
        { value: '2', label: 'Jurisdictions', icon: Globe },
        { value: '50+', label: 'Offense Types', icon: Scale },
        { value: '200+', label: 'Case Citations', icon: BookOpen },
        { value: '6', label: 'Data Entities', icon: Layers },
        { value: '95%', label: 'Verification Rate', icon: BadgeCheck }
    ];

    const entities = [
        {
            icon: Scale,
            title: 'Offenses',
            description: 'Complete offense definitions including actus reus, mens rea, grading levels, statutory references, and penalty ranges for both Canadian and US jurisdictions.'
        },
        {
            icon: ShieldCheck,
            title: 'Defenses',
            description: 'Comprehensive defense catalog covering justifications (self-defense, necessity), excuses (duress, intoxication), and procedural defenses with burden allocation.'
        },
        {
            icon: FileText,
            title: 'Case Law',
            description: 'Landmark and leading cases with holdings, ratio decidendi, judicial reasoning summaries, and citation chains for precedent tracking.'
        },
        {
            icon: Tag,
            title: 'Procedural Rules',
            description: 'Step-by-step procedural frameworks from arrest through appeal, including bail/remand, disclosure, trial procedures, and post-conviction remedies.'
        },
        {
            icon: Layers,
            title: 'Sentencing',
            description: 'Sentencing ranges, mandatory minimums, aggravating/mitigating factors, conditional sentences, and jurisdiction-specific guidelines.'
        },
        {
            icon: Sparkles,
            title: 'AI-Ready Notes',
            description: 'RAG-optimized document chunks with embedded metadata, semantic tags, citation links, and retrieval-tuned summaries.'
        }
    ];

    const schemaFields = [
        { field: 'id', type: 'UUID', purpose: 'Unique entry identifier', example: 'a3f1c2d4-...' },
        { field: 'jurisdiction', type: 'Enum', purpose: 'Primary jurisdiction', example: 'Canada | US' },
        { field: 'jurisdiction_sub', type: 'String', purpose: 'Province, state, or territory', example: 'Ontario | California' },
        { field: 'source_type', type: 'Enum', purpose: 'Entry classification', example: 'Statute | Case Law | Guideline' },
        { field: 'offense_category', type: 'Enum', purpose: 'Broad offense grouping', example: 'Violent | Property | Drug | Regulatory' },
        { field: 'title', type: 'String', purpose: 'Entry display name', example: 'Theft Under $5,000' },
        { field: 'citation', type: 'String', purpose: 'Official legal citation', example: 'R v. Oakes, [1986] 1 SCR 103' },
        { field: 'statute_ref', type: 'String', purpose: 'Statutory section reference', example: 'Criminal Code, RSC 1985, c C-46, s 322' },
        { field: 'summary', type: 'Text', purpose: 'Plain-language overview', example: 'Fraudulently taking property...' },
        { field: 'elements', type: 'JSON Array', purpose: 'Required offense elements', example: '["actus reus: taking...", "mens rea: intent"]' },
        { field: 'mens_rea', type: 'String', purpose: 'Mental element standard', example: 'Specific Intent | General Intent | Strict' },
        { field: 'defenses', type: 'JSON Array', purpose: 'Applicable defenses', example: '["colour of right", "consent"]' },
        { field: 'penalties', type: 'Text', purpose: 'Sentencing description', example: 'Indictable: max 10 years; Summary: max 2 years less a day' },
        { field: 'penalty_range', type: 'JSON', purpose: 'Structured sentencing range', example: '{"min": 0, "max_years": 10, "type": "indictable"}' },
        { field: 'related_cases', type: 'JSON Array', purpose: 'Linked case law citations', example: '["R v. Corbett", "R v. Kowbel"]' },
        { field: 'tags', type: 'String Array', purpose: 'Taxonomy and search labels', example: '["theft", "property", "hybrid"]' },
        { field: 'last_verified', type: 'Date', purpose: 'Last verification timestamp', example: '2025-01-15' },
        { field: 'version', type: 'Integer', purpose: 'Schema version number', example: '3' },
        { field: 'ai_chunks', type: 'JSON Array', purpose: 'RAG-optimized text segments', example: '[{"chunk": "...", "tokens": 284}]' }
    ];

    const sampleEntries = [
        {
            title: 'Theft',
            badge: 'Canada',
            badgeColor: 'from-red-500 to-red-600',
            data: {
                id: 'c7a2e1f0-4b3d-4e5a-9c8b-1d2f3e4a5b6c',
                jurisdiction: 'Canada',
                jurisdiction_sub: 'Federal (all provinces)',
                source_type: 'Statute',
                offense_category: 'Property',
                title: 'Theft (Under / Over $5,000)',
                citation: 'Criminal Code, RSC 1985, c C-46',
                statute_ref: 's. 322(1)',
                summary: 'Every one commits theft who fraudulently and without colour of right takes, or converts to their use, anything with intent to deprive the owner temporarily or absolutely.',
                elements: [
                    'Actus reus: fraudulent taking or conversion of property',
                    'Mens rea: specific intent to deprive owner',
                    'Without colour of right',
                    'Property must be capable of being stolen'
                ],
                mens_rea: 'Specific Intent',
                defenses: ['Colour of right', 'Consent', 'Honest but mistaken belief in ownership'],
                penalties: 'Over $5,000 (s.334(a)): indictable, max 10 years. Under $5,000 (s.334(b)): hybrid, summary max 2 years less a day.',
                penalty_range: { min: 0, max_years: 10, type: 'hybrid' },
                related_cases: ['R v. Kowbel [1954] SCR 498', 'R v. Milne [1992] 1 SCR 697'],
                tags: ['theft', 'property', 'hybrid', 'larceny'],
                last_verified: '2025-01-12',
                version: 3
            }
        },
        {
            title: 'Assault',
            badge: 'United States',
            badgeColor: 'from-blue-500 to-blue-600',
            data: {
                id: 'b8d3f2a1-5c4e-4f6b-8d9a-2e3f4a5b6c7d',
                jurisdiction: 'US',
                jurisdiction_sub: 'Model Penal Code (adopted by majority)',
                source_type: 'Statute',
                offense_category: 'Violent',
                title: 'Simple Assault',
                citation: 'Model Penal Code \u00a7 211.1',
                statute_ref: 'MPC \u00a7 211.1(1)',
                summary: 'A person is guilty of assault if he attempts to cause or purposely, knowingly, or recklessly causes bodily injury to another, or negligently causes bodily injury with a deadly weapon.',
                elements: [
                    'Actus reus: attempt or actual causation of bodily injury',
                    'Mens rea: purposely, knowingly, or recklessly',
                    'Victim: another person',
                    'Alternatively: negligent injury via deadly weapon'
                ],
                mens_rea: 'General Intent (purposely, knowingly, or recklessly)',
                defenses: ['Self-defense (\u00a7 3.04)', 'Defense of others (\u00a7 3.05)', 'Consent', 'Provocation (mitigation)'],
                penalties: 'Simple assault: misdemeanor. Aggravated assault (\u00a7 211.1(2)): felony of the second or third degree.',
                penalty_range: { min: 0, max_years: 10, type: 'felony (if aggravated)' },
                related_cases: ['People v. Goetz (1986)', 'State v. Norman (1989)'],
                tags: ['assault', 'violent', 'person', 'misdemeanor'],
                last_verified: '2025-02-03',
                version: 2
            }
        },
        {
            title: 'Self-Defense',
            badge: 'Canada',
            badgeColor: 'from-red-500 to-red-600',
            data: {
                id: 'e9f4a3b2-6d5f-4a7c-9e0b-3f4a5b6c7d8e',
                jurisdiction: 'Canada',
                jurisdiction_sub: 'Federal (all provinces)',
                source_type: 'Statute + Case Law',
                offense_category: 'Defense (Justification)',
                title: 'Defence of Person (Self-Defence)',
                citation: 'Criminal Code, RSC 1985, c C-46, s. 34',
                statute_ref: 's. 34(1)',
                summary: 'A person is not guilty of an offence if they believe on reasonable grounds that force or threat of force is being used against them, the act is committed for the purpose of defending themselves, and the act committed is reasonable in the circumstances.',
                elements: [
                    'Reasonable belief of force or threat of force',
                    'Defensive purpose: act done to defend or protect',
                    'Proportionality: act is reasonable in the circumstances',
                    'Court considers factors under s. 34(2)'
                ],
                mens_rea: 'N/A (defense negates liability)',
                defenses: ['N/A \u2014 this entry IS a defense'],
                penalties: 'N/A \u2014 successful defense results in acquittal',
                penalty_range: { min: null, max_years: null, type: 'defense' },
                related_cases: ['R v. Lavallee [1990] 1 SCR 852', 'R v. Cinous [2002] 2 SCR 3', 'R v. Khill [2021] SCC 37'],
                tags: ['self-defense', 'justification', 'defense', 'force'],
                last_verified: '2025-01-20',
                version: 4
            }
        }
    ];

    const pipelineSteps = [
        {
            step: 1,
            title: 'Source Ingestion',
            icon: Upload,
            description: 'Import statutes, case law, and legal commentary from official government databases, court registries, and verified legal publishers.'
        },
        {
            step: 2,
            title: 'Jurisdiction Normalization',
            icon: Globe,
            description: 'Tag and normalize entries by jurisdiction (Canada/US), sub-jurisdiction (province/state), and legal system (common law, statutory).'
        },
        {
            step: 3,
            title: 'Element Extraction',
            icon: Filter,
            description: 'Parse offense elements, mens rea standards, actus reus requirements, defenses, and penalty structures into structured schema fields.'
        },
        {
            step: 4,
            title: 'Citation Attachment',
            icon: Link2,
            description: 'Link each entry to authoritative citations, related cases, cross-references, and statutory amendments with proper Bluebook/McGill formatting.'
        },
        {
            step: 5,
            title: 'Dual-Source Verification',
            icon: ShieldAlert,
            description: 'Every entry is verified against at least two independent authoritative sources. Flagged entries undergo manual legal review before publication.'
        },
        {
            step: 6,
            title: 'AI Index Publishing',
            icon: Printer,
            description: 'Chunk verified entries into RAG-optimized segments, generate semantic embeddings, attach metadata tags, and publish to the retrieval index.'
        }
    ];

    const dataQuality = [
        { label: 'Verified Sources', value: 94, width: 'w-[94%]' },
        { label: 'Schema Completeness', value: 91, width: 'w-[91%]' },
        { label: 'Update Recency', value: 96, width: 'w-[96%]' },
        { label: 'Citation Accuracy', value: 93, width: 'w-[93%]' },
        { label: 'AI Retrieval Score', value: 89, width: 'w-[89%]' }
    ];

    const jurisdictionMatrix = [
        { area: 'Offenses', canada: 'Complete', us: 'Complete', canadaColor: 'text-emerald-400', usColor: 'text-emerald-400' },
        { area: 'Defenses', canada: 'Complete', us: 'In Progress', canadaColor: 'text-emerald-400', usColor: 'text-yellow-400' },
        { area: 'Case Law', canada: '85+ cases', us: '120+ cases', canadaColor: 'text-emerald-400', usColor: 'text-emerald-400' },
        { area: 'Procedure', canada: 'Complete', us: 'Complete', canadaColor: 'text-emerald-400', usColor: 'text-emerald-400' },
        { area: 'Sentencing', canada: 'Complete', us: 'In Progress', canadaColor: 'text-emerald-400', usColor: 'text-yellow-400' },
        { area: 'Youth Justice', canada: 'Complete', us: 'In Progress', canadaColor: 'text-emerald-400', usColor: 'text-yellow-400' }
    ];

    return (
        <PageWrapper title="Database">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>

                {/* ── Hero Section ── */}
                <div className="mb-14">
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
                    <p className="text-lg max-w-3xl leading-relaxed">
                        Transforming criminal law research into a structured, queryable, AI-ready database.
                        Every entry is normalized for fast retrieval, comparative analysis, and grounded AI responses
                        across Canadian and US jurisdictions.
                    </p>
                </div>

                {/* ── Live Stats Dashboard ── */}
                <section className="mb-14">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className={`p-5 rounded-2xl border text-center transition-all hover:scale-[1.03] ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80 hover:shadow-lg'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                    <stat.icon className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                </div>
                                <p className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stat.value}
                                </p>
                                <p className="text-xs">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Data Entities Section ── */}
                <section className="mb-14">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Data Entities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {entities.map((entity, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80 hover:shadow-lg'
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

                {/* ── Detailed Schema Table ── */}
                <section className="mb-14">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Database Schema
                    </h3>
                    <div className={`overflow-x-auto rounded-2xl border ${isDark
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/60 border-gray-200'
                    }`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'text-emerald-200' : 'text-emerald-700'}>
                                    <th className="px-4 py-3 text-left font-semibold">Field</th>
                                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                                    <th className="px-4 py-3 text-left font-semibold">Purpose</th>
                                    <th className="px-4 py-3 text-left font-semibold">Example</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schemaFields.map((row, index) => (
                                    <tr key={index} className={isDark ? 'border-t border-white/10' : 'border-t border-gray-200'}>
                                        <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                            {row.field}
                                        </td>
                                        <td className={`px-4 py-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {row.type}
                                        </td>
                                        <td className="px-4 py-3">{row.purpose}</td>
                                        <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {row.example}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── Sample Database Entries ── */}
                <section className="mb-14">
                    <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Sample Database Entries
                    </h3>
                    <p className="mb-6 text-sm">Click an entry to expand its full schema data.</p>
                    <div className="space-y-4">
                        {sampleEntries.map((entry, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl border overflow-hidden transition-all ${isDark
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-white/60 border-gray-200'
                                }`}
                            >
                                {/* Entry Header */}
                                <button
                                    onClick={() => toggleEntry(index)}
                                    className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isDark
                                        ? 'hover:bg-white/5'
                                        : 'hover:bg-white/80'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                            <Gavel className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {entry.title}
                                            </h4>
                                            <p className="text-sm">{entry.data.citation}</p>
                                        </div>
                                        <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${entry.badgeColor}`}>
                                            {entry.badge}
                                        </span>
                                    </div>
                                    {expandedEntry === index
                                        ? <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                        : <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                    }
                                </button>

                                {/* Entry Body */}
                                {expandedEntry === index && (
                                    <div className={`px-5 pb-5 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                        <div className={`mt-4 p-4 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto ${isDark
                                            ? 'bg-black/40 text-gray-300'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            <div>{'{'}</div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"id"</span>
                                                : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.id}"</span>,
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"jurisdiction"</span>
                                                : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.jurisdiction}"</span>,
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"jurisdiction_sub"</span>
                                                : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.jurisdiction_sub}"</span>,
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"source_type"</span>
                                                : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.source_type}"</span>,
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"offense_category"</span>
                                                : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.offense_category}"</span>,
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"title"</span>
                                                : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.title}"</span>,
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"citation"</span>
                                                : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.citation}"</span>,
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"statute_ref"</span>
                                                : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.statute_ref}"</span>,
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"summary"</span>
                                                : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.summary}"</span>,
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"elements"</span>: [
                                                {entry.data.elements.map((el, i) => (
                                                    <div key={i} className="ml-8">
                                                        <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{el}"</span>
                                                        {i < entry.data.elements.length - 1 ? ',' : ''}
                                                    </div>
                                                ))}
                                                <span className="ml-4">],</span>
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"mens_rea"</span>
                                                : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.mens_rea}"</span>,
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"defenses"</span>: [
                                                {entry.data.defenses.map((d, i) => (
                                                    <div key={i} className="ml-8">
                                                        <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{d}"</span>
                                                        {i < entry.data.defenses.length - 1 ? ',' : ''}
                                                    </div>
                                                ))}
                                                <span className="ml-4">],</span>
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"penalties"</span>
                                                : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.penalties}"</span>,
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"penalty_range"</span>: {'{'}
                                                <div className="ml-8">
                                                    <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"min"</span>
                                                    : <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>{entry.data.penalty_range.min === null ? 'null' : entry.data.penalty_range.min}</span>,
                                                </div>
                                                <div className="ml-8">
                                                    <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"max_years"</span>
                                                    : <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>{entry.data.penalty_range.max_years === null ? 'null' : entry.data.penalty_range.max_years}</span>,
                                                </div>
                                                <div className="ml-8">
                                                    <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"type"</span>
                                                    : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.penalty_range.type}"</span>
                                                </div>
                                                <span className="ml-4">{'}'},</span>
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"related_cases"</span>: [
                                                {entry.data.related_cases.map((rc, i) => (
                                                    <div key={i} className="ml-8">
                                                        <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{rc}"</span>
                                                        {i < entry.data.related_cases.length - 1 ? ',' : ''}
                                                    </div>
                                                ))}
                                                <span className="ml-4">],</span>
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"tags"</span>
                                                : [
                                                {entry.data.tags.map((t, i) => (
                                                    <span key={i}>
                                                        <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{t}"</span>
                                                        {i < entry.data.tags.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                                ],
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"last_verified"</span>
                                                : <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>"{entry.data.last_verified}"</span>,
                                            </div>
                                            <div className="ml-4">
                                                <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"version"</span>
                                                : <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>{entry.data.version}</span>
                                            </div>
                                            <div>{'}'}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Population Workflow ── */}
                <section className="mb-14">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Population Workflow
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pipelineSteps.map((step, index) => (
                            <div
                                key={index}
                                className={`relative p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80 hover:shadow-lg'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                        <step.icon className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDark
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        Step {step.step}
                                    </span>
                                </div>
                                <h4 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {step.title}
                                </h4>
                                <p className="text-sm leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Data Quality & Jurisdiction Coverage ── */}
                <section className="mb-14">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Data Quality Progress Bars */}
                        <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3 mb-6">
                                <CheckCircle2 className={`w-6 h-6 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Data Quality Metrics
                                </h3>
                            </div>
                            <div className="space-y-5">
                                {dataQuality.map((metric, index) => (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2 text-sm">
                                            <span>{metric.label}</span>
                                            <span className={`font-semibold ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>{metric.value}%</span>
                                        </div>
                                        <div className={`h-2.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-700 ${metric.width} ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Jurisdiction Coverage Matrix */}
                        <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3 mb-6">
                                <Globe className={`w-6 h-6 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Jurisdiction Coverage
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className={isDark ? 'text-emerald-200' : 'text-emerald-700'}>
                                            <th className="px-3 py-2 text-left font-semibold">Area</th>
                                            <th className="px-3 py-2 text-center font-semibold">Canada</th>
                                            <th className="px-3 py-2 text-center font-semibold">United States</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jurisdictionMatrix.map((row, index) => (
                                            <tr key={index} className={isDark ? 'border-t border-white/10' : 'border-t border-gray-200'}>
                                                <td className={`px-3 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {row.area}
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                                                        row.canada === 'Complete'
                                                            ? isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                                            : isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {row.canada}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                                                        row.us === 'Complete' || row.us.includes('+')
                                                            ? isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                                            : isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {row.us}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CTA Section ── */}
                <section className={`p-8 rounded-2xl border ${isDark
                    ? 'bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 border-white/10'
                    : 'bg-gradient-to-br from-emerald-100 via-white to-cyan-100 border-gray-200'
                }`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-white/80'}`}>
                            <ArrowUpRight className={`w-6 h-6 ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`} />
                        </div>
                        <div>
                            <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Put the Database to Work
                            </h3>
                            <p className="mb-5 max-w-2xl leading-relaxed">
                                The populated database powers KimuntuPro's legal AI assistant, delivering precise,
                                citation-grounded answers across criminal law topics. Start a conversation or explore
                                the research methodology behind the data.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="/chat"
                                    className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                                >
                                    Launch Legal AI Chat
                                </a>
                                <a
                                    href="/research"
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${isDark
                                        ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                                        : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Explore Research Methodology
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
