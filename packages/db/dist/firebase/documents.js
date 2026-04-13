/**
 * Firestore Documents Metadata (RAG)
 * Stores uploaded document metadata
 */
import { db, Timestamp, collection, addDoc, query, where, orderBy, limit, getDocs, getDoc, doc, } from './client.js';
/**
 * Save document metadata to Firestore
 */
export async function saveDocumentMeta(data) {
    try {
        const docRef = await addDoc(collection(db, 'documents'), {
            ...data,
            createdAt: Timestamp.now(),
        });
        console.log(`[Firestore] Saved document metadata: ${docRef.id}`);
        return docRef.id;
    }
    catch (error) {
        console.error('[Firestore] Failed to save document metadata:', error);
        throw error;
    }
}
/**
 * List recent documents for a tenant
 */
export async function listRecentDocuments(tenantId, take = 5) {
    try {
        const q = query(collection(db, 'documents'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'), limit(take));
        const snapshot = await getDocs(q);
        const documents = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate(),
            };
        });
        console.log(`[Firestore] Listed ${documents.length} documents for tenant ${tenantId}`);
        return documents;
    }
    catch (error) {
        console.error('[Firestore] Failed to list documents:', error);
        throw error;
    }
}
/**
 * Get a single document by ID
 */
export async function getDocumentMeta(docId) {
    try {
        const docRef = doc(db, 'documents', docId);
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
        console.error('[Firestore] Failed to get document:', error);
        throw error;
    }
}
//# sourceMappingURL=documents.js.map