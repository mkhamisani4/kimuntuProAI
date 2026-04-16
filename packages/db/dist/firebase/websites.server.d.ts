/**
 * Server-side website persistence functions
 * Uses Firebase Admin SDK for API routes
 * Bypasses Firestore security rules
 */
import 'server-only';
import type { Website } from './websites.js';
/**
 * Create new website (server-side with admin privileges)
 * Falls back to client SDK in development mode
 *
 * @param website - Website data to create
 * @returns Document ID
 */
export declare function createWebsiteAdmin(website: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
/**
 * Get website by ID (server-side)
 * Falls back to client SDK in development mode
 *
 * @param websiteId - Document ID
 * @returns Website or null if not found
 */
export declare function getWebsiteAdmin(websiteId: string): Promise<Website | null>;
/**
 * Update website (server-side)
 * Falls back to client SDK in development mode
 *
 * @param websiteId - Document ID
 * @param updates - Partial website data to update
 */
export declare function updateWebsiteAdmin(websiteId: string, updates: Partial<Website>): Promise<void>;
/**
 * List websites for a tenant/user (server-side)
 * Falls back to client SDK in development mode
 *
 * @param tenantId - Tenant ID
 * @param userId - Optional user ID filter
 * @param limitCount - Number of websites to fetch (default 20)
 * @returns Array of websites
 */
export declare function listWebsitesAdmin(tenantId: string, userId?: string, limitCount?: number): Promise<Website[]>;
/**
 * Delete website (server-side)
 * Falls back to client SDK in development mode
 *
 * @param websiteId - Document ID
 */
export declare function deleteWebsiteAdmin(websiteId: string): Promise<void>;
//# sourceMappingURL=websites.server.d.ts.map