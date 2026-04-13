/**
 * Server-side assistant results persistence functions
 * Uses Firebase Admin SDK for API routes
 * Bypasses Firestore security rules
 */
import 'server-only';
import type { AssistantResult } from './assistantResults.js';
/**
 * Save assistant result (server-side with admin privileges)
 * Falls back to client SDK in development mode
 *
 * @param result - Assistant result to save
 * @returns Document ID
 */
export declare function saveAssistantResultAdmin(result: Omit<AssistantResult, 'id' | 'createdAt'>): Promise<string>;
/**
 * Get recent assistant results for a tenant (server-side)
 * Falls back to client SDK in development mode
 *
 * @param tenantId - Tenant ID
 * @param limitCount - Number of results to fetch (default 5)
 * @returns Array of assistant results
 */
export declare function getRecentResultsAdmin(tenantId: string, limitCount?: number): Promise<AssistantResult[]>;
/**
 * Get a specific assistant result by ID (server-side)
 * Falls back to client SDK in development mode
 *
 * @param resultId - Document ID
 * @returns Assistant result or null
 */
export declare function getAssistantResultAdmin(resultId: string): Promise<AssistantResult | null>;
/**
 * Delete assistant result (server-side with admin SDK)
 * Falls back to client SDK in development mode
 *
 * @param resultId - Result document ID
 */
export declare function deleteAssistantResultAdmin(resultId: string): Promise<void>;
//# sourceMappingURL=assistantResults.server.d.ts.map