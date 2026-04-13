/**
 * Assistant Results Persistence
 * Stores completed assistant outputs for Recent Activity
 */
import { db, Timestamp, collection, addDoc, query, where, orderBy, limit, getDocs, getDoc, doc, deleteDoc, } from './client.js';
/**
 * Save assistant result to Firestore
 *
 * @param result - Assistant result to save
 * @returns Document ID
 */
export async function saveAssistantResult(result) {
    try {
        const docRef = await addDoc(collection(db, 'assistant_results'), {
            ...result,
            createdAt: Timestamp.now(),
        });
        console.log(`[Firestore] Saved assistant result: ${docRef.id} (${result.assistant})`);
        return docRef.id;
    }
    catch (error) {
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
export async function getRecentResults(tenantId, limitCount = 5) {
    try {
        const q = query(collection(db, 'assistant_results'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate(),
            };
        });
        console.log(`[Firestore] Fetched ${results.length} recent results for tenant ${tenantId}`);
        return results;
    }
    catch (error) {
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
export async function getAssistantResult(resultId) {
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
        };
    }
    catch (error) {
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
export function generateTitle(input, assistant) {
    // Truncate input to first 60 chars
    const truncated = input.length > 60 ? input.substring(0, 60) + '...' : input;
    // Add assistant prefix
    const prefixes = {
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
export function generateSummary(sections) {
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
export async function deleteAssistantResult(resultId) {
    try {
        const docRef = doc(db, 'assistant_results', resultId);
        await deleteDoc(docRef);
        console.log(`[Firestore] Deleted assistant result: ${resultId}`);
    }
    catch (error) {
        console.error('[Firestore] Failed to delete assistant result:', error);
        throw error;
    }
}
//# sourceMappingURL=assistantResults.js.map