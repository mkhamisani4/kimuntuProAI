'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import { HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react';

const SupportCenter = () => {
    const { isDark } = useTheme();

    const faqCategories = [
        {
            category: 'General Questions',
            faqs: [
                {
                    question: 'What is Kimuntu AI / ProLaunch?',
                    answer: 'Kimuntu AI is a next-generation AI ecosystem by Kimuntu Power Inc. ProLaunch reflects its core mission: to professionally launch users toward success in career, business, legal navigation, and innovation goals — using advanced AI tools, simulations, and intelligent avatars.'
                },
                {
                    question: 'Who is Kimuntu AI designed for?',
                    answer: 'Job seekers, professionals, entrepreneurs, startups, SMEs, students, newcomers, legal self-help users in Canada and the USA, and governments, NGOs, and educational institutions.'
                },
                {
                    question: 'What makes Kimuntu AI unique?',
                    answer: 'Unlike single-purpose platforms, Kimuntu AI integrates four intelligence tracks: (1) Personal/Career, (2) Business, (3) Legal for Canada and USA, and (4) Future Intelligence and Innovation — all in one unified ecosystem.'
                },
                {
                    question: 'Is the platform secure and compliant?',
                    answer: 'Yes. Kimuntu AI follows GDPR, CCPA, and PIPEDA. All data is AES-256 encrypted in transit and at rest, anonymized where applicable, and fully user-controlled. We never sell personal data.'
                },
                {
                    question: 'What languages are supported?',
                    answer: 'English, French, and Spanish are fully supported. The AI Multilingual Translation and Voice Assistant covers 50+ languages for document translation and real-time communication.'
                },
            ]
        },
        {
            category: 'Personal & Career Track',
            faqs: [
                {
                    question: 'What does the AI CV Builder do?',
                    answer: 'It generates professional, ATS-optimized resumes and cover letters tailored to specific industries and roles, with multi-language support and real-time improvements.'
                },
                {
                    question: 'How does the AI Interview Coach work?',
                    answer: 'It simulates realistic job interviews using AI avatars, analyzes tone and communication style, and delivers detailed performance reports with actionable feedback. Users can retry sessions to track progress.'
                },
                {
                    question: 'What is the AI Career Accelerator?',
                    answer: 'A complete career growth engine that evaluates skills via adaptive AI assessments, identifies gaps, recommends targeted courses (Coursera, Udemy, LinkedIn Learning), builds personalized development roadmaps, and tracks progress in real time.'
                },
                {
                    question: 'What is the LevelUp Skills Hub?',
                    answer: 'The integrated upskilling engine offering personalized learning pathways, gamified micro-learning experiences, digital badges, and certifications — connected to major global education platforms.'
                },
            ]
        },
        {
            category: 'Business Intelligence Track',
            faqs: [
                {
                    question: 'What types of business plans are available?',
                    answer: 'Three levels: Basic (executive summary, market overview), Medium (competitor analysis, financial projections), and Professional (strategic marketing, investor-ready financial models, AI website builder, and SEO integration).'
                },
                {
                    question: 'What is ProLaunch TeamAI?',
                    answer: 'A virtual enterprise automation suite that simulates a full company — CEO, HR, Finance, Sales, and Administration AI agents. It allows a solo founder to operate like a 20-person team, with AI cold calling, automated emails, CRM integration, and daily executive reports.'
                },
                {
                    question: 'How does the Funding Finder work?',
                    answer: 'The AI scans global funding databases, grant programs, and VC directories, matching businesses with the most relevant opportunities. It can also auto-generate pitch decks and investor presentations.'
                },
                {
                    question: 'Is a website builder included?',
                    answer: 'Yes. The AI Website Builder offers drag-and-drop templates, domain integration, cloud hosting, e-commerce, and AI-driven SEO optimization.'
                },
            ]
        },
        {
            category: 'Legal Intelligence Track',
            faqs: [
                {
                    question: 'What legal areas are covered in Canada?',
                    answer: 'Family Law, Criminal Law, Business and Contract Law, Consumer Rights, Immigration and Refugee Law, Labor Law, and Civil Litigation — with AI document drafting, case analysis, and success probability estimation.'
                },
                {
                    question: 'What legal areas are covered in the USA?',
                    answer: 'The same comprehensive coverage: Family Law, Criminal Law research, Business Contracts, Consumer Rights, Immigration and Visa guidance, Workplace Rights, and Civil Litigation prediction and mediation tools.'
                },
                {
                    question: 'Does Kimuntu AI replace a lawyer?',
                    answer: 'No. Kimuntu AI provides AI-assisted guidance and document drafting for informational and preparation purposes only. It is not a law firm. For formal legal proceedings, users are directed to licensed attorneys in their jurisdiction.'
                },
                {
                    question: 'What are Virtual Lawyer Avatars and Court Simulations?',
                    answer: 'Virtual Lawyer Avatars are interactive AI agents that simulate legal consultations. The Immigration Court Simulation uses AI judges, lawyers, and officers to help users prepare for asylum hearings or immigration proceedings.'
                },
            ]
        },
        {
            category: 'Future Intelligence & Innovation Track',
            faqs: [
                {
                    question: 'What is the Future Intelligence Track?',
                    answer: 'A forward-looking suite of AI tools for innovation, sustainability, and human advancement — covering sustainable business planning, patent research, personalized education, smart city simulation, and ethical AI governance.'
                },
                {
                    question: 'What is the Sustainable Innovation Assistant?',
                    answer: 'AI tools for carbon footprint analysis, ESG strategy generation, supply chain sustainability, and funding identification for green projects and climate-focused startups.'
                },
                {
                    question: 'Who benefits from the Innovation Track?',
                    answer: 'Governments, NGOs, researchers, innovators, educators, and entrepreneurs building sustainable, future-ready solutions.'
                },
            ]
        },
        {
            category: 'Pricing & Support',
            faqs: [
                {
                    question: 'What pricing tiers are available?',
                    answer: 'Free Tier (basic tools), Career Premium ($10–15/month), Business Premium ($20–50/month), Legal Premium ($30–100/month), and Enterprise/Institutional licensing with custom pricing.'
                },
                {
                    question: 'Is mobile access available?',
                    answer: 'Yes — web browser, Android, and iOS, with full cloud synchronization across all devices.'
                },
                {
                    question: 'How do I contact support?',
                    answer: 'Via the in-platform Support page, email at support@kimuntu.ai, or the Help Center with guides, video tutorials, and an AI onboarding assistant.'
                },
            ]
        },
    ];

    const generalFaqs = [
        {
            question: 'What is Kimuntu AI?',
            answer: 'Kimuntu AI is a professional AI-powered platform offering four specialized tracks: Career, Business, Legal, and Innovation. Each track provides AI-driven tools, document generation, and expert guidance tailored to your professional needs.'
        },
        {
            question: 'How do I get started?',
            answer: 'Sign up for a free account, complete the onboarding flow to select your tracks, and start using AI tools immediately. Upgrade to a paid plan for premium features like Live Avatar sessions, advanced document generation, and more.'
        },
        {
            question: 'Is my data secure?',
            answer: 'Yes. Kimuntu AI uses enterprise-grade encryption, SOC 2 compliance standards, and GDPR-compliant data handling. Your documents and personal information are never shared with third parties.'
        },
    ];

    const careerFaqs = [
        {
            question: 'What career tools are available?',
            answer: 'AI-powered CV/resume builder, cover letter generator, interview preparation with Live Avatar simulation, job matching engine, LinkedIn profile optimization, and salary negotiation coaching.'
        },
        {
            question: 'How does the AI Interview Prep work?',
            answer: 'The AI simulates real interview scenarios using a Live Avatar. It asks industry-specific questions, evaluates your responses in real-time, and provides detailed feedback on content, delivery, and body language.'
        },
        {
            question: 'Can Kimuntu AI help me find jobs?',
            answer: 'Yes. The Job Matching engine scans thousands of job listings, matches them to your profile, skills, and preferences, and provides tailored application strategies for each opportunity.'
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
            response: 'Response within 24 hours'
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
