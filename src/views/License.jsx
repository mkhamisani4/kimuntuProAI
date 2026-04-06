'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';

const License = () => {
    const { isDark } = useTheme();

    return (
        <PageWrapper title="End User License Agreement">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    End User License Agreement (EULA)
                </h2>
                <p className="mb-4 text-sm text-gray-500">Effective Date: January 2025 | Applies to: iOS App (App Store) and Android App (Google Play)</p>
                <p className="mb-6">
                    This End User License Agreement ('EULA') is a legally binding contract between you and Kimuntu Power Inc. governing your installation and use of the Kimuntu AI mobile application. This EULA supplements and incorporates by reference the Terms of Service and Privacy Policy.
                </p>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 1 — License Grant
                    </h3>
                    <p className="mb-4">
                        Subject to your compliance with this EULA and the Terms of Service, Kimuntu Power Inc. grants you a personal, non-exclusive, non-transferable, non-sublicensable, revocable limited license to download, install, and use one copy of the Kimuntu AI mobile application on a device that you own or control, for your personal or internal business purposes only.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 2 — License Restrictions
                    </h3>
                    <p className="mb-4">You expressly agree that you will NOT:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Copy, reproduce, or create derivative works of the App or any of its components without prior written authorization from Kimuntu Power Inc.</li>
                        <li>Reverse engineer, decompile, disassemble, or attempt to derive source code, AI model weights, training data, or proprietary algorithms from the App</li>
                        <li>Sell, resell, sublicense, transfer, assign, or otherwise commercialize the App or your license to any third party</li>
                        <li>Use the App in any automated, scripted, or batch manner that exceeds normal human usage patterns without a valid API license agreement</li>
                        <li>Circumvent, disable, remove, or bypass any content protection, digital rights management, authentication, or security feature of the App</li>
                        <li>Use the App to create, transmit, or distribute unlawful, harmful, fraudulent, defamatory, or rights-infringing content</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 3 — In-App Purchases and Subscriptions
                    </h3>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Premium features within the mobile App are available via subscriptions and in-app purchases facilitated by Apple App Store or Google Play billing systems.</li>
                        <li>Subscriptions purchased through the App Store or Google Play automatically renew unless auto-renewal is turned off at least 24 hours before the end of the current subscription period.</li>
                        <li>Refund requests for App Store purchases must be submitted through Apple's refund process. Google Play purchases are subject to Google's refund policy. Kimuntu AI cannot process refunds for app store transactions directly.</li>
                        <li>Subscriptions purchased directly through the Kimuntu AI web platform are governed by the Refund and Cancellation Policy.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 4 — App Store Terms
                    </h3>
                    <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                    <th className="text-left p-3 font-semibold">Apple App Store</th>
                                    <th className="text-left p-3 font-semibold">Google Play</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/20">
                                <tr><td className="p-3">Apple is not responsible for the App or its content</td><td className="p-3">Google is not responsible for the App or its content</td></tr>
                                <tr><td className="p-3">Apple has no obligation to provide support or maintenance</td><td className="p-3">Google has no obligation to provide support or maintenance</td></tr>
                                <tr><td className="p-3">Apple is a third-party beneficiary of this EULA</td><td className="p-3">Google is a third-party beneficiary of this EULA</td></tr>
                                <tr><td className="p-3">Subject to Apple's Usage Rules in its App Store Terms</td><td className="p-3">Subject to Google Play Developer Distribution Agreement</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 5 — Updates and Modifications
                    </h3>
                    <p className="mb-4">
                        Kimuntu AI may release updates, patches, or new versions of the App at any time. Some updates may be mandatory for continued access to the Services. By enabling automatic updates on your device, you consent to the installation of all updates. This EULA automatically applies to all updated versions of the App.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 6 — Termination of License
                    </h3>
                    <p className="mb-4">
                        This license is effective until terminated. It terminates automatically without notice if you fail to comply with any provision of this EULA. Upon termination, you must immediately cease all use of the App, uninstall and delete all copies from your devices, and confirm destruction of all copies upon Kimuntu AI's request. Provisions of this EULA that by their nature should survive termination shall survive, including Sections 2, 3, 7, and 8.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Contact Information
                    </h3>
                    <p className="mb-4">
                        For licensing inquiries, contact:
                    </p>
                    <p className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        legal@kimuntu.ai
                    </p>
                </section>
            </div>
        </PageWrapper>
    );
};

export default License;
