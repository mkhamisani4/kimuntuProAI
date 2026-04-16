/**
 * Website persistence functions
 * Stores and manages AI-generated websites in Firestore
 */
/**
 * Website document (matches Firestore schema)
 */
export interface Website {
    id?: string;
    tenantId: string;
    userId: string;
    businessPlanId: string | null;
    hasPlanAttached: boolean;
    wizardInput: any;
    completedInput: any | null;
    siteSpec: any | null;
    siteCode: string | null;
    title: string;
    status: 'draft' | 'generating' | 'ready' | 'failed';
    errorMessage: string | null;
    generationMetadata: {
        model: string;
        tokensUsed: number;
        latencyMs: number;
        costCents: number;
        generatedAt: Date;
    } | null;
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * Create new website (draft)
 *
 * @param website - Website data to create
 * @returns Document ID
 */
export declare function createWebsite(website: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
/**
 * Get website by ID
 *
 * @param websiteId - Document ID
 * @returns Website or null if not found
 */
export declare function getWebsite(websiteId: string): Promise<Website | null>;
/**
 * Update website (for generation completion or edits)
 *
 * @param websiteId - Document ID
 * @param updates - Partial website data to update
 */
export declare function updateWebsite(websiteId: string, updates: Partial<Website>): Promise<void>;
/**
 * List websites for a tenant/user
 *
 * @param tenantId - Tenant ID
 * @param userId - Optional user ID filter
 * @param limitCount - Number of websites to fetch (default 20)
 * @returns Array of websites
 */
export declare function listWebsites(tenantId: string, userId?: string, limitCount?: number): Promise<Website[]>;
/**
 * Delete website
 *
 * @param websiteId - Document ID
 */
export declare function deleteWebsite(websiteId: string): Promise<void>;
//# sourceMappingURL=websites.d.ts.map