/**
 * Marketing Keywords persistence functions
 * CRUD for marketing_keywords collection in Firestore
 */
import type { MarketingKeyword } from './marketing.js';
/**
 * Save a keyword to tracking
 *
 * @param keyword - Keyword data to save
 * @returns Document ID
 */
export declare function saveKeyword(keyword: Omit<MarketingKeyword, 'id' | 'createdAt'>): Promise<string>;
/**
 * List keywords for a tenant/user, optionally filtered by campaignId
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @param campaignId - Optional campaign filter
 * @param limitCount - Max results (default 100)
 * @returns Array of keywords
 */
export declare function listKeywords(tenantId: string, userId: string, campaignId?: string, limitCount?: number): Promise<MarketingKeyword[]>;
/**
 * Delete a keyword
 *
 * @param keywordId - Document ID
 */
export declare function deleteKeyword(keywordId: string): Promise<void>;
//# sourceMappingURL=marketingKeywords.d.ts.map