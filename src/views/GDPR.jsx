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
            description: 'You can request a copy of all personal data we hold about you via Settings > Privacy > Data Request.',
        },
        {
            icon: FileText,
            title: 'Right to Rectification',
            description: 'You can request correction of inaccurate or incomplete data directly in account Settings or by contacting privacy@kimuntu.ai.',
        },
        {
            icon: Trash2,
            title: 'Right to Erasure',
            description: 'You can request deletion of your personal data via Settings > Privacy > Delete My Account, or by email. Response within 30 days.',
        },
        {
            icon: Lock,
            title: 'Right to Restriction',
            description: 'You can request restriction of processing of your personal data by contacting privacy@kimuntu.ai with your specific restriction request.',
        },
        {
            icon: Download,
            title: 'Right to Data Portability',
            description: 'You can request your data in JSON/CSV format via Settings > Privacy > Export My Data.',
        },
        {
            icon: Shield,
            title: 'Right to Object',
            description: 'You can object to processing for marketing via the unsubscribe link in every marketing email or Settings > Notifications.',
        },
    ];

    return (
        <PageWrapper title="GDPR Compliance, Security & Data Processing">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    GDPR Compliance, Security Practices & Data Processing
                </h2>
                <p className="mb-6 text-lg">
                    Kimuntu AI is committed to protecting your privacy and ensuring compliance with the General Data Protection Regulation (GDPR), PIPEDA (Canada), CCPA (California), and Quebec Law 25.
                </p>
                <p className="mb-4 text-sm text-gray-500">Effective Date: January 2025 | Version 2.0</p>

                {/* GDPR Rights Section */}
                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Your Data Rights
                    </h3>
                    <p className="mb-6">
                        Under GDPR, PIPEDA, and CCPA, you have the following rights regarding your personal data:
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
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                                        }`}>
                                        <right.icon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'
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
                    <p className="mb-4">
                        <strong>Response Timeframe:</strong> We respond to all verifiable privacy rights requests within 30 days. For complex requests, we may extend this by an additional 30 days with prior notification. Identity verification is required before disclosing or deleting any personal data.
                    </p>
                </section>

                {/* Security Practices Section */}
                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Security Practices
                    </h3>
                    <p className="mb-4">
                        This section describes the technical and organizational measures Kimuntu Power Inc. implements to protect your data, the platform infrastructure, and the integrity of AI systems. Our practices align with SOC 2 Type II principles, NIST Cybersecurity Framework, and ISO/IEC 27001 standards.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Encryption Standards
                    </h3>
                    <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                    <th className="text-left p-3 font-semibold">Security Control</th>
                                    <th className="text-left p-3 font-semibold">Specification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/20">
                                <tr><td className="p-3">Data in Transit</td><td className="p-3">TLS 1.3 (minimum TLS 1.2). All HTTP traffic redirected to HTTPS. HSTS enabled.</td></tr>
                                <tr><td className="p-3">Data at Rest</td><td className="p-3">AES-256-GCM encryption for all stored user data, documents, and AI outputs.</td></tr>
                                <tr><td className="p-3">Database Encryption</td><td className="p-3">Transparent Data Encryption (TDE) on all production databases.</td></tr>
                                <tr><td className="p-3">Backup Encryption</td><td className="p-3">AES-256 encryption on all automated backup snapshots.</td></tr>
                                <tr><td className="p-3">Password Storage</td><td className="p-3">bcrypt hashing with salt (minimum cost factor 12). Plaintext passwords never stored.</td></tr>
                                <tr><td className="p-3">API Keys and Secrets</td><td className="p-3">Stored in AWS Secrets Manager / HashiCorp Vault. Never in source code or logs.</td></tr>
                                <tr><td className="p-3">Payment Data</td><td className="p-3">Handled exclusively by PCI DSS Level 1 compliant processors (Stripe, PayPal). Kimuntu AI does not store raw card data.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Access Controls and Authentication
                    </h3>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Multi-Factor Authentication (MFA):</strong> Available and strongly recommended for all user accounts. Mandatory for all administrator and internal team accounts.</li>
                        <li><strong>Role-Based Access Control (RBAC):</strong> Internal access to user data is restricted to the minimum necessary roles. Engineers do not have default access to production data.</li>
                        <li><strong>Zero Trust Architecture:</strong> All internal system access requires authentication, even within our private network perimeter.</li>
                        <li><strong>Session Management:</strong> Sessions expire after 30 minutes of inactivity on web. Mobile sessions use refresh token rotation with a 90-day maximum lifetime.</li>
                        <li><strong>Failed Login Throttling:</strong> Accounts are temporarily locked after 5 consecutive failed login attempts. Users are notified via email.</li>
                        <li><strong>Privileged Access Workstations (PAW):</strong> All production access by employees requires dedicated secure workstations with endpoint protection software.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Infrastructure Security
                    </h3>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Cloud Infrastructure:</strong> Hosted on AWS, Google Cloud, and Microsoft Azure — all SOC 2 Type II and ISO 27001 certified. Data centers are physically secured with biometric access controls.</li>
                        <li><strong>Network Segmentation:</strong> Production, staging, and development environments are fully isolated. No cross-environment data access is permitted.</li>
                        <li><strong>Web Application Firewall (WAF):</strong> AWS WAF deployed to protect against OWASP Top 10 vulnerabilities including SQL injection, XSS, and CSRF.</li>
                        <li><strong>DDoS Protection:</strong> AWS Shield Advanced provides always-on DDoS detection and mitigation.</li>
                        <li><strong>Intrusion Detection and Prevention (IDS/IPS):</strong> Real-time monitoring of network traffic for anomalous patterns and known attack signatures.</li>
                        <li><strong>Vulnerability Management:</strong> Automated dependency scanning (Snyk, Dependabot) with mandatory patch cycles — critical vulnerabilities patched within 24 hours, high within 72 hours, medium within 30 days.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Security Testing and Auditing
                    </h3>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Penetration Testing:</strong> Annual third-party penetration tests conducted by an accredited security firm. Results reviewed by senior leadership. Critical findings remediated before next release cycle.</li>
                        <li><strong>Security Code Review:</strong> All code changes undergo automated SAST (Static Application Security Testing) via SonarQube and manual security review for high-risk components.</li>
                        <li><strong>Audit Logs:</strong> Comprehensive audit logs maintained for all data access, modifications, and admin actions. Logs retained for 12 months, tamper-evident, and reviewed weekly.</li>
                        <li><strong>Bug Bounty Program:</strong> Kimuntu AI operates a responsible disclosure program. Security researchers may report vulnerabilities to security@kimuntu.ai. We commit to acknowledging reports within 48 hours.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Incident Response
                    </h3>
                    <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                    <th className="text-left p-3 font-semibold">Phase</th>
                                    <th className="text-left p-3 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/20">
                                <tr><td className="p-3">Detection (0-1 hour)</td><td className="p-3">Automated monitoring alerts on-call security team. Incident ticket opened. Initial severity assessed.</td></tr>
                                <tr><td className="p-3">Containment (1-4 hours)</td><td className="p-3">Affected systems isolated. Unauthorized access revoked. Forensic snapshot taken.</td></tr>
                                <tr><td className="p-3">Eradication (4-24 hours)</td><td className="p-3">Root cause identified. Vulnerability patched. Verification testing completed.</td></tr>
                                <tr><td className="p-3">Notification — Regulatory</td><td className="p-3">Canada (OPC): within 72 hours if significant risk of harm. USA (relevant state AGs): per applicable breach notification laws (typically 30-72 hours).</td></tr>
                                <tr><td className="p-3">Notification — Users</td><td className="p-3">Affected users notified within 72 hours of confirmed breach via email with details of what was affected and recommended actions.</td></tr>
                                <tr><td className="p-3">Recovery</td><td className="p-3">Services restored from clean backups. Post-incident review within 7 days. Lessons learned documented.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        User Security Responsibilities
                    </h3>
                    <p className="mb-4">
                        Security is a shared responsibility. Kimuntu AI secures the platform infrastructure. You are responsible for securing your account access.
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Use a strong, unique password for your Kimuntu AI account — minimum 12 characters, including uppercase, lowercase, numbers, and symbols</li>
                        <li>Enable Multi-Factor Authentication (MFA) on your account — available in Settings &gt; Security</li>
                        <li>Never share your login credentials with other individuals, even colleagues or family members</li>
                        <li>Log out of your account on shared or public devices and verify your active sessions in Settings &gt; Security &gt; Active Sessions</li>
                        <li>Report any suspicious activity, unauthorized access, or potential phishing to security@kimuntu.ai immediately</li>
                    </ul>
                </section>

                {/* Data Processing Agreement Section */}
                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Data Processing Agreement (DPA)
                    </h3>
                    <p className="mb-4">
                        This section governs the processing of Personal Information by Kimuntu Power Inc. ('Processor') on behalf of enterprise, institutional, and business clients ('Controller') in connection with the Kimuntu AI ProLaunch Platform. This DPA supplements the Terms of Service and is required for compliance with GDPR Article 28, PIPEDA accountability provisions, and CCPA service provider requirements.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Subject Matter and Scope of Processing
                    </h3>
                    <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                    <th className="text-left p-3 font-semibold">Element</th>
                                    <th className="text-left p-3 font-semibold">Specification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/20">
                                <tr><td className="p-3">Nature of Processing</td><td className="p-3">Storage, analysis, and AI-assisted processing of Personal Information to deliver Platform Services</td></tr>
                                <tr><td className="p-3">Purpose of Processing</td><td className="p-3">Providing Career, Business, Legal, and Innovation AI tools to the Controller's authorized users</td></tr>
                                <tr><td className="p-3">Duration of Processing</td><td className="p-3">For the term of the Master Services Agreement or applicable subscription period</td></tr>
                                <tr><td className="p-3">Categories of Personal Information</td><td className="p-3">Professional profiles, business data, legal documents, usage data — as defined in the Privacy Policy</td></tr>
                                <tr><td className="p-3">Categories of Data Subjects</td><td className="p-3">The Controller's employees, clients, members, or other authorized users of the Platform</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Processor Obligations
                    </h3>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Process Personal Information only on documented instructions from the Controller, unless required to do so by applicable law</li>
                        <li>Ensure that all Kimuntu AI personnel authorized to process Personal Information are subject to binding confidentiality obligations</li>
                        <li>Implement and maintain the technical and organizational security measures described in the Security Practices section above</li>
                        <li>Not engage any sub-processor without prior written authorization from the Controller, except as set out in the approved sub-processor list</li>
                        <li>Assist the Controller in fulfilling its obligations to respond to data subject rights requests within required timeframes</li>
                        <li>Delete or return all Personal Information to the Controller upon termination of the DPA, as directed in writing by the Controller</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Approved Sub-Processors
                    </h3>
                    <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                    <th className="text-left p-3 font-semibold">Sub-Processor</th>
                                    <th className="text-left p-3 font-semibold">Purpose</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/20">
                                <tr><td className="p-3">Amazon Web Services (AWS)</td><td className="p-3">Cloud infrastructure hosting — Canada (ca-central-1) and USA (us-east-1) regions</td></tr>
                                <tr><td className="p-3">Google Cloud Platform</td><td className="p-3">AI/ML processing, analytics — North America regions</td></tr>
                                <tr><td className="p-3">Microsoft Azure</td><td className="p-3">Backup and disaster recovery — Canada Central region</td></tr>
                                <tr><td className="p-3">Stripe Inc.</td><td className="p-3">Payment processing — PCI DSS Level 1 compliant</td></tr>
                                <tr><td className="p-3">PayPal Holdings Inc.</td><td className="p-3">Alternative payment processing</td></tr>
                                <tr><td className="p-3">Brevo (Sendinblue)</td><td className="p-3">Transactional and marketing email delivery</td></tr>
                                <tr><td className="p-3">Google Analytics 4</td><td className="p-3">Anonymized platform usage analytics</td></tr>
                                <tr><td className="p-3">Auth0 (Okta)</td><td className="p-3">Authentication and identity management</td></tr>
                                <tr><td className="p-3">Twilio Inc.</td><td className="p-3">AI voice and SMS communication (ProLaunch TeamAI feature)</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4">
                        <strong>Sub-Processor Changes:</strong> Kimuntu AI will provide 30 days advance written notice before adding or replacing any sub-processor. Controllers may object to new sub-processors within 14 days of notice. If the objection cannot be resolved, the Controller may terminate the affected services without penalty.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        International Transfers Under the DPA
                    </h3>
                    <p className="mb-4">
                        Where Personal Information is transferred outside Canada or the EEA, Kimuntu AI implements appropriate safeguards including: EU Standard Contractual Clauses (SCCs) for transfers to non-adequate countries; PIPEDA Schedule 1 cross-border transfer accountability; and binding contractual data protection obligations with all sub-processors. A current sub-processor list with transfer locations is available on request.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Audit Rights
                    </h3>
                    <p className="mb-4">
                        The Controller may, upon 30 days written notice and no more than once per calendar year, audit Kimuntu AI's compliance with this DPA at the Controller's expense. Kimuntu AI may satisfy audit requests by providing current SOC 2 Type II audit reports, ISO 27001 certification, or third-party penetration test executive summaries in lieu of on-site inspections.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Exercising Your Rights
                    </h3>
                    <p className="mb-4">
                        To exercise any of your data protection rights or to inquire about our security practices, please contact our Data Protection Officer at:
                    </p>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                        <p className={`font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            Data Protection Officer
                        </p>
                        <p>Email: dpo@kimuntu.ai</p>
                        <p>Security Reports: security@kimuntu.ai</p>
                        <p>Response time: Within 30 days</p>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Complaints
                    </h3>
                    <p className="mb-4">
                        If you believe we have not handled your personal data appropriately, you have the right to lodge a complaint with your local supervisory authority: Canada: Office of the Privacy Commissioner (OPC) at priv.gc.ca | USA: Federal Trade Commission (FTC) at ftc.gov | EU: your national Data Protection Authority.
                    </p>
                </section>
            </div>
        </PageWrapper>
    );
};

export default GDPR;
