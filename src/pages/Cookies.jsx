'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';

const Cookies = () => {
    const { isDark } = useTheme();

    return (
        <PageWrapper title="Cookie Policy">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Cookie Policy
                </h2>
                <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        What Are Cookies?
                    </h3>
                    <p className="mb-4">
                        Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        How We Use Cookies
                    </h3>
                    <p className="mb-4">
                        We use cookies for the following purposes:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                        <li><strong>Preference Cookies:</strong> Remember your settings and preferences (e.g., theme selection)</li>
                        <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
                        <li><strong>Authentication Cookies:</strong> Keep you signed in to your account</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Types of Cookies We Use
                    </h3>

                    <div className="mb-6">
                        <h4 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Session Cookies
                        </h4>
                        <p className="mb-4">
                            Temporary cookies that expire when you close your browser. These are essential for the platform to function properly.
                        </p>
                    </div>

                    <div className="mb-6">
                        <h4 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Persistent Cookies
                        </h4>
                        <p className="mb-4">
                            Cookies that remain on your device for a set period. These help us remember your preferences across sessions.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Managing Cookies
                    </h3>
                    <p className="mb-4">
                        You can control and manage cookies in various ways:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Most browsers allow you to refuse or accept cookies</li>
                        <li>You can delete cookies that have already been set</li>
                        <li>You can set your browser to notify you when cookies are being sent</li>
                    </ul>
                    <p className="mb-4">
                        Please note that disabling cookies may affect your ability to use certain features of our platform.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Third-Party Cookies
                    </h3>
                    <p className="mb-4">
                        We may use third-party services that set cookies on your device. These include:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Firebase Authentication for secure sign-in</li>
                        <li>Analytics services to improve our platform</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Updates to This Policy
                    </h3>
                    <p className="mb-4">
                        We may update this Cookie Policy from time to time. We encourage you to review this page periodically for any changes.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Contact Us
                    </h3>
                    <p className="mb-4">
                        If you have questions about our use of cookies, contact us at:
                    </p>
                    <p className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        privacy@kimuntupro.com
                    </p>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Cookies;
