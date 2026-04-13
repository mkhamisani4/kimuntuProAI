/**
 * Email Error Log persistence functions
 * CRUD + query pending retries
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
  updateDoc,
  deleteDoc,
} from './client';

import type { EmailErrorLog } from './marketing';

/**
 * Create an error log entry
 */
export async function createEmailErrorLog(
  errorLog: Omit<EmailErrorLog, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'email_error_log'), {
      ...errorLog,
      nextRetryAt: errorLog.nextRetryAt ? Timestamp.fromDate(errorLog.nextRetryAt) : null,
      resolvedAt: errorLog.resolvedAt ? Timestamp.fromDate(errorLog.resolvedAt) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`[Firestore] Created email error log: ${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firestore] Failed to create email error log:', error);
    throw error;
  }
}

/**
 * List error logs for a campaign
 */
export async function listEmailErrorLogs(
  tenantId: string,
  userId: string,
  emailCampaignId?: string,
  limitCount: number = 50
): Promise<EmailErrorLog[]> {
  try {
    const constraints: any[] = [
      where('tenantId', '==', tenantId),
      where('userId', '==', userId),
    ];

    if (emailCampaignId) {
      constraints.push(where('emailCampaignId', '==', emailCampaignId));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(limitCount));

    const q = query(collection(db, 'email_error_log'), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((d) => {
        const data = d.data();
        if (!data) return null;
        return {
          id: d.id,
          ...data,
          nextRetryAt: data.nextRetryAt?.toDate() ?? null,
          resolvedAt: data.resolvedAt?.toDate() ?? null,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as EmailErrorLog;
      })
      .filter((e): e is EmailErrorLog => e !== null);
  } catch (error: any) {
    console.error('[Firestore] Failed to list email error logs:', error);
    throw error;
  }
}

/**
 * List pending retry errors
 */
export async function listPendingRetryErrors(
  tenantId: string,
  userId: string
): Promise<EmailErrorLog[]> {
  try {
    const q = query(
      collection(db, 'email_error_log'),
      where('tenantId', '==', tenantId),
      where('userId', '==', userId),
      where('status', '==', 'pending_retry'),
      orderBy('nextRetryAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => {
        const data = d.data();
        if (!data) return null;
        return {
          id: d.id,
          ...data,
          nextRetryAt: data.nextRetryAt?.toDate() ?? null,
          resolvedAt: data.resolvedAt?.toDate() ?? null,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as EmailErrorLog;
      })
      .filter((e): e is EmailErrorLog => e !== null);
  } catch (error: any) {
    console.error('[Firestore] Failed to list pending retry errors:', error);
    throw error;
  }
}

/**
 * Update an error log entry
 */
export async function updateEmailErrorLog(
  errorLogId: string,
  updates: Partial<EmailErrorLog>
): Promise<void> {
  try {
    const docRef = doc(db, 'email_error_log', errorLogId);
    const updateData: Record<string, any> = { ...updates, updatedAt: Timestamp.now() };

    if (updates.nextRetryAt !== undefined) {
      updateData.nextRetryAt = updates.nextRetryAt ? Timestamp.fromDate(updates.nextRetryAt) : null;
    }
    if (updates.resolvedAt !== undefined) {
      updateData.resolvedAt = updates.resolvedAt ? Timestamp.fromDate(updates.resolvedAt) : null;
    }

    await updateDoc(docRef, updateData);
    console.log(`[Firestore] Updated email error log: ${errorLogId}`);
  } catch (error: any) {
    console.error('[Firestore] Failed to update email error log:', error);
    throw error;
  }
}

/**
 * Delete an error log entry
 */
export async function deleteEmailErrorLog(errorLogId: string): Promise<void> {
  try {
    const docRef = doc(db, 'email_error_log', errorLogId);
    await deleteDoc(docRef);
    console.log(`[Firestore] Deleted email error log: ${errorLogId}`);
  } catch (error: any) {
    console.error('[Firestore] Failed to delete email error log:', error);
    throw error;
  }
}
