'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';

const Terms = () => {
    const { isDark } = useTheme();

    return (
        <PageWrapper title="Terms of Service">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Terms of Service
                </h2>
                <p className="mb-4 text-sm text-gray-500">Effective Date: January 2025 | Version 2.0</p>

                <div className={`p-4 rounded-xl mb-8 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                    <p className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Binding Agreement
                    </p>
                    <p className="mt-2">
                        These Terms of Service ('Terms') constitute a legally binding agreement between you ('User') and Kimuntu Power Inc. ('Kimuntu AI,' 'we,' 'us'). By accessing or using any part of the Kimuntu AI ProLaunch Platform, you agree to be bound by these Terms. If you do not agree, you must immediately cease using the Platform.
                    </p>
                </div>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 1 — Eligibility and Account Registration
                    </h3>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>You must be at least 16 years of age, or the applicable legal age of majority in your jurisdiction, to create an account and use the Services.</li>
                        <li>You must provide accurate, current, and complete information during registration and keep your account information updated at all times.</li>
                        <li>You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</li>
                        <li>You must notify us immediately at support@kimuntu.ai of any unauthorized use of your account or any other security breach.</li>
                        <li>Kimuntu AI reserves the right to refuse registration, suspend, or terminate any account at its sole discretion for any violation of these Terms.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 2 — Description of Services
                    </h3>
                    <p className="mb-4">
                        Kimuntu AI provides AI-powered tools across four tracks: (1) Career Track — CV building, interview coaching, job matching, career planning; (2) Business Track — business plan generation, virtual team automation (ProLaunch TeamAI), funding discovery, website building; (3) Legal Track — document drafting, immigration tools, legal simulations, lawyer matching; (4) Innovation Track — patent research, ESG tools, policy simulation, AI learning hub. Services are delivered via web platform and mobile applications. Specific features vary by subscription plan.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 3 — Subscriptions, Fees, and Payments
                    </h3>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>All fees are displayed in USD unless otherwise specified. Canadian users are shown CAD pricing inclusive of applicable taxes.</li>
                        <li>Subscriptions are billed monthly or annually in advance. Monthly subscriptions renew on the same calendar date each month. Annual subscriptions renew on the anniversary date of the original purchase.</li>
                        <li>You authorize Kimuntu AI to charge your designated payment method on each renewal date. Failure to maintain a valid payment method may result in service suspension.</li>
                        <li>Price changes will be communicated via email at least 30 days before taking effect. Continued use after the effective date constitutes acceptance of the new price.</li>
                        <li>US Sales Tax: Applicable state and local sales taxes are added to your invoice in accordance with economic nexus laws. Kimuntu AI uses TaxJar for automated tax calculation and remittance.</li>
                        <li>Canada GST/HST/QST: Applicable federal and provincial consumption taxes are added to invoices for Canadian users. Our CRA Business Number and GST/HST registration number appear on every invoice.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 4 — Acceptable Use
                    </h3>
                    <p className="mb-4">You agree that you will NOT use the Platform to:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Violate any applicable federal, provincial, state, or local law or regulation in Canada, the USA, or any other jurisdiction</li>
                        <li>Generate, distribute, or transmit content that is defamatory, harassing, threatening, obscene, or discriminatory based on race, ethnicity, national origin, religion, gender, sexual orientation, disability, or immigration status</li>
                        <li>Create fraudulent legal documents, false business plans, or fabricated credentials intended to deceive third parties</li>
                        <li>Attempt to reverse engineer, decompile, disassemble, or extract source code, AI model weights, or training data from the Platform</li>
                        <li>Circumvent, disable, or interfere with any security mechanism, authentication system, or access control on the Platform</li>
                        <li>Use automated scripts, bots, crawlers, or scraping tools to access or extract data from the Platform without written authorization</li>
                        <li>Resell, sublicense, or commercially redistribute Platform features or AI-generated outputs without a valid white-label or reseller agreement</li>
                        <li>Submit content that infringes any patent, trademark, copyright, trade secret, or other intellectual property right of any party</li>
                        <li>Use the Legal track to engage in the unauthorized practice of law or to provide legal advice to third parties as a professional service</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 5 — AI-Generated Content — Disclaimer and User Responsibility
                    </h3>
                    <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <p className={`font-semibold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                            Important Disclaimer
                        </p>
                        <p>
                            ALL content generated by Kimuntu AI — including resumes, business plans, legal documents, innovation reports, and recommendations — is provided for INFORMATIONAL AND PREPARATION PURPOSES ONLY. It does NOT constitute professional legal, financial, career, medical, immigration, or investment advice.
                        </p>
                    </div>
                    <p className="mb-4">Kimuntu AI generates outputs using large language models and proprietary AI systems. By using AI-generated content, you acknowledge and agree to the following:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>AI outputs do not constitute professional legal, financial, career, medical, or investment advice.</li>
                        <li>You are solely responsible for reviewing, validating, and verifying all AI-generated content before using it for any real-world purpose.</li>
                        <li>Kimuntu AI does not guarantee the accuracy, completeness, currency, or fitness for any particular purpose of AI-generated outputs.</li>
                        <li>You must not submit AI-generated legal documents to courts, regulatory bodies, or government agencies without independent review by a licensed professional.</li>
                    </ul>

                    <div className={`overflow-x-auto rounded-xl border mt-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                    <th className="text-left p-3 font-semibold">Track</th>
                                    <th className="text-left p-3 font-semibold">Specific Disclaimer</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/20">
                                <tr><td className="p-3 font-medium">Career Track</td><td className="p-3">AI-generated resumes and career advice do not guarantee employment. Job market conditions vary. Always review AI outputs with a professional career advisor before critical applications.</td></tr>
                                <tr><td className="p-3 font-medium">Business Track</td><td className="p-3">AI-generated business plans and financial projections are illustrative only. They are not investment advice, accounting opinions, or audited financial statements. Consult a CPA/CA before making financial decisions.</td></tr>
                                <tr><td className="p-3 font-medium">Legal Track</td><td className="p-3">Kimuntu AI is NOT a law firm. AI legal tools are NOT a substitute for legal advice from a licensed attorney. Do not use AI legal outputs in court without independent legal review. Legal outcomes are never guaranteed.</td></tr>
                                <tr><td className="p-3 font-medium">Immigration Track</td><td className="p-3">Immigration laws change frequently. AI outputs may not reflect the most current IRCC or USCIS requirements. Always verify with a licensed immigration consultant or lawyer before filing.</td></tr>
                                <tr><td className="p-3 font-medium">Innovation Track</td><td className="p-3">Patent drafts require review by a registered patent agent or attorney before filing with the USPTO or CIPO. AI patent research does not constitute a freedom-to-operate opinion.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 6 — Intellectual Property
                    </h3>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Kimuntu Power Inc. owns all rights, title, and interest in the Platform, including all software, AI models, algorithms, trademarks, service marks, logos, and proprietary content.</li>
                        <li>You retain full ownership of all documents, content, and materials you create, upload, or generate using the Platform ('User Content').</li>
                        <li>By using the Platform, you grant Kimuntu AI a limited, non-exclusive, royalty-free license to store, process, and display your User Content solely as necessary to provide the Services to you.</li>
                        <li>You also grant Kimuntu AI a limited license to use anonymized, aggregated versions of User Content to improve AI model performance. This license applies only to data that has been fully de-identified and cannot be traced back to you.</li>
                        <li>Kimuntu AI, ProLaunch, and all associated logos and platform names are trademarks of Kimuntu Power Inc. Unauthorized use is strictly prohibited.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 7 — Termination
                    </h3>
                    <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                    <th className="text-left p-3 font-semibold">Termination Type</th>
                                    <th className="text-left p-3 font-semibold">Conditions and Consequences</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/20">
                                <tr><td className="p-3">Voluntary termination by User</td><td className="p-3">Cancel anytime via Settings &gt; Subscription &gt; Cancel Plan. Access continues until end of current billing period.</td></tr>
                                <tr><td className="p-3">Termination for cause by Kimuntu AI</td><td className="p-3">Immediate suspension for material breach of Terms, fraudulent activity, or harm to other users. No refund.</td></tr>
                                <tr><td className="p-3">Termination for convenience by Kimuntu AI</td><td className="p-3">30-day advance notice via email. Pro-rated refund of prepaid unused period.</td></tr>
                                <tr><td className="p-3">Account deletion request</td><td className="p-3">Account data deleted within 30 days per Privacy Policy.</td></tr>
                                <tr><td className="p-3">Effect of termination</td><td className="p-3">All licenses granted to you immediately cease. User Content downloadable for 30 days post-termination, then deleted.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 8 — Limitation of Liability
                    </h3>
                    <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                        <p className="font-semibold mb-2">IMPORTANT — LIMITATION OF LIABILITY</p>
                        <p className="uppercase text-sm">
                            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, KIMUNTU AI AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICES, EVEN IF KIMUNTU AI HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL KIMUNTU AI'S TOTAL CUMULATIVE LIABILITY EXCEED THE GREATER OF: (A) THE AMOUNTS PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED CANADIAN DOLLARS ($100 CAD).
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 9 — Governing Law and Dispute Resolution
                    </h3>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>These Terms are governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles.</li>
                        <li>You and Kimuntu AI agree to first attempt to resolve any dispute through good-faith negotiation for a period of 30 days before initiating formal proceedings.</li>
                        <li>If negotiation fails, disputes shall be resolved by binding arbitration administered under the rules of the ADR Institute of Canada (for Canadian users) or JAMS (for US users), conducted in English or French at the user's election.</li>
                        <li><strong>CLASS ACTION WAIVER:</strong> You agree to resolve disputes with Kimuntu AI individually and waive any right to bring or participate in a class action lawsuit or class-wide arbitration.</li>
                        <li>Notwithstanding the foregoing, either party may seek emergency injunctive or other equitable relief from a court of competent jurisdiction to prevent irreparable harm.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Contact Information
                    </h3>
                    <p className="mb-4">
                        For questions about these Terms, contact us at:
                    </p>
                    <p className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        legal@kimuntu.ai
                    </p>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Terms;
