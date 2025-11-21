'use client';

import { TrendingUp, FileText, BarChart3, DollarSign, Globe, Mail, Palette } from 'lucide-react';
import ToolCard from './ToolCard';
import FeaturedToolCard from './FeaturedToolCard';

export default function ToolsPanel() {
  return (
    <div className="space-y-6">
      {/* Section Title */}
      <h2 className="text-xl font-bold text-white">AI Tools</h2>

      {/* Planning & Strategy */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Planning & Strategy
        </h3>
        <div className="space-y-3">
          <ToolCard
            icon={TrendingUp}
            title="Streamlined Plan"
            description="One-page lean plan in 60 seconds"
            route="/dashboard/business/streamlined-plan"
            color="blue"
          />
          <ToolCard
            icon={FileText}
            title="Executive Summary"
            description="Investor-ready summary with financials"
            route="/dashboard/business/exec-summary"
            color="blue"
          />
        </div>
      </div>

      {/* Research & Analysis */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Research & Analysis
        </h3>
        <div className="space-y-3">
          <ToolCard
            icon={BarChart3}
            title="Market Analysis"
            description="Competitive intelligence with live data"
            route="/dashboard/business/market-analysis"
            color="teal"
          />
          <ToolCard
            icon={DollarSign}
            title="Financial Overview"
            description="12-month projections & metrics"
            route="/dashboard/business/financial-overview"
            color="teal"
          />
        </div>
      </div>

      {/* Build & Launch - Featured */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Build & Launch
        </h3>
        <div className="space-y-3">
          <FeaturedToolCard
            icon={Globe}
            title="AI Website Builder"
            description="Create professional websites in minutes with AI-powered design and content generation"
            route="/dashboard/business/websites/new"
          />
          <ToolCard
            icon={Palette}
            title="Logo Studio"
            description="AI-powered logo design and branding"
            route="/dashboard/business/logo-studio"
            color="purple"
          />
          <ToolCard
            icon={Mail}
            title="Marketing Suite"
            description="SEO, Email, Social automation"
            route="/dashboard/business/marketing"
            color="orange"
            disabled={true}
            badge="Q1 2025"
          />
        </div>
      </div>
    </div>
  );
}
