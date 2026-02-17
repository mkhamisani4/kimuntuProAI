/**
 * Marketing Keywords persistence functions
 * CRUD for marketing_keywords collection in Firestore
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
  doc,
  deleteDoc,
} from './client.js';

import type { MarketingKeyword } from './marketing.js';

/**
 * Save a keyword to tracking
 *
 * @param keyword - Keyword data to save
 * @returns Document ID
 */
export async function saveKeyword(
  keyword: Omit<MarketingKeyword, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'marketing_keywords'), {
      ...keyword,
      createdAt: Timestamp.now(),
    });

    console.log(`[Firestore] Saved marketing keyword: ${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firestore] Failed to save marketing keyword:', error);
    throw error;
  }
}

/**
 * List keywords for a tenant/user, optionally filtered by campaignId
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @param campaignId - Optional campaign filter
 * @param limitCount - Max results (default 100)
 * @returns Array of keywords
 */
export async function listKeywords(
  tenantId: string,
  userId: string,
  campaignId?: string,
  limitCount: number = 100
): Promise<MarketingKeyword[]> {
  try {
    const constraints = [
      where('tenantId', '==', tenantId),
      where('userId', '==', userId),
    ];

    if (campaignId) {
      constraints.push(where('campaignId', '==', campaignId));
    }

    const q = query(
      collection(db, 'marketing_keywords'),
      ...constraints,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const keywords = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        if (!data) return null;
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        } as MarketingKeyword;
      })
      .filter((k): k is MarketingKeyword => k !== null);

    console.log(`[Firestore] Fetched ${keywords.length} marketing keywords for tenant ${tenantId}`);
    return keywords;
  } catch (error: any) {
    console.error('[Firestore] Failed to list marketing keywords:', error);
    throw error;
  }
}

/**
 * Delete a keyword
 *
 * @param keywordId - Document ID
 */
export async function deleteKeyword(keywordId: string): Promise<void> {
  try {
    const docRef = doc(db, 'marketing_keywords', keywordId);
    await deleteDoc(docRef);

    console.log(`[Firestore] Deleted marketing keyword: ${keywordId}`);
  } catch (error: any) {
    console.error('[Firestore] Failed to delete marketing keyword:', error);
    throw error;
  }
}
