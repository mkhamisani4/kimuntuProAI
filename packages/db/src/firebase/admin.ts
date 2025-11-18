/**
 * Firebase Admin SDK Client
 * For server-side operations (API routes) with full admin privileges
 * Bypasses Firestore security rules
 */

import 'server-only';
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials or application default credentials
 *
 * For development: Uses emulator or permissive Firestore rules with client SDK
 * For production: Requires FIREBASE_SERVICE_ACCOUNT_KEY environment variable
 */
function initializeAdmin(): App | null {
  // Check if already initialized
  const apps = admin.apps;
  if (apps.length > 0 && apps[0]) {
    return apps[0];
  }

  // Initialize with service account or default credentials
  try {
    // Option 1: Use service account key (REQUIRED for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('[Firebase Admin] Initializing with service account key');
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    // Option 2: Development mode - no admin SDK
    // Falls back to client SDK with permissive security rules
    console.warn('[Firebase Admin] No service account key found. Using development mode.');
    console.warn('[Firebase Admin] For production, set FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
    console.warn('[Firebase Admin] See docs/PRODUCTION_SETUP.md for instructions.');

    return null; // Will fallback to client SDK
  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', error);
    return null;
  }
}

/**
 * Check if admin SDK is available
 */
export function isAdminAvailable(): boolean {
  return adminApp !== null;
}

// Initialize the admin app (may be null in development)
const adminApp = initializeAdmin();
const adminDb: Firestore | null = adminApp ? getFirestore(adminApp) : null;

export { adminApp, adminDb };
