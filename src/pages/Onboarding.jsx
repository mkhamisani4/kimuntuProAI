'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
    Sparkles,
    Compass,
    Scale,
    Globe,
    ShieldCheck,
    Settings,
    CheckCircle2,
    User,
    FileText
} from 'lucide-react';

const Onboarding = () => {
    const { isDark } = useTheme();

    const steps = [
        {
            icon: User,
            title: 'Profile Setup',
            description: 'Confirm role, organization type, and legal focus.'
        },
        {
            icon: Scale,
            title: 'Choose Track',
            description: 'Activate the Legal Track for criminal law workflows.'
        },
        {
            icon: Globe,
            title: 'Jurisdiction',
            description: 'Select Canada, US, or both for comparative insights.'
        },
        {
            icon: FileText,
            title: 'Documents',
            description: 'Upload policies, case notes, or internal templates.'
        },
        {
            icon: Settings,
            title: 'AI Preferences',
            description: 'Set tone, detail level, and citation requirements.'
        },
        {
            icon: CheckCircle2,
            title: 'Launch',
            description: 'Begin using the AI assistant and legal database.'
        }
    ];

    const quickActions = [
        'Import existing case research',
        'Enable criminal law update alerts',
        'Invite collaborators to review data',
        'Connect knowledge sources for RAG'
    ];

    return (
        <PageWrapper title="Onboarding">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <div className={`relative overflow-hidden rounded-3xl p-8 mb-10 border ${isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/70 border-gray-200'
                    }`}
                >
                    <div className={`absolute inset-0 ${isDark
                        ? 'bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10'
                        : 'bg-gradient-to-br from-purple-100 via-white to-pink-100'
                        } pointer-events-none`}></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                                <Compass className={`w-6 h-6 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                            </div>
                            <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border ${isDark
                                ? 'bg-white/5 border-white/10 text-purple-200'
                                : 'bg-white/80 border-gray-200 text-purple-700'
                                }`}>
                                <Sparkles className="w-3 h-3" />
                                Glass Polymorphism Flow
                            </span>
                        </div>
                        <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Welcome to Kimuntu Legal Onboarding
                        </h2>
                        <p className="text-lg max-w-3xl">
                            This guided setup configures your criminal law workspace, aligns jurisdictions, and prepares the AI assistant to deliver reliable, citation-backed answers.
                        </p>
                    </div>
                </div>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Setup Steps
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`relative p-6 rounded-2xl border backdrop-blur-xl ${isDark
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-white/70 border-gray-200'
                                    }`}
                            >
                                <div className={`absolute inset-0 rounded-2xl ${isDark
                                    ? 'bg-gradient-to-br from-white/10 via-transparent to-transparent'
                                    : 'bg-gradient-to-br from-white/60 via-transparent to-transparent'
                                    } pointer-events-none`}></div>
                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                                        <step.icon className={`w-6 h-6 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                                    </div>
                                    <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {step.title}
                                    </h4>
                                    <p className="text-sm leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className={`w-6 h-6 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Compliance Checklist
                                </h4>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                    Confirm privacy and confidentiality requirements
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                    Set citation depth for AI responses
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                    Align jurisdictional boundaries and role-based access
                                </li>
                            </ul>
                        </div>
                        <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-white/10'
                            : 'bg-gradient-to-br from-purple-100 to-indigo-100 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className={`w-6 h-6 ${isDark ? 'text-purple-200' : 'text-purple-700'}`} />
                                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Quick Actions
                                </h4>
                            </div>
                            <ul className="space-y-3">
                                {quickActions.map((action, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className={`mt-2 w-2 h-2 rounded-full ${isDark ? 'bg-purple-300' : 'bg-purple-600'}`}></span>
                                        {action}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section className={`p-8 rounded-2xl border ${isDark
                    ? 'bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 border-white/10'
                    : 'bg-gradient-to-br from-purple-100 via-white to-pink-100 border-gray-200'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-white/80'}`}>
                            <Compass className={`w-6 h-6 ${isDark ? 'text-purple-200' : 'text-purple-700'}`} />
                        </div>
                        <div>
                            <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Begin Your Legal Workspace
                            </h3>
                            <p className="mb-4 max-w-2xl">
                                After onboarding, the AI assistant is ready to answer criminal law questions with structured, citation-aware responses.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="/chat"
                                    className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
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
                                    View Research Plan
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Onboarding;
