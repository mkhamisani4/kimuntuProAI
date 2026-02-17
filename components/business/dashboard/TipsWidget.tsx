'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, ExternalLink, ChevronRight } from 'lucide-react';

const tips = [
  {
    title: 'Attach Business Plans to Websites',
    description: 'Generate more accurate websites by attaching a business plan. The AI will use your plan\'s details to create tailored content.',
    actionLabel: 'Learn More',
    actionUrl: '/docs/website-builder#attaching-plans'
  },
  {
    title: 'Use Market Analysis for Better Plans',
    description: 'Include market research when generating business plans to get data-driven insights and competitive analysis.',
    actionLabel: 'Try Market Analysis',
    actionUrl: '/dashboard/business/market-analysis'
  },
  {
    title: 'Export Your Websites',
    description: 'Download your generated websites as HTML files. You can host them anywhere or edit them further with your favorite tools.',
    actionLabel: 'View Websites',
    actionUrl: '/dashboard/business/websites'
  },
  {
    title: 'Regenerate for Better Results',
    description: 'Not satisfied with the output? Try regenerating with slightly different inputs or more specific details for improved results.',
    actionLabel: 'Tips for Better Prompts',
    actionUrl: '/docs/tips#better-prompts'
  },
  {
    title: 'Save Your Favorite Results',
    description: 'Keep track of your best AI-generated content. You can revisit and edit any previous result from your dashboard.',
    actionLabel: 'View All Results',
    actionUrl: '/dashboard/business/ai-assistant'
  }
];

export default function TipsWidget() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

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
          Tip of the Day
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
          <span>Browse Documentation</span>
          <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}
