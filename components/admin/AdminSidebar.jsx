'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, CreditCard, Activity,
  Settings2, LifeBuoy, FileText, BarChart3, Settings,
  Shield, ArrowLeft, Bell,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { ProfileButton } from '@/components/shared/ProfileButton';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard',      href: '/admin',                icon: LayoutDashboard },
  { name: 'Users',          href: '/admin/users',          icon: Users },
  { name: 'Payments',       href: '/admin/payments',       icon: CreditCard },
  { name: 'AI Usage',       href: '/admin/ai-usage',       icon: Activity },
  { name: 'Features',       href: '/admin/features',       icon: Settings2 },
  { name: 'Support',        href: '/admin/support',        icon: LifeBuoy },
  { name: 'Content',        href: '/admin/content',        icon: FileText },
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
  const { siteName } = useSiteSettings();

  const base = isDark
    ? 'bg-black/90 border-r border-white/10'
    : 'bg-white border-r border-black/5 shadow-sm';

  const activeClass = isDark
    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

  const inactiveClass = isDark
    ? 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
    : 'text-black/50 hover:bg-black/5 hover:text-black border border-transparent';

  return (
    <div className={`flex w-64 flex-col h-screen fixed top-0 left-0 z-40 backdrop-blur-xl ${base}`}>

      {/* Logo */}
      <div className="p-5 pb-3 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
          <Image src="/assets/LOGOS(9).svg" alt="KimuntuPro" width={32} height={32} />
          <div>
            <p className={`text-base font-bold leading-tight ${isDark ? 'text-white' : 'text-black'}`}>{siteName}</p>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-semibold">Admin</span>
            </div>
          </div>
        </Link>

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

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navigation.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive ? activeClass : inactiveClass}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* System Health */}
      <div className={`mx-3 mb-3 p-3 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'}`}>
        <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${isDark ? 'text-white/30' : 'text-black/30'}`}>
          System Health
        </p>
        <div className="space-y-1.5">
          {systemHealth.map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className={`text-xs ${isDark ? 'text-white/50' : 'text-black/50'}`}>{s.label}</span>
              <span className="flex items-center gap-1 text-xs text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Profile + Sign out */}
      <ProfileButton />
    </div>
  );
}
