/**
 * Marketing Storage functions
 * Handles media uploads for social posts
 */
/**
 * Upload media for a marketing post
 *
 * @param file - File object from form input
 * @param tenantId - Tenant ID
 * @param postId - Post ID (for folder organization)
 * @returns Download URL
 */
export declare function uploadPostMedia(file: File, tenantId: string, postId: string): Promise<string>;
/**
 * Delete media from Firebase Storage
 *
 * @param mediaUrl - Full download URL of the media
 */
export declare function deletePostMedia(mediaUrl: string): Promise<void>;
//# sourceMappingURL=marketingStorage.d.ts.map