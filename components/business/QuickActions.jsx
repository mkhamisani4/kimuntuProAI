'use client';

import Link from 'next/link';

function ActionCard({ icon, title, description, buttonText, comingSoon, href }) {
  return (
    <div className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6 text-center relative hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl hover:shadow-black/20 transition-all">
      {comingSoon && <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">Coming Soon</div>}
      <span className="text-4xl mb-4 block">{icon}</span>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
      >
        {buttonText}
      </Link>
    </div>
  );
}

export default function QuickActions() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" role="region" aria-label="Quick actions">
      <ActionCard
        icon="📈"
        title="Streamlined Business Plan"
        description="AI-powered lean one-page business plan"
        buttonText="Generate Plan"
        href="/dashboard/business/streamlined-plan"
      />
      <ActionCard
        icon="💰"
        title="Executive Summary + Financials"
        description="Financial overview with 12-month projections"
        buttonText="Create Summary"
        href="/dashboard/business/exec-summary"
      />
      <ActionCard
        icon="🔍"
        title="Market Analysis"
        description="AI-powered competitive intelligence with live data"
        buttonText="Analyze Market"
        href="/dashboard/business/market-analysis"
      />
      <ActionCard
        icon="🎯"
        title="Marketing Suite (SEO • Email • Social)"
        description="Comprehensive digital marketing automation"
        buttonText="Launch Campaign"
        href="/dashboard/business/marketing-suite"
        comingSoon
      />
      <ActionCard
        icon="💰"
        title="Funding Strategy"
        description="Grants + capital options"
        buttonText="Find Funding"
        href="/dashboard/business/funding-strategy"
      />
      <ActionCard
        icon="🌐"
        title="AI Website Builder"
        description="Professional websites with AI-powered design"
        buttonText="Build Website"
        href="/dashboard/business/website-builder"
        comingSoon
      />
    </section>
  );
}
