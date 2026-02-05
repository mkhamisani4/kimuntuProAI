'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { 
    FileText, 
    FileCheck, 
    Shield, 
    Scale, 
    Globe,
    Users,
    Briefcase,
    ArrowRight
} from 'lucide-react';

export default function LegalTrackPage() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { t } = useLanguage();

    const legalServices = [
        {
            id: 'immigration',
            icon: Globe,
            title: 'Immigration Law',
            description: 'US & Canada immigration guidance, visa information, and process assistance',
            path: '/dashboard/legal/immigration',
            color: 'blue',
            new: true
        },
        {
            id: 'family',
            icon: Users,
            title: 'Family Law',
            description: 'Family legal matters, custody, divorce, and domestic relations',
            path: '/dashboard/legal/family',
            color: 'purple',
            comingSoon: true
        },
        {
            id: 'contract',
            icon: FileText,
            title: 'Contract Review',
            description: 'AI-powered contract analysis and risk assessment',
            path: '/dashboard/legal/contracts',
            color: 'pink',
            comingSoon: true
        },
        {
            id: 'templates',
            icon: FileCheck,
            title: 'Legal Templates',
            description: 'Professional legal document templates',
            path: '/dashboard/legal/templates',
            color: 'green',
            comingSoon: true
        },
        {
            id: 'compliance',
            icon: Shield,
            title: 'Compliance Check',
            description: 'GDPR, CCPA, and regulatory compliance verification',
            path: '/dashboard/legal/compliance',
            color: 'yellow',
            comingSoon: true
        },
        {
            id: 'document',
            icon: Scale,
            title: 'Document Drafting',
            description: 'AI-assisted legal document creation',
            path: '/dashboard/legal/drafting',
            color: 'indigo',
            comingSoon: true
        }
    ];

    const colorClasses = {
        blue: {
            bg: isDark ? 'bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/30' : 'bg-blue-50 border-blue-200 hover:bg-blue-100',
            text: isDark ? 'text-blue-400' : 'text-blue-700',
            icon: isDark ? 'text-blue-400' : 'text-blue-600'
        },
        purple: {
            bg: isDark ? 'bg-purple-500/20 border-purple-500/40 hover:bg-purple-500/30' : 'bg-purple-50 border-purple-200 hover:bg-purple-100',
            text: isDark ? 'text-purple-400' : 'text-purple-700',
            icon: isDark ? 'text-purple-400' : 'text-purple-600'
        },
        pink: {
            bg: isDark ? 'bg-pink-500/20 border-pink-500/40 hover:bg-pink-500/30' : 'bg-pink-50 border-pink-200 hover:bg-pink-100',
            text: isDark ? 'text-pink-400' : 'text-pink-700',
            icon: isDark ? 'text-pink-400' : 'text-pink-600'
        },
        green: {
            bg: isDark ? 'bg-green-500/20 border-green-500/40 hover:bg-green-500/30' : 'bg-green-50 border-green-200 hover:bg-green-100',
            text: isDark ? 'text-green-400' : 'text-green-700',
            icon: isDark ? 'text-green-400' : 'text-green-600'
        },
        yellow: {
            bg: isDark ? 'bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30' : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
            text: isDark ? 'text-yellow-400' : 'text-yellow-700',
            icon: isDark ? 'text-yellow-400' : 'text-yellow-600'
        },
        indigo: {
            bg: isDark ? 'bg-indigo-500/20 border-indigo-500/40 hover:bg-indigo-500/30' : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
            text: isDark ? 'text-indigo-400' : 'text-indigo-700',
            icon: isDark ? 'text-indigo-400' : 'text-indigo-600'
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.legalTrackTitle || 'Legal Track'}
                </h2>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.legalTrackDesc || 'Access comprehensive legal assistance powered by AI'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {legalServices.map((service) => {
                    const colors = colorClasses[service.color];
                    const Icon = service.icon;
                    
                    return (
                        <button
                            key={service.id}
                            onClick={() => !service.comingSoon && router.push(service.path)}
                            disabled={service.comingSoon}
                            className={`${colors.bg} border rounded-2xl p-6 text-left transition-all ${
                                service.comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    isDark ? 'bg-white/10' : 'bg-white/50'
                                }`}>
                                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                                </div>
                                {service.new && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                                    }`}>
                                        NEW
                                    </span>
                                )}
                                {service.comingSoon && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        COMING SOON
                                    </span>
                                )}
                            </div>
                            
                            <h3 className={`text-xl font-bold mb-2 ${colors.text}`}>
                                {service.title}
                            </h3>
                            
                            <p className={`text-sm mb-4 ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                {service.description}
                            </p>
                            
                            {!service.comingSoon && (
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${colors.text}`}>
                                        Get Started
                                    </span>
                                    <ArrowRight className={`w-4 h-4 ${colors.icon}`} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Featured Tool Section */}
            <div className={`mt-12 rounded-2xl p-8 ${
                isDark 
                    ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/30' 
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
            }`}>
                <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                        <Globe className={`w-8 h-8 ${
                            isDark ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-2xl font-bold mb-2 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                            Immigration Law Assistant
                        </h3>
                        <p className={`text-lg mb-4 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Get expert guidance on US and Canadian immigration law. Ask questions about visas, 
                            work permits, permanent residence, citizenship, and more.
                        </p>
                        <button
                            onClick={() => router.push('/dashboard/legal/immigration')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                isDark
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            } shadow-lg hover:shadow-xl`}
                        >
                            Try Immigration Assistant →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
