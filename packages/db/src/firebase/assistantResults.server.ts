/**
 * Server-side assistant results persistence functions
 * Uses Firebase Admin SDK for API routes
 * Bypasses Firestore security rules
 */

import 'server-only';
import { adminDb, isAdminAvailable } from './admin.js';
import type { AssistantResult } from './assistantResults.js';
import { Timestamp } from 'firebase-admin/firestore';

// Fallback to client SDK when admin is not available (development mode)
import {
  saveAssistantResult as saveAssistantResultClient,
  getRecentResults as getRecentResultsClient,
  getAssistantResult as getAssistantResultClient,
  deleteAssistantResult as deleteAssistantResultClient,
} from './assistantResults.js';

/**
 * Save assistant result (server-side with admin privileges)
 * Falls back to client SDK in development mode
 *
 * @param result - Assistant result to save
 * @returns Document ID
 */
export async function saveAssistantResultAdmin(
  result: Omit<AssistantResult, 'id' | 'createdAt'>
): Promise<string> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    console.log('[Firestore] Using client SDK (development mode)');
    return await saveAssistantResultClient(result);
  }

  // Production mode: use admin SDK
  try {
    const docRef = await adminDb!.collection('assistant_results').add({
      ...result,
      createdAt: Timestamp.now(),
    });

    console.log(`[Firestore Admin] Saved assistant result: ${docRef.id} (${result.assistant})`);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to save assistant result:', error);
    throw error;
  }
}

/**
 * Get recent assistant results for a tenant (server-side)
 * Falls back to client SDK in development mode
 *
 * @param tenantId - Tenant ID
 * @param limitCount - Number of results to fetch (default 5)
 * @returns Array of assistant results
 */
export async function getRecentResultsAdmin(
  tenantId: string,
  limitCount: number = 5
): Promise<AssistantResult[]> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    return await getRecentResultsClient(tenantId, limitCount);
  }

  // Production mode: use admin SDK
  try {
    const snapshot = await adminDb!
      .collection('assistant_results')
      .where('tenantId', '==', tenantId)
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    const results = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as AssistantResult;
    });

    console.log(`[Firestore Admin] Fetched ${results.length} recent results for tenant ${tenantId}`);
    return results;
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to get recent results:', error);
    throw error;
  }
}

/**
 * Get a specific assistant result by ID (server-side)
 * Falls back to client SDK in development mode
 *
 * @param resultId - Document ID
 * @returns Assistant result or null
 */
export async function getAssistantResultAdmin(resultId: string): Promise<AssistantResult | null> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    return await getAssistantResultClient(resultId);
  }

  // Production mode: use admin SDK
  try {
    const docRef = adminDb!.collection('assistant_results').doc(resultId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }

    const data = docSnap.data();
    if (!data) {
      return null;
    }

    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    } as AssistantResult;
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to get assistant result:', error);
    throw error;
  }
}

/**
 * Delete assistant result (server-side with admin SDK)
 * Falls back to client SDK in development mode
 *
 * @param resultId - Result document ID
 */
export async function deleteAssistantResultAdmin(resultId: string): Promise<void> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    return await deleteAssistantResultClient(resultId);
  }

  // Production mode: use admin SDK
  try {
    const docRef = adminDb!.collection('assistant_results').doc(resultId);
    await docRef.delete();

    console.log(`[Firestore Admin] Deleted assistant result: ${resultId}`);
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to delete assistant result:', error);
    throw error;
  }
}
