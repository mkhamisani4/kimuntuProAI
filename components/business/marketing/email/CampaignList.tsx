'use client';

import React, { useState } from 'react';
import {
  Plus,
  Send,
  Trash2,
  Edit3,
  Eye,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Calendar,
} from 'lucide-react';
import CampaignEditor from './CampaignEditor';
import CampaignPreview from './CampaignPreview';
import {
  listEmailErrorLogs,
  updateEmailErrorLog,
  type EmailCampaign,
  type MarketingSettings,
  type EmailErrorLog,
} from '@kimuntupro/db';
import { toast } from '@/components/ai/Toast';
import { fetchAuthed } from '@/lib/api/fetchAuthed';

interface CampaignListProps {
  tenantId: string;
  userId: string;
  campaigns: EmailCampaign[];
  settings: MarketingSettings;
  onDataChange: () => void;
  templateHtml?: string | null;
  onTemplateUsed?: () => void;
}

export default function CampaignList({
  tenantId,
  userId,
  campaigns,
  settings,
  onDataChange,
  templateHtml,
  onTemplateUsed,
}: CampaignListProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<EmailCampaign | null>(null);
  const [errorLogs, setErrorLogs] = useState<EmailErrorLog[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [initialHtml, setInitialHtml] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState<EmailCampaign | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // If a template was selected, open editor with it
  React.useEffect(() => {
    if (templateHtml) {
      setEditingCampaign(null);
      setInitialHtml(templateHtml);
      setShowEditor(true);
      onTemplateUsed?.();
    }
  }, [templateHtml]);

  const handleCreate = () => {
    setEditingCampaign(null);
    setInitialHtml(null);
    setShowEditor(true);
  };

  const handleDuplicate = (campaign: EmailCampaign) => {
    const duplicated = {
      ...campaign,
      id: undefined,
      mailchimpCampaignId: undefined,
      title: `${campaign.title} (Copy)`,
      status: 'draft',
    } as any;
    setEditingCampaign(duplicated);
    setInitialHtml(campaign.htmlContent || null);
    setShowEditor(true);
  };

  const handleScheduleConfirm = () => {
    if (!showScheduleModal || !scheduleDate || !scheduleTime) return;
    const scheduleAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    handleSend(showScheduleModal, scheduleAt);
    setShowScheduleModal(null);
    setScheduleDate('');
    setScheduleTime('');
  };

  const handleEdit = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign);
    setShowEditor(true);
  };

  const handleDelete = async (campaign: EmailCampaign) => {
    if (!confirm(`Delete campaign "${campaign.title}"?`)) return;

    try {
      const response = await fetchAuthed('/api/marketing/email/campaigns', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          userId,
          campaignId: campaign.id,
          mailchimpCampaignId: campaign.mailchimpCampaignId,
        }),
      });

      if (!response.ok) throw new Error('Failed to delete campaign');
      toast.success('Campaign deleted');
      onDataChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete campaign');
    }
  };

  const handleSend = async (campaign: EmailCampaign, scheduleAt?: string) => {
    const action = scheduleAt ? 'schedule' : 'send';
    if (!confirm(`${scheduleAt ? 'Schedule' : 'Send'} campaign "${campaign.title}"?`)) return;

    try {
      const response = await fetchAuthed('/api/marketing/email/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          userId,
          campaignId: campaign.id,
          mailchimpCampaignId: campaign.mailchimpCampaignId,
          scheduleAt,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${action} campaign`);
      }

      toast.success(`Campaign ${action === 'send' ? 'sent' : 'scheduled'}!`);
      onDataChange();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} campaign`);
    }
  };

  const loadErrors = async () => {
    try {
      const logs = await listEmailErrorLogs(tenantId, userId);
      setErrorLogs(logs);
      setShowErrors(true);
    } catch (error) {
      toast.error('Failed to load error logs');
    }
  };

  const handleRetry = async (errorLog: EmailErrorLog) => {
    if (!errorLog.id) return;

    try {
      await updateEmailErrorLog(errorLog.id, {
        status: 'retrying',
        retryCount: errorLog.retryCount + 1,
      });

      // Re-call the original operation
      let response: Response;
      switch (errorLog.operation) {
        case 'send':
        case 'schedule':
          response = await fetchAuthed('/api/marketing/email/campaigns/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tenantId,
              userId,
              campaignId: errorLog.emailCampaignId,
              mailchimpCampaignId: errorLog.requestPayload?.mailchimpCampaignId,
              scheduleAt: errorLog.requestPayload?.scheduleAt,
            }),
          });
          break;
        case 'content_update':
          response = await fetchAuthed('/api/marketing/email/campaigns/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tenantId,
              userId,
              campaignId: errorLog.emailCampaignId,
              mailchimpCampaignId: errorLog.requestPayload?.mailchimpCampaignId,
              htmlContent: errorLog.requestPayload?.htmlContent,
            }),
          });
          break;
        default:
          throw new Error('Unsupported retry operation');
      }

      if (response!.ok) {
        await updateEmailErrorLog(errorLog.id, {
          status: 'resolved',
          resolvedAt: new Date(),
        });
        toast.success('Retry successful!');
      } else {
        const nextRetry = new Date(Date.now() + Math.pow(2, errorLog.retryCount + 1) * 60000);
        const newStatus = errorLog.retryCount + 1 >= errorLog.maxRetries ? 'failed_permanent' : 'pending_retry';
        await updateEmailErrorLog(errorLog.id, {
          status: newStatus,
          nextRetryAt: newStatus === 'pending_retry' ? nextRetry : null,
        });
        toast.error('Retry failed');
      }

      loadErrors();
      onDataChange();
    } catch (error: any) {
      toast.error(error.message || 'Retry failed');
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-4 h-4 text-gray-400" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'sent': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      scheduled: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      sent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
      failed: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}>
        {statusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (showEditor) {
    return (
      <CampaignEditor
        tenantId={tenantId}
        userId={userId}
        settings={settings}
        campaign={editingCampaign}
        initialHtml={initialHtml}
        onSave={() => {
          setShowEditor(false);
          setInitialHtml(null);
          onDataChange();
        }}
        onCancel={() => {
          setShowEditor(false);
          setInitialHtml(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Email Campaigns</h2>
        <div className="flex gap-2">
          <button
            onClick={loadErrors}
            className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/10"
          >
            <AlertTriangle className="w-4 h-4" />
            Error Log
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Campaign cards */}
      {campaigns.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No email campaigns yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first email campaign to get started.</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{campaign.title}</h3>
                    {statusBadge(campaign.status)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Subject: {campaign.subject}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Recipients: {campaign.recipientCount}</span>
                    {campaign.status === 'sent' && (
                      <>
                        <span>Opens: {campaign.stats.uniqueOpens}</span>
                        <span>Clicks: {campaign.stats.uniqueClicks}</span>
                      </>
                    )}
                    {campaign.scheduledAt && (
                      <span>Scheduled: {new Date(campaign.scheduledAt).toLocaleString()}</span>
                    )}
                    {campaign.sentAt && (
                      <span>Sent: {new Date(campaign.sentAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  {campaign.htmlContent && (
                    <button
                      onClick={() => setPreviewCampaign(campaign)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(campaign)}
                    className="p-2 text-gray-400 hover:text-purple-500 transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {campaign.status === 'draft' && (
                    <>
                      <button
                        onClick={() => handleEdit(campaign)}
                        className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSend(campaign)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Send now"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowScheduleModal(campaign)}
                        className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
                        title="Schedule"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(campaign)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Log Modal */}
      {showErrors && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Error Log</h3>
              <button onClick={() => setShowErrors(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            {errorLogs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No errors recorded</p>
            ) : (
              <div className="space-y-3">
                {errorLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            log.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : log.status === 'failed_permanent'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}>
                            {log.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">{log.operation}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{log.errorMessage.substring(0, 200)}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Retries: {log.retryCount}/{log.maxRetries}
                          {log.createdAt && ` | ${new Date(log.createdAt).toLocaleString()}`}
                        </p>
                      </div>
                      {log.status === 'pending_retry' && (
                        <button
                          onClick={() => handleRetry(log)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Schedule Campaign</h3>
            <p className="text-sm text-gray-500 mb-4">Choose when to send &quot;{showScheduleModal.title}&quot;</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowScheduleModal(null); setScheduleDate(''); setScheduleTime(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleConfirm}
                disabled={!scheduleDate || !scheduleTime}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                Schedule Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewCampaign && (
        <CampaignPreview
          campaign={previewCampaign}
          onClose={() => setPreviewCampaign(null)}
        />
      )}
    </div>
  );
}
