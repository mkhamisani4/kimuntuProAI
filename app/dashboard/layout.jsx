'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Briefcase, Users, Scale, Home, FileText, TrendingUp, HelpCircle, Sun, Moon, Rocket, Settings, CreditCard } from 'lucide-react';
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
    ];

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark
                ? 'bg-black'
                : 'bg-white'
                }`}>
                <div className="flex flex-col items-center gap-4">
                    <Image src="/assets/LOGOS(9).svg" alt="KimuntuPro AI" width={80} height={80} className="animate-bounce" />
                    <div className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                        Loading...
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
            <div className={`fixed left-0 top-0 h-full w-64 shadow-2xl z-40 ${isDark
                ? 'bg-black border-r border-white/10'
                : 'bg-white border-r border-black/10'
                }`}>

                <div className="flex flex-col h-full relative z-10 overflow-hidden">
                    <div className="p-6 flex-shrink-0">
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-center mb-8 hover:opacity-80 transition-opacity cursor-pointer w-full"
                        >
                            <Image
                                src="/assets/LOGOS(9).svg"
                                alt="KimuntuPro AI"
                                width={80}
                                height={80}
                            />
                        </Link>
                    </div>
                    
                    <nav className="flex-1 overflow-y-auto px-6 space-y-1 min-h-0 scrollbar-hide">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isDark
                                    ? 'text-white/60 hover:bg-white/10 hover:text-white'
                                    : 'text-black/60 hover:bg-black/5 hover:text-black'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className={`flex-shrink-0 p-6 ${isDark ? 'border-t border-white/10' : 'border-t border-black/10'}`}>
                        <div className={`rounded-xl p-4 mb-4 ${isDark
                            ? 'bg-white/5 border border-white/10'
                            : 'bg-black/5 border border-black/10'
                            }`}>
                            <p className={`text-xs mb-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                {t.loggedInAs}
                            </p>
                            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>
                                {user?.email || user?.displayName}
                            </p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${isDark
                                ? 'bg-white text-black hover:bg-white/90'
                                : 'bg-black text-white hover:bg-black/90'
                                }`}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">{t.signOut}</span>
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
                        className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isDark
                            ? 'bg-white/10 border border-white/20 hover:bg-white/20'
                            : 'bg-black/5 border border-black/10 hover:bg-black/10'
                            }`}
                    >
                        {isDark ? (
                            <Sun className="w-6 h-6 text-white" />
                        ) : (
                            <Moon className="w-6 h-6 text-black" />
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
