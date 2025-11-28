/**
 * Firestore Documents Metadata (RAG)
 * Stores uploaded document metadata
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
} from './client.js';

/**
 * Document metadata interface
 */
export interface DocumentMeta {
  id?: string;
  tenantId: string;
  userId: string;
  name: string;
  mime: string;
  size: number;
  storagePath: string;
  createdAt?: Date;
}

/**
 * Save document metadata to Firestore
 */
export async function saveDocumentMeta(data: {
  tenantId: string;
  userId: string;
  name: string;
  mime: string;
  size: number;
  storagePath: string;
}): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'documents'), {
      ...data,
      createdAt: Timestamp.now(),
    });

    console.log(`[Firestore] Saved document metadata: ${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firestore] Failed to save document metadata:', error);
    throw error;
  }
}

/**
 * List recent documents for a tenant
 */
export async function listRecentDocuments(tenantId: string, take = 5): Promise<DocumentMeta[]> {
  try {
    const q = query(
      collection(db, 'documents'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      limit(take)
    );

    const snapshot = await getDocs(q);
    const documents = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as DocumentMeta;
    });

    console.log(`[Firestore] Listed ${documents.length} documents for tenant ${tenantId}`);
    return documents;
  } catch (error: any) {
    console.error('[Firestore] Failed to list documents:', error);
    throw error;
  }
}

/**
 * Get a single document by ID
 */
export async function getDocumentMeta(docId: string): Promise<DocumentMeta | null> {
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
    } as DocumentMeta;
  } catch (error: any) {
    console.error('[Firestore] Failed to get document:', error);
    throw error;
  }
}
