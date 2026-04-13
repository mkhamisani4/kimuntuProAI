'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut, Home, Sun, Moon,
  BarChart2, Bot, FileText, Settings, HeadphonesIcon, ShieldCheck,
} from 'lucide-react';
import { auth, signOutUser } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from '@/components/providers/ThemeProvider';
import Image from 'next/image';
import FloatingChatbot from '@/components/FloatingChatbot';

const navItems = [
  { id: 'overview',   label: 'Overview',   icon: ShieldCheck,      href: '/admin' },
  { id: 'analytics',  label: 'Analytics',  icon: BarChart2,        href: '/admin/analytics' },
  { id: 'ai-usage',   label: 'AI Usage',   icon: Bot,              href: '/admin/ai-usage' },
  { id: 'content',    label: 'Content',    icon: FileText,         href: '/admin/content' },
  { id: 'support',    label: 'Support',    icon: HeadphonesIcon,   href: '/admin/support' },
  { id: 'settings',   label: 'Settings',   icon: Settings,         href: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 shadow-2xl z-40 backdrop-blur-xl ${
        isDark ? 'bg-black/80 border-r border-white/10' : 'bg-white/80 border-r border-black/5'
      }`}>
        <div className="flex flex-col h-full relative z-10 overflow-hidden">
          <div className="p-6 flex-shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity cursor-pointer w-full"
            >
              <Image src="/assets/LOGOS(9).svg" alt="Kimuntu AI" width={36} height={36} />
              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>Kimuntu</span>
            </Link>

            {/* Back to dashboard link */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 mb-6 text-xs transition-colors ${
                isDark ? 'text-white/30 hover:text-white/60' : 'text-black/30 hover:text-black/60'
              }`}
            >
              <Home className="w-3 h-3" />
              Back to Dashboard
            </Link>

            {/* Admin label */}
            <div className={`flex items-center gap-2 px-1 mb-3`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className={`text-[10px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                Admin
              </span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 space-y-1 min-h-0 scrollbar-hide">
            {navItems.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all text-sm ${
                    isActive
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

          <div className={`flex-shrink-0 p-4 mx-4 mb-4 rounded-2xl ${
            isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-black/[0.02] border border-black/5'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {(user?.displayName || user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-black/40'}`}>Logged in as</p>
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>
                  {user?.displayName || user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
                isDark
                  ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                  : 'bg-black/5 text-black/60 hover:bg-black/10 hover:text-black border border-black/5'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Theme toggle */}
        <div className="fixed top-6 right-6 z-30">
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all duration-300 backdrop-blur-xl ${
              isDark
                ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                : 'bg-black/5 border border-black/5 hover:bg-black/10'
            }`}
          >
            {isDark ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-black" />}
          </button>
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>

      <FloatingChatbot />
    </div>
  );
}
