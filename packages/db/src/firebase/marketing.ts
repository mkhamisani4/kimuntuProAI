/**
 * Marketing Suite - Shared Types
 * TypeScript interfaces for all marketing collections
 */

export interface MarketingCampaign {
  id?: string;
  tenantId: string;
  userId: string;
  title: string;
  description: string;
  status: 'active' | 'paused' | 'ended';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MarketingPost {
  id?: string;
  tenantId: string;
  userId: string;
  campaignId: string | null;
  ayrshareId: string | null;
  content: string;
  mediaUrl: string | null;
  platforms: string[];
  scheduledAt: Date | null;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  metrics: { views: number; clicks: number } | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MarketingKeyword {
  id?: string;
  tenantId: string;
  userId: string;
  campaignId: string | null;
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  createdAt?: Date;
}

export interface MarketingSettings {
  id?: string;
  tenantId: string;
  userId: string;
  ayrshareProfileKey: string | null;
  connectedPlatforms: string[];
  mailchimpAccessToken: string | null;
  mailchimpServer: string | null;
  mailchimpListId: string | null;
  mailchimpReplyTo: string | null;
  mailchimpFromName: string | null;
  updatedAt?: Date;
}

export interface EmailCampaign {
  id?: string;
  tenantId: string;
  userId: string;
  mailchimpCampaignId: string;
  title: string;
  subject: string;
  previewText: string;
  htmlContent: string;
  listId: string;
  segmentId?: string | null;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledAt: Date | null;
  sentAt: Date | null;
  recipientCount: number;
  stats: {
    opens: number;
    uniqueOpens: number;
    clicks: number;
    uniqueClicks: number;
    bounces: number;
    unsubscribes: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailAnalyticsEvent {
  id?: string;
  tenantId: string;
  userId: string;
  emailCampaignId: string;
  mailchimpCampaignId: string;
  eventType: 'open' | 'click' | 'bounce' | 'unsubscribe' | 'complaint';
  email: string;
  url?: string;
  timestamp: Date;
  raw?: Record<string, any>;
  createdAt?: Date;
}

export interface EmailErrorLog {
  id?: string;
  tenantId: string;
  userId: string;
  emailCampaignId: string;
  operation: 'create' | 'send' | 'schedule' | 'content_update' | 'batch_import';
  errorCode: string;
  errorMessage: string;
  requestPayload?: Record<string, any>;
  retryCount: number;
  maxRetries: number;
  status: 'pending_retry' | 'retrying' | 'resolved' | 'failed_permanent';
  nextRetryAt: Date | null;
  resolvedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
