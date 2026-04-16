/**
 * Server-side admin functions for logo management
 * Use ONLY in API routes (not client-side)
 */
import 'server-only';
import type { Logo } from './logos.js';
/**
 * Create logo (server-side with admin SDK)
 * Falls back to client SDK in development mode
 *
 * @param logo - Logo data to create
 * @returns Document ID
 */
export declare function createLogoAdmin(logo: Omit<Logo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
/**
 * Get logo by ID (server-side)
 * Falls back to client SDK in development mode
 *
 * @param logoId - Document ID
 * @returns Logo or null if not found
 */
export declare function getLogoAdmin(logoId: string): Promise<Logo | null>;
/**
 * Update logo (server-side)
 * Falls back to client SDK in development mode
 *
 * @param logoId - Document ID
 * @param updates - Partial logo data to update
 */
export declare function updateLogoAdmin(logoId: string, updates: Partial<Logo>): Promise<void>;
/**
 * Delete logo (server-side)
 * Falls back to client SDK in development mode
 *
 * @param logoId - Document ID
 */
export declare function deleteLogoAdmin(logoId: string): Promise<void>;
/**
 * Unset isPrimary for all logos belonging to a user
 * DECISION: Only one logo can be primary per user
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 */
export declare function unsetPrimaryLogoForUser(tenantId: string, userId: string): Promise<void>;
//# sourceMappingURL=logos.server.d.ts.map