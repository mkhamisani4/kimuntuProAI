/**
 * @kimuntupro/db
 * Database layer with Firebase Firestore for KimuntuPro AI
 */
export * from './firebase/client.js';
export { recordUsage, sumTokensByUser, sumTokensByTenant, getUsageMetrics, type UsageRow, } from './firebase/usage.js';
export { saveAssistantResult, getRecentResults, getAssistantResult, generateTitle, generateSummary, type AssistantResult, } from './firebase/assistantResults.js';
export { saveDocumentMeta, listRecentDocuments, getDocumentMeta, type DocumentMeta, } from './firebase/documents.js';
/**
 * Database configuration type
 */
export type DatabaseConfig = {
    projectId: string;
    apiKey: string;
};
/**
 * Connect to Firebase (client initializes automatically)
 */
export declare function connectDatabase(): Promise<void>;
/**
 * Disconnect is not needed for Firebase (manages connections automatically)
 */
export declare function disconnectDatabase(): Promise<void>;
//# sourceMappingURL=index.d.ts.map