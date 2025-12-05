'use client';

import React from 'react';
import { CreditCard, Check, Zap, Crown, Sparkles, Gift } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function PricingPage() {
    const { isDark } = useTheme();
    const { t } = useLanguage();

    const plans = [
        {
            name: t.pricingFree,
            icon: Gift,
            price: '$0',
            period: '/month',
            description: t.pricingFreeDesc,
            features: [
                '1 AI-generated business plan per month',
                '1 website generation per month',
                '1 logo design per month',
                'Basic resume builder (3 uses/month)',
                'Cover letter generator (2 uses/month)',
                'AI Assistant (3 queries/month)',
                'Community support only',
                '100K tokens per month',
                'Watermarked exports',
                'No priority support',
                'Limited feature access'
            ],
            popular: false,
            color: 'gray'
        },
        {
            name: t.pricingStarter,
            icon: Zap,
            price: '$9',
            period: '/month',
            description: t.pricingStarterDesc,
            features: [
                '5 AI-generated business plans per month',
                '3 website generations per month',
                '2 logo designs per month',
                'Basic resume builder',
                'Cover letter generator',
                'AI Assistant (10 queries/month)',
                'Email support',
                '1M tokens per month'
            ],
            popular: false,
            color: 'emerald'
        },
        {
            name: t.pricingProfessional,
            icon: Sparkles,
            price: '$29',
            period: '/month',
            description: t.pricingProfessionalDesc,
            features: [
                'Unlimited business plans',
                '10 website generations per month',
                '10 logo designs per month',
                'Advanced resume builder',
                'Cover letter generator',
                'AI Assistant (unlimited queries)',
                'Job matching platform access',
                'Interview simulator',
                'Priority email support',
                '5M tokens per month'
            ],
            popular: true,
            color: 'blue'
        },
        {
            name: t.pricingEnterprise,
            icon: Crown,
            price: '$99',
            period: '/month',
            description: t.pricingEnterpriseDesc,
            features: [
                'Everything in Professional',
                'Unlimited website generations',
                'Unlimited logo designs',
                'Team collaboration features',
                'Custom AI model training',
                'Dedicated account manager',
                '24/7 priority support',
                'Custom integrations',
                'Advanced analytics dashboard',
                '20M tokens per month',
                'White-label options'
            ],
            popular: false,
            color: 'purple'
        }
    ];

    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <CreditCard className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.pricingPlans}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    const isPopular = plan.popular;
                    
                    return (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl p-8 transition-all ${
                                isPopular
                                    ? isDark
                                        ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50 shadow-xl scale-105'
                                        : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-xl scale-105'
                                    : isDark
                                        ? 'bg-gray-900/80 border border-gray-800'
                                        : 'bg-white border border-gray-200'
                            }`}
                        >
                            {isPopular && (
                                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold ${
                                    isDark
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-blue-500 text-white'
                                }`}>
                                    {t.pricingMostPopular}
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-lg ${
                                    plan.color === 'gray'
                                        ? isDark ? 'bg-gray-500/20' : 'bg-gray-100'
                                        : plan.color === 'emerald'
                                        ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                                        : plan.color === 'blue'
                                        ? isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                                        : isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                }`}>
                                    <Icon className={`w-6 h-6 ${
                                        plan.color === 'gray'
                                            ? isDark ? 'text-gray-400' : 'text-gray-600'
                                            : plan.color === 'emerald'
                                            ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                            : plan.color === 'blue'
                                            ? isDark ? 'text-blue-400' : 'text-blue-600'
                                            : isDark ? 'text-purple-400' : 'text-purple-600'
                                    }`} />
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {plan.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {plan.price}
                                    </span>
                                    <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {plan.period}
                                    </span>
                                </div>
                            </div>

                            <button
                                className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 ${
                                    plan.name === t.pricingFree
                                        ? isDark
                                            ? 'bg-gray-500/20 text-gray-300 border border-gray-500/50 hover:bg-gray-500/30'
                                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                        : isPopular
                                        ? isDark
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                                        : isDark
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
                                            : 'bg-emerald-100 text-emerald-600 border border-emerald-300 hover:bg-emerald-200'
                                }`}
                            >
                                {plan.name === t.pricingFree ? t.pricingStartFree : isPopular ? t.pricingGetStarted : t.pricingChoosePlan}
                            </button>

                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                            isDark ? 'text-emerald-400' : 'text-emerald-600'
                                        }`} />
                                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            <div className={`mt-12 rounded-2xl p-8 ${isDark
                ? 'bg-gray-900/80 border border-gray-800'
                : 'bg-white border border-gray-200'
            }`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.pricingAllPlansInclude}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <Check className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {t.pricingSecureEncryption}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Check className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {t.pricingFeatureUpdates}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Check className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {t.pricingCancelAnytime}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Check className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {t.pricingMoneyBack}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

