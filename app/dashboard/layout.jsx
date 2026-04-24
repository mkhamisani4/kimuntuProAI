'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Scale, Home, FileText, TrendingUp, HelpCircle, Sun, Moon, Rocket, Settings, CreditCard, Shield, Lock, FlaskConical } from 'lucide-react';
import { auth, signOutUser } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ProfileButton } from '@/components/shared/ProfileButton';
import Footer from '@/components/Footer';
import FloatingChatbot from '@/components/FloatingChatbot';
import Image from 'next/image';
import DashboardAccessGate from '@/components/DashboardAccessGate';
import { useAuth } from '@/hooks/useAuth';
import { canAccessPath } from '@/lib/accessControl';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isDark, toggleTheme } = useTheme();
    const { t } = useLanguage();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { profile, features } = useAuth();
    
    // Pages where footer should be hidden
    const hideFooterPages = [
        '/dashboard/documents',
        '/dashboard/support',
        '/dashboard/settings',
        '/dashboard/pricing'
    ];
    
    const shouldShowFooter = !hideFooterPages.includes(pathname);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push('/');
            } else {
                setUser(currentUser);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleSignOut = async () => {
        try {
            await signOutUser();
            router.push('/');
        } catch (err) {
            console.error('Sign out failed', err);
        }
    };

    // Profile modal state
    const [showProfile, setShowProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '', plan: 'pro' });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileError, setProfileError] = useState(null);

    const openProfile = async () => {
        const [first, ...rest] = (user?.displayName || '').split(' ');
        let plan = 'pro';
        try {
            if (user?.uid) {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) plan = snap.data()?.subscriptionTier || 'pro';
            }
        } catch {}
        setProfileForm({ firstName: first || '', lastName: rest.join(' '), email: user?.email || '', plan });
        setProfileError(null);
        setProfileSaved(false);
        setShowProfile(true);
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileError(null);
        try {
            const displayName = [profileForm.firstName, profileForm.lastName].filter(Boolean).join(' ');
            await updateProfile(auth.currentUser, { displayName });
            if (profileForm.email !== user?.email) {
                await updateEmail(auth.currentUser, profileForm.email);
            }
            if (user?.uid) {
                await setDoc(doc(db, 'users', user.uid), { subscriptionTier: profileForm.plan, displayName }, { merge: true });
            }
            setUser((prev) => ({ ...prev, displayName, email: profileForm.email }));
            setProfileSaved(true);
            setTimeout(() => { setProfileSaved(false); setShowProfile(false); }, 1200);
        } catch (err) {
            setProfileError(err.message?.replace('Firebase: ', '').replace(/ \(auth\/.*\)/, '') || 'Failed to save.');
        } finally {
            setProfileSaving(false);
        }
    };

    const PLAN_OPTIONS = [
        { value: 'pro',        label: 'Pro Launch Plan',      price: '$29/mo' },
        { value: 'starter',    label: 'Career Premium',       price: '$19/mo' },
        { value: 'business',   label: 'Business Premium',     price: '$49/mo' },
        { value: 'free',       label: 'Legal Premium',        price: '$39/mo' },
        { value: 'innovation', label: 'Innovation Premium',   price: '$59/mo' },
    ];

    const navItems = [
        { id: 'overview', label: t.overview, icon: Home, href: '/dashboard' },
        { id: 'career', label: t.career, icon: Briefcase, href: '/dashboard/career' },
        { id: 'business', label: t.business, icon: TrendingUp, href: '/dashboard/business' },
        { id: 'legal', label: t.legal, icon: Scale, href: '/dashboard/legal' },
        { id: 'innovative', label: t.innovative, icon: Rocket, href: '/dashboard/innovative' },
        { id: 'documents', label: t.documents, icon: FileText, href: '/dashboard/documents' },
        { id: 'support', label: t.support, icon: HelpCircle, href: '/dashboard/support' },
        { id: 'settings', label: t.settings, icon: Settings, href: '/dashboard/settings' },
        { id: 'pricing', label: t.pricing, icon: CreditCard, href: '/dashboard/pricing' },
        { id: 'research', label: t.research, icon: FlaskConical, href: '/dashboard/research' },
        { id: 'admin', label: 'Admin', icon: Shield, href: '/admin' },
    ];

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <Image src="/assets/new_single_logo.png" alt="Kimuntu AI" width={72} height={72} className="animate-float" />
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-all duration-500 ${isDark
            ? 'bg-black'
            : 'bg-white'
            }`}>
            {/* Premium Sidebar */}
            <div className={`fixed left-0 top-0 h-full w-64 shadow-2xl z-40 backdrop-blur-xl ${isDark
                ? 'bg-black/80 border-r border-white/10'
                : 'bg-white/80 border-r border-black/5'
                }`}>

                <div className="flex flex-col h-full relative z-10 overflow-hidden">
                    <div className="p-6 flex-shrink-0">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity cursor-pointer w-full"
                        >
                            <img
                                src={isDark ? '/assets/new_darkmode_logo.png' : '/assets/new_light_mode_logo.png'}
                                alt="Kimuntu AI Logo"
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-4 space-y-1 min-h-0 scrollbar-hide">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/dashboard' && pathname.startsWith(item.href));
                            const isLocked = item.href.startsWith('/dashboard') && !canAccessPath(item.href, profile, features);
                            const baseClass = `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all text-sm border`;
                            const stateClass = isLocked
                                ? isDark
                                    ? 'text-white/25 bg-white/[0.02] border-white/5 cursor-not-allowed opacity-70'
                                    : 'text-black/25 bg-black/[0.02] border-black/5 cursor-not-allowed opacity-70'
                                : isActive
                                    ? isDark
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isDark
                                        ? 'text-white/50 hover:bg-white/5 hover:text-white border-transparent'
                                        : 'text-black/50 hover:bg-black/5 hover:text-black border-transparent';
                            const content = (
                                <>
                                    <item.icon className="w-[18px] h-[18px]" />
                                    <span className="font-medium">{item.label}</span>
                                    {isLocked && <Lock className="w-3.5 h-3.5 ml-auto opacity-80" />}
                                </>
                            );
                            if (isLocked) {
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        disabled
                                        title="Locked by plan"
                                        className={`${baseClass} ${stateClass}`}
                                    >
                                        {content}
                                    </button>
                                );
                            }
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`${baseClass} ${stateClass}`}
                                >
                                    {content}
                                </Link>
                            );
                        })}
                    </nav>

                    <ProfileButton onSignOut={() => router.push('/')} />
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 flex flex-col min-h-screen">
                {/* Theme Toggle - Top Right */}
                <div className="fixed top-6 right-6 z-30">
                    <button
                        onClick={toggleTheme}
                        className={`p-3 rounded-xl transition-all duration-300 backdrop-blur-xl ${isDark
                            ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                            : 'bg-black/5 border border-black/5 hover:bg-black/10'
                            }`}
                    >
                        {isDark ? (
                            <Sun className="w-5 h-5 text-white" />
                        ) : (
                            <Moon className="w-5 h-5 text-black" />
                        )}
                    </button>
                </div>

                <div className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        <DashboardAccessGate>{children}</DashboardAccessGate>
                    </div>
                </div>
            </div>

            {/* Floating Chatbot */}
            <FloatingChatbot />

            {/* Profile Modal */}
            {showProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowProfile(false)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div
                        className={`relative w-full max-w-md rounded-2xl border shadow-2xl ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {(user?.displayName || user?.email || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Edit Profile</h2>
                                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-black/40'}`}>Update your personal details and plan</p>
                                </div>
                            </div>
                            <button onClick={() => setShowProfile(false)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-black/5 text-black/40'}`}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleProfileSave} className="px-6 py-5 space-y-4">
                            {/* Name row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-white/50' : 'text-black/50'}`}>First Name</label>
                                    <input
                                        value={profileForm.firstName}
                                        onChange={(e) => setProfileForm(f => ({ ...f, firstName: e.target.value }))}
                                        placeholder="Jane"
                                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-black/[0.03] border-black/10 text-black placeholder:text-black/30'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-white/50' : 'text-black/50'}`}>Last Name</label>
                                    <input
                                        value={profileForm.lastName}
                                        onChange={(e) => setProfileForm(f => ({ ...f, lastName: e.target.value }))}
                                        placeholder="Smith"
                                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-black/[0.03] border-black/10 text-black placeholder:text-black/30'}`}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-white/50' : 'text-black/50'}`}>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm(f => ({ ...f, email: e.target.value }))}
                                    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-black/[0.03] border-black/10 text-black placeholder:text-black/30'}`}
                                />
                            </div>

                            {/* Payment Plan */}
                            <div>
                                <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-white/50' : 'text-black/50'}`}>Payment Plan</label>
                                <div className="space-y-2">
                                    {PLAN_OPTIONS.map((p) => (
                                        <label key={p.value} className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                            profileForm.plan === p.value
                                                ? isDark ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
                                                : isDark ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/[0.02]'
                                        }`}>
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="radio"
                                                    name="plan"
                                                    value={p.value}
                                                    checked={profileForm.plan === p.value}
                                                    onChange={() => setProfileForm(f => ({ ...f, plan: p.value }))}
                                                    className="accent-emerald-500"
                                                />
                                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>{p.label}</span>
                                            </div>
                                            <span className={`text-xs font-medium ${profileForm.plan === p.value ? 'text-emerald-500' : isDark ? 'text-white/40' : 'text-black/40'}`}>{p.price}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {profileError && (
                                <p className={`text-xs rounded-xl px-3 py-2 border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                    {profileError}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setShowProfile(false)}
                                    className={`flex-1 rounded-xl py-2.5 text-sm font-medium border ${isDark ? 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10' : 'bg-black/[0.03] text-black/60 border-black/10 hover:bg-black/[0.06]'}`}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={profileSaving}
                                    className={`flex-1 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-colors ${
                                        profileSaved ? 'bg-emerald-500/20 text-emerald-500' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                    }`}>
                                    {profileSaved
                                        ? <><Check className="w-4 h-4" /> Saved!</>
                                        : profileSaving
                                            ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
                                            : 'Save Changes'
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
