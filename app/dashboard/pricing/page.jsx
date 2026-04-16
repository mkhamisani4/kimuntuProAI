'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { auth } from '@/lib/firebase';
import { PLANS, CREDIT_BUNDLES, CREDIT_ACTIONS } from '@/lib/payments';
import {
    Check, Sparkles, Crown, Zap, Shield, ArrowRight,
    Star, Infinity, Brain, FileText, Briefcase, Globe,
    HeadphonesIcon, Rocket, Lock, CreditCard, Scale,
    Lightbulb, Package, Users, ChevronDown
} from 'lucide-react';

export default function PricingPage() {
    const { isDark } = useTheme();
    const router = useRouter();
    const [isYearly, setIsYearly] = useState(false);
    const [hoveredPlan, setHoveredPlan] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
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

    const planCards = [
        {
            key: 'free',
            plan: PLANS.free,
            icon: Zap,
            subtitle: 'Get started',
            color: 'gray',
        },
        {
            key: 'career',
            plan: PLANS.career,
            icon: Users,
            subtitle: 'For job seekers & career changers',
            color: 'blue',
        },
        {
            key: 'business',
            plan: PLANS.business,
            icon: Briefcase,
            subtitle: 'For entrepreneurs & SMBs',
            color: 'amber',
        },
        {
            key: 'legal',
            plan: PLANS.legal,
            icon: Scale,
            subtitle: 'For legal navigation',
            color: 'purple',
        },
        {
            key: 'innovation',
            plan: PLANS.innovation,
            icon: Lightbulb,
            subtitle: 'For researchers & innovators',
            color: 'cyan',
        },
        {
            key: 'fullPackage',
            plan: PLANS.fullPackage,
            icon: Package,
            subtitle: 'All 4 tracks — maximum value',
            color: 'emerald',
            bestSeller: true,
        },
    ];

    const faqs = [
        { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. You will retain access until the end of your current billing period.' },
        { q: 'Is there a free trial?', a: 'We offer a free tier with limited features so you can explore the platform before upgrading. No credit card required.' },
        { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, Amex) and debit cards through our secure Stripe payment processing.' },
        { q: 'Can I switch between monthly and yearly?', a: 'Absolutely! You can switch your billing cycle at any time from the subscription management page.' },
        { q: 'Can I switch plans?', a: 'Yes! You can upgrade or downgrade between individual track plans at any time. The Full Package gives you the best value with all tracks included.' },
        { q: 'What are Pay-Per-Use credits?', a: 'Credits let you access premium actions like Live Avatar sessions, professional business plans, and patent drafting on demand. Buy credit bundles and use them whenever you need them.' },
        { q: 'How does the Full Package save me money?', a: 'Buying all 4 tracks separately costs $159.96/month. The Full Package at $99/month saves you $60.96/month ($731.52/year).' },
        { q: 'Need help?', a: 'Contact us at support@kimuntu.ai — we typically respond within 24 hours for premium members.' },
    ];

    const getPrice = (plan) => {
        if (plan.monthlyPrice === 0) return '$0';
        return isYearly ? `$${plan.yearlyPrice}` : `$${plan.monthlyPrice}`;
    };

    const getInterval = (plan) => {
        if (plan.monthlyPrice === 0) return '/forever';
        return isYearly ? '/year' : '/month';
    };

    const getMonthlyEquiv = (plan) => {
        if (!isYearly || plan.monthlyPrice === 0) return null;
        return `$${(plan.yearlyPrice / 12).toFixed(2)}/month`;
    };

    const handleSelectPlan = (planKey) => {
        if (planKey === 'free') return;
        if (hasSubscription) {
            router.push('/dashboard/subscription');
        } else {
            router.push(`/dashboard/checkout?plan=${planKey}&billing=${isYearly ? 'yearly' : 'monthly'}`);
        }
    };

    // Glass card style helper
    const glassStyle = (isHighlighted = false) => ({
        background: isDark
            ? isHighlighted ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.02)'
            : isHighlighted ? 'rgba(16, 185, 129, 0.03)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
    });

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
                        <span className="text-sm font-medium text-emerald-500">Kimuntu AI Pricing</span>
                    </div>
                    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Choose Your Track
                    </h1>
                    <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-white/50' : 'text-black'}`}>
                        Pick individual tracks or get everything with the Full Package.
                        All plans include a 20% discount on yearly billing.
                    </p>
                </div>

                {/* Billing toggle */}
                <div className={`flex items-center justify-center gap-4 mb-12 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}
                    style={{ animationDelay: '100ms' }}
                >
                    <span className={`text-sm font-medium ${!isYearly ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-white/40' : 'text-black')}`}>
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
                    <span className={`text-sm font-medium ${isYearly ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-white/40' : 'text-black')}`}>
                        Yearly
                    </span>
                    {isYearly && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 animate-scaleIn">
                            Save 20%
                        </span>
                    )}
                </div>

                {/* Savings banner for Full Package */}
                <div className={`max-w-4xl mx-auto mb-8 text-center ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}
                    style={{ animationDelay: '150ms' }}
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
                        style={{
                            background: isDark ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.05)',
                            border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.1)'}`,
                        }}
                    >
                        <Crown className="w-4 h-4 text-emerald-400" />
                        <span className={`text-sm ${isDark ? 'text-white/70' : 'text-black'}`}>
                            Full Package saves you <strong className="text-emerald-400">$60.96/month</strong> vs. buying all tracks separately
                        </span>
                    </div>
                </div>

                {/* ────────── PRICING CARDS ────────── */}
                <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}
                    style={{ animationDelay: '200ms' }}
                >
                    {planCards.map((card) => {
                        const Icon = card.icon;
                        const isBestSeller = card.bestSeller;
                        const isFree = card.key === 'free';

                        return (
                            <div
                                key={card.key}
                                onMouseEnter={() => setHoveredPlan(card.key)}
                                onMouseLeave={() => setHoveredPlan(null)}
                                className={`relative rounded-3xl p-7 transition-all duration-500 flex flex-col ${
                                    hoveredPlan === card.key ? 'scale-[1.02]' : ''
                                } ${isBestSeller ? '' : (
                                    isDark
                                        ? 'border border-white/[0.08] hover:border-white/20'
                                        : 'border border-black/[0.06] hover:border-black/15'
                                )}`}
                                style={{
                                    ...glassStyle(isBestSeller),
                                    ...(isBestSeller ? {
                                        border: isDark
                                            ? '1.5px solid rgba(16, 185, 129, 0.25)'
                                            : '1.5px solid rgba(16, 185, 129, 0.2)',
                                        boxShadow: isDark
                                            ? '0 0 80px rgba(16, 185, 129, 0.08), 0 20px 60px rgba(0,0,0,0.3)'
                                            : '0 0 60px rgba(16, 185, 129, 0.08), 0 20px 40px rgba(0,0,0,0.05)',
                                    } : {}),
                                }}
                            >
                                {/* Best Seller badge */}
                                {isBestSeller && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="px-5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
                                            <Crown className="w-3.5 h-3.5" />
                                            BEST SELLER
                                        </div>
                                    </div>
                                )}

                                {/* Glass reflection */}
                                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                                    <div
                                        className="absolute top-0 left-0 right-0 h-1/2"
                                        style={{
                                            background: isDark
                                                ? isBestSeller
                                                    ? 'linear-gradient(to bottom, rgba(16, 185, 129, 0.05), transparent)'
                                                    : 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)'
                                                : isBestSeller
                                                    ? 'linear-gradient(to bottom, rgba(16, 185, 129, 0.04), transparent)'
                                                    : 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)',
                                            borderRadius: 'inherit',
                                        }}
                                    />
                                </div>

                                {/* Shimmer for best seller */}
                                {isBestSeller && (
                                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
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
                                )}

                                <div className="relative z-10 flex flex-col flex-1">
                                    {/* Plan header */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className={`p-3 rounded-2xl ${
                                            isBestSeller
                                                ? isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'
                                                : isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'
                                        }`}>
                                            <Icon className={`w-5 h-5 ${
                                                isBestSeller
                                                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                                    : isDark ? 'text-white/50' : 'text-gray-500'
                                            }`} />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {card.plan.name}
                                            </h3>
                                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-black'}`}>
                                                {card.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className={`text-4xl font-bold ${
                                            isBestSeller
                                                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent'
                                                : isDark ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            {getPrice(card.plan)}
                                        </span>
                                        <span className={`text-sm ${isDark ? 'text-white/30' : 'text-black'}`}>
                                            {getInterval(card.plan)}
                                        </span>
                                    </div>
                                    {getMonthlyEquiv(card.plan) && (
                                        <p className="text-xs text-emerald-500 font-medium mb-4">
                                            That&apos;s just {getMonthlyEquiv(card.plan)}
                                        </p>
                                    )}
                                    {!getMonthlyEquiv(card.plan) && <div className="mb-4" />}

                                    {/* CTA button */}
                                    <button
                                        onClick={() => handleSelectPlan(card.key)}
                                        className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mb-6 ${
                                            isFree
                                                ? isDark
                                                    ? 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                                                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:text-gray-900'
                                                : isBestSeller
                                                    ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 hover:scale-[1.02]'
                                                    : isDark
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                        }`}
                                    >
                                        {isFree ? (
                                            'Current Plan'
                                        ) : hasSubscription ? (
                                            'Manage Subscription'
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                {isBestSeller ? 'Get Full Package' : `Get ${card.plan.name}`}
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>

                                    {/* Features list */}
                                    <ul className="space-y-2.5 flex-1">
                                        {card.plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2.5">
                                                <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                    isBestSeller || !isFree
                                                        ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'
                                                        : isDark ? 'bg-white/5' : 'bg-gray-100'
                                                }`}>
                                                    <Check className={`w-3 h-3 ${
                                                        isBestSeller || !isFree
                                                            ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                                            : isDark ? 'text-white/30' : 'text-black'
                                                    }`} />
                                                </div>
                                                <span className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-black'}`}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Exclusive features for Full Package */}
                                    {card.plan.exclusiveFeatures && (
                                        <div className="mt-5 pt-5" style={{
                                            borderTop: isDark
                                                ? '1px solid rgba(16, 185, 129, 0.15)'
                                                : '1px solid rgba(16, 185, 129, 0.1)',
                                        }}>
                                            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>
                                                Exclusive Benefits
                                            </p>
                                            <ul className="space-y-2">
                                                {card.plan.exclusiveFeatures.map((feature) => (
                                                    <li key={feature} className="flex items-start gap-2.5">
                                                        <Star className={`w-3 h-3 flex-shrink-0 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                                        <span className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-black'}`}>
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ────────── PAY-PER-USE CREDITS SECTION ────────── */}
                <div className={`max-w-5xl mx-auto mb-16 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '400ms' }}>
                    <h2 className={`text-2xl font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Pay-Per-Use Credits
                    </h2>
                    <p className={`text-center mb-10 max-w-2xl mx-auto ${isDark ? 'text-white/40' : 'text-black'}`}>
                        Buy credit bundles for on-demand premium actions like Live Avatar sessions,
                        professional business plans, and patent drafting.
                    </p>

                    {/* Credit Bundles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        {CREDIT_BUNDLES.map((bundle) => (
                            <div
                                key={bundle.id}
                                className={`relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] ${
                                    bundle.bestValue ? '' : ''
                                }`}
                                style={{
                                    ...glassStyle(bundle.bestValue),
                                    border: bundle.bestValue
                                        ? isDark
                                            ? '1.5px solid rgba(16, 185, 129, 0.2)'
                                            : '1.5px solid rgba(16, 185, 129, 0.15)'
                                        : isDark
                                            ? '1px solid rgba(255, 255, 255, 0.06)'
                                            : '1px solid rgba(0, 0, 0, 0.04)',
                                }}
                            >
                                {bundle.bestValue && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                                            BEST VALUE
                                        </span>
                                    </div>
                                )}
                                <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {bundle.name}
                                </h3>
                                <p className={`text-xs mb-3 ${isDark ? 'text-white/40' : 'text-black'}`}>
                                    {bundle.credits} credits
                                </p>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        ${bundle.price}
                                    </span>
                                </div>
                                <p className={`text-xs mb-4 ${isDark ? 'text-white/40' : 'text-black'}`}>
                                    ${bundle.perCredit.toFixed(2)} / credit
                                    {bundle.savings && (
                                        <span className="ml-2 text-emerald-400 font-semibold">{bundle.savings}</span>
                                    )}
                                </p>
                                <button
                                    onClick={() => router.push(`/dashboard/checkout?credits=${bundle.id}`)}
                                    className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all ${
                                        bundle.bestValue
                                            ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20'
                                            : isDark
                                                ? 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                    }`}
                                >
                                    Buy Credits
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* What 1 Credit Buys */}
                    <div className="rounded-2xl p-6"
                        style={{
                            ...glassStyle(),
                            border: isDark
                                ? '1px solid rgba(255, 255, 255, 0.06)'
                                : '1px solid rgba(0, 0, 0, 0.04)',
                        }}
                    >
                        <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            What Credits Buy You
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {CREDIT_ACTIONS.map((item) => (
                                <div key={item.action} className="flex items-center justify-between gap-3">
                                    <span className={`text-xs ${isDark ? 'text-white/60' : 'text-black'}`}>
                                        {item.action}
                                    </span>
                                    <span className={`text-xs font-bold flex-shrink-0 px-2 py-1 rounded-lg ${
                                        isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                                    }`}>
                                        {item.credits} {item.credits === 1 ? 'credit' : 'credits'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ────────── FAQ Section ────────── */}
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
                                    ...glassStyle(),
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
                                        <span className={`text-sm ${isDark ? 'text-white/60' : 'text-black'}`}>+</span>
                                    </div>
                                </button>
                                {openFaq === i && (
                                    <div className={`px-5 pb-5 text-sm animate-fadeIn ${isDark ? 'text-white/50' : 'text-black'}`}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ────────── Bottom CTA ────────── */}
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
                    <p className={`mb-2 max-w-lg mx-auto ${isDark ? 'text-white/50' : 'text-black'}`}>
                        Join thousands of professionals using Kimuntu AI to build, create, and grow faster.
                    </p>
                    <p className={`text-sm mb-6 ${isDark ? 'text-white/40' : 'text-black'}`}>
                        Questions? Contact <a href="mailto:support@kimuntu.ai" className="text-emerald-400 hover:text-emerald-300 underline">support@kimuntu.ai</a>
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <button
                            onClick={() => handleSelectPlan('fullPackage')}
                            className="px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            Get Full Package — $99/mo
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <Lock className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-black'}`} />
                                <span className={`text-xs ${isDark ? 'text-white/30' : 'text-black'}`}>Secure checkout</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Shield className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-black'}`} />
                                <span className={`text-xs ${isDark ? 'text-white/30' : 'text-black'}`}>Cancel anytime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
