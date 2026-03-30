'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import EmailContentEditor from './EmailContentEditor';
import type { EmailCampaign, MarketingSettings } from '@kimuntupro/db';
import { toast } from '@/components/ai/Toast';

interface CampaignEditorProps {
  tenantId: string;
  userId: string;
  settings: MarketingSettings;
  campaign: EmailCampaign | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function CampaignEditor({
  tenantId,
  userId,
  settings,
  campaign,
  onSave,
  onCancel,
}: CampaignEditorProps) {
  const [title, setTitle] = useState(campaign?.title || '');
  const [subject, setSubject] = useState(campaign?.subject || '');
  const [previewText, setPreviewText] = useState(campaign?.previewText || '');
  const [htmlContent, setHtmlContent] = useState(campaign?.htmlContent || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSubjects, setIsGeneratingSubjects] = useState(false);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);

  const isEditing = !!campaign;

  const handleSave = async () => {
    if (!title.trim() || !subject.trim()) {
      toast.error('Title and subject are required');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        // Update existing campaign
        const response = await fetch('/api/marketing/email/campaigns', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            userId,
            campaignId: campaign.id,
            mailchimpCampaignId: campaign.mailchimpCampaignId,
            title,
            subject,
            previewText,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update campaign');
        }

        // If content changed, update it separately
        if (htmlContent && htmlContent !== campaign.htmlContent) {
          const contentResponse = await fetch('/api/marketing/email/campaigns/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tenantId,
              userId,
              campaignId: campaign.id,
              mailchimpCampaignId: campaign.mailchimpCampaignId,
              htmlContent,
            }),
          });

          if (!contentResponse.ok) {
            toast.error('Campaign saved but content update failed. Check error log.');
          }
        }

        toast.success('Campaign updated!');
      } else {
        // Create new campaign
        const response = await fetch('/api/marketing/email/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            userId,
            title,
            subject,
            previewText,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to create campaign');
        }

        const data = await response.json();

        // Set content if we have any
        if (htmlContent) {
          await fetch('/api/marketing/email/campaigns/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tenantId,
              userId,
              campaignId: data.campaignId,
              mailchimpCampaignId: data.mailchimpCampaignId,
              htmlContent,
            }),
          });
        }

        toast.success('Campaign created!');
      }

      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSubjects = async () => {
    if (!title.trim()) {
      toast.error('Enter a campaign title first');
      return;
    }

    setIsGeneratingSubjects(true);
    try {
      const response = await fetch('/api/marketing/email/campaigns/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          userId,
          goal: title,
          generateSubjectLines: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate subject lines');

      const data = await response.json();
      setSubjectSuggestions(data.subjectLines || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate subject lines');
    } finally {
      setIsGeneratingSubjects(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Campaign' : 'New Campaign'}
          </h2>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEditing ? 'Update Campaign' : 'Create Campaign'}
            </>
          )}
        </button>
      </div>

      {/* Campaign details */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Campaign Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., March Newsletter"
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Subject Line *
            </label>
            <button
              onClick={handleGenerateSubjects}
              disabled={isGeneratingSubjects}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
            >
              {isGeneratingSubjects ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-500" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              AI Suggest
            </button>
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Don't miss our latest updates!"
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          {subjectSuggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              {subjectSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setSubject(s); setSubjectSuggestions([]); }}
                  className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/10 rounded hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Preview Text
          </label>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Short text that appears after the subject line in inbox"
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Email Content Editor */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Email Content</h3>
        <EmailContentEditor
          tenantId={tenantId}
          userId={userId}
          htmlContent={htmlContent}
          onContentChange={setHtmlContent}
          campaignTitle={title}
        />
      </div>
    </div>
  );
}
