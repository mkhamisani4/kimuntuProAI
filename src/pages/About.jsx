import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../context/ThemeContext';
import { Target, Lightbulb, Users, Sparkles } from 'lucide-react';

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

    return (
        <PageWrapper title="About Us">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    About KimuntuPro AI
                </h2>

                <section className="mb-10">
                    <p className="text-lg mb-4">
                        KimuntuPro AI is a revolutionary platform that empowers professionals with AI-driven solutions for career development, business growth, legal assistance, and innovative project management.
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
                                <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                    }`}>
                                    <value.icon className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'
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
                            <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                            <span><strong>Career Track:</strong> AI-powered resume building, job matching, and interview preparation</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                            <span><strong>Business Track:</strong> Comprehensive business planning, market analysis, and growth strategies</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                            <span><strong>Legal Track:</strong> Document review, contract analysis, and legal guidance</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
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
                    <p className={isDark ? 'text-purple-400' : 'text-purple-600'}>
                        contact@kimuntupro.com
                    </p>
                </section>
            </div>
        </PageWrapper >
    );
};

export default About;
