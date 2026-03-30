/**
 * @kimuntupro/db
 * Database layer with Firebase Firestore for KimuntuPro AI
 */
export * from './firebase/client.js';
export { recordUsage, sumTokensByUser, sumTokensByTenant, getUsageMetrics, type UsageRow, } from './firebase/usage.js';
export { saveAssistantResult, getRecentResults, getAssistantResult, deleteAssistantResult, generateTitle, generateSummary, type AssistantResult, } from './firebase/assistantResults.js';
export { saveDocumentMeta, listRecentDocuments, getDocumentMeta, type DocumentMeta, } from './firebase/documents.js';
export { createWebsite, getWebsite, updateWebsite, listWebsites, deleteWebsite, type Website, } from './firebase/websites.js';
export { uploadLogo, deleteLogo, } from './firebase/storage.js';
export { createLogo, getLogo, updateLogo, listLogos, deleteLogo as deleteLogoDoc, getPrimaryLogo, saveLogoVersion, getLogoVersions, restoreLogoVersion, deleteLogoVersion, type Logo, type LogoVersion, } from './firebase/logos.js';
export { type MarketingCampaign, type MarketingPost, type MarketingKeyword, type MarketingSettings, } from './firebase/marketing.js';
export { createCampaign, getCampaign, listCampaigns, updateCampaign, deleteCampaign, } from './firebase/marketingCampaigns.js';
export { createPost, getPost, listPosts, updatePost, deletePost, } from './firebase/marketingPosts.js';
export { saveKeyword, listKeywords, deleteKeyword, } from './firebase/marketingKeywords.js';
export { uploadPostMedia, deletePostMedia, } from './firebase/marketingStorage.js';
export { getMarketingSettings, updateMarketingSettings, } from './firebase/marketingSettings.js';
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