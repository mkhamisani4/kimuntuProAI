'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Target, Lightbulb, Users, Sparkles, Brain, Rocket, Scale } from 'lucide-react';

const About = () => {
    const { isDark } = useTheme();

    const values = [
        {
            icon: Lightbulb,
            title: 'Innovation',
            description: 'We push the boundaries of AI technology to create cutting-edge solutions.'
        },
        {
            icon: Users,
            title: 'User-Centric',
            description: 'Every feature is designed with our users\' success in mind.'
        },
        {
            icon: Target,
            title: 'Excellence',
            description: 'We strive for the highest quality in everything we do.'
        },
        {
            icon: Sparkles,
            title: 'Accessibility',
            description: 'Making professional AI tools available to everyone.'
        }
    ];

    const leadershipTeam = [
        {
            icon: Brain,
            title: 'Chief Executive Officer (CEO) / Founder',
            name: 'Yannick Nkayilu Salomon',
            role: 'The visionary leader of Kimuntu AI.',
            responsibilities: [
                'Defines the global vision and strategy',
                'Leads growth across Career, Business, Legal, and Innovation',
                'Builds partnerships with institutions, investors, and strategic stakeholders'
            ],
            impact: 'Builds trust, leadership, and direction for the platform.'
        },
        {
            icon: Sparkles,
            title: 'Chief Technology Officer (CTO) / Head of AI',
            name: '',
            role: 'Leads all technology and AI development.',
            responsibilities: [
                'Oversees AI systems, matching engines, and platform architecture',
                'Ensures scalability, performance, and technical innovation',
                'Integrates advanced experiences like avatars, voice, and simulations'
            ],
            impact: 'Shows the platform is technically strong and future-ready.'
        },
        {
            icon: Scale,
            title: 'Chief Legal & Compliance Officer (CLO)',
            name: '',
            role: 'Ensures all legal services and data practices are compliant.',
            responsibilities: [
                'Oversees legal intelligence and compliance standards',
                'Validates legal content, safeguards, and disclaimers',
                'Supports partnerships with licensed lawyers and legal advisors'
            ],
            impact: 'Critical for trust, safety, and legal credibility.'
        },
        {
            icon: Rocket,
            title: 'Chief Product Officer (CPO) / Head of Product & User Experience',
            name: '',
            role: 'Leads the design, functionality, and overall user experience of Kimuntu AI.',
            responsibilities: [
                'Shapes product strategy across all platform tracks',
                'Keeps the platform intuitive, scalable, and user-friendly',
                'Translates user needs into features and product improvements'
            ],
            impact: 'Ensures the platform is powerful, attractive, and easy to use.'
        }
    ];

    return (
        <PageWrapper title="About Us">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    About Kimuntu AI
                </h2>

                <section className="mb-10">
                    <p className="text-lg mb-4">
                        Kimuntu AI is a revolutionary platform that empowers professionals with AI-driven solutions for career development, business growth, legal assistance, and innovative project management.
                    </p>
                    <p className="mb-4">
                        Founded with the vision of democratizing access to advanced AI capabilities, we're committed to helping individuals and businesses achieve their full potential through intelligent automation and insights.
                    </p>
                </section>

                <section className="mb-10">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Our Mission
                    </h3>
                    <p className="text-lg mb-4">
                        To empower every professional with AI-powered tools that transform how they work, create, and innovate.
                    </p>
                </section>

                <section className="mb-10">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Our Vision
                    </h3>
                    <p className="text-lg mb-4">
                        A world where advanced AI assistance is accessible to everyone, enabling professionals to focus on what matters most: creativity, strategy, and human connection.
                    </p>
                </section>

                <section className="mb-10">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Our Team
                    </h3>
                    <div className={`p-6 rounded-2xl border mb-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-gray-200'}`}>
                        <h4 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            KimuntuPro Launch AI: Powered Platform for Career, Business, and Legal Assistance
                        </h4>
                        <p className={isDark ? 'text-white/70' : 'text-gray-700'}>
                            A concise leadership structure guiding vision, AI innovation, compliance, and product experience across the platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {leadershipTeam.map((leader, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-gray-200'}`}
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-100'}`}>
                                        <leader.icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    </div>
                                    <div>
                                        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {leader.title}
                                        </h4>
                                        {leader.name && (
                                            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                                {leader.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <p className="mb-4">{leader.role}</p>

                                <ul className="space-y-2 mb-4">
                                    {leader.responsibilities.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start gap-3">
                                            <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <p className={isDark ? 'text-white/70' : 'text-gray-700'}>
                                    <strong>Why it matters:</strong> {leader.impact}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-10">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Our Values
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-xl border ${isDark
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-white/60 border-gray-200'
                                    } transition-all hover:scale-105`}
                            >
                                <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                                    }`}>
                                    <value.icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'
                                        }`} />
                                </div>
                                <h4 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {value.title}
                                </h4>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-10">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        What We Offer
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                            <span><strong>Career Track:</strong> AI-powered resume building, job matching, and interview preparation</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                            <span><strong>Business Track:</strong> Comprehensive business planning, market analysis, and growth strategies</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                            <span><strong>Legal Track:</strong> Document review, contract analysis, and legal guidance</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                            <span><strong>Innovative Track:</strong> AI-powered ideation, rapid prototyping, and project management</span>
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Contact Us
                    </h3>
                    <p className="mb-4">
                        Have questions or want to learn more? Get in touch with us:
                    </p>
                    <p className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
                        contact@kimuntu.ai
                    </p>
                </section>
            </div>
        </PageWrapper >
    );
};

export default About;
