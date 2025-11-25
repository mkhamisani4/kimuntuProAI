import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../context/ThemeContext';
import { Download, Image, FileText, Newspaper } from 'lucide-react';

const Press = () => {
    const { isDark } = useTheme();

    const resources = [
        {
            icon: Image,
            title: 'Brand Assets',
            description: 'Logos, color palettes, and brand guidelines',
            action: 'Download'
        },
        {
            icon: FileText,
            title: 'Company Fact Sheet',
            description: 'Key information about KimuntuPro AI',
            action: 'Download'
        },
        {
            icon: Newspaper,
            title: 'Press Releases',
            description: 'Latest company news and announcements',
            action: 'View All'
        }
    ];

    const coverage = [
        {
            outlet: 'TechCrunch',
            title: 'KimuntuPro AI Raises $10M to Democratize AI Tools',
            date: 'October 2024'
        },
        {
            outlet: 'VentureBeat',
            title: 'How AI is Transforming Professional Development',
            date: 'September 2024'
        },
        {
            outlet: 'Forbes',
            title: 'The Future of Work: AI-Powered Career Platforms',
            date: 'August 2024'
        }
    ];

    return (
        <PageWrapper title="Press Kit">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Press Kit
                </h2>
                <p className="text-lg mb-10">
                    Resources and information for media and press inquiries.
                </p>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Media Resources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {resources.map((resource, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl border ${isDark
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                        : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                    } transition-all cursor-pointer text-center`}
                            >
                                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                    }`}>
                                    <resource.icon className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'
                                        }`} />
                                </div>
                                <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {resource.title}
                                </h4>
                                <p className="text-sm mb-4">{resource.description}</p>
                                <button className={`flex items-center gap-2 mx-auto px-4 py-2 rounded-lg font-medium transition-all ${isDark
                                        ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    }`}>
                                    <Download className="w-4 h-4" />
                                    {resource.action}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Company Overview
                    </h3>
                    <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                        }`}>
                        <p className="mb-4">
                            <strong>About KimuntuPro AI:</strong> KimuntuPro AI is a leading AI-powered platform that empowers professionals with advanced tools for career development, business growth, legal assistance, and innovative project management.
                        </p>
                        <p className="mb-4">
                            <strong>Founded:</strong> 2023
                        </p>
                        <p className="mb-4">
                            <strong>Headquarters:</strong> San Francisco, CA
                        </p>
                        <p className="mb-4">
                            <strong>Employees:</strong> 50+
                        </p>
                        <p>
                            <strong>Funding:</strong> Series A
                        </p>
                    </div>
                </section>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Recent Press Coverage
                    </h3>
                    <div className="space-y-4">
                        {coverage.map((article, index) => (
                            <div
                                key={index}
                                className={`p-5 rounded-xl border ${isDark
                                        ? 'bg-white/5 border-white/10'
                                        : 'bg-white/60 border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {article.title}
                                        </p>
                                        <p className="text-sm">
                                            {article.outlet} • {article.date}
                                        </p>
                                    </div>
                                    <button className={`${isDark ? 'text-purple-400' : 'text-purple-600'} hover:underline`}>
                                        Read →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={`p-8 rounded-2xl border ${isDark
                        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
                    }`}>
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Media Inquiries
                    </h3>
                    <p className="mb-4">
                        For press inquiries, interviews, or more information, please contact our PR team:
                    </p>
                    <p className={`font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        press@kimuntupro.com
                    </p>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Press;
