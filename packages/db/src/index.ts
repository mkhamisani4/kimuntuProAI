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
  deleteAssistantResult,
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

// Export website persistence functions (client-side)
export {
  createWebsite,
  getWebsite,
  updateWebsite,
  listWebsites,
  deleteWebsite,
  type Website,
} from './firebase/websites.js';

// Note: Server-side admin functions are NOT exported here to prevent client-side bundling
// Import directly from '@kimuntupro/db/firebase/websites.server' in API routes only

// Export Firebase Storage functions
export {
  uploadLogo,
  deleteLogo,
} from './firebase/storage.js';

// Export Logo persistence functions (client-side)
export {
  createLogo,
  getLogo,
  updateLogo,
  listLogos,
  deleteLogo as deleteLogoDoc,
  getPrimaryLogo,
  // Version history functions (Phase 3 Feature 4)
  saveLogoVersion,
  getLogoVersions,
  restoreLogoVersion,
  deleteLogoVersion,
  type Logo,
  type LogoVersion,
} from './firebase/logos.js';

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
