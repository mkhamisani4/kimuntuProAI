/**
 * Logo persistence functions (client-side)
 * Stores and manages AI-generated logos in Firestore
 */
/**
 * Logo version history entry
 */
export interface LogoVersion {
    versionId: string;
    spec: any;
    label?: string;
    savedAt: Date;
}
/**
 * Logo document (matches Firestore schema)
 * Based on LogoDocument from @kimuntupro/shared
 */
export interface Logo {
    id?: string;
    tenantId: string;
    userId: string;
    businessPlanId: string | null;
    companyName: string;
    name?: string;
    brief: any;
    concepts: any[];
    currentSpec: any;
    isPrimary: boolean;
    versions?: LogoVersion[];
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
 * Create new logo document
 *
 * @param logo - Logo data to create
 * @returns Document ID
 */
export declare function createLogo(logo: Omit<Logo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
/**
 * Get logo by ID
 *
 * @param logoId - Document ID
 * @returns Logo or null if not found
 */
export declare function getLogo(logoId: string): Promise<Logo | null>;
/**
 * Update logo document
 *
 * @param logoId - Document ID
 * @param updates - Partial logo data to update
 */
export declare function updateLogo(logoId: string, updates: Partial<Logo>): Promise<void>;
/**
 * List logos for a tenant/user
 *
 * @param tenantId - Tenant ID
 * @param userId - Optional user ID filter
 * @param limitCount - Number of logos to fetch (default 20)
 * @returns Array of logos
 */
export declare function listLogos(tenantId: string, userId?: string, limitCount?: number): Promise<Logo[]>;
/**
 * Delete logo
 *
 * @param logoId - Document ID
 */
export declare function deleteLogo(logoId: string): Promise<void>;
/**
 * Get primary logo for a user
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @returns Primary logo or null if not found
 */
export declare function getPrimaryLogo(tenantId: string, userId: string): Promise<Logo | null>;
/**
 * Unset isPrimary for all logos belonging to a user
 * Only one logo can be primary per user
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 */
export declare function unsetPrimaryLogoForUser(tenantId: string, userId: string): Promise<void>;
/**
 * Save current logo spec as a new version
 *
 * @param logoId - Logo document ID
 * @param label - Optional label for this version
 * @returns Version ID
 */
export declare function saveLogoVersion(logoId: string, label?: string): Promise<string>;
/**
 * Get all versions for a logo
 *
 * @param logoId - Logo document ID
 * @returns Array of versions (most recent first)
 */
export declare function getLogoVersions(logoId: string): Promise<LogoVersion[]>;
/**
 * Restore a specific version to currentSpec
 *
 * @param logoId - Logo document ID
 * @param versionId - Version ID to restore
 */
export declare function restoreLogoVersion(logoId: string, versionId: string): Promise<void>;
/**
 * Delete a specific version
 *
 * @param logoId - Logo document ID
 * @param versionId - Version ID to delete
 */
export declare function deleteLogoVersion(logoId: string, versionId: string): Promise<void>;
//# sourceMappingURL=logos.d.ts.map