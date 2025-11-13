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
// Legacy Prisma support (conditional)
const usePrisma = process.env.USE_PRISMA === 'true';
if (usePrisma) {
    console.warn('⚠️  Using legacy Prisma database. Set USE_PRISMA=false to use Firebase.');
}
else {
    console.log('✅ Using Firebase Firestore for database operations');
}
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