'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Briefcase, Users, Scale, Home, FileText, TrendingUp, HelpCircle, Sun, Moon, Rocket, Settings, CreditCard, Crown, ShieldCheck } from 'lucide-react';
import { auth, signOutUser } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import Footer from '@/components/Footer';
import FloatingChatbot from '@/components/FloatingChatbot';
import Image from 'next/image';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isDark, toggleTheme } = useTheme();
    const { t } = useLanguage();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Pages where footer should be hidden
    const hideFooterPages = [
        '/dashboard/documents',
        '/dashboard/support',
        '/dashboard/settings',
        '/dashboard/pricing',
        '/dashboard/checkout',
        '/dashboard/subscription'
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

    const navItems = [
        { id: 'overview', label: t.overview, icon: Home, href: '/dashboard' },
        { id: 'career', label: t.career, icon: Briefcase, href: '/dashboard/career' },
        { id: 'business', label: t.business, icon: TrendingUp, href: '/dashboard/business' },
        { id: 'legal', label: t.legal, icon: Scale, href: '/dashboard/legal' },
        { id: 'innovative', label: t.innovative, icon: Rocket, href: '/dashboard/innovative' },
        { id: 'documents', label: t.documents, icon: FileText, href: '/dashboard/documents' },
        { id: 'support', label: t.support, icon: HelpCircle, href: '/dashboard/support' },
        { id: 'settings', label: t.settings, icon: Settings, href: '/dashboard/settings' },
        { id: 'subscription', label: 'Subscription', icon: Crown, href: '/dashboard/subscription' },
        { id: 'admin', label: 'Admin', icon: ShieldCheck, href: '/admin' },
    ];

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <Image src="/assets/LOGOS(9).svg" alt="Kimuntu AI" width={64} height={64} className="animate-float" />
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
                            <Image
                                src="/assets/LOGOS(9).svg"
                                alt="Kimuntu AI"
                                width={36}
                                height={36}
                            />
                            <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                Kimuntu
                            </span>
                        </Link>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-4 space-y-1 min-h-0 scrollbar-hide">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/dashboard' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all text-sm ${isActive
                                        ? isDark
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : isDark
                                            ? 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
                                            : 'text-black/50 hover:bg-black/5 hover:text-black border border-transparent'
                                    }`}
                                >
                                    <item.icon className="w-[18px] h-[18px]" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className={`flex-shrink-0 p-4 mx-4 mb-4 rounded-2xl ${isDark
                        ? 'bg-white/[0.03] border border-white/10'
                        : 'bg-black/[0.02] border border-black/5'
                    }`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${isDark
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                                {(user?.displayName || user?.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                                    {t.loggedInAs}
                                </p>
                                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>
                                    {user?.displayName || user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${isDark
                                ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                                : 'bg-black/5 text-black/60 hover:bg-black/10 hover:text-black border border-black/5'
                            }`}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">{t.signOut}</span>
                        </button>
                    </div>
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
                        {children}
                    </div>
                </div>
            </div>

            {/* Floating Chatbot */}
            <FloatingChatbot />
        </div>
    );
}
