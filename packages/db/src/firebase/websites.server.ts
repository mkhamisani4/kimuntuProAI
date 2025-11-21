/**
 * Server-side website persistence functions
 * Uses Firebase Admin SDK for API routes
 * Bypasses Firestore security rules
 */

import 'server-only';
import { adminDb, isAdminAvailable } from './admin.js';
import type { Website } from './websites.js';
import { Timestamp } from 'firebase-admin/firestore';

// Fallback to client SDK when admin is not available (development mode)
import {
  createWebsite as createWebsiteClient,
  updateWebsite as updateWebsiteClient,
  getWebsite as getWebsiteClient,
  listWebsites as listWebsitesClient,
  deleteWebsite as deleteWebsiteClient
} from './websites.js';

/**
 * Create new website (server-side with admin privileges)
 * Falls back to client SDK in development mode
 *
 * @param website - Website data to create
 * @returns Document ID
 */
export async function createWebsiteAdmin(
  website: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    console.log('[Firestore] Using client SDK (development mode)');
    return await createWebsiteClient(website);
  }

  // Production mode: use admin SDK
  try {
    const docRef = await adminDb!.collection('websites').add({
      ...website,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`[Firestore Admin] Created website: ${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to create website:', error);
    throw error;
  }
}

/**
 * Get website by ID (server-side)
 * Falls back to client SDK in development mode
 *
 * @param websiteId - Document ID
 * @returns Website or null if not found
 */
export async function getWebsiteAdmin(websiteId: string): Promise<Website | null> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    return await getWebsiteClient(websiteId);
  }

  // Production mode: use admin SDK
  try {
    const docRef = adminDb!.collection('websites').doc(websiteId);
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
      updatedAt: data.updatedAt?.toDate(),
      generationMetadata: data.generationMetadata
        ? {
            ...data.generationMetadata,
            generatedAt: data.generationMetadata.generatedAt?.toDate?.() || data.generationMetadata.generatedAt,
          }
        : null,
    } as Website;
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to get website:', error);
    throw error;
  }
}

/**
 * Update website (server-side)
 * Falls back to client SDK in development mode
 *
 * @param websiteId - Document ID
 * @param updates - Partial website data to update
 */
export async function updateWebsiteAdmin(
  websiteId: string,
  updates: Partial<Website>
): Promise<void> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    return await updateWebsiteClient(websiteId, updates);
  }

  // Production mode: use admin SDK
  try {
    const docRef = adminDb!.collection('websites').doc(websiteId);

    // Convert Date objects to Timestamps for Firestore
    const firestoreUpdates: any = { ...updates };

    if (firestoreUpdates.generationMetadata?.generatedAt instanceof Date) {
      firestoreUpdates.generationMetadata = {
        ...firestoreUpdates.generationMetadata,
        generatedAt: Timestamp.fromDate(firestoreUpdates.generationMetadata.generatedAt),
      };
    }

    await docRef.update({
      ...firestoreUpdates,
      updatedAt: Timestamp.now(),
    });

    console.log(`[Firestore Admin] Updated website: ${websiteId}`);
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to update website:', error);
    throw error;
  }
}

/**
 * List websites for a tenant/user (server-side)
 * Falls back to client SDK in development mode
 *
 * @param tenantId - Tenant ID
 * @param userId - Optional user ID filter
 * @param limitCount - Number of websites to fetch (default 20)
 * @returns Array of websites
 */
export async function listWebsitesAdmin(
  tenantId: string,
  userId?: string,
  limitCount: number = 20
): Promise<Website[]> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    return await listWebsitesClient(tenantId, userId, limitCount);
  }

  // Production mode: use admin SDK
  try {
    let query = adminDb!.collection('websites')
      .where('tenantId', '==', tenantId);

    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    const websites = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        if (!data) return null;

        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          generationMetadata: data.generationMetadata
            ? {
                ...data.generationMetadata,
                generatedAt: data.generationMetadata.generatedAt?.toDate?.() || data.generationMetadata.generatedAt,
              }
            : null,
        } as Website;
      })
      .filter((website): website is Website => website !== null);

    console.log(`[Firestore Admin] Fetched ${websites.length} websites for tenant ${tenantId}`);
    return websites;
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to list websites:', error);
    throw error;
  }
}

/**
 * Delete website (server-side)
 * Falls back to client SDK in development mode
 *
 * @param websiteId - Document ID
 */
export async function deleteWebsiteAdmin(websiteId: string): Promise<void> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    return await deleteWebsiteClient(websiteId);
  }

  // Production mode: use admin SDK
  try {
    const docRef = adminDb!.collection('websites').doc(websiteId);
    await docRef.delete();

    console.log(`[Firestore Admin] Deleted website: ${websiteId}`);
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to delete website:', error);
    throw error;
  }
}
