'use client';

import React from 'react';
import { X, Mail } from 'lucide-react';
import type { EmailCampaign } from '@kimuntupro/db';

interface CampaignPreviewProps {
  campaign: EmailCampaign;
  onClose: () => void;
}

export default function CampaignPreview({ campaign, onClose }: CampaignPreviewProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{campaign.title}</h3>
              <p className="text-sm text-gray-500">Subject: {campaign.subject}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden">
          {campaign.htmlContent ? (
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}</style></head><body>${campaign.htmlContent}</body></html>`}
              className="w-full h-[70vh] border-0"
              sandbox="allow-same-origin"
              title="Email preview"
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              No content to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
