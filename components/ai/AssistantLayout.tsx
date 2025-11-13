'use client';

/**
 * AssistantLayout Component
 * Shared layout for all AI assistant pages with dark gradient theme
 * Provides breadcrumb navigation, header with icon/title/description, and back button
 */

import Link from 'next/link';
import Toast from './Toast';

interface AssistantLayoutProps {
  title: string;
  description: string;
  icon: string;
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      {/* Toast Notifications */}
      <Toast />

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 text-sm text-gray-400" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link href={backHref} className="hover:text-emerald-400 transition-colors">
                Business Track
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <span className="text-white font-medium">{title}</span>
            </li>
          </ol>
        </nav>

        {/* Header with Icon, Title, and Description */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-6xl" aria-hidden="true">{icon}</span>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {title}
              </h1>
              <p className="text-gray-400 text-lg">
                {description}
              </p>
            </div>
            {/* Back Button */}
            <Link
              href={backHref}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              aria-label="Back to Business Track"
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
              Back
            </Link>
          </div>
        </div>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
}
