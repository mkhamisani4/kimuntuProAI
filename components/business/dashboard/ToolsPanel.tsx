'use client';

import { TrendingUp, FileText, BarChart3, DollarSign, Globe, Mail, Palette } from 'lucide-react';
import ToolCard from './ToolCard';
import FeaturedToolCard from './FeaturedToolCard';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function ToolsPanel() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      {/* Section Title */}
      <h2 className="text-xl font-bold text-gray-900">{t.biz_aiTools}</h2>

      {/* Planning & Strategy */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          {t.biz_planningStrategy}
        </h3>
        <div className="space-y-3">
          <ToolCard
            icon={TrendingUp}
            title={t.biz_streamlinedPlan}
            description={t.biz_streamlinedPlanDesc}
            route="/dashboard/business/streamlined-plan"
            color="blue"
          />
          <ToolCard
            icon={FileText}
            title={t.biz_execSummary}
            description={t.biz_execSummaryDesc}
            route="/dashboard/business/exec-summary"
            color="blue"
          />
        </div>
      </div>

      {/* Research & Analysis */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          {t.biz_researchAnalysis}
        </h3>
        <div className="space-y-3">
          <ToolCard
            icon={BarChart3}
            title={t.biz_marketAnalysis}
            description={t.biz_marketAnalysisDesc}
            route="/dashboard/business/market-analysis"
            color="teal"
          />
          <ToolCard
            icon={DollarSign}
            title={t.biz_financialOverview}
            description={t.biz_financialOverviewDesc}
            route="/dashboard/business/financial-overview"
            color="teal"
          />
        </div>
      </div>

      {/* Build & Launch - Featured */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          {t.biz_buildLaunch}
        </h3>
        <div className="space-y-3">
          <FeaturedToolCard
            icon={Globe}
            title={t.biz_websiteBuilder}
            description={t.biz_websiteBuilderDesc}
            route="/dashboard/business/websites/new"
          />
          <ToolCard
            icon={Palette}
            title={t.biz_logoStudio}
            description={t.biz_logoStudioDesc}
            route="/dashboard/business/logo-studio"
            color="purple"
          />
          <ToolCard
            icon={Mail}
            title={t.biz_marketingSuite}
            description={t.biz_marketingSuiteDesc}
            route="/dashboard/business/marketing"
            color="orange"
          />
        </div>
      </div>
    </div>
  );
}
