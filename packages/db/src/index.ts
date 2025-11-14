/**
 * @kimuntupro/db
 * Database layer with Firebase Firestore for KimuntuPro AI
 */

// Export Firebase client and utilities
export * from './firebase/client.js';

// Export usage tracking functions (Firestore)
export {
  recordUsage,
  sumTokensByUser,
  sumTokensByTenant,
  getUsageMetrics,
  type UsageRow,
} from './firebase/usage.js';

// Export assistant results persistence
export {
  saveAssistantResult,
  getRecentResults,
  getAssistantResult,
  generateTitle,
  generateSummary,
  type AssistantResult,
} from './firebase/assistantResults.js';

// Export document metadata (RAG)
export {
  saveDocumentMeta,
  listRecentDocuments,
  getDocumentMeta,
  type DocumentMeta,
} from './firebase/documents.js';

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
export async function connectDatabase(): Promise<void> {
  console.log('✓ Firebase Firestore connected');
}

/**
 * Disconnect is not needed for Firebase (manages connections automatically)
 */
export async function disconnectDatabase(): Promise<void> {
  console.log('✓ Firebase connection managed automatically');
}
