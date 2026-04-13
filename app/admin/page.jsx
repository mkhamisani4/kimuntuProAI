'use client';

import Link from 'next/link';
import { BarChart2, Bot, FileText, Settings, HeadphonesIcon, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

const sections = [
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2, description: 'User growth, conversions, and engagement metrics.' },
  { label: 'AI Usage', href: '/admin/ai-usage', icon: Bot, description: 'Token consumption and AI feature usage across the platform.' },
  { label: 'Content', href: '/admin/content', icon: FileText, description: 'Manage platform content and published materials.' },
  { label: 'Support', href: '/admin/support', icon: HeadphonesIcon, description: 'Review and respond to user support requests.' },
  { label: 'Settings', href: '/admin/settings', icon: Settings, description: 'Platform-wide configuration and admin controls.' },
];

export default function AdminPage() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen p-8 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-7 h-7 text-emerald-500" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <p className={`mb-10 text-sm ${isDark ? 'text-white/50' : 'text-black/50'}`}>
          Platform management and monitoring
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map(({ label, href, icon: Icon, description }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-emerald-500/30'
                  : 'bg-white border-black/5 hover:bg-emerald-50 hover:border-emerald-200'
              }`}
            >
              <div className={`mt-0.5 p-2 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                <Icon className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-0.5">{label}</p>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
