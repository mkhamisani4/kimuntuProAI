'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';

const Privacy = () => {
    const { isDark } = useTheme();

    return (
        <PageWrapper title="Privacy Policy">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Privacy Policy
                </h2>
                <p className="mb-4 text-sm text-gray-500">Effective Date: January 2025 | Version 2.0</p>
                <p className="mb-6">
                    This Privacy Policy complies with: PIPEDA (Canada), Quebec Law 25 / Bill 64, CCPA / CPRA (California, USA), GDPR (European Union), and applicable provincial privacy legislation. In the event of conflict, the most protective standard applicable to the user's jurisdiction shall prevail.
                </p>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 1 — Definitions
                    </h3>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Personal Information:</strong> Any information that identifies or could reasonably identify an individual, including name, email, IP address, device identifiers, and user-generated content.</li>
                        <li><strong>Sensitive Personal Information:</strong> Includes government identification numbers, immigration status information, financial account details, biometric data, and health information. Subject to heightened protection.</li>
                        <li><strong>Processing:</strong> Any operation performed on Personal Information, including collection, storage, use, disclosure, and deletion.</li>
                        <li><strong>Controller / Business:</strong> Kimuntu Power Inc., which determines the purposes and means of processing Personal Information.</li>
                        <li><strong>Processor / Service Provider:</strong> Third parties that process Personal Information on behalf of Kimuntu Power Inc. under binding data processing agreements.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 2 — Information We Collect
                    </h3>

                    <h4 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        2.1 Information You Provide Directly
                    </h4>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Account registration data:</strong> Full name, email address, phone number, username, encrypted password, and preferred language</li>
                        <li><strong>Career data:</strong> Resume content, work history, educational background, skills, interview recordings (stored with consent only), and job preferences</li>
                        <li><strong>Business data:</strong> Business plans, financial projections, pitch decks, company names, and strategic documents you create on the platform</li>
                        <li><strong>Legal data:</strong> Legal documents, immigration applications, case descriptions, and personal circumstances you share with the Legal AI tools</li>
                        <li><strong>Payment data:</strong> Billing address and transaction history. Card numbers and banking details are processed directly by Stripe or PayPal — Kimuntu AI stores only the last four digits and card type for display purposes</li>
                        <li><strong>Communications:</strong> Messages sent to our support team, feedback forms, survey responses, and any correspondence with Kimuntu AI</li>
                    </ul>

                    <h4 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        2.2 Information Collected Automatically
                    </h4>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Device identifiers:</strong> IP address, browser type and version, operating system, device model, and unique device identifiers</li>
                        <li><strong>Usage data:</strong> Pages and features accessed, session duration, navigation paths, feature interaction logs, and error reports</li>
                        <li><strong>Performance data:</strong> Load times, API response times, and platform stability metrics — collected anonymously for infrastructure improvement</li>
                        <li><strong>Approximate geolocation:</strong> City and country level only, derived from IP address. We do not access precise GPS location without explicit permission</li>
                    </ul>

                    <h4 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        2.3 Information from Third Parties
                    </h4>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Job board integrations</strong> (LinkedIn, Indeed, Glassdoor, Workopolis): Only with your explicit OAuth authorization, and only the data you grant access to</li>
                        <li><strong>Legal database providers:</strong> Anonymized case research data to improve AI legal tools, not linked to individual user accounts</li>
                        <li><strong>Single Sign-On providers</strong> (Google, LinkedIn): Name and email address used for account creation only; no other data is imported without your consent</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 3 — How We Use Your Information
                    </h3>
                    <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                    <th className="text-left p-3 font-semibold">Purpose</th>
                                    <th className="text-left p-3 font-semibold">Legal Basis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/20">
                                <tr><td className="p-3">Delivering and personalizing Services to your account</td><td className="p-3">Contract performance (PIPEDA, GDPR Art. 6(1)(b))</td></tr>
                                <tr><td className="p-3">Processing payments and managing subscription billing</td><td className="p-3">Contract performance</td></tr>
                                <tr><td className="p-3">Improving AI model accuracy and platform features</td><td className="p-3">Legitimate interests — data is aggregated and anonymized</td></tr>
                                <tr><td className="p-3">Preventing fraud, abuse, and security threats</td><td className="p-3">Legitimate interests and legal obligation</td></tr>
                                <tr><td className="p-3">Sending transactional communications (receipts, alerts)</td><td className="p-3">Contract performance</td></tr>
                                <tr><td className="p-3">Sending promotional emails where opted-in</td><td className="p-3">Consent — withdrawable at any time</td></tr>
                                <tr><td className="p-3">Complying with legal and regulatory obligations</td><td className="p-3">Legal obligation (PIPEDA, CCPA, GDPR Art. 6(1)(c))</td></tr>
                                <tr><td className="p-3">Conducting analytics on platform usage patterns</td><td className="p-3">Legitimate interests — anonymized data only</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 4 — Data Sharing and Disclosure
                    </h3>
                    <p className="mb-4">
                        We do not sell, rent, or trade your Personal Information to third parties. We do not allow advertising networks to use your data for behavioral advertising without your explicit consent. Data is disclosed only as described below:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Service Providers:</strong> Cloud hosting (AWS, Google Cloud, Azure — all under DPAs), payment processors (Stripe, PayPal), email delivery (Brevo/Sendgrid), analytics (Google Analytics — anonymized), customer support tools. All are contractually bound to process data only as instructed and to maintain equivalent security standards.</li>
                        <li><strong>Professional Advisors:</strong> Legal counsel, auditors, and insurance providers under confidentiality obligations, as required for business operations.</li>
                        <li><strong>Legal Compliance:</strong> Government authorities, regulators, or courts when required by binding legal process (court order, subpoena, regulatory demand). We will notify you of such requests unless legally prohibited from doing so.</li>
                        <li><strong>Business Transactions:</strong> In the event of a merger, acquisition, or asset sale, Personal Information may be transferred to the successor entity under equivalent privacy protections. Users will be notified in advance.</li>
                        <li><strong>With Your Consent:</strong> We will share your information with any additional third party only upon your explicit, informed, and freely given consent.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 5 — Your Privacy Rights
                    </h3>
                    <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                    <th className="text-left p-3 font-semibold">Your Right</th>
                                    <th className="text-left p-3 font-semibold">How to Exercise It</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/20">
                                <tr><td className="p-3">Right of Access — obtain a copy of your personal data</td><td className="p-3">Submit request via account Settings &gt; Privacy &gt; Data Request</td></tr>
                                <tr><td className="p-3">Right to Rectification — correct inaccurate data</td><td className="p-3">Edit directly in account Settings or contact privacy@kimuntu.ai</td></tr>
                                <tr><td className="p-3">Right to Erasure ('Right to be Forgotten')</td><td className="p-3">Settings &gt; Privacy &gt; Delete My Account, or email request. Response within 30 days.</td></tr>
                                <tr><td className="p-3">Right to Data Portability — receive data in JSON/CSV</td><td className="p-3">Settings &gt; Privacy &gt; Export My Data</td></tr>
                                <tr><td className="p-3">Right to Object — object to processing for marketing</td><td className="p-3">Unsubscribe link in every marketing email or Settings &gt; Notifications</td></tr>
                                <tr><td className="p-3">Right to Restrict Processing — limit specific uses</td><td className="p-3">Contact privacy@kimuntu.ai with your specific restriction request</td></tr>
                                <tr><td className="p-3">Right to Opt Out of 'Sale' (CCPA) — California users</td><td className="p-3">'Do Not Sell or Share My Personal Information' link in website footer</td></tr>
                                <tr><td className="p-3">Right to Non-Discrimination (CCPA)</td><td className="p-3">Exercising privacy rights will never result in reduced service quality</td></tr>
                                <tr><td className="p-3">Right to Lodge a Complaint</td><td className="p-3">Canada: OPC at priv.gc.ca | USA: FTC at ftc.gov | EU: your national DPA</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4">
                        <strong>Response Timeframe:</strong> We respond to all verifiable privacy rights requests within 30 days. For complex requests, we may extend this by an additional 30 days with prior notification. Identity verification is required before disclosing or deleting any personal data.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 6 — Data Retention
                    </h3>
                    <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                    <th className="text-left p-3 font-semibold">Data Category</th>
                                    <th className="text-left p-3 font-semibold">Retention Period</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/20">
                                <tr><td className="p-3">Active account data</td><td className="p-3">Retained while account is active</td></tr>
                                <tr><td className="p-3">Inactive account data (no login for 24 months)</td><td className="p-3">Deleted after 90-day notice to registered email</td></tr>
                                <tr><td className="p-3">AI-generated documents (Career, Business, Innovation)</td><td className="p-3">Retained for 24 months after last access; then deleted unless downloaded</td></tr>
                                <tr><td className="p-3">Legal documents and immigration applications</td><td className="p-3">Retained for 7 years from creation (legal compliance requirement)</td></tr>
                                <tr><td className="p-3">Payment records and transaction history</td><td className="p-3">7 years (CRA / IRS tax compliance)</td></tr>
                                <tr><td className="p-3">Support communications</td><td className="p-3">3 years from ticket closure</td></tr>
                                <tr><td className="p-3">Security logs and access records</td><td className="p-3">12 months rolling (overwritten after)</td></tr>
                                <tr><td className="p-3">Anonymized analytics data</td><td className="p-3">Indefinite (no personal identifiers retained)</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 7 — Children's Privacy
                    </h3>
                    <p className="mb-4">
                        The Kimuntu AI platform is not directed at individuals under the age of 16. We do not knowingly collect, store, or process Personal Information from children under 16. If we become aware that a user is under 16, we will immediately suspend the account and delete all associated data. If you believe a child under 16 has provided us with personal information, please contact privacy@kimuntu.ai immediately.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 8 — International Data Transfers
                    </h3>
                    <p className="mb-4">
                        Your data may be processed in Canada, the United States, Ireland (AWS EU), or other jurisdictions where our service providers operate. All international transfers are protected by: GDPR Standard Contractual Clauses (SCCs), PIPEDA cross-border transfer provisions, and binding contractual protections with all data processors. We do not transfer data to jurisdictions without adequate privacy protection frameworks without implementing supplementary safeguards.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Article 9 — Policy Updates
                    </h3>
                    <p className="mb-4">
                        We will notify users of material changes to this Privacy Policy via email at least 30 days before the changes take effect, and via prominent in-platform notice. For minor, non-material changes, we will post an updated version with a revised effective date. Continued use of the platform after the effective date constitutes acceptance. If you do not accept the updated Policy, you may delete your account before the effective date.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Contact Us
                    </h3>
                    <p className="mb-4">
                        If you have questions about this Privacy Policy, please contact us at:
                    </p>
                    <p className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        privacy@kimuntu.ai
                    </p>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Privacy;
