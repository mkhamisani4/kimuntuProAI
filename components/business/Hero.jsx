'use client';

import Link from 'next/link';

function AIToolCard({ icon, title, description, href }) {
  return (
    <Link
      href={href}
      className="bg-white/5 backdrop-blur border border-gray-800 rounded-xl p-4 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl hover:shadow-emerald-500/10 transition-all group"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">{icon}</span>
        <div className="flex-1 text-left">
          <h3 className="text-white font-semibold mb-1 group-hover:text-emerald-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <svg
          className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}

export default function Hero() {
  return (
    <section className="mb-8">
      {/* Main Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Business Track
        </h1>
        <p className="text-lg text-gray-400 mb-6">
          Plan, fund, and grow with AI.
        </p>
        <Link
          href="/dashboard/business/streamlined-plan"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold gap-2 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all"
        >
          <span>🚀</span> Start Business Plan
        </Link>
      </div>

      {/* AI Tools Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span>✨</span> AI-Powered Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AIToolCard
            icon="📈"
            title="Streamlined Plan"
            description="Lean one-page business plan in 60 seconds"
            href="/dashboard/business/streamlined-plan"
          />
          <AIToolCard
            icon="💰"
            title="Executive Summary"
            description="Financial overview with projections"
            href="/dashboard/business/exec-summary"
          />
          <AIToolCard
            icon="🔍"
            title="Market Analysis"
            description="Competitive intelligence with live data"
            href="/dashboard/business/market-analysis"
          />
        </div>
      </div>
    </section>
  );
}
