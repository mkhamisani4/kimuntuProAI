'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import { HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react';

const SupportCenter = () => {
    const { isDark } = useTheme();

    const faqs = [
        {
            question: 'How do I get started with KimuntuPro AI?',
            answer: 'Simply create an account, complete your profile, and choose which track (Career, Business, Legal, or Innovative) you want to explore first.'
        },
        {
            question: 'Is my data secure?',
            answer: 'Yes, we use industry-standard encryption and security measures to protect your data. See our Privacy Policy and GDPR Compliance page for more details.'
        },
        {
            question: 'Can I export my data?',
            answer: 'Absolutely! You can export all your data at any time from your account settings.'
        },
        {
            question: 'Do you offer refunds?',
            answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans. Contact support@kimuntupro.com for assistance.'
        },
        {
            question: 'How does the AI feature work?',
            answer: 'Our AI uses advanced machine learning models to provide personalized recommendations, generate content, and assist with various professional tasks.'
        }
    ];

    const contactMethods = [
        {
            icon: Mail,
            title: 'Email Support',
            description: 'support@kimuntupro.com',
            response: 'Response within 24 hours'
        },
        {
            icon: MessageCircle,
            title: 'Live Chat',
            description: 'Available Mon-Fri, 9 AM - 6 PM PST',
            response: 'Instant response'
        },
        {
            icon: Phone,
            title: 'Phone Support',
            description: '+1 (555) 123-4567',
            response: 'Mon-Fri, 9 AM - 6 PM PST'
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

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Frequently Asked Questions
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
                                <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                    }`}>
                                    <method.icon className={`w-7 h-7 ${isDark ? 'text-purple-400' : 'text-purple-600'
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
                        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
                    }`}>
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Can't Find What You're Looking For?
                    </h3>
                    <p className="mb-4">
                        Our support team is here to help. Send us a message and we'll get back to you as soon as possible.
                    </p>
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all">
                        Contact Support
                    </button>
                </div>
            </div>
        </PageWrapper>
    );
};

export default SupportCenter;
