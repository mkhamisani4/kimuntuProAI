'use client';

import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import Toast from '@/components/ai/Toast';
import EmailDashboard from '@/components/business/marketing/email/EmailDashboard';
import { useAuth } from '@/hooks/useAuth';

export default function EmailMarketingPage() {
  const { user, loading } = useAuth();

  const userId = user?.uid || '';
  const tenantId = user?.uid || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast />

      {/* Hero Header */}
      <div className="w-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-emerald-300/70">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              </li>
              <li><span className="mx-1">/</span></li>
              <li>
                <Link href="/dashboard/business" className="hover:text-white transition-colors">Business Track</Link>
              </li>
              <li><span className="mx-1">/</span></li>
              <li>
                <Link href="/dashboard/business/marketing" className="hover:text-white transition-colors">Marketing Suite</Link>
              </li>
              <li><span className="mx-1">/</span></li>
              <li><span className="text-white font-medium">Email Campaigns</span></li>
            </ol>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur">
                <Mail className="w-8 h-8 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Email Campaigns</h1>
                <p className="text-emerald-300/80 text-sm mt-1">
                  Create, send, and track email campaigns with Mailchimp
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/business/marketing"
              className="flex items-center gap-2 px-4 py-2 text-emerald-300/70 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketing
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        ) : (
          <EmailDashboard userId={userId} tenantId={tenantId} />
        )}
      </div>
    </div>
  );
}
