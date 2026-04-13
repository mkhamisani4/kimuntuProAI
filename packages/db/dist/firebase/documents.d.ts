/**
 * Firestore Documents Metadata (RAG)
 * Stores uploaded document metadata
 */
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
export declare function saveDocumentMeta(data: {
    tenantId: string;
    userId: string;
    name: string;
    mime: string;
    size: number;
    storagePath: string;
}): Promise<string>;
/**
 * List recent documents for a tenant
 */
export declare function listRecentDocuments(tenantId: string, take?: number): Promise<DocumentMeta[]>;
/**
 * Get a single document by ID
 */
export declare function getDocumentMeta(docId: string): Promise<DocumentMeta | null>;
//# sourceMappingURL=documents.d.ts.map