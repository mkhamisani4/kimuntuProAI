/**
 * Firebase Storage functions
 * Handles logo uploads and deletions for Website Builder
 */
/**
 * Upload logo to Firebase Storage
 *
 * @param file - File object from form input
 * @param tenantId - Tenant ID
 * @param websiteId - Website ID (for folder organization)
 * @returns Download URL
 */
export declare function uploadLogo(file: File, tenantId: string, websiteId: string): Promise<string>;
/**
 * Delete logo from Firebase Storage
 *
 * @param logoUrl - Full download URL of the logo
 */
export declare function deleteLogo(logoUrl: string): Promise<void>;
//# sourceMappingURL=storage.d.ts.map