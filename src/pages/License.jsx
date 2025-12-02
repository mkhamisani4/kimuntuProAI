'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';

const License = () => {
    const { isDark } = useTheme();

    return (
        <PageWrapper title="License">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Software License Agreement
                </h2>
                <p className="mb-4 text-sm text-gray-500">Version 1.0 | Last updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        License Grant
                    </h3>
                    <p className="mb-4">
                        Subject to the terms of this Agreement, KimuntuPro AI grants you a limited, non-exclusive, non-transferable license to access and use the platform for your personal or commercial purposes.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Intellectual Property Rights
                    </h3>
                    <p className="mb-4">
                        All intellectual property rights in the KimuntuPro AI platform, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Software code and architecture</li>
                        <li>AI models and algorithms</li>
                        <li>User interface and design</li>
                        <li>Logos, trademarks, and branding</li>
                        <li>Documentation and content</li>
                    </ul>
                    <p className="mb-4">
                        ...remain the exclusive property of KimuntuPro AI and its licensors.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        User Content Ownership
                    </h3>
                    <p className="mb-4">
                        You retain all rights to content you create using the platform. By using our services, you grant us a limited license to:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Process your content through our AI systems</li>
                        <li>Store your content on our servers</li>
                        <li>Display your content back to you</li>
                        <li>Make backups for data protection</li>
                    </ul>
                    <p className="mb-4">
                        We do not claim ownership of your content and will not use it for purposes other than providing our services.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Restrictions
                    </h3>
                    <p className="mb-4">
                        You may not:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Copy, modify, or create derivative works of the platform</li>
                        <li>Reverse engineer, decompile, or disassemble the software</li>
                        <li>Rent, lease, or sublicense access to the platform</li>
                        <li>Remove or alter any proprietary notices</li>
                        <li>Use the platform to build a competitive product</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Open Source Components
                    </h3>
                    <p className="mb-4">
                        The platform may include open source software components. These components are governed by their respective licenses, which are available in our documentation.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Warranty Disclaimer
                    </h3>
                    <p className="mb-4">
                        THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Limitation of Liability
                    </h3>
                    <p className="mb-4">
                        IN NO EVENT SHALL KIMUNTUPRO AI BE LIABLE FOR ANY SPECIAL, INCIDENTAL, INDIRECT, OR CONSEQUENTIAL DAMAGES WHATSOEVER ARISING OUT OF THE USE OF OR INABILITY TO USE THE PLATFORM.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Termination
                    </h3>
                    <p className="mb-4">
                        This license is effective until terminated. Your rights under this license will terminate automatically without notice if you fail to comply with any term of this Agreement.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Contact Information
                    </h3>
                    <p className="mb-4">
                        For licensing inquiries, contact:
                    </p>
                    <p className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        legal@kimuntupro.com
                    </p>
                </section>
            </div>
        </PageWrapper>
    );
};

export default License;
