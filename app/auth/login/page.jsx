'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/AuthForm';
import { translations } from '@/lib/translations';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const t = translations.en; // Default to English for now

  // Redirect authenticated users to home page
  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-emerald-400 text-2xl">Loading...</div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-emerald-400 text-2xl">Redirecting...</div>
      </div>
    );
  }

  // Show auth form for unauthenticated users
  return <AuthForm t={t} />;
}
