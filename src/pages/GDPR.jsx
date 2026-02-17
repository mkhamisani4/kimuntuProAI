'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Shield, Lock, Eye, Download, Trash2, FileText } from 'lucide-react';

const GDPR = () => {
    const { isDark } = useTheme();

    const rights = [
        {
            icon: Eye,
            title: 'Right to Access',
            description: 'You can request a copy of all personal data we hold about you.',
        },
        {
            icon: FileText,
            title: 'Right to Rectification',
            description: 'You can request correction of inaccurate or incomplete data.',
        },
        {
            icon: Trash2,
            title: 'Right to Erasure',
            description: 'You can request deletion of your personal data ("right to be forgotten").',
        },
        {
            icon: Lock,
            title: 'Right to Restriction',
            description: 'You can request restriction of processing of your personal data.',
        },
        {
            icon: Download,
            title: 'Right to Data Portability',
            description: 'You can request your data in a structured, machine-readable format.',
        },
        {
            icon: Shield,
            title: 'Right to Object',
            description: 'You can object to processing of your personal data.',
        },
    ];

    return (
        <PageWrapper title="GDPR Compliance">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    GDPR Compliance
                </h2>
                <p className="mb-6 text-lg">
                    KimuntuPro AI is committed to protecting your privacy and ensuring compliance with the General Data Protection Regulation (GDPR).
                </p>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Your Data Rights
                    </h3>
                    <p className="mb-6">
                        Under GDPR, you have the following rights regarding your personal data:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {rights.map((right, index) => (
                            <div
                                key={index}
                                className={`p-5 rounded-xl border ${isDark
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                        : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                    } transition-all`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                        }`}>
                                        <right.icon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'
                                            }`} />
                                    </div>
                                    <div>
                                        <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {right.title}
                                        </h4>
                                        <p className="text-sm">{right.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        How We Protect Your Data
                    </h3>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>End-to-end encryption for data in transit</li>
                        <li>Encrypted storage of sensitive information</li>
                        <li>Regular security audits and assessments</li>
                        <li>Strict access controls and authentication</li>
                        <li>Data minimization principles</li>
                        <li>Regular staff training on data protection</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Legal Basis for Processing
                    </h3>
                    <p className="mb-4">
                        We process your personal data based on:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Consent:</strong> You have given clear consent for specific purposes</li>
                        <li><strong>Contract:</strong> Processing is necessary to fulfill our contract with you</li>
                        <li><strong>Legal Obligation:</strong> Processing is necessary to comply with the law</li>
                        <li><strong>Legitimate Interest:</strong> Processing is necessary for our legitimate interests</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Data Retention
                    </h3>
                    <p className="mb-4">
                        We retain your personal data only for as long as necessary to fulfill the purposes for which we collected it, including legal, accounting, or reporting requirements.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        International Data Transfers
                    </h3>
                    <p className="mb-4">
                        When we transfer personal data outside the EEA, we ensure appropriate safeguards are in place to protect your data, including standard contractual clauses approved by the European Commission.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Exercising Your Rights
                    </h3>
                    <p className="mb-4">
                        To exercise any of your GDPR rights, please contact our Data Protection Officer at:
                    </p>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'}`}>
                        <p className={`font-semibold mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            Data Protection Officer
                        </p>
                        <p>Email: dpo@kimuntupro.com</p>
                        <p>Response time: Within 30 days</p>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Complaints
                    </h3>
                    <p className="mb-4">
                        If you believe we have not handled your personal data in accordance with GDPR, you have the right to lodge a complaint with your local supervisory authority.
                    </p>
                </section>
            </div>
        </PageWrapper>
    );
};

export default GDPR;
