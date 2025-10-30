'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, Home, Briefcase, TrendingUp, Scale, FileText, HelpCircle } from 'lucide-react';
import { signOutUser } from '@/lib/firebase';

export default function Sidebar({ user, t }) {
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguage] = useState('en'); // TODO: Move to global state in future

  const navItems = [
    { id: 'overview', label: t.overview, icon: Home, path: '/dashboard/overview' },
    { id: 'career', label: t.career, icon: Briefcase, path: '/dashboard/career' },
    { id: 'business', label: t.business, icon: TrendingUp, path: '/dashboard/business' },
    { id: 'legal', label: t.legal, icon: Scale, path: '/dashboard/legal' },
    { id: 'documents', label: t.documents, icon: FileText, path: '/dashboard/documents' },
    { id: 'support', label: t.support, icon: HelpCircle, path: '/dashboard/support' },
  ];

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/');
    } catch (err) {
      console.error('Sign out failed', err);
    }
  };

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

  const handleNavClick = (path) => {
    router.push(path);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-black/60 backdrop-blur-xl border-r border-gray-800">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <button
            onClick={handleLogoClick}
            className="mb-8 cursor-pointer hover:opacity-80 transition-opacity w-full flex items-center justify-center bg-transparent border-none p-0"
            type="button"
          >
            <Image
              src="/kimuntu_logo_black.png"
              alt="KimuntuPro AI Logo"
              width={144}
              height={144}
              className="w-full object-contain"
            />
          </button>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-l-2 border-emerald-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-4 mb-4 border border-emerald-500/20">
            <p className="text-xs text-gray-400 mb-1">{t.loggedInAs}</p>
            <p className="text-white text-sm font-medium truncate">{user?.email || user?.displayName}</p>
          </div>

          {/* Language Toggle */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                language === 'en'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                language === 'fr'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              FR
            </button>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">{t.signOut}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
