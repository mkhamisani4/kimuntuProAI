/**
 * Marketing Campaigns persistence functions
 * CRUD for marketing_campaigns collection in Firestore
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
} from './client';

import type { MarketingCampaign } from './marketing';

/**
 * Create a new marketing campaign
 *
 * @param campaign - Campaign data to create
 * @returns Document ID
 */
export async function createCampaign(
  campaign: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'marketing_campaigns'), {
      ...campaign,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`[Firestore] Created marketing campaign: ${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firestore] Failed to create marketing campaign:', error);
    throw error;
  }
}

/**
 * Get a campaign by ID
 *
 * @param campaignId - Document ID
 * @returns Campaign or null if not found
 */
export async function getCampaign(campaignId: string): Promise<MarketingCampaign | null> {
  try {
    const docRef = doc(db, 'marketing_campaigns', campaignId);
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
    } as MarketingCampaign;
  } catch (error: any) {
    console.error('[Firestore] Failed to get marketing campaign:', error);
    throw error;
  }
}

/**
 * List campaigns for a tenant/user
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @param limitCount - Max results (default 50)
 * @returns Array of campaigns
 */
export async function listCampaigns(
  tenantId: string,
  userId: string,
  limitCount: number = 50
): Promise<MarketingCampaign[]> {
  try {
    const q = query(
      collection(db, 'marketing_campaigns'),
      where('tenantId', '==', tenantId),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const campaigns = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        if (!data) return null;
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as MarketingCampaign;
      })
      .filter((c): c is MarketingCampaign => c !== null);

    console.log(`[Firestore] Fetched ${campaigns.length} marketing campaigns for tenant ${tenantId}`);
    return campaigns;
  } catch (error: any) {
    console.error('[Firestore] Failed to list marketing campaigns:', error);
    throw error;
  }
}

/**
 * Update a campaign
 *
 * @param campaignId - Document ID
 * @param updates - Partial campaign data
 */
export async function updateCampaign(
  campaignId: string,
  updates: Partial<MarketingCampaign>
): Promise<void> {
  try {
    const docRef = doc(db, 'marketing_campaigns', campaignId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    console.log(`[Firestore] Updated marketing campaign: ${campaignId}`);
  } catch (error: any) {
    console.error('[Firestore] Failed to update marketing campaign:', error);
    throw error;
  }
}

/**
 * Delete a campaign
 *
 * @param campaignId - Document ID
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  try {
    const docRef = doc(db, 'marketing_campaigns', campaignId);
    await deleteDoc(docRef);

    console.log(`[Firestore] Deleted marketing campaign: ${campaignId}`);
  } catch (error: any) {
    console.error('[Firestore] Failed to delete marketing campaign:', error);
    throw error;
  }
}
