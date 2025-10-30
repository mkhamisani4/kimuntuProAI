'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="text-center mb-8">
      <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
        Business Track
      </h1>
      <p className="text-lg text-gray-400 mb-6">
        Plan, fund, and grow with AI.
      </p>
      <Link
        href="/dashboard/business/plan-generator"
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold gap-2 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all"
      >
        <span>🚀</span> Start Business Plan
      </Link>
    </section>
  );
}
