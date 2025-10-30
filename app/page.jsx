'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LandingHero from '@/components/LandingHero';
import { translations } from '@/lib/translations';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const t = translations.en; // Default to English for now

  const handleGetStarted = () => {
    router.push('/auth/login');
  };

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
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
        <div className="text-emerald-400 text-2xl">Redirecting to dashboard...</div>
      </div>
    );
  }

  // If user is not authenticated, show the landing page
  return <LandingHero t={t} onGetStarted={handleGetStarted} />;
}
