/**
 * Firestore Usage Tracking Functions
 * Handles usage log persistence and aggregations for quotas and analytics
 */

import {
  db,
  Timestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from './client.js';

/**
 * Usage row for insertion
 */
export interface UsageRow {
  tenantId: string;
  userId: string;
  assistant: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  costCents: number;
  latencyMs: number;
  toolInvocations: {
    retrieval?: number;
    webSearch?: number;
    finance?: number;
  };
  requestId?: string;
  meta?: Record<string, any>;
}

/**
 * Record a usage event in Firestore
 *
 * @param row - Usage row to record
 * @returns Promise resolving when recorded
 */
export async function recordUsage(row: UsageRow): Promise<void> {
  try {
    await addDoc(collection(db, 'usage_logs'), {
      tenantId: row.tenantId,
      userId: row.userId,
      assistant: row.assistant,
      model: row.model,
      tokensIn: row.tokensIn,
      tokensOut: row.tokensOut,
      totalTokens: row.tokensIn + row.tokensOut,
      costCents: row.costCents,
      latencyMs: row.latencyMs,
      toolInvocations: row.toolInvocations,
      requestId: row.requestId || null,
      meta: row.meta || null,
      createdAt: Timestamp.now(),
    });

    console.log(
      `[Firestore] Logged usage for ${row.assistant}: ${row.tokensIn + row.tokensOut} tokens, ${row.costCents}¢`
    );
  } catch (error: any) {
    console.error('[Firestore] Failed to record usage:', error);
    throw error;
  }
}

/**
 * Sum tokens by user since a given time
 *
 * @param userId - User ID to sum for
 * @param since - Start date (inclusive)
 * @returns Total tokens (in + out)
 */
export async function sumTokensByUser(
  userId: string,
  since: Date
): Promise<number> {
  try {
    const q = query(
      collection(db, 'usage_logs'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(since))
    );

    const snapshot = await getDocs(q);
    const total = snapshot.docs.reduce((sum, doc) => {
      const data = doc.data();
      return sum + (data.tokensIn || 0) + (data.tokensOut || 0);
    }, 0);

    console.log(`[Firestore] User ${userId} total tokens since ${since.toISOString()}: ${total}`);
    return total;
  } catch (error: any) {
    console.error('[Firestore] Failed to sum tokens by user:', error);
    throw error;
  }
}

/**
 * Sum tokens by tenant since a given time
 *
 * @param tenantId - Tenant ID to sum for
 * @param since - Start date (inclusive)
 * @returns Total tokens (in + out)
 */
export async function sumTokensByTenant(
  tenantId: string,
  since: Date
): Promise<number> {
  try {
    const q = query(
      collection(db, 'usage_logs'),
      where('tenantId', '==', tenantId),
      where('createdAt', '>=', Timestamp.fromDate(since))
    );

    const snapshot = await getDocs(q);
    const total = snapshot.docs.reduce((sum, doc) => {
      const data = doc.data();
      return sum + (data.tokensIn || 0) + (data.tokensOut || 0);
    }, 0);

    console.log(`[Firestore] Tenant ${tenantId} total tokens since ${since.toISOString()}: ${total}`);
    return total;
  } catch (error: any) {
    console.error('[Firestore] Failed to sum tokens by tenant:', error);
    throw error;
  }
}

/**
 * Get usage aggregations for metrics
 *
 * @param options - Filter options
 * @returns Aggregated metrics
 */
export async function getUsageMetrics(options?: {
  tenantId?: string;
  userId?: string;
  since?: Date;
}): Promise<{
  totalRequests: number;
  totalCostCents: number;
  totalTokensIn: number;
  totalTokensOut: number;
  byAssistant: Record<string, { requests: number; costCents: number; tokens: number }>;
}> {
  try {
    let q = query(collection(db, 'usage_logs'));

    if (options?.tenantId) {
      q = query(q, where('tenantId', '==', options.tenantId));
    }

    if (options?.userId) {
      q = query(q, where('userId', '==', options.userId));
    }

    if (options?.since) {
      q = query(q, where('createdAt', '>=', Timestamp.fromDate(options.since)));
    }

    const snapshot = await getDocs(q);

    let totalRequests = 0;
    let totalCostCents = 0;
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    const byAssistant: Record<string, { requests: number; costCents: number; tokens: number }> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalRequests++;
      totalCostCents += data.costCents || 0;
      totalTokensIn += data.tokensIn || 0;
      totalTokensOut += data.tokensOut || 0;

      const assistant = data.assistant || 'unknown';
      if (!byAssistant[assistant]) {
        byAssistant[assistant] = { requests: 0, costCents: 0, tokens: 0 };
      }
      byAssistant[assistant].requests++;
      byAssistant[assistant].costCents += data.costCents || 0;
      byAssistant[assistant].tokens += (data.tokensIn || 0) + (data.tokensOut || 0);
    });

    return {
      totalRequests,
      totalCostCents,
      totalTokensIn,
      totalTokensOut,
      byAssistant,
    };
  } catch (error: any) {
    console.error('[Firestore] Failed to get usage metrics:', error);
    throw error;
  }
}
