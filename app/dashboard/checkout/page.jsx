'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { auth } from '@/lib/firebase';
import { PLANS, PRO_FEATURES, USE_REAL_PAYMENTS, saveMockSubscription } from '@/lib/payments';
import {
    CreditCard, Lock, Shield, ArrowLeft, Check, Sparkles,
    Loader2
} from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isDark } = useTheme();
    const planId = searchParams.get('plan') || 'fullPackage';
    const billingCycle = searchParams.get('billing') || 'monthly';
    const plan = PLANS[planId] || PLANS.fullPackage;

    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [zip, setZip] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    const user = auth.currentUser;

    const formatCardNumber = (value) => {
        const v = value.replace(/\D/g, '').slice(0, 16);
        const parts = [];
        for (let i = 0; i < v.length; i += 4) {
            parts.push(v.slice(i, i + 4));
        }
        return parts.join(' ');
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2);
        return v;
    };

    const validate = () => {
        const errs = {};
        if (cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Enter a valid card number';
        if (!cardName.trim()) errs.cardName = 'Name is required';
        if (expiry.length < 5) errs.expiry = 'Enter a valid expiry date';
        if (cvc.length < 3) errs.cvc = 'Enter a valid CVC';
        if (zip.length < 4) errs.zip = 'Enter a valid ZIP/postal code';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ─── Real Stripe mode: redirect to Stripe Checkout ───
        if (USE_REAL_PAYMENTS) {
            setProcessing(true);
            try {
                const res = await fetch('/api/payments/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planId: plan.id,
                        userId: user?.uid,
                        userEmail: user?.email,
                    }),
                });
                const data = await res.json();
                if (data.url) {
                    // Redirect to Stripe's hosted checkout
                    window.location.href = data.url;
                    return;
                } else {
                    setErrors({ cardNumber: data.error || 'Payment setup failed. Please try again.' });
                }
            } catch {
                setErrors({ cardNumber: 'Connection error. Please try again.' });
            } finally {
                setProcessing(false);
            }
            return;
        }

        // ─── Mock mode: simulate payment ───
        if (!validate()) return;
        setProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2500));

        const selectedPrice = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        const selectedInterval = billingCycle === 'yearly' ? 'year' : 'month';
        saveMockSubscription(user?.uid, {
            planId: plan.id,
            planName: plan.displayName,
            price: selectedPrice,
            interval: selectedInterval,
            status: 'active',
            startDate: new Date().toISOString(),
            nextBillingDate: selectedInterval === 'month'
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
            userId: user?.uid,
        });

        setProcessing(false);
        setSuccess(true);
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className={`max-w-md w-full text-center p-10 rounded-3xl ${
                    isDark
                        ? 'bg-white/[0.04] border border-white/10 backdrop-blur-2xl'
                        : 'bg-white border border-black/5 shadow-xl'
                }`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'
                    }`}>
                        <Check className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Welcome to Pro!
                    </h1>
                    <p className={`text-lg mb-2 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                        Your Kimuntu Pro AI subscription is now active.
                    </p>
                    <p className={`text-sm mb-8 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                        {plan.name} plan — ${billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}/{billingCycle === 'yearly' ? 'year' : 'month'}
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/25"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/subscription')}
                        className={`w-full mt-3 py-3 rounded-2xl font-medium transition-all ${
                            isDark ? 'text-white/50 hover:text-white/80' : 'text-black/50 hover:text-black/80'
                        }`}
                    >
                        Manage Subscription
                    </button>
                </div>
            </div>
        );
    }

    const inputClass = `w-full px-4 py-3.5 rounded-xl transition-all focus:outline-none focus:ring-2 ${
        isDark
            ? 'bg-white/[0.06] border border-white/10 text-white placeholder-white/30 focus:ring-emerald-500/40 focus:border-emerald-500/40'
            : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-500/40 focus:border-emerald-500'
    }`;

    return (
        <div className="max-w-5xl mx-auto py-4">
            {/* Back button */}
            <button
                onClick={() => router.push('/dashboard/pricing')}
                className={`flex items-center gap-2 mb-8 text-sm font-medium transition-all ${
                    isDark ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'
                }`}
            >
                <ArrowLeft className="w-4 h-4" />
                Back to pricing
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left: Payment Form */}
                <div className="lg:col-span-3">
                    <div className={`rounded-3xl p-8 ${
                        isDark
                            ? 'bg-white/[0.04] border border-white/10 backdrop-blur-2xl'
                            : 'bg-white border border-black/5 shadow-xl'
                    }`}>
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                <CreditCard className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Payment Details
                                </h1>
                                <p className={`text-sm ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                                    {USE_REAL_PAYMENTS ? 'Secure checkout powered by Stripe' : 'Secure checkout powered by Stripe'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email (read-only) */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    readOnly
                                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                                />
                            </div>

                            {/* Card Number */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                    Card number
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        placeholder="1234 1234 1234 1234"
                                        className={`${inputClass} pr-20 ${errors.cardNumber ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                                        <div className={`w-8 h-5 rounded ${isDark ? 'bg-white/10' : 'bg-gray-200'} flex items-center justify-center`}>
                                            <span className="text-[10px] font-bold text-blue-500">VISA</span>
                                        </div>
                                        <div className={`w-8 h-5 rounded ${isDark ? 'bg-white/10' : 'bg-gray-200'} flex items-center justify-center`}>
                                            <span className="text-[10px] font-bold text-orange-500">MC</span>
                                        </div>
                                    </div>
                                </div>
                                {errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>}
                            </div>

                            {/* Name on card */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                    Name on card
                                </label>
                                <input
                                    type="text"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    placeholder="Full name on card"
                                    className={`${inputClass} ${errors.cardName ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                                />
                                {errors.cardName && <p className="text-red-400 text-xs mt-1">{errors.cardName}</p>}
                            </div>

                            {/* Expiry + CVC + ZIP */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                        Expiry
                                    </label>
                                    <input
                                        type="text"
                                        value={expiry}
                                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                        placeholder="MM/YY"
                                        className={`${inputClass} ${errors.expiry ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                                    />
                                    {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                        CVC
                                    </label>
                                    <input
                                        type="text"
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="123"
                                        className={`${inputClass} ${errors.cvc ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                                    />
                                    {errors.cvc && <p className="text-red-400 text-xs mt-1">{errors.cvc}</p>}
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                        ZIP Code
                                    </label>
                                    <input
                                        type="text"
                                        value={zip}
                                        onChange={(e) => setZip(e.target.value.slice(0, 10))}
                                        placeholder="12345"
                                        className={`${inputClass} ${errors.zip ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                                    />
                                    {errors.zip && <p className="text-red-400 text-xs mt-1">{errors.zip}</p>}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-[1.01] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-3"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing payment...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Subscribe — ${(billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice)}/{(billingCycle === 'yearly' ? 'year' : 'month')}
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Security badges */}
                        <div className={`flex items-center justify-center gap-6 mt-6 pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-1.5">
                                <Lock className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                                <span className={`text-xs ${isDark ? 'text-white/30' : 'text-black/30'}`}>SSL Encrypted</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Shield className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                                <span className={`text-xs ${isDark ? 'text-white/30' : 'text-black/30'}`}>PCI Compliant</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Check className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                                <span className={`text-xs ${isDark ? 'text-white/30' : 'text-black/30'}`}>30-day guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="lg:col-span-2">
                    <div className={`rounded-3xl p-8 sticky top-8 ${
                        isDark
                            ? 'bg-white/[0.04] border border-white/10 backdrop-blur-2xl'
                            : 'bg-white border border-black/5 shadow-xl'
                    }`}>
                        <h2 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Order Summary
                        </h2>

                        {/* Plan card */}
                        <div className={`rounded-2xl p-5 mb-6 ${
                            isDark ? 'bg-emerald-500/[0.06] border border-emerald-500/20' : 'bg-emerald-50/50 border border-emerald-100'
                        }`}>
                            <div className="flex items-center gap-3 mb-3">
                                <Sparkles className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Kimuntu Pro AI
                                </span>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                                {plan.name} subscription
                            </p>
                            {plan.savings && (
                                <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                                    {plan.savings}
                                </span>
                            )}
                        </div>

                        {/* Price breakdown */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <span className={`text-sm ${isDark ? 'text-white/50' : 'text-black/50'}`}>Subtotal</span>
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${(billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={`text-sm ${isDark ? 'text-white/50' : 'text-black/50'}`}>Tax</span>
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>$0.00</span>
                            </div>
                            <div className={`pt-3 border-t flex justify-between ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Total</span>
                                <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    ${(billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice)}/{billingCycle === 'yearly' ? 'yr' : 'mo'}
                                </span>
                            </div>
                        </div>

                        {/* Features */}
                        <div className={`pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                Everything in Pro:
                            </h3>
                            <ul className="space-y-2.5">
                                {PRO_FEATURES.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2.5">
                                        <Check className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                        <span className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Switch plan */}
                        <button
                            onClick={() => router.push(`/dashboard/checkout?plan=${planId === 'monthly' ? 'yearly' : 'monthly'}`)}
                            className={`w-full mt-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                isDark
                                    ? 'bg-white/5 text-white/50 hover:text-white/80 border border-white/10'
                                    : 'bg-gray-50 text-black/50 hover:text-black/80 border border-gray-100'
                            }`}
                        >
                            Switch to {planId === 'monthly' ? 'yearly (save $39.89)' : 'monthly'} billing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
