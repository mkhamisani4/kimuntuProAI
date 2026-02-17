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
                ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black'
                : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'
                }`}>
                <div className="flex flex-col items-center gap-4">
                    <Image src="/assets/LOGOS(4).svg" alt="KimuntuPro AI" width={80} height={80} className="animate-bounce" />
                    <div className={`text-2xl font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-all duration-500 ${isDark
            ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black'
            : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'
            }`}>
            {/* Glassmorphism Sidebar */}
            <div className={`fixed left-0 top-0 h-full w-64 shadow-2xl z-40 ${isDark
                ? 'bg-gray-900'
                : 'bg-white'
                }`}>

                <div className="flex flex-col h-full relative z-10 overflow-hidden">
                    <div className="p-6 flex-shrink-0">
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-center mb-8 hover:opacity-80 transition-opacity cursor-pointer w-full"
                        >
                            <Image
                                src={isDark ? "/assets/white_logo.png" : "/assets/dark_logo.png"}
                                alt="KimuntuPro AI"
                                width={144}
                                height={144}
                            />
                        </Link>
                    </div>
                    
                    <nav className="flex-1 overflow-y-auto px-6 space-y-1 min-h-0 scrollbar-hide">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isDark
                                    ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className={`flex-shrink-0 p-6 ${isDark ? 'border-t border-white/10' : 'border-t border-gray-200'}`}>
                        <div className={`rounded-xl p-4 mb-4 backdrop-blur-xl ${isDark
                            ? 'bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/30'
                            : 'bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-300'
                            }`}>
                            <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {t.loggedInAs}
                            </p>
                            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {user?.email || user?.displayName}
                            </p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all backdrop-blur-xl ${isDark
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-300'
                                }`}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">{t.signOut}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 flex flex-col min-h-screen">
                <div className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
                
                {/* Footer - Hidden on specific pages */}
                {shouldShowFooter && <Footer />}
            </div>
        </div>
    );
}
