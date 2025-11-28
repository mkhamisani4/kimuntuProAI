/**
 * Website persistence functions
 * Stores and manages AI-generated websites in Firestore
 */

import {
  db,
  Timestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from './client.js';

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
export async function createWebsite(
  website: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'websites'), {
      ...website,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`[Firestore] Created website: ${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firestore] Failed to create website:', error);
    throw error;
  }
}

/**
 * Get website by ID
 *
 * @param websiteId - Document ID
 * @returns Website or null if not found
 */
export async function getWebsite(websiteId: string): Promise<Website | null> {
  try {
    const docRef = doc(db, 'websites', websiteId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
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
    console.error('[Firestore] Failed to get website:', error);
    throw error;
  }
}

/**
 * Recursively remove undefined values from an object
 * Firestore doesn't allow undefined values - they must be null or omitted
 */
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned;
  }

  return obj;
}

/**
 * Update website (for generation completion or edits)
 *
 * @param websiteId - Document ID
 * @param updates - Partial website data to update
 */
export async function updateWebsite(
  websiteId: string,
  updates: Partial<Website>
): Promise<void> {
  try {
    const docRef = doc(db, 'websites', websiteId);

    // Convert Date objects to Timestamps for Firestore
    let firestoreUpdates: any = { ...updates };

    if (firestoreUpdates.generationMetadata?.generatedAt instanceof Date) {
      firestoreUpdates.generationMetadata = {
        ...firestoreUpdates.generationMetadata,
        generatedAt: Timestamp.fromDate(firestoreUpdates.generationMetadata.generatedAt),
      };
    }

    // Remove undefined values (Firestore doesn't accept them)
    firestoreUpdates = removeUndefined(firestoreUpdates);

    await updateDoc(docRef, {
      ...firestoreUpdates,
      updatedAt: Timestamp.now(),
    });

    console.log(`[Firestore] Updated website: ${websiteId}`);
  } catch (error: any) {
    console.error('[Firestore] Failed to update website:', error);
    throw error;
  }
}

/**
 * List websites for a tenant/user
 *
 * @param tenantId - Tenant ID
 * @param userId - Optional user ID filter
 * @param limitCount - Number of websites to fetch (default 20)
 * @returns Array of websites
 */
export async function listWebsites(
  tenantId: string,
  userId?: string,
  limitCount: number = 20
): Promise<Website[]> {
  try {
    let q;

    if (userId) {
      q = query(
        collection(db, 'websites'),
        where('tenantId', '==', tenantId),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, 'websites'),
        where('tenantId', '==', tenantId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    const websites = snapshot.docs
      .map((doc) => {
        const rawData = doc.data();
        if (!rawData) return null;
        const data = rawData as any;
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

    console.log(`[Firestore] Fetched ${websites.length} websites for tenant ${tenantId}`);
    return websites;
  } catch (error: any) {
    console.error('[Firestore] Failed to list websites:', error);
    throw error;
  }
}

/**
 * Delete website
 *
 * @param websiteId - Document ID
 */
export async function deleteWebsite(websiteId: string): Promise<void> {
  try {
    const docRef = doc(db, 'websites', websiteId);
    await deleteDoc(docRef);

    console.log(`[Firestore] Deleted website: ${websiteId}`);
  } catch (error: any) {
    console.error('[Firestore] Failed to delete website:', error);
    throw error;
  }
}
