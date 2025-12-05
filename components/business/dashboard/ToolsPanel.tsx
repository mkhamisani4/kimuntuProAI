'use client';

import { TrendingUp, FileText, BarChart3, DollarSign, Globe, Mail, Palette } from 'lucide-react';
import ToolCard from './ToolCard';
import FeaturedToolCard from './FeaturedToolCard';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function ToolsPanel() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.businessAITools}</h2>

      {/* Planning & Strategy */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          {t.businessPlanningStrategy}
        </h3>
        <div className="space-y-3">
          <ToolCard
            icon={TrendingUp}
            title={t.businessStreamlinedPlan}
            description={t.businessStreamlinedPlanDesc}
            route="/dashboard/business/streamlined-plan"
            color="blue"
          />
          <ToolCard
            icon={FileText}
            title={t.businessExecutiveSummary}
            description={t.businessExecutiveSummaryDesc}
            route="/dashboard/business/exec-summary"
            color="blue"
          />
        </div>
      </div>

      {/* Research & Analysis */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          {t.businessResearchAnalysis}
        </h3>
        <div className="space-y-3">
          <ToolCard
            icon={BarChart3}
            title={t.businessMarketAnalysis}
            description={t.businessMarketAnalysisDesc}
            route="/dashboard/business/market-analysis"
            color="teal"
          />
          <ToolCard
            icon={DollarSign}
            title={t.businessFinancialOverview}
            description={t.businessFinancialOverviewDesc}
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
