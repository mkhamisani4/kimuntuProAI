'use client';

import React from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

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
        description: 'Available Mon–Fri, 9 AM – 6 PM EST',
        response: 'Instant response'
    },
    {
        icon: Phone,
        title: 'Phone Support',
        description: '+1 (613) 290-32-00',
        response: 'Mon–Fri, 9 AM – 6 PM EST'
    },
];

export default function SupportPage() {
    const { isDark } = useTheme();

    return (
        <div>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Support Center
            </h2>
            <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Find answers to common questions or get in touch with our team.
            </p>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {contactMethods.map((method, index) => (
                    <div
                        key={index}
                        className={`rounded-2xl p-6 text-center border ${isDark
                            ? 'bg-gray-900/80 border-gray-800'
                            : 'bg-white border-gray-200'
                        } shadow-sm`}
                    >
                        <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                            <method.icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{method.title}</h4>
                        <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{method.description}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{method.response}</p>
                    </div>
                ))}
            </div>

            {/* FAQ */}
            <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Frequently Asked Questions
            </h3>
            <div className="space-y-8">
                {faqCategories.map((cat, catIndex) => (
                    <div key={catIndex}>
                        <h4 className={`text-base font-bold mb-3 pb-2 border-b ${isDark ? 'text-emerald-400 border-gray-800' : 'text-emerald-700 border-gray-200'}`}>
                            {cat.category}
                        </h4>
                        <div className="space-y-3">
                            {cat.faqs.map((faq, index) => (
                                <details
                                    key={index}
                                    className={`p-5 rounded-xl border ${isDark
                                        ? 'bg-gray-900/60 border-gray-800'
                                        : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <summary className={`cursor-pointer font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {faq.question}
                                    </summary>
                                    <p className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {faq.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
