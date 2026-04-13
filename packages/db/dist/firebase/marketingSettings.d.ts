/**
 * Marketing Settings persistence functions
 * Stores Ayrshare profile keys and connected platform info
 */
import type { MarketingSettings } from './marketing.js';
/**
 * Get marketing settings for a tenant/user
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @returns Settings or null if not found
 */
export declare function getMarketingSettings(tenantId: string, userId: string): Promise<MarketingSettings | null>;
/**
 * Update marketing settings (creates if not exists)
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @param updates - Partial settings data
 */
export declare function updateMarketingSettings(tenantId: string, userId: string, updates: Partial<MarketingSettings>): Promise<void>;
//# sourceMappingURL=marketingSettings.d.ts.map