'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, CreditCard, Activity,
  Settings2, LifeBuoy, FileText, BarChart3, Settings,
  Shield, ArrowLeft, Bell, FlaskConical, Menu, X,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { ProfileButton } from '@/components/shared/ProfileButton';

const navigation = [
  { name: 'Dashboard',      href: '/admin',                icon: LayoutDashboard },
  { name: 'Users',          href: '/admin/users',          icon: Users },
  { name: 'Payments',       href: '/admin/payments',       icon: CreditCard },
  { name: 'AI Usage',       href: '/admin/ai-usage',       icon: Activity },
  { name: 'Features',       href: '/admin/features',       icon: Settings2 },
  { name: 'Support',        href: '/admin/support',        icon: LifeBuoy },
  { name: 'Content',        href: '/admin/content',        icon: FileText },
  { name: 'Research',       href: '/admin/research',       icon: FlaskConical },
  { name: 'Analytics',      href: '/admin/analytics',      icon: BarChart3 },
  { name: 'Notifications',  href: '/admin/notifications',  icon: Bell },
  { name: 'Settings',       href: '/admin/settings',       icon: Settings },
];

const systemHealth = [
  { label: 'AI Services', status: 'Operational' },
  { label: 'Payments',    status: 'Operational' },
  { label: 'Database',    status: 'Operational' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const base = isDark
    ? 'bg-black/90 border-r border-white/10'
    : 'bg-white border-r border-black/5 shadow-sm';

  const activeClass = isDark
    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

  const inactiveClass = isDark
    ? 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
    : 'text-black/50 hover:bg-black/5 hover:text-black border border-transparent';

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  const sidebarBody = (
    <div className={`flex w-full lg:w-64 flex-col h-full backdrop-blur-xl ${base}`}>
      <div className="p-4 sm:p-5 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
            <img
              src={isDark ? '/assets/new_darkmode_logo.png' : '/assets/new_light_mode_logo.png'}
              alt="Kimuntu AI Logo"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <div className="flex items-center gap-1 shrink-0">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-semibold">Admin</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className={`lg:hidden p-2 rounded-xl border ${isDark
              ? 'bg-white/5 border-white/10 text-white'
              : 'bg-black/[0.03] border-black/10 text-black'
            }`}
            aria-label="Close admin menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Link
          href="/dashboard"
          className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg transition-all ${
            isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/5' : 'text-black/40 hover:text-black/60 hover:bg-black/5'
          }`}
        >
          <ArrowLeft className="w-3 h-3" />
          Back to App
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 min-h-0">
        {navigation.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? activeClass : inactiveClass}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={`mx-3 mb-3 p-3 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'}`}>
        <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${isDark ? 'text-white/30' : 'text-black/30'}`}>
          System Health
        </p>
        <div className="space-y-1.5">
          {systemHealth.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-2">
              <span className={`text-xs ${isDark ? 'text-white/50' : 'text-black/50'}`}>{s.label}</span>
              <span className="flex items-center gap-1 text-xs text-emerald-500 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ProfileButton />
    </div>
  );

  return (
    <>
      <div className={`lg:hidden fixed top-0 inset-x-0 z-40 border-b backdrop-blur-xl ${isDark ? 'bg-black/85 border-white/10' : 'bg-white/90 border-black/5'}`}>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={`p-2.5 rounded-xl border ${isDark
              ? 'bg-white/5 border-white/10 text-white'
              : 'bg-black/[0.03] border-black/10 text-black'
            }`}
            aria-label="Open admin menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/admin" className="min-w-0 flex-1 flex justify-center px-2">
            <img
              src={isDark ? '/assets/new_darkmode_logo.png' : '/assets/new_light_mode_logo.png'}
              alt="Kimuntu AI Logo"
              className="h-7 w-auto max-w-full object-contain"
            />
          </Link>

          <div className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${isDark
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            Admin
          </div>
        </div>
      </div>

      <div className={`hidden lg:flex w-64 flex-col h-screen fixed top-0 left-0 z-40`}>
        {sidebarBody}
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close admin menu overlay"
          />
          <div className="relative h-full w-[86vw] max-w-[340px]">
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
}
