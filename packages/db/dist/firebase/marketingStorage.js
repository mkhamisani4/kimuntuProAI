/**
 * Marketing Storage functions
 * Handles media uploads for social posts
 */
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './client.js';
const storage = getStorage(app);
/**
 * Upload media for a marketing post
 *
 * @param file - File object from form input
 * @param tenantId - Tenant ID
 * @param postId - Post ID (for folder organization)
 * @returns Download URL
 */
export async function uploadPostMedia(file, tenantId, postId) {
    try {
        const storageRef = ref(storage, `marketing/${tenantId}/posts/${postId}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`[Storage] Uploaded post media: ${downloadURL}`);
        return downloadURL;
    }
    catch (error) {
        console.error('[Storage] Failed to upload post media:', error);
        throw error;
    }
}
/**
 * Delete media from Firebase Storage
 *
 * @param mediaUrl - Full download URL of the media
 */
export async function deletePostMedia(mediaUrl) {
    try {
        const urlObj = new URL(mediaUrl);
        const pathMatch = urlObj.pathname.match(/\/o\/(.+)$/);
        if (!pathMatch) {
            throw new Error('Invalid media URL format');
        }
        const path = decodeURIComponent(pathMatch[1]);
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        console.log(`[Storage] Deleted post media: ${path}`);
    }
    catch (error) {
        console.error('[Storage] Failed to delete post media:', error);
        throw error;
    }
}
//# sourceMappingURL=marketingStorage.js.map