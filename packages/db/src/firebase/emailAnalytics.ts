/**
 * Email Analytics persistence functions
 * Write events + query by campaignId and eventType
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
} from './client';

import type { EmailAnalyticsEvent } from './marketing';

/**
 * Write an analytics event
 */
export async function createEmailAnalyticsEvent(
  event: Omit<EmailAnalyticsEvent, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'email_analytics'), {
      ...event,
      timestamp: Timestamp.fromDate(event.timestamp),
      createdAt: Timestamp.now(),
    });

    console.log(`[Firestore] Created email analytics event: ${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firestore] Failed to create email analytics event:', error);
    throw error;
  }
}

/**
 * Check if a deduplicated event already exists
 */
export async function emailAnalyticsEventExists(
  emailCampaignId: string,
  eventType: string,
  email: string,
  timestamp: Date
): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'email_analytics'),
      where('emailCampaignId', '==', emailCampaignId),
      where('eventType', '==', eventType),
      where('email', '==', email),
      where('timestamp', '==', Timestamp.fromDate(timestamp)),
      limit(1)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error: any) {
    console.error('[Firestore] Failed to check email analytics event:', error);
    return false;
  }
}

/**
 * List analytics events for a campaign
 */
export async function listEmailAnalyticsEvents(
  tenantId: string,
  emailCampaignId: string,
  eventType?: string,
  limitCount: number = 100
): Promise<EmailAnalyticsEvent[]> {
  try {
    const constraints: any[] = [
      where('tenantId', '==', tenantId),
      where('emailCampaignId', '==', emailCampaignId),
    ];

    if (eventType) {
      constraints.push(where('eventType', '==', eventType));
    }

    constraints.push(orderBy('timestamp', 'desc'));
    constraints.push(limit(limitCount));

    const q = query(collection(db, 'email_analytics'), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((d) => {
        const data = d.data();
        if (!data) return null;
        return {
          id: d.id,
          ...data,
          timestamp: data.timestamp?.toDate(),
          createdAt: data.createdAt?.toDate(),
        } as EmailAnalyticsEvent;
      })
      .filter((e): e is EmailAnalyticsEvent => e !== null);
  } catch (error: any) {
    console.error('[Firestore] Failed to list email analytics events:', error);
    throw error;
  }
}

/**
 * Count events by type for a campaign
 */
export async function countEmailAnalyticsEvents(
  emailCampaignId: string,
  eventType: string
): Promise<number> {
  try {
    const q = query(
      collection(db, 'email_analytics'),
      where('emailCampaignId', '==', emailCampaignId),
      where('eventType', '==', eventType)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error: any) {
    console.error('[Firestore] Failed to count email analytics events:', error);
    throw error;
  }
}
