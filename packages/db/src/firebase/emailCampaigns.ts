/**
 * Email Campaigns persistence functions
 * CRUD for email_campaigns collection in Firestore
 */

import {
  db,
  Timestamp,
  collection,
  addDoc,
  query,
  where,
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from './client';

import type { EmailCampaign } from './marketing';

/**
 * Create a new email campaign
 */
export async function createEmailCampaign(
  campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'email_campaigns'), {
      ...campaign,
      scheduledAt: campaign.scheduledAt ? Timestamp.fromDate(campaign.scheduledAt) : null,
      sentAt: campaign.sentAt ? Timestamp.fromDate(campaign.sentAt) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`[Firestore] Created email campaign: ${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firestore] Failed to create email campaign:', error);
    throw error;
  }
}

/**
 * Get an email campaign by ID
 */
export async function getEmailCampaign(campaignId: string): Promise<EmailCampaign | null> {
  try {
    const docRef = doc(db, 'email_campaigns', campaignId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      scheduledAt: data.scheduledAt?.toDate() ?? null,
      sentAt: data.sentAt?.toDate() ?? null,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as EmailCampaign;
  } catch (error: any) {
    console.error('[Firestore] Failed to get email campaign:', error);
    throw error;
  }
}

/**
 * List email campaigns for a tenant/user
 */
export async function listEmailCampaigns(
  tenantId: string,
  userId: string,
  limitCount: number = 50
): Promise<EmailCampaign[]> {
  try {
    const q = query(
      collection(db, 'email_campaigns'),
      where('tenantId', '==', tenantId),
      where('userId', '==', userId),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const campaigns = snapshot.docs
      .map((d) => {
        const data = d.data();
        if (!data) return null;
        return {
          id: d.id,
          ...data,
          scheduledAt: data.scheduledAt?.toDate() ?? null,
          sentAt: data.sentAt?.toDate() ?? null,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as EmailCampaign;
      })
      .filter((c): c is EmailCampaign => c !== null)
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() ?? 0;
        const bTime = b.createdAt?.getTime() ?? 0;
        return bTime - aTime;
      });

    console.log(`[Firestore] Fetched ${campaigns.length} email campaigns for tenant ${tenantId}`);
    return campaigns;
  } catch (error: any) {
    console.error('[Firestore] Failed to list email campaigns:', error);
    throw error;
  }
}

/**
 * Find an email campaign by Mailchimp campaign ID
 */
export async function getEmailCampaignByMailchimpId(
  mailchimpCampaignId: string
): Promise<EmailCampaign | null> {
  try {
    const q = query(
      collection(db, 'email_campaigns'),
      where('mailchimpCampaignId', '==', mailchimpCampaignId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const d = snapshot.docs[0];
    const data = d.data();
    return {
      id: d.id,
      ...data,
      scheduledAt: data.scheduledAt?.toDate() ?? null,
      sentAt: data.sentAt?.toDate() ?? null,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as EmailCampaign;
  } catch (error: any) {
    console.error('[Firestore] Failed to find email campaign by Mailchimp ID:', error);
    throw error;
  }
}

/**
 * Update an email campaign
 */
export async function updateEmailCampaign(
  campaignId: string,
  updates: Partial<EmailCampaign>
): Promise<void> {
  try {
    const docRef = doc(db, 'email_campaigns', campaignId);
    const updateData: Record<string, any> = { ...updates, updatedAt: Timestamp.now() };

    if (updates.scheduledAt !== undefined) {
      updateData.scheduledAt = updates.scheduledAt ? Timestamp.fromDate(updates.scheduledAt) : null;
    }
    if (updates.sentAt !== undefined) {
      updateData.sentAt = updates.sentAt ? Timestamp.fromDate(updates.sentAt) : null;
    }

    await updateDoc(docRef, updateData);
    console.log(`[Firestore] Updated email campaign: ${campaignId}`);
  } catch (error: any) {
    console.error('[Firestore] Failed to update email campaign:', error);
    throw error;
  }
}

/**
 * Delete an email campaign
 */
export async function deleteEmailCampaign(campaignId: string): Promise<void> {
  try {
    const docRef = doc(db, 'email_campaigns', campaignId);
    await deleteDoc(docRef);
    console.log(`[Firestore] Deleted email campaign: ${campaignId}`);
  } catch (error: any) {
    console.error('[Firestore] Failed to delete email campaign:', error);
    throw error;
  }
}
