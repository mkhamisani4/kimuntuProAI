'use client';

import React, { useState, useCallback } from 'react';
import { Sparkles, Image, Code, Eye } from 'lucide-react';
import { toast } from '@/components/ai/Toast';

interface EmailContentEditorProps {
  tenantId: string;
  userId: string;
  htmlContent: string;
  onContentChange: (html: string) => void;
  campaignTitle: string;
}

export default function EmailContentEditor({
  tenantId,
  userId,
  htmlContent,
  onContentChange,
  campaignTitle,
}: EmailContentEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const handleAIGenerate = async () => {
    if (!aiGoal.trim() && !campaignTitle.trim()) {
      toast.error('Enter a campaign goal or title first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/marketing/email/campaigns/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          userId,
          subject: campaignTitle,
          goal: aiGoal || campaignTitle,
          tone: aiTone,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data = await response.json();
      onContentChange(data.htmlContent);
      setShowAiPanel(false);
      toast.success('Email content generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const { uploadPostMedia } = await import('@kimuntupro/db');
        const url = await uploadPostMedia(file, tenantId, `email_${Date.now()}`);
        const imgTag = `<img src="${url}" alt="Email image" style="max-width: 100%; height: auto;" />`;
        onContentChange(htmlContent + imgTag);
        toast.success('Image uploaded!');
      } catch (error: any) {
        toast.error('Failed to upload image');
      }
    };
    input.click();
  }, [htmlContent, onContentChange, tenantId]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowAiPanel(!showAiPanel)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            showAiPanel
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              : 'text-purple-600 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/10'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Generate
        </button>
        <button
          onClick={handleImageUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
        >
          <Image className="w-4 h-4" />
          Add Image
        </button>
        <div className="flex-1" />
        <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${
              viewMode === 'edit'
                ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <Code className="w-3 h-3" />
            HTML
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${
              viewMode === 'preview'
                ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
        </div>
      </div>

      {/* AI Generation Panel */}
      {showAiPanel && (
        <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">
              Campaign Goal / Description
            </label>
            <textarea
              value={aiGoal}
              onChange={(e) => setAiGoal(e.target.value)}
              placeholder="e.g., Announce our new product launch and drive traffic to the landing page"
              className="w-full px-3 py-2 border border-purple-200 dark:border-purple-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-20 resize-none"
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">
                Tone
              </label>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                className="w-full px-3 py-2 border border-purple-200 dark:border-purple-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual & Friendly</option>
                <option value="urgent">Urgent / FOMO</option>
                <option value="educational">Educational</option>
                <option value="promotional">Promotional</option>
              </select>
            </div>
            <button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Editor / Preview */}
      {viewMode === 'edit' ? (
        <textarea
          value={htmlContent}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="<h1>Your email content here...</h1>\n<p>Write HTML or use AI Generate to create content.</p>"
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[300px] resize-y"
          spellCheck={false}
        />
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden min-h-[300px] bg-white">
          {htmlContent ? (
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}</style></head><body>${htmlContent}</body></html>`}
              className="w-full min-h-[300px] border-0"
              sandbox="allow-same-origin"
              title="Email preview"
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No content to preview
            </div>
          )}
        </div>
      )}
    </div>
  );
}
