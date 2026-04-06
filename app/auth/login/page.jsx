'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';
import AuthForm from '@/components/AuthForm';
import { translations } from '@/lib/translations';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isDark } = useTheme();
  const t = translations.en;

  useEffect(() => {
    if (user && !loading) {
      // Login page always means existing user — go to dashboard directly
      router.push('/dashboard');
    }
  }, [user, loading, router]);

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

  if (user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Image src="/assets/LOGOS(9).svg" alt="Kimuntu AI" width={64} height={64} className="animate-float" />
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
          </div>
          <p className={`text-sm ${isDark ? 'text-white/50' : 'text-black/50'}`}>Redirecting...</p>
        </div>
      </div>
    );
  }

  return <AuthForm t={t} />;
}
