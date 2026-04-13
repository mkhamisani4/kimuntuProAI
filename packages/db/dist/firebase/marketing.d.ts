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
    metrics: {
        views: number;
        clicks: number;
    } | null;
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
    updatedAt?: Date;
}
//# sourceMappingURL=marketing.d.ts.map