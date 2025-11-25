import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../context/ThemeContext';
import { Briefcase, Code, TrendingUp, Users } from 'lucide-react';

const Careers = () => {
    const { isDark } = useTheme();

    const positions = [
        {
            title: 'Senior AI Engineer',
            department: 'Engineering',
            location: 'Remote / San Francisco',
            type: 'Full-time',
            icon: Code,
            description: 'Build cutting-edge AI models and systems that power our platform.'
        },
        {
            title: 'Product Manager',
            department: 'Product',
            location: 'Remote / San Francisco',
            type: 'Full-time',
            icon: TrendingUp,
            description: 'Shape the future of AI-powered professional tools.'
        },
        {
            title: 'UX/UI Designer',
            department: 'Design',
            location: 'Remote',
            type: 'Full-time',
            icon: Briefcase,
            description: 'Create beautiful, intuitive experiences for our users.'
        },
        {
            title: 'Customer Success Manager',
            department: 'Customer Success',
            location: 'Remote',
            type: 'Full-time',
            icon: Users,
            description: 'Help our users achieve their goals and maximize platform value.'
        }
    ];

    const benefits = [
        'Competitive salary and equity packages',
        'Comprehensive health, dental, and vision insurance',
        'Unlimited PTO and flexible work arrangements',
        'Professional development budget',
        'Latest tech equipment and tools',
        'Regular team events and offsites',
        'Remote-first culture',
        'Parental leave and family support'
    ];

    return (
        <PageWrapper title="Careers">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Join Our Team
                </h2>
                <p className="text-lg mb-10">
                    Help us build the future of AI-powered professional tools. We're looking for passionate, creative individuals who want to make a real impact.
                </p>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Open Positions
                    </h3>
                    <div className="space-y-4">
                        {positions.map((position, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl border ${isDark
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                        : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                    } transition-all cursor-pointer`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                        }`}>
                                        <position.icon className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {position.title}
                                                </h4>
                                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {position.department} • {position.location} • {position.type}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mb-4">{position.description}</p>
                                        <button className={`px-4 py-2 rounded-lg font-medium transition-all ${isDark
                                                ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                            }`}>
                                            Apply Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Why Join Us?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3"
                            >
                                <div className={`mt-1 w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'
                                    }`}></div>
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={`p-8 rounded-2xl border ${isDark
                        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
                    }`}>
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Don't See Your Role?
                    </h3>
                    <p className="mb-4">
                        We're always interested in hearing from talented individuals. Send us your resume and let us know what you're passionate about!
                    </p>
                    <p className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        careers@kimuntupro.com
                    </p>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Careers;
