'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, ExternalLink, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

const tipUrls = [
  '/docs/website-builder#attaching-plans',
  '/dashboard/business/market-analysis',
  '/dashboard/business/websites',
  '/docs/tips#better-prompts',
  '/dashboard/business/ai-assistant',
];

export default function TipsWidget() {
  const { t } = useLanguage();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const tips = [
    {
      title: t.biz_tip1Title,
      description: t.biz_tip1Desc,
      actionLabel: t.biz_tip1Action,
      actionUrl: tipUrls[0],
    },
    {
      title: t.biz_tip2Title,
      description: t.biz_tip2Desc,
      actionLabel: t.biz_tip2Action,
      actionUrl: tipUrls[1],
    },
    {
      title: t.biz_tip3Title,
      description: t.biz_tip3Desc,
      actionLabel: t.biz_tip3Action,
      actionUrl: tipUrls[2],
    },
    {
      title: t.biz_tip4Title,
      description: t.biz_tip4Desc,
      actionLabel: t.biz_tip4Action,
      actionUrl: tipUrls[3],
    },
    {
      title: t.biz_tip5Title,
      description: t.biz_tip5Desc,
      actionLabel: t.biz_tip5Action,
      actionUrl: tipUrls[4],
    },
  ];

  // Rotate tips every 24 hours based on day of year
  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setCurrentTipIndex(dayOfYear % tips.length);
  }, []);

  const currentTip = tips[currentTipIndex];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Lightbulb size={20} className="text-white" />
        </div>
        <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
          {t.biz_tipOfTheDay}
        </h3>
      </div>

      {/* Tip Content */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">
          {currentTip.title}
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          {currentTip.description}
        </p>

        {/* Action Button */}
        <a
          href={currentTip.actionUrl}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium group"
        >
          {currentTip.actionLabel}
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      {/* Tip Indicator Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4 pt-4 border-t border-blue-200">
        {tips.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTipIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === currentTipIndex
                ? 'bg-blue-600 w-6'
                : 'bg-blue-200 hover:bg-blue-400'
              }`}
            aria-label={`View tip ${index + 1}`}
          />
        ))}
      </div>

      {/* Resources Link */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <a
          href="/docs"
          className="flex items-center justify-between text-sm text-blue-600 hover:text-blue-700 font-medium group"
        >
          <span>{t.biz_browseDocumentation}</span>
          <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}
