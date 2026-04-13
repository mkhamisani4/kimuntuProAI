/**
 * Marketing Settings persistence functions
 * Stores Ayrshare profile keys and connected platform info
 */

import {
  db,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from './client';

import type { MarketingSettings } from './marketing';

/**
 * Get marketing settings for a tenant/user
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @returns Settings or null if not found
 */
export async function getMarketingSettings(
  tenantId: string,
  userId: string
): Promise<MarketingSettings | null> {
  try {
    const q = query(
      collection(db, 'marketing_settings'),
      where('tenantId', '==', tenantId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      updatedAt: data.updatedAt?.toDate(),
    } as MarketingSettings;
  } catch (error: any) {
    console.error('[Firestore] Failed to get marketing settings:', error);
    throw error;
  }
}

/**
 * Update marketing settings (creates if not exists)
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @param updates - Partial settings data
 */
export async function updateMarketingSettings(
  tenantId: string,
  userId: string,
  updates: Partial<MarketingSettings>
): Promise<void> {
  try {
    // Check if settings doc already exists
    const existing = await getMarketingSettings(tenantId, userId);

    if (existing?.id) {
      const docRef = doc(db, 'marketing_settings', existing.id);
      await setDoc(docRef, {
        ...updates,
        tenantId,
        userId,
        updatedAt: Timestamp.now(),
      }, { merge: true });

      console.log(`[Firestore] Updated marketing settings: ${existing.id}`);
    } else {
      // Create new settings doc with a deterministic ID
      const docId = `${tenantId}_${userId}`;
      const docRef = doc(db, 'marketing_settings', docId);
      await setDoc(docRef, {
        tenantId,
        userId,
        ayrshareProfileKey: null,
        connectedPlatforms: [],
        mailchimpAccessToken: null,
        mailchimpServer: null,
        mailchimpListId: null,
        ...updates,
        updatedAt: Timestamp.now(),
      });

      console.log(`[Firestore] Created marketing settings: ${docId}`);
    }
  } catch (error: any) {
    console.error('[Firestore] Failed to update marketing settings:', error);
    throw error;
  }
}
