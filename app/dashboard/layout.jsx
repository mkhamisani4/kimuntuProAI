'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import { translations } from '@/lib/translations';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const t = translations.en; // Default to English for now

  // Redirect unauthenticated users to auth page
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-emerald-400 text-2xl">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated, show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-emerald-400 text-2xl">Redirecting...</div>
      </div>
    );
  }

  // Authenticated: show dashboard with sidebar
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Sidebar user={user} t={t} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
