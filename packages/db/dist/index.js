/**
 * @kimuntupro/db
 * Database layer with Firebase Firestore for KimuntuPro AI
 */
// Export Firebase client and utilities
export * from './firebase/client.js';
// Export usage tracking functions (Firestore)
export { recordUsage, sumTokensByUser, sumTokensByTenant, getUsageMetrics, } from './firebase/usage.js';
// Export assistant results persistence
export { saveAssistantResult, getRecentResults, getAssistantResult, generateTitle, generateSummary, } from './firebase/assistantResults.js';
// Export document metadata (RAG)
export { saveDocumentMeta, listRecentDocuments, getDocumentMeta, } from './firebase/documents.js';
// Export website persistence functions (client-side)
export { createWebsite, getWebsite, updateWebsite, listWebsites, deleteWebsite, } from './firebase/websites.js';
// Note: Server-side admin functions are NOT exported here to prevent client-side bundling
// Import directly from '@kimuntupro/db/firebase/websites.server' in API routes only
// Export Firebase Storage functions
export { uploadLogo, deleteLogo, } from './firebase/storage.js';
/**
 * Connect to Firebase (client initializes automatically)
 */
export async function connectDatabase() {
    console.log('✓ Firebase Firestore connected');
}
/**
 * Disconnect is not needed for Firebase (manages connections automatically)
 */
export async function disconnectDatabase() {
    console.log('✓ Firebase connection managed automatically');
}
//# sourceMappingURL=index.js.map