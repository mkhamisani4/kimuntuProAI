/**
 * Marketing Campaigns persistence functions
 * CRUD for marketing_campaigns collection in Firestore
 */
import type { MarketingCampaign } from './marketing.js';
/**
 * Create a new marketing campaign
 *
 * @param campaign - Campaign data to create
 * @returns Document ID
 */
export declare function createCampaign(campaign: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
/**
 * Get a campaign by ID
 *
 * @param campaignId - Document ID
 * @returns Campaign or null if not found
 */
export declare function getCampaign(campaignId: string): Promise<MarketingCampaign | null>;
/**
 * List campaigns for a tenant/user
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @param limitCount - Max results (default 50)
 * @returns Array of campaigns
 */
export declare function listCampaigns(tenantId: string, userId: string, limitCount?: number): Promise<MarketingCampaign[]>;
/**
 * Update a campaign
 *
 * @param campaignId - Document ID
 * @param updates - Partial campaign data
 */
export declare function updateCampaign(campaignId: string, updates: Partial<MarketingCampaign>): Promise<void>;
/**
 * Delete a campaign
 *
 * @param campaignId - Document ID
 */
export declare function deleteCampaign(campaignId: string): Promise<void>;
//# sourceMappingURL=marketingCampaigns.d.ts.map