import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../context/ThemeContext';
import { Linkedin, Mail } from 'lucide-react';

const Team = () => {
    const { isDark } = useTheme();

    const team = [
        {
            name: 'Yannick Nkayilu Salomon',
            role: 'CEO & Founder',
            bio: 'Visionary leader driving innovation in AI-powered professional tools.',
            linkedin: '#'
        }
    ];

    return (
        <PageWrapper title="Our Team">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Meet Our Team
                </h2>
                <p className="text-lg mb-10">
                    We're a diverse team of innovators, engineers, and dreamers passionate about empowering professionals with AI technology.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {team.map((member, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-2xl border ${isDark
                                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                : 'bg-white/60 border-gray-200 hover:bg-white/80'
                                } transition-all`}
                        >
                            <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center text-2xl font-bold ${isDark
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                : 'bg-gradient-to-br from-purple-400 to-pink-400'
                                } text-white`}>
                                {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {member.name}
                            </h3>
                            <p className={`text-sm mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                {member.role}
                            </p>
                            <p className="text-sm mb-4">
                                {member.bio}
                            </p>
                            <div className="flex gap-3">
                                <a
                                    href={member.linkedin}
                                    className={`p-2 rounded-lg transition-all ${isDark
                                        ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                                        : 'bg-white/60 hover:bg-white text-gray-600 hover:text-gray-900'
                                        }`}
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a
                                    href="mailto:contact@kimuntupro.com"
                                    className={`p-2 rounded-lg transition-all ${isDark
                                        ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                                        : 'bg-white/60 hover:bg-white text-gray-600 hover:text-gray-900'
                                        }`}
                                    aria-label="Email"
                                >
                                    <Mail className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <section className="mt-12 p-8 rounded-2xl border ${isDark ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30' : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'}">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Join Our Team
                    </h3>
                    <p className="mb-4">
                        We're always looking for talented individuals who share our passion for AI and innovation. Check out our open positions on the Careers page.
                    </p>
                    <a
                        href="#/page/careers"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                        View Open Positions
                    </a>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Team;
