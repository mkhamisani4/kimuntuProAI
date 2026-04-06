'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import { HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react';

const SupportCenter = () => {
    const { isDark } = useTheme();

    const generalFaqs = [
        {
            question: 'What is Kimuntu AI and what does ProLaunch mean?',
            answer: "Kimuntu AI is a next-generation AI-powered ecosystem developed by Kimuntu Power Inc. It unifies four intelligent service tracks — Career, Business, Legal, and Innovation — into a single platform. 'ProLaunch' reflects the platform's core mission: to professionally launch every user toward measurable success in their personal, professional, and entrepreneurial goals, regardless of their starting point, language, or background."
        },
        {
            question: 'Who is Kimuntu AI designed for?',
            answer: 'Kimuntu AI serves a broad audience: job seekers, career professionals, new graduates, newcomers and immigrants to Canada and the USA, entrepreneurs and SMB owners, legal self-help users, researchers and innovators, government agencies, NGOs, educational institutions, and enterprise clients. The platform is specifically optimized for bilingual (English/French) users and multilingual communities across North America and globally.'
        },
        {
            question: 'What makes Kimuntu AI different from other AI platforms?',
            answer: "Unlike single-purpose AI tools (LinkedIn for career, LegalZoom for legal, Shopify for business), Kimuntu AI integrates all four intelligence verticals in one unified ecosystem with a single login and subscription. Additionally, the Live Avatar feature — offering real-time AI-simulated interactions for interviews, legal consultations, and pitch coaching — is a capability unavailable at comparable price points on any competing platform. Our bilingual EN/FR foundation and 50+ language support further differentiate us in the North American market."
        },
        {
            question: 'Is Kimuntu AI compliant with privacy laws?',
            answer: 'Yes. Kimuntu AI operates in full compliance with PIPEDA (Canada), CCPA (California/USA), GDPR (European Union), and Quebec Law 25 (Bill 64). All data is encrypted with AES-256 at rest and TLS 1.3 in transit. We maintain a zero-data-sale policy and provide users with full data rights including access, correction, portability, and deletion.'
        },
        {
            question: 'What languages does the platform support?',
            answer: 'The platform interface and all AI-generated documents are fully supported in English and French. The AI Multilingual Translation and Voice Assistant extends coverage to 50+ languages for document translation, real-time communication, and voice interaction. This includes Spanish, Arabic, Mandarin, Portuguese, Haitian Creole, Swahili, Hindi, and many others.'
        },
        {
            question: 'Is Kimuntu AI available on mobile devices?',
            answer: 'Yes. Kimuntu AI is accessible via web browser on any device, and via dedicated native apps on iOS (App Store) and Android (Google Play). All data synchronizes in real time across devices via secure cloud infrastructure.'
        },
        {
            question: 'How do I create an account?',
            answer: "Visit kimuntuai.com and click 'Get Started Free.' You may register using your email address or via Google/LinkedIn OAuth single sign-on. No credit card is required for the Free tier. Account verification is completed via email. You must be at least 16 years old or the legal age of majority in your jurisdiction to create an account."
        },
    ];

    const careerFaqs = [
        {
            question: 'What does the AI CV and Resume Builder do?',
            answer: 'The AI CV Builder generates professional, ATS-optimized resumes and cover letters tailored to specific industries, roles, seniority levels, and target regions (US or Canada). It analyzes live job postings, identifies required keywords, and structures your CV to pass applicant tracking systems. Outputs are available in 15+ design templates and can be exported in PDF, DOCX, or TXT format. Bilingual versions (English and French) are generated automatically on Career Premium and Full Package plans.'
        },
        {
            question: 'How does the AI Interview Coach work?',
            answer: 'The Interview Coach uses AI-powered Live Avatar technology to simulate realistic job interviews. It adapts to your industry, experience level, and target role. The Avatar asks behavioral (STAR method), technical, and situational questions. After each session, the system delivers a detailed performance report covering communication clarity, confidence indicators, keyword usage, pace, and areas for improvement. Users can replay sessions and track improvement over time.'
        },
        {
            question: 'What is the AI Career Accelerator?',
            answer: 'The AI Career Accelerator is a complete professional development engine. It conducts AI-powered skills assessments, identifies competency gaps against current market demand, recommends curated learning resources from Coursera, Udemy, and LinkedIn Learning, and builds a personalized 90-day career action plan. Progress is tracked in real time with milestone alerts and encouragement mechanisms.'
        },
        {
            question: 'How does the job matching engine work?',
            answer: 'The AI Job Matching Engine scans 50,000+ live job postings daily from Indeed, LinkedIn, Glassdoor, Workopolis, and government job boards across the USA and Canada. It matches your profile, skills, experience, and preferences to the best opportunities and ranks them by fit score. It also sends customized alerts and recommends application strategies for high-match roles.'
        },
    ];

    const businessFaqs = [
        {
            question: 'What types of business plans does Kimuntu AI generate?',
            answer: 'Three tiers: Basic (executive summary, market overview, company description, 1-year projections); Medium (competitor analysis, detailed financial models, marketing strategy, 3-year projections); and Professional (investor-ready format, strategic marketing plan, AI website builder integration, SEO roadmap, full financial statements, and pitch deck). All levels support Canadian and US market contexts with relevant regulatory and funding references.'
        },
        {
            question: 'What is ProLaunch TeamAI?',
            answer: 'ProLaunch TeamAI is a virtual enterprise automation suite that simulates a complete executive team. AI agents function as CEO (strategic decisions), HR Manager (hiring workflows, offer letters, onboarding), CFO (cash flow modeling, financial alerts), Sales Director (AI cold outreach via Twilio, CRM management), and Administrative Officer (scheduling, document management, follow-ups). A solo founder can operate with the efficiency of a 20-person team.'
        },
        {
            question: 'How does the Funding Opportunities Finder work?',
            answer: 'The AI scans and indexes 10,000+ funding programs across the USA (SBA loans, SBIR grants, angel networks, VC databases) and Canada (BDC, IRAP, Futurpreneur, provincial programs, Investissement Quebec, federal grants). It matches your business profile, stage, sector, and geography to the best opportunities and auto-generates pitch decks and executive summaries tailored to each funder\'s requirements.'
        },
    ];

    const legalFaqs = [
        {
            question: 'Does Kimuntu AI replace a lawyer?',
            answer: 'No. Kimuntu AI is NOT a law firm and does NOT provide legal representation or formal legal advice. The Legal track provides AI-assisted information, document drafting, and preparation tools for educational and self-help purposes only. For formal legal proceedings, court representation, or binding legal advice, users must consult a licensed attorney or barrister in their jurisdiction. All Legal track outputs include this disclaimer prominently.'
        },
        {
            question: 'What legal areas are covered for Canada?',
            answer: 'Kimuntu AI covers the following areas under Canadian law: Family Law (divorce, custody, support), Criminal Law (informational research only), Business and Contract Law (contract drafting, business incorporation guidance), Consumer Rights, Immigration and Refugee Law (IRCC applications, study/work permits, PR pathways, refugee claims), Labour and Employment Law (wrongful dismissal, employment standards by province), and Civil Litigation (demand letters, small claims preparation). Coverage is available for all provinces and territories with Quebec-specific French-language outputs.'
        },
        {
            question: 'What legal areas are covered for the USA?',
            answer: 'US coverage includes: Family Law (divorce, custody), Criminal Law (informational only), Business Contracts and LLC/Corp formation, Consumer Rights, Immigration and Visa guidance (H-1B, OPT, green card, DACA, asylum), Workplace Rights and employment law, Civil Litigation preparation, and small claims court assistance across all 50 states and D.C.'
        },
        {
            question: 'What is the Immigration Court Simulation?',
            answer: 'The Immigration Court Simulation is an AI-powered practice environment where users can rehearse immigration hearings, asylum interviews, and IRCC/USCIS application reviews. AI agents simulate the roles of immigration judges, officers, and opposing counsel. Users receive detailed feedback on their responses, documentation completeness, and areas of vulnerability. This tool is available on the Legal Premium and Full Package plans.'
        },
    ];

    const pricingFaqs = [
        {
            question: 'What are the available plans?',
            answer: 'Free Tier ($0/month), Career Premium ($19.99/month), Business Premium ($29.99/month), Legal Premium ($29.99/month), Innovation Premium ($79.99/month), and Full Package — All 4 Tracks ($99/month or $950.40/year). Annual plans offer a 20% discount. Pay-Per-Use credits are available for Live Avatar sessions, on-demand documents, and legal consultations. B2B and Enterprise plans are available from $59/seat/month with custom onboarding.'
        },
        {
            question: 'Is there a free trial?',
            answer: 'Yes. All paid plans include a 14-day free trial with full feature access. No credit card is required to start the trial. At the end of the trial, you will be prompted to enter payment details to continue. If you do not subscribe, your account reverts to the Free Tier and your generated documents remain accessible for 30 days.'
        },
        {
            question: 'How do refunds work?',
            answer: 'Monthly subscribers may request a refund within 7 days of the most recent billing date, provided the account has not generated more than 3 premium documents in that billing cycle. Annual subscribers may request a pro-rated refund within 30 days of purchase. App store purchases are subject to the refund policies of Apple App Store and Google Play respectively. See the Refund and Cancellation Policy below for full details.'
        },
        {
            question: 'How do I contact support?',
            answer: 'Support is available via: In-platform live chat (all plans, business hours EST); email at support@kimuntu.ai (response within 48 hours for standard plans, 24 hours for Full Package, 12 hours for Enterprise); the Help Center with guides, video tutorials, and an AI onboarding assistant. Emergency security issues: security@kimuntu.ai.'
        },
    ];

    const refundFaqs = [
        {
            question: 'How do I cancel my subscription?',
            answer: "You may cancel your subscription at any time through Settings > Subscription > Cancel Plan, or by contacting support@kimuntu.ai. Cancellation takes effect at the end of the current billing period. You retain full access to your plan features until that date. After cancellation, your account reverts to the Free Tier. Your documents and data remain accessible and downloadable for 90 days before being subject to the standard retention schedule. Cancellation does not delete your account. To permanently delete your account and all associated data, follow the process in Settings > Privacy > Delete My Account."
        },
        {
            question: 'What is the refund policy for monthly plans?',
            answer: 'If you request a refund within 7 days of billing and have generated fewer than 3 premium documents, you will receive a full refund of the most recent charge. After 7 days or if more than 3 premium docs were generated, no refund is issued but access continues until the end of the billing period.'
        },
        {
            question: 'What is the refund policy for annual plans?',
            answer: 'If you request a refund within 30 days of initial purchase, you receive a pro-rated refund for unused months, minus a $15 CAD / $12 USD processing fee. After 30 days, no refund is issued but access continues until the end of the annual period.'
        },
        {
            question: 'Are Pay-Per-Use credits refundable?',
            answer: 'No. Pay-Per-Use credits are non-refundable. Credits remain valid for 24 months from the purchase date.'
        },
        {
            question: 'How do App Store refunds work?',
            answer: "App Store (Apple / Google Play) purchases are subject to the respective platform's refund policies. Kimuntu AI cannot process these refunds directly — you must submit refund requests through Apple or Google."
        },
        {
            question: 'What if there is a technical failure or extended outage?',
            answer: 'For technical failures or extended platform outages exceeding 4 hours, a service credit equivalent to the affected period is applied to your next billing cycle.'
        },
        {
            question: 'How do I request a refund?',
            answer: "Email support@kimuntu.ai with subject line: 'Refund Request — [Your Account Email]'. Include: your account email, subscription plan, purchase date, reason for refund request, and any supporting context. Kimuntu AI will acknowledge your request within 2 business days and provide a decision within 5 business days. Approved refunds are processed within 7-10 business days to your original payment method. Refund decisions are final. If you believe a decision was made in error, you may escalate with 'Refund Appeal' in the subject line."
        },
    ];

    const renderFaqSection = (title, faqs) => (
        <section className="mb-12">
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
            </h3>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <details
                        key={index}
                        className={`p-5 rounded-xl border ${isDark
                                ? 'bg-white/5 border-white/10'
                                : 'bg-white/60 border-gray-200'
                            }`}
                    >
                        <summary className={`cursor-pointer font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {faq.question}
                        </summary>
                        <p className="mt-3">{faq.answer}</p>
                    </details>
                ))}
            </div>
        </section>
    );

    const contactMethods = [
        {
            icon: Mail,
            title: 'Email Support',
            description: 'support@kimuntu.ai',
            response: 'Response within 24-48 hours (12 hours for Enterprise)'
        },
        {
            icon: MessageCircle,
            title: 'Live Chat',
            description: 'Available Mon-Fri, business hours EST',
            response: 'All plans'
        },
        {
            icon: Phone,
            title: 'Security Issues',
            description: 'security@kimuntu.ai',
            response: 'Emergency security reports'
        }
    ];

    return (
        <PageWrapper title="Support Center">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    How Can We Help?
                </h2>
                <p className="text-lg mb-10">
                    Find answers to common questions or get in touch with our support team.
                </p>

                <section className="mb-6">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Frequently Asked Questions
                    </h3>
                </section>

                {renderFaqSection('General Questions', generalFaqs)}
                {renderFaqSection('Career Track', careerFaqs)}
                {renderFaqSection('Business Track', businessFaqs)}
                {renderFaqSection('Legal Track', legalFaqs)}
                {renderFaqSection('Pricing & Billing', pricingFaqs)}
                {renderFaqSection('Refund & Cancellation Policy', refundFaqs)}

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Contact Support
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {contactMethods.map((method, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl border text-center ${isDark
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                        : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                    } transition-all`}
                            >
                                <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                                    }`}>
                                    <method.icon className={`w-7 h-7 ${isDark ? 'text-emerald-400' : 'text-emerald-600'
                                        }`} />
                                </div>
                                <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {method.title}
                                </h4>
                                <p className="text-sm mb-2">{method.description}</p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {method.response}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Additional Resources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="#/page/docs"
                            className={`p-5 rounded-xl border flex items-center justify-between ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                } transition-all`}
                        >
                            <span className={isDark ? 'text-white' : 'text-gray-900'}>
                                <strong>Documentation</strong><br />
                                <span className="text-sm">Comprehensive guides and tutorials</span>
                            </span>
                            <HelpCircle className="w-5 h-5" />
                        </a>
                        <a
                            href="#/page/api"
                            className={`p-5 rounded-xl border flex items-center justify-between ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                } transition-all`}
                        >
                            <span className={isDark ? 'text-white' : 'text-gray-900'}>
                                <strong>API Reference</strong><br />
                                <span className="text-sm">Developer documentation</span>
                            </span>
                            <HelpCircle className="w-5 h-5" />
                        </a>
                        <a
                            href="#/page/community"
                            className={`p-5 rounded-xl border flex items-center justify-between ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                } transition-all`}
                        >
                            <span className={isDark ? 'text-white' : 'text-gray-900'}>
                                <strong>Community Forums</strong><br />
                                <span className="text-sm">Get help from the community</span>
                            </span>
                            <HelpCircle className="w-5 h-5" />
                        </a>
                        <a
                            href="#/page/status"
                            className={`p-5 rounded-xl border flex items-center justify-between ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                } transition-all`}
                        >
                            <span className={isDark ? 'text-white' : 'text-gray-900'}>
                                <strong>System Status</strong><br />
                                <span className="text-sm">Check service availability</span>
                            </span>
                            <HelpCircle className="w-5 h-5" />
                        </a>
                    </div>
                </section>

                <div className={`p-8 rounded-2xl border ${isDark
                        ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30'
                        : 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-300'
                    }`}>
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Can't Find What You're Looking For?
                    </h3>
                    <p className="mb-4">
                        Our support team is here to help. Send us a message and we'll get back to you as soon as possible.
                    </p>
                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all">
                        Contact Support
                    </button>
                </div>
            </div>
        </PageWrapper>
    );
};

export default SupportCenter;
