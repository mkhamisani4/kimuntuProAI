'use client';

/**
 * AssistantLayout Component
 * Shared layout for all AI assistant pages with dark gradient theme
 * Provides breadcrumb navigation, header with icon/title/description, and back button
 */

import Link from 'next/link';
import Toast from './Toast';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface AssistantLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  backHref?: string;
  children: React.ReactNode;
}

export default function AssistantLayout({
  title,
  description,
  icon,
  backHref = '/dashboard/business',
  children
}: AssistantLayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8">
      {/* Toast Notifications */}
      <Toast />

      <div className="mx-auto w-full max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-5 overflow-x-auto pb-1 text-xs text-gray-400 sm:mb-6 sm:text-sm" aria-label="Breadcrumb">
          <ol className="flex min-w-0 items-center gap-2 whitespace-nowrap">
            <li>
              <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                {t.biz_dashboard}
              </Link>
            </li>
            <li>
              <span>/</span>
            </li>
            <li>
              <Link href={backHref} className="hover:text-emerald-400 transition-colors">
                {t.biz_businessTrack}
              </Link>
            </li>
            <li>
              <span>/</span>
            </li>
            <li>
              <span className="font-medium text-white">{title}</span>
            </li>
          </ol>
        </nav>

        {/* Header with Icon, Title, and Description */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex items-start gap-3 sm:flex-1 sm:gap-4">
              <div className="shrink-0 text-emerald-400 [&>svg]:h-12 [&>svg]:w-12 sm:[&>svg]:h-16 sm:[&>svg]:w-16" aria-hidden="true">{icon}</div>
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                {title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-lg">
                  {description}
                </p>
              </div>
            </div>
            {/* Back Button */}
            <Link
              href={backHref}
              className="inline-flex w-fit items-center gap-2 rounded-xl px-0 py-2 text-sm text-gray-400 transition-colors hover:text-white sm:px-4"
              aria-label={`${t.biz_back} ${t.biz_businessTrack}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t.biz_back}
            </Link>
          </div>
        </div>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
}
