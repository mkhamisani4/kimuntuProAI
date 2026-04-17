'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import SupportContactForm from '@/components/SupportContactForm';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function SupportContactPage() {
  const { isDark } = useTheme();

  return (
    <PageWrapper title="Contact Support">
      <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
        <Link
          href="/support"
          className={`inline-flex items-center gap-2 mb-6 text-sm font-medium ${isDark ? 'text-emerald-300 hover:text-emerald-200' : 'text-emerald-700 hover:text-emerald-600'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Support Center
        </Link>

        <p className="text-lg mb-8">
          Share a few details and we&apos;ll prepare your message to the support team.
        </p>

        <SupportContactForm isDark={isDark} />
      </div>
    </PageWrapper>
  );
}
