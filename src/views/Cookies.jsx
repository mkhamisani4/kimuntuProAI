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
                <p className="mb-4 text-sm text-gray-500">Effective Date: January 2025 | Version 2.0</p>
                <p className="mb-6">
                    This Cookie Policy explains how Kimuntu AI uses cookies and similar tracking technologies (including web beacons, pixel tags, and local storage objects) on our website and web application. It complies with GDPR, CCPA, PIPEDA, and Quebec Law 25 consent requirements.
                </p>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 1 — What Are Cookies?
                    </h3>
                    <p className="mb-4">
                        Cookies are small text files placed on your device (computer, tablet, or mobile phone) by websites you visit. They serve multiple functions: keeping you logged in, remembering your preferences, understanding how you use the platform, and enabling us to show you relevant content. Cookies cannot execute programs or deliver viruses to your computer.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 2 — Cookie Categories We Use
                    </h3>
                    <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                    <th className="text-left p-3 font-semibold">Cookie Type</th>
                                    <th className="text-left p-3 font-semibold">Required?</th>
                                    <th className="text-left p-3 font-semibold">Duration</th>
                                    <th className="text-left p-3 font-semibold">Purpose</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/20">
                                <tr>
                                    <td className="p-3 font-medium">Essential / Strictly Necessary</td>
                                    <td className="p-3">Yes — cannot be disabled</td>
                                    <td className="p-3">Session / 1 year</td>
                                    <td className="p-3">Authentication, security tokens, session management, fraud prevention, load balancing</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">Performance & Analytics</td>
                                    <td className="p-3">No — consent required</td>
                                    <td className="p-3">Up to 13 months</td>
                                    <td className="p-3">Platform performance monitoring, anonymized usage analytics via Google Analytics 4 (IP anonymized)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">Functional / Preference</td>
                                    <td className="p-3">No — consent required</td>
                                    <td className="p-3">Up to 12 months</td>
                                    <td className="p-3">Language preference, region, UI settings, onboarding state, accessibility preferences</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">Marketing & Advertising</td>
                                    <td className="p-3">No — consent required</td>
                                    <td className="p-3">Up to 12 months</td>
                                    <td className="p-3">Retargeting via Google Ads, LinkedIn Ads, Meta Pixel; campaign effectiveness measurement</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">AI Personalization</td>
                                    <td className="p-3">No — consent required</td>
                                    <td className="p-3">Up to 6 months</td>
                                    <td className="p-3">Improves AI recommendations for job matching, legal guidance, and business insights based on usage patterns</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 3 — Consent Management
                    </h3>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>On your first visit, a Cookie Consent Banner allows you to: Accept All Cookies, Customize your preferences by category, or Reject All non-essential cookies.</li>
                        <li>Your preferences are stored for 12 months. You may change your preferences at any time via the 'Cookie Settings' link in the website footer.</li>
                        <li>For users in the EU, UK, and Quebec, non-essential cookies are blocked by default until explicit consent is given in accordance with GDPR and Law 25 requirements.</li>
                        <li>Withdrawing consent does not affect the lawfulness of processing carried out before consent was withdrawn.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 4 — Managing Cookies Through Your Browser
                    </h3>
                    <p className="mb-4">
                        All major browsers allow you to control cookies through browser settings. Note that blocking essential cookies may impair platform functionality:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Google Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
                        <li><strong>Mozilla Firefox:</strong> Options &gt; Privacy & Security &gt; Cookies and Site Data</li>
                        <li><strong>Apple Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
                        <li><strong>Microsoft Edge:</strong> Settings &gt; Privacy, search, and services &gt; Cookies</li>
                        <li><strong>Mobile browsers:</strong> Follow device-specific browser settings or OS privacy settings</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Contact Us
                    </h3>
                    <p className="mb-4">
                        If you have questions about our use of cookies, contact us at:
                    </p>
                    <p className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        privacy@kimuntu.ai
                    </p>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Cookies;
