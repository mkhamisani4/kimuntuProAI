/**
 * Server-side admin functions for logo management
 * Use ONLY in API routes (not client-side)
 */

import 'server-only';
import { adminDb, isAdminAvailable } from './admin.js';
import type { Logo } from './logos.js';
import { Timestamp } from 'firebase-admin/firestore';

// Fallback to client SDK when admin is not available (development mode)
import {
  createLogo as createLogoClient,
  updateLogo as updateLogoClient,
  getLogo as getLogoClient,
  deleteLogo as deleteLogoClient,
} from './logos.js';

/**
 * Create logo (server-side with admin SDK)
 * Falls back to client SDK in development mode
 *
 * @param logo - Logo data to create
 * @returns Document ID
 */
export async function createLogoAdmin(
  logo: Omit<Logo, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    console.log('[Firestore] Using client SDK (development mode)');
    return await createLogoClient(logo);
  }

  // Production mode: use admin SDK
  try {
    const docRef = await adminDb!.collection('logos').add({
      ...logo,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`[Firestore Admin] Created logo: ${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to create logo:', error);
    throw error;
  }
}

/**
 * Get logo by ID (server-side)
 * Falls back to client SDK in development mode
 *
 * @param logoId - Document ID
 * @returns Logo or null if not found
 */
export async function getLogoAdmin(logoId: string): Promise<Logo | null> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    console.log('[Firestore] Using client SDK (development mode)');
    return await getLogoClient(logoId);
  }

  // Production mode: use admin SDK
  try {
    const docSnap = await adminDb!.collection('logos').doc(logoId).get();

    if (!docSnap.exists) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data?.createdAt?.toDate(),
      updatedAt: data?.updatedAt?.toDate(),
      generationMetadata: data?.generationMetadata
        ? {
            ...data.generationMetadata,
            generatedAt: data.generationMetadata.generatedAt?.toDate?.() || data.generationMetadata.generatedAt,
          }
        : null,
    } as Logo;
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to get logo:', error);
    throw error;
  }
}

/**
 * Update logo (server-side)
 * Falls back to client SDK in development mode
 *
 * @param logoId - Document ID
 * @param updates - Partial logo data to update
 */
export async function updateLogoAdmin(
  logoId: string,
  updates: Partial<Logo>
): Promise<void> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    console.log('[Firestore] Using client SDK (development mode)');
    return await updateLogoClient(logoId, updates);
  }

  // Production mode: use admin SDK
  try {
    await adminDb!.collection('logos').doc(logoId).update({
      ...updates,
      updatedAt: Timestamp.now(),
    });

    console.log(`[Firestore Admin] Updated logo: ${logoId}`);
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to update logo:', error);
    throw error;
  }
}

/**
 * Delete logo (server-side)
 * Falls back to client SDK in development mode
 *
 * @param logoId - Document ID
 */
export async function deleteLogoAdmin(logoId: string): Promise<void> {
  // Development mode: use client SDK
  if (!isAdminAvailable()) {
    console.log('[Firestore] Using client SDK (development mode)');
    return await deleteLogoClient(logoId);
  }

  // Production mode: use admin SDK
  try {
    await adminDb!.collection('logos').doc(logoId).delete();

    console.log(`[Firestore Admin] Deleted logo: ${logoId}`);
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to delete logo:', error);
    throw error;
  }
}

/**
 * Unset isPrimary for all logos belonging to a user
 * DECISION: Only one logo can be primary per user
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 */
export async function unsetPrimaryLogoForUser(
  tenantId: string,
  userId: string
): Promise<void> {
  // For development/client mode, we can skip this or implement client-side
  if (!isAdminAvailable()) {
    console.log('[Firestore] Skipping unset primary (development mode)');
    return;
  }

  // Production mode: use admin SDK
  try {
    const snapshot = await adminDb!
      .collection('logos')
      .where('tenantId', '==', tenantId)
      .where('userId', '==', userId)
      .where('isPrimary', '==', true)
      .get();

    const batch = adminDb!.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isPrimary: false, updatedAt: Timestamp.now() });
    });

    await batch.commit();

    console.log(`[Firestore Admin] Unset primary logo for user ${userId}`);
  } catch (error: any) {
    console.error('[Firestore Admin] Failed to unset primary logo:', error);
    throw error;
  }
}
