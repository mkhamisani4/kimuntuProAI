/**
 * Firebase Admin SDK Client
 * For server-side operations (API routes) with full admin privileges
 * Bypasses Firestore security rules
 */
import 'server-only';
import type { App } from 'firebase-admin/app';
import { Firestore } from 'firebase-admin/firestore';
/**
 * Check if admin SDK is available
 */
export declare function isAdminAvailable(): boolean;
declare const adminApp: App | null;
declare const adminDb: Firestore | null;
export { adminApp, adminDb };
//# sourceMappingURL=admin.d.ts.map