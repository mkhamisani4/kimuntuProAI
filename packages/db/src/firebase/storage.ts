/**
 * Firebase Storage functions
 * Handles logo uploads and deletions for Website Builder
 */

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './client.js';

const storage = getStorage(app);

/**
 * Upload logo to Firebase Storage
 *
 * @param file - File object from form input
 * @param tenantId - Tenant ID
 * @param websiteId - Website ID (for folder organization)
 * @returns Download URL
 */
export async function uploadLogo(
  file: File,
  tenantId: string,
  websiteId: string
): Promise<string> {
  try {
    // Create storage path: /logos/{tenantId}/{websiteId}/{filename}
    const storageRef = ref(storage, `logos/${tenantId}/${websiteId}/${file.name}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log(`[Storage] Uploaded logo: ${downloadURL}`);
    return downloadURL;
  } catch (error: any) {
    console.error('[Storage] Failed to upload logo:', error);
    throw error;
  }
}

/**
 * Delete logo from Firebase Storage
 *
 * @param logoUrl - Full download URL of the logo
 */
export async function deleteLogo(logoUrl: string): Promise<void> {
  try {
    // Extract path from URL
    // Firebase Storage URLs format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const urlObj = new URL(logoUrl);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)$/);

    if (!pathMatch) {
      throw new Error('Invalid logo URL format');
    }

    const path = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, path);

    await deleteObject(storageRef);

    console.log(`[Storage] Deleted logo: ${path}`);
  } catch (error: any) {
    console.error('[Storage] Failed to delete logo:', error);
    throw error;
  }
}
