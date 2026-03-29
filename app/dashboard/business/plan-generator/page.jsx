'use client';

import Link from 'next/link';
import { ArrowLeft, Rocket } from 'lucide-react';

export default function PlanGeneratorPage() {
  return (
    <div>
      <Link
        href="/dashboard/business"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Business Track
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Business Plan Generator
        </h1>
        <p className="text-lg text-gray-400">
          Create a comprehensive business plan powered by AI
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8">
        <div className="text-center py-12">
          <div className="text-emerald-400 mb-4 flex justify-center">
            <Rocket className="w-20 h-20" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Our AI-powered Business Plan Generator is currently in development.
            This feature will help you create professional business plans in minutes,
            tailored to your industry and goals.
          </p>
          <Link
            href="/dashboard/business"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
          >
            Return to Business Track
          </Link>
        </div>
      </div>
    </div>
  );
}
