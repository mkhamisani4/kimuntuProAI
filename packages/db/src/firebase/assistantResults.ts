/**
 * Assistant Results Persistence
 * Stores completed assistant outputs for Recent Activity
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
  deleteDoc,
} from './client.js';

/**
 * Assistant result document
 */
export interface AssistantResult {
  id?: string;
  tenantId: string;
  userId: string;
  assistant: 'streamlined_plan' | 'exec_summary' | 'market_analysis' | 'financial_overview';
  title: string;
  summary: string;
  sections: Record<string, string>;
  sources: Array<{
    type: 'rag' | 'web';
    title: string;
    snippet: string;
    url?: string;
    docId?: string;
  }>;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    latencyMs?: number;
    cost?: number;
  };
  createdAt?: Date;
}

/**
 * Save assistant result to Firestore
 *
 * @param result - Assistant result to save
 * @returns Document ID
 */
export async function saveAssistantResult(result: Omit<AssistantResult, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'assistant_results'), {
      ...result,
      createdAt: Timestamp.now(),
    });

    console.log(`[Firestore] Saved assistant result: ${docRef.id} (${result.assistant})`);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firestore] Failed to save assistant result:', error);
    throw error;
  }
}

/**
 * Get recent assistant results for a tenant
 *
 * @param tenantId - Tenant ID
 * @param limitCount - Number of results to fetch (default 5)
 * @returns Array of assistant results
 */
export async function getRecentResults(
  tenantId: string,
  limitCount: number = 5
): Promise<AssistantResult[]> {
  try {
    const q = query(
      collection(db, 'assistant_results'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as AssistantResult;
    });

    console.log(`[Firestore] Fetched ${results.length} recent results for tenant ${tenantId}`);
    return results;
  } catch (error: any) {
    console.error('[Firestore] Failed to get recent results:', error);
    throw error;
  }
}

/**
 * Get a specific assistant result by ID
 *
 * @param resultId - Document ID
 * @returns Assistant result or null
 */
export async function getAssistantResult(resultId: string): Promise<AssistantResult | null> {
  try {
    const docRef = doc(db, 'assistant_results', resultId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    } as AssistantResult;
  } catch (error: any) {
    console.error('[Firestore] Failed to get assistant result:', error);
    throw error;
  }
}

/**
 * Generate title from input or result
 *
 * @param input - User input
 * @param assistant - Assistant type
 * @returns Generated title
 */
export function generateTitle(input: string, assistant: string): string {
  // Truncate input to first 60 chars
  const truncated = input.length > 60 ? input.substring(0, 60) + '...' : input;

  // Add assistant prefix
  const prefixes: Record<string, string> = {
    streamlined_plan: 'Plan:',
    exec_summary: 'Summary:',
    market_analysis: 'Market:',
    financial_overview: 'Financials:',
  };

  const prefix = prefixes[assistant] || 'Result:';
  return `${prefix} ${truncated}`;
}

/**
 * Generate summary from sections
 *
 * @param sections - Response sections
 * @returns 1-3 sentence summary
 */
export function generateSummary(sections: Record<string, string>): string {
  // Get first section content
  const firstSection = Object.values(sections)[0] || '';

  // Take first 2-3 sentences (up to 200 chars)
  const sentences = firstSection.match(/[^.!?]+[.!?]+/g) || [];
  const summary = sentences.slice(0, 2).join(' ');

  return summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
}

/**
 * Delete assistant result by ID
 *
 * @param resultId - Result document ID
 */
export async function deleteAssistantResult(resultId: string): Promise<void> {
  try {
    const docRef = doc(db, 'assistant_results', resultId);
    await deleteDoc(docRef);

    console.log(`[Firestore] Deleted assistant result: ${resultId}`);
  } catch (error: any) {
    console.error('[Firestore] Failed to delete assistant result:', error);
    throw error;
  }
}
