'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { auth } from '@/lib/firebase';
import {
    Check, Sparkles, Crown, Zap, Shield, ArrowRight,
    Star, Infinity, Brain, FileText, Briefcase, Globe,
    HeadphonesIcon, Rocket, Lock, CreditCard
} from 'lucide-react';

export default function PricingPage() {
    const { isDark } = useTheme();
    const router = useRouter();
    const [isYearly, setIsYearly] = useState(false);
    const [hoveredPlan, setHoveredPlan] = useState(null);
    const [mounted, setMounted] = useState(false);
    const user = auth.currentUser;

    // Check existing subscription
    const [hasSubscription, setHasSubscription] = useState(false);
    useEffect(() => {
        setMounted(true);
        if (user && typeof window !== 'undefined') {
            const stored = localStorage.getItem(`kimuntu_subscription_${user.uid}`);
            if (stored) {
                const sub = JSON.parse(stored);
                if (sub.status === 'active') setHasSubscription(true);
            }
        }
    }, [user]);

    const monthlyPrice = 19.99;
    const yearlyPrice = 199.99;
    const monthlySavings = ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12) * 100).toFixed(0);

    const features = [
        { icon: Infinity, title: 'Unlimited AI Queries', desc: 'No caps on AI assistant usage' },
        { icon: Brain, title: 'All 4 Pro Tracks', desc: 'Career, Business, Legal & Innovation' },
        { icon: FileText, title: 'Unlimited Documents', desc: 'Business plans, resumes, cover letters' },
        { icon: Briefcase, title: 'Interview Simulator', desc: 'AI-powered mock interviews with feedback' },
        { icon: Globe, title: 'Website Generator', desc: 'Unlimited AI website generations' },
        { icon: Sparkles, title: 'Logo Studio', desc: 'Unlimited AI logo designs' },
        { icon: HeadphonesIcon, title: 'Priority Support', desc: '24/7 dedicated assistance' },
        { icon: Rocket, title: 'Early Access', desc: 'Be first to try new features' },
        { icon: Shield, title: 'No Watermarks', desc: 'Clean, professional exports' },
        { icon: Star, title: 'Unlimited Tokens', desc: 'No usage limits whatsoever' },
    ];

    const faqs = [
        { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. You will retain access until the end of your current billing period.' },
        { q: 'Is there a free trial?', a: 'We offer a free tier with limited features so you can explore the platform before upgrading.' },
        { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, Amex) and debit cards through our secure Stripe payment processing.' },
        { q: 'Can I switch between monthly and yearly?', a: 'Absolutely! You can switch your billing cycle at any time from the subscription management page.' },
    ];

    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="relative overflow-hidden">
            {/* Animated background orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className={`absolute w-[600px] h-[600px] rounded-full blur-[150px] animate-aurora ${
                        isDark ? 'bg-emerald-500/[0.07]' : 'bg-emerald-400/[0.08]'
                    }`}
                    style={{ top: '-10%', left: '-5%' }}
                />
                <div
                    className={`absolute w-[500px] h-[500px] rounded-full blur-[130px] animate-aurora-slow ${
                        isDark ? 'bg-teal-500/[0.05]' : 'bg-teal-400/[0.06]'
                    }`}
                    style={{ bottom: '10%', right: '-10%', animationDelay: '5s' }}
                />
                <div
                    className={`absolute w-[400px] h-[400px] rounded-full blur-[120px] animate-aurora ${
                        isDark ? 'bg-cyan-500/[0.04]' : 'bg-cyan-400/[0.05]'
                    }`}
                    style={{ top: '50%', left: '40%', animationDelay: '8s' }}
                />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className={`text-center mb-12 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                        style={{
                            background: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)',
                            border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)'}`,
                        }}
                    >
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-500">Kimuntu Pro AI</span>
                    </div>
                    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Unlock Your Full Potential
                    </h1>
                    <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                        One powerful plan. Unlimited possibilities. Get access to all AI-powered tools,
                        professional tracks, and premium features.
                    </p>
                </div>

                {/* Billing toggle */}
                <div className={`flex items-center justify-center gap-4 mb-12 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}
                    style={{ animationDelay: '100ms' }}
                >
                    <span className={`text-sm font-medium ${!isYearly ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-white/40' : 'text-black/40')}`}>
                        Monthly
                    </span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                            isYearly
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                : isDark ? 'bg-white/10' : 'bg-black/10'
                        }`}
                    >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                            isYearly ? 'left-9' : 'left-1'
                        }`} />
                    </button>
                    <span className={`text-sm font-medium ${isYearly ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-white/40' : 'text-black/40')}`}>
                        Yearly
                    </span>
                    {isYearly && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 animate-scaleIn">
                            Save {monthlySavings}%
                        </span>
                    )}
                </div>

                {/* Pricing cards */}
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}
                    style={{ animationDelay: '200ms' }}
                >
                    {/* Free Plan */}
                    <div
                        onMouseEnter={() => setHoveredPlan('free')}
                        onMouseLeave={() => setHoveredPlan(null)}
                        className={`relative rounded-3xl p-8 transition-all duration-500 ${
                            isDark
                                ? 'border border-white/[0.08] hover:border-white/20'
                                : 'border border-black/[0.06] hover:border-black/15'
                        } ${hoveredPlan === 'free' ? 'scale-[1.02]' : ''}`}
                        style={{
                            background: isDark
                                ? 'rgba(255, 255, 255, 0.02)'
                                : 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(40px)',
                            WebkitBackdropFilter: 'blur(40px)',
                        }}
                    >
                        {/* Glass reflection */}
                        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                            <div
                                className="absolute top-0 left-0 right-0 h-1/2"
                                style={{
                                    background: isDark
                                        ? 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)'
                                        : 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)',
                                    borderRadius: 'inherit',
                                }}
                            />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                                    <Zap className={`w-6 h-6 ${isDark ? 'text-white/50' : 'text-gray-500'}`} />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Free</h3>
                                    <p className={`text-sm ${isDark ? 'text-white/40' : 'text-black/40'}`}>Get started</p>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$0</span>
                                <span className={`text-lg ${isDark ? 'text-white/30' : 'text-black/30'}`}>/forever</span>
                            </div>

                            <button
                                className={`w-full py-4 rounded-2xl font-semibold text-sm transition-all mb-8 ${
                                    isDark
                                        ? 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:text-gray-900'
                                }`}
                            >
                                Current Plan
                            </button>

                            <ul className="space-y-3">
                                {[
                                    '3 AI queries per month',
                                    '1 business plan per month',
                                    'Basic resume builder',
                                    'Community support',
                                    'Watermarked exports',
                                    '100K tokens/month',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <Check className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                                        <span className={`text-sm ${isDark ? 'text-white/50' : 'text-black/50'}`}>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div
                        onMouseEnter={() => setHoveredPlan('pro')}
                        onMouseLeave={() => setHoveredPlan(null)}
                        className={`relative rounded-3xl p-8 transition-all duration-500 ${
                            hoveredPlan === 'pro' ? 'scale-[1.02]' : ''
                        }`}
                        style={{
                            background: isDark
                                ? 'rgba(16, 185, 129, 0.04)'
                                : 'rgba(16, 185, 129, 0.03)',
                            backdropFilter: 'blur(40px)',
                            WebkitBackdropFilter: 'blur(40px)',
                            border: isDark
                                ? '1.5px solid rgba(16, 185, 129, 0.2)'
                                : '1.5px solid rgba(16, 185, 129, 0.15)',
                            boxShadow: isDark
                                ? '0 0 80px rgba(16, 185, 129, 0.06), 0 20px 60px rgba(0,0,0,0.3)'
                                : '0 0 60px rgba(16, 185, 129, 0.06), 0 20px 40px rgba(0,0,0,0.05)',
                        }}
                    >
                        {/* Popular badge */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <div className="px-5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
                                <Crown className="w-3.5 h-3.5" />
                                MOST POPULAR
                            </div>
                        </div>

                        {/* Glass reflection */}
                        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                            <div
                                className="absolute top-0 left-0 right-0 h-1/2"
                                style={{
                                    background: isDark
                                        ? 'linear-gradient(to bottom, rgba(16, 185, 129, 0.05), transparent)'
                                        : 'linear-gradient(to bottom, rgba(16, 185, 129, 0.04), transparent)',
                                    borderRadius: 'inherit',
                                }}
                            />
                            {/* Animated shimmer */}
                            <div
                                className="absolute inset-0 animate-shimmer"
                                style={{
                                    background: isDark
                                        ? 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.03) 50%, transparent 100%)'
                                        : 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.04) 50%, transparent 100%)',
                                    backgroundSize: '200% 100%',
                                }}
                            />
                        </div>

                        {/* Animated border glow */}
                        <div className="absolute inset-0 rounded-3xl animate-border-glow pointer-events-none"
                            style={{ border: '1px solid transparent' }}
                        />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
                                    <Sparkles className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pro</h3>
                                    <p className={`text-sm ${isDark ? 'text-emerald-400/60' : 'text-emerald-600/60'}`}>Everything unlimited</p>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-1 mb-2">
                                <span className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    ${isYearly ? yearlyPrice : monthlyPrice}
                                </span>
                                <span className={`text-lg ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                                    /{isYearly ? 'year' : 'month'}
                                </span>
                            </div>
                            {isYearly && (
                                <p className="text-sm text-emerald-500 font-medium mb-6">
                                    That&apos;s just ${(yearlyPrice / 12).toFixed(2)}/month
                                </p>
                            )}
                            {!isYearly && <div className="mb-6" />}

                            <button
                                onClick={() => {
                                    if (hasSubscription) {
                                        router.push('/dashboard/subscription');
                                    } else {
                                        router.push(`/dashboard/checkout?plan=${isYearly ? 'yearly' : 'monthly'}`);
                                    }
                                }}
                                className="w-full py-4 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 mb-8"
                            >
                                {hasSubscription ? (
                                    <>Manage Subscription</>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Upgrade to Pro
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <ul className="space-y-3">
                                {[
                                    'Unlimited AI queries',
                                    'Unlimited business plans & documents',
                                    'All 4 professional tracks',
                                    'Advanced interview simulator',
                                    'Unlimited website & logo generation',
                                    'Priority 24/7 support',
                                    'No watermarks',
                                    'Unlimited tokens',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'
                                        }`}>
                                            <Check className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                        </div>
                                        <span className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-black/70'}`}>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Everything in Pro section */}
                <div className={`mb-16 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '400ms' }}>
                    <h2 className={`text-2xl font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Everything You Get with Pro
                    </h2>
                    <p className={`text-center mb-10 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                        One plan, every feature. No hidden costs.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {features.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.title}
                                    className={`group rounded-2xl p-5 transition-all duration-300 hover:scale-[1.03] cursor-default ${
                                        mounted ? 'animate-fadeInUp' : 'opacity-0'
                                    }`}
                                    style={{
                                        animationDelay: `${500 + i * 60}ms`,
                                        background: isDark
                                            ? 'rgba(255, 255, 255, 0.02)'
                                            : 'rgba(255, 255, 255, 0.5)',
                                        backdropFilter: 'blur(20px)',
                                        WebkitBackdropFilter: 'blur(20px)',
                                        border: isDark
                                            ? '1px solid rgba(255, 255, 255, 0.06)'
                                            : '1px solid rgba(0, 0, 0, 0.04)',
                                    }}
                                >
                                    <div className={`p-2.5 rounded-xl w-fit mb-3 transition-colors ${
                                        isDark
                                            ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20'
                                            : 'bg-emerald-50 group-hover:bg-emerald-100'
                                    }`}>
                                        <Icon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    </div>
                                    <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {feature.title}
                                    </h3>
                                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                                        {feature.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className={`max-w-2xl mx-auto mb-16 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '600ms' }}>
                    <h2 className={`text-2xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="rounded-2xl overflow-hidden transition-all"
                                style={{
                                    background: isDark
                                        ? 'rgba(255, 255, 255, 0.02)'
                                        : 'rgba(255, 255, 255, 0.5)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    border: isDark
                                        ? '1px solid rgba(255, 255, 255, 0.06)'
                                        : '1px solid rgba(0, 0, 0, 0.04)',
                                }}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className={`w-full flex items-center justify-between p-5 text-left transition-all ${
                                        isDark ? 'text-white hover:text-white' : 'text-gray-900'
                                    }`}
                                >
                                    <span className="font-medium text-sm">{faq.q}</span>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-all duration-300 ${
                                        openFaq === i
                                            ? isDark ? 'bg-emerald-500/20 rotate-45' : 'bg-emerald-50 rotate-45'
                                            : isDark ? 'bg-white/5' : 'bg-gray-50'
                                    }`}>
                                        <span className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>+</span>
                                    </div>
                                </button>
                                {openFaq === i && (
                                    <div className={`px-5 pb-5 text-sm animate-fadeIn ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div
                    className={`rounded-3xl p-10 text-center mb-8 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}
                    style={{
                        animationDelay: '700ms',
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(20, 184, 166, 0.04))'
                            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.04), rgba(20, 184, 166, 0.03))',
                        backdropFilter: 'blur(40px)',
                        WebkitBackdropFilter: 'blur(40px)',
                        border: isDark
                            ? '1px solid rgba(16, 185, 129, 0.12)'
                            : '1px solid rgba(16, 185, 129, 0.08)',
                    }}
                >
                    <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Ready to supercharge your workflow?
                    </h2>
                    <p className={`mb-6 max-w-lg mx-auto ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                        Join thousands of professionals using Kimuntu Pro AI to build, create, and grow faster.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <button
                            onClick={() => router.push(`/dashboard/checkout?plan=${isYearly ? 'yearly' : 'monthly'}`)}
                            className="px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            Get Pro Now
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <Lock className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                                <span className={`text-xs ${isDark ? 'text-white/30' : 'text-black/30'}`}>Secure checkout</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Shield className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                                <span className={`text-xs ${isDark ? 'text-white/30' : 'text-black/30'}`}>30-day guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
