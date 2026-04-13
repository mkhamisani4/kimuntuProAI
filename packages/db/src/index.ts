/**
 * @kimuntupro/db
 * Database layer with Firebase Firestore for KimuntuPro AI
 */

// Export Firebase client and utilities
export * from './firebase/client';

// Export usage tracking functions (Firestore)
export {
  recordUsage,
  sumTokensByUser,
  sumTokensByTenant,
  getUsageMetrics,
  type UsageRow,
} from './firebase/usage';

// Export assistant results persistence
export {
  saveAssistantResult,
  getRecentResults,
  getAssistantResult,
  deleteAssistantResult,
  generateTitle,
  generateSummary,
  type AssistantResult,
} from './firebase/assistantResults';

// Export document metadata (RAG)
export {
  saveDocumentMeta,
  listRecentDocuments,
  getDocumentMeta,
  type DocumentMeta,
} from './firebase/documents';

// Export website persistence functions (client-side)
export {
  createWebsite,
  getWebsite,
  updateWebsite,
  listWebsites,
  deleteWebsite,
  type Website,
} from './firebase/websites';

// Note: Server-side admin functions are NOT exported here to prevent client-side bundling
// Import directly from '@kimuntupro/db/firebase/websites.server' in API routes only

// Export Firebase Storage functions
export {
  uploadLogo,
  deleteLogo,
} from './firebase/storage';

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
} from './firebase/logos';

// Export Marketing Suite types
export {
  type MarketingCampaign,
  type MarketingPost,
  type MarketingKeyword,
  type MarketingSettings,
  type EmailCampaign,
  type EmailAnalyticsEvent,
  type EmailErrorLog,
} from './firebase/marketing';

// Export Marketing Campaign CRUD
export {
  createCampaign,
  getCampaign,
  listCampaigns,
  updateCampaign,
  deleteCampaign,
} from './firebase/marketingCampaigns';

// Export Marketing Post CRUD
export {
  createPost,
  getPost,
  listPosts,
  updatePost,
  deletePost,
} from './firebase/marketingPosts';

// Export Marketing Keyword functions
export {
  saveKeyword,
  listKeywords,
  deleteKeyword,
} from './firebase/marketingKeywords';

// Export Marketing Storage functions
export {
  uploadPostMedia,
  deletePostMedia,
} from './firebase/marketingStorage';

// Export Marketing Settings functions
export {
  getMarketingSettings,
  updateMarketingSettings,
} from './firebase/marketingSettings';

// Export Email Campaign CRUD
export {
  createEmailCampaign,
  getEmailCampaign,
  listEmailCampaigns,
  getEmailCampaignByMailchimpId,
  updateEmailCampaign,
  deleteEmailCampaign,
} from './firebase/emailCampaigns';

// Export Email Analytics functions
export {
  createEmailAnalyticsEvent,
  emailAnalyticsEventExists,
  listEmailAnalyticsEvents,
  countEmailAnalyticsEvents,
} from './firebase/emailAnalytics';

// Export Email Error Log functions
export {
  createEmailErrorLog,
  listEmailErrorLogs,
  listPendingRetryErrors,
  updateEmailErrorLog,
  deleteEmailErrorLog,
} from './firebase/emailErrorLog';

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
