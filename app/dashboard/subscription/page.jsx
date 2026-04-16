'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { auth } from '@/lib/firebase';
import { USE_REAL_PAYMENTS, PLANS, PRO_FEATURES, getMockSubscription, saveMockSubscription } from '@/lib/payments';
import {
    CreditCard, AlertTriangle, Check,
    RefreshCw, X, Shield, Zap, Crown
} from 'lucide-react';
import Image from 'next/image';

export default function SubscriptionPage() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { t, language } = useLanguage();
    const user = auth.currentUser;
    const [subscription, setSubscription] = useState(null);
    const [showCancel, setShowCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { setLoading(false); return; }

        if (USE_REAL_PAYMENTS) {
            fetch(`/api/payments/status?uid=${user.uid}`)
                .then(res => res.json())
                .then(data => {
                    if (data.active) {
                        const plan = PLANS[data.planId] || PLANS.fullPackage;
                        setSubscription({
                            planId: data.planId,
                            planName: plan.displayName,
                            price: data.price || plan.monthlyPrice,
                            interval: data.interval || 'month',
                            status: 'active',
                            startDate: data.subscribedAt || new Date().toISOString(),
                            nextBillingDate: data.currentPeriodEnd || '',
                            cardLast4: data.cardLast4 || '••••',
                            userId: user.uid,
                        });
                    }
                })
                .catch(() => {})
                .finally(() => setLoading(false));
        } else {
            const stored = getMockSubscription(user.uid);
            if (stored) {
                // Enrich with plan data
                const plan = PLANS[stored.planId] || PLANS.fullPackage;
                setSubscription({
                    ...stored,
                    planName: plan.displayName,
                    price: stored.price || plan.monthlyPrice,
                    interval: stored.interval || 'month',
                });
            }
            setLoading(false);
        }
    }, [user]);

    const handleCancel = async () => {
        setCancelling(true);
        if (USE_REAL_PAYMENTS) {
            try {
                await fetch('/api/payments/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user?.uid }),
                });
            } catch { /* fall through */ }
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
        const updated = { ...subscription, status: 'cancelled', cancelledAt: new Date().toISOString() };
        if (!USE_REAL_PAYMENTS) {
            saveMockSubscription(user?.uid, updated);
        }
        setSubscription(updated);
        setCancelling(false);
        setShowCancel(false);
    };

    const handleReactivate = async () => {
        if (USE_REAL_PAYMENTS) {
            router.push(`/dashboard/checkout?plan=${subscription?.planId || 'fullPackage'}`);
            return;
        }
        const updated = { ...subscription, status: 'active', cancelledAt: null };
        saveMockSubscription(user?.uid, updated);
        setSubscription(updated);
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <Image src="/assets/new_single_logo.png" alt="Kimuntu" width={56} height={56} className="animate-float" />
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            </div>
        );
    }

    // No subscription — show upgrade CTA
    if (!subscription) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                {/* Aurora background orbs */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className={`absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px] ${isDark ? 'bg-emerald-500/8' : 'bg-emerald-500/5'}`} />
                    <div className={`absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[120px] ${isDark ? 'bg-teal-500/8' : 'bg-teal-500/5'}`} />
                </div>

                <div className={`relative max-w-md w-full text-center p-10 rounded-3xl overflow-hidden ${
                    isDark
                        ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl'
                        : 'bg-white border border-black/5 shadow-2xl'
                }`}>
                    {/* Glass reflection */}
                    {isDark && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />}

                    <div className="relative z-10">
                        <div className="relative inline-block mb-6">
                            <Image src="/assets/new_single_logo.png" alt="Kimuntu AI" width={80} height={80} className="animate-float" />
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl" />
                        </div>
                        <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.sub_noSubscription}
                        </h2>
                        <p className={`mb-8 text-sm leading-relaxed ${isDark ? 'text-white/50' : 'text-black'}`}>
                            {t.sub_upgradeDesc}
                        </p>
                        <button
                            onClick={() => router.push('/dashboard/pricing')}
                            className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            {t.sub_viewPlans}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isActive = subscription.status === 'active';
    const plan = PLANS[subscription.planId] || PLANS.fullPackage;

    const nextBilling = subscription.nextBillingDate
        ? new Date(subscription.nextBillingDate).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'N/A';
    const startDate = new Date(subscription.startDate).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="max-w-4xl mx-auto py-4 relative">
            {/* Aurora background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-20 -left-32 w-96 h-96 rounded-full blur-[120px] ${isDark ? 'bg-emerald-500/8' : 'bg-emerald-500/5'}`} />
                <div className={`absolute bottom-20 -right-32 w-80 h-80 rounded-full blur-[120px] ${isDark ? 'bg-teal-500/8' : 'bg-teal-500/5'}`} />
            </div>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="relative">
                    <Image src="/assets/new_single_logo.png" alt="Kimuntu AI" width={48} height={48} />
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
                </div>
                <div>
                    <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t.sub_title}
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-white/40' : 'text-black'}`}>
                        {t.sub_subtitle}
                    </p>
                </div>
            </div>

            {/* Main Status Card */}
            <div className={`relative rounded-3xl p-8 mb-6 overflow-hidden ${
                isDark
                    ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl'
                    : 'bg-white border border-black/5 shadow-2xl'
            }`}>
                {/* Glass reflection */}
                {isDark && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />}

                <div className="relative z-10">
                    {/* Plan header */}
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${
                                isActive
                                    ? isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                                    : isDark ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-orange-50 border border-orange-200'
                            }`}>
                                <Crown className={`w-7 h-7 ${
                                    isActive
                                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                        : isDark ? 'text-orange-400' : 'text-orange-600'
                                }`} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {subscription.planName}
                                </h2>
                                <p className={`text-sm ${isDark ? 'text-white/40' : 'text-black'}`}>
                                    {t.sub_memberSince} {startDate}
                                </p>
                            </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                        }`}>
                            {subscription.status}
                        </span>
                    </div>

                    {/* Price display */}
                    <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-white/[0.03] border border-white/5' : 'bg-gray-50/80 border border-gray-100'}`}>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                ${subscription.price}
                            </span>
                            <span className={`text-lg ${isDark ? 'text-white/40' : 'text-black'}`}>
                                /{subscription.interval}
                            </span>
                        </div>
                        {subscription.interval === 'year' && plan.savings && (
                            <p className="text-sm text-emerald-400 font-medium mt-1">
                                {plan.savings}
                            </p>
                        )}
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className={`rounded-2xl p-4 ${isDark ? 'bg-white/[0.03] border border-white/5' : 'bg-gray-50/80 border border-gray-100'}`}>
                            <p className={`text-xs font-medium mb-1 uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-black'}`}>{t.sub_nextBilling}</p>
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {isActive ? nextBilling : 'N/A'}
                            </p>
                        </div>
                        <div className={`rounded-2xl p-4 ${isDark ? 'bg-white/[0.03] border border-white/5' : 'bg-gray-50/80 border border-gray-100'}`}>
                            <p className={`text-xs font-medium mb-1 uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-black'}`}>{t.sub_paymentMethod}</p>
                            <div className="flex items-center gap-2">
                                <CreditCard className={`w-4 h-4 ${isDark ? 'text-white/50' : 'text-black'}`} />
                                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    •••• {subscription.cardLast4}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex gap-3 pt-6 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                        {isActive ? (
                            <>
                                <button
                                    onClick={() => router.push('/dashboard/pricing')}
                                    className={`flex-1 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] ${
                                        isDark
                                            ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    {t.sub_changePlan}
                                </button>
                                <button
                                    onClick={() => setShowCancel(true)}
                                    className={`flex-1 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] ${
                                        isDark
                                            ? 'bg-red-500/5 text-red-400 hover:bg-red-500/10 border border-red-500/20'
                                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                    }`}
                                >
                                    <X className="w-4 h-4" />
                                    {t.sub_cancelSubscription}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleReactivate}
                                className="flex-1 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {t.sub_reactivate}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Pro Features included */}
            <div className={`relative rounded-3xl p-8 mb-6 overflow-hidden ${
                isDark
                    ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl'
                    : 'bg-white border border-black/5 shadow-2xl'
            }`}>
                {isDark && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />}

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.sub_proFeatures}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PRO_FEATURES.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    isActive
                                        ? 'bg-emerald-500/20'
                                        : isDark ? 'bg-white/5' : 'bg-gray-100'
                                }`}>
                                    <Check className={`w-3 h-3 ${
                                        isActive
                                            ? 'text-emerald-400'
                                            : isDark ? 'text-white/30' : 'text-black'
                                    }`} />
                                </div>
                                <span className={`text-sm ${
                                    isActive
                                        ? isDark ? 'text-white/80' : 'text-black'
                                        : isDark ? 'text-white/30 line-through' : 'text-black line-through'
                                }`}>
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Billing History */}
            <div className={`relative rounded-3xl p-8 overflow-hidden ${
                isDark
                    ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl'
                    : 'bg-white border border-black/5 shadow-2xl'
            }`}>
                {isDark && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />}

                <div className="relative z-10">
                    <h3 className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t.sub_billingHistory}
                    </h3>
                    <div className="space-y-3">
                        <div className={`flex items-center justify-between p-4 rounded-xl ${
                            isDark ? 'bg-white/[0.03] border border-white/5' : 'bg-gray-50/80 border border-gray-100'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-orange-500'}`} />
                                <div>
                                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {subscription.planName}
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-black'}`}>
                                        {startDate}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    ${subscription.price}
                                </p>
                                <p className="text-xs text-emerald-400 font-medium">{t.sub_paid}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCancel(false)} />
                    <div className={`relative w-full max-w-md rounded-3xl p-8 overflow-hidden ${
                        isDark
                            ? 'bg-gray-900/95 border border-white/10 backdrop-blur-2xl'
                            : 'bg-white border border-gray-200 shadow-2xl'
                    }`}>
                        {isDark && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />}

                        <div className="relative z-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
                                isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
                            }`}>
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className={`text-xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {t.sub_cancelModal}
                            </h3>
                            <p className={`text-center text-sm mb-6 leading-relaxed ${isDark ? 'text-white/50' : 'text-black'}`}>
                                {t.sub_cancelWarning}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancel(false)}
                                    className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                                        isDark
                                            ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    {t.sub_keepSubscription}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="flex-1 py-3 rounded-xl font-medium text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all duration-300"
                                >
                                    {cancelling ? t.sub_cancelling : t.sub_yesCancel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
