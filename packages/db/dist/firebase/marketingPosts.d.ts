/**
 * Marketing Posts persistence functions
 * CRUD for marketing_posts collection in Firestore
 */
import type { MarketingPost } from './marketing.js';
/**
 * Create a new marketing post
 *
 * @param post - Post data to create
 * @returns Document ID
 */
export declare function createPost(post: Omit<MarketingPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
/**
 * Get a post by ID
 *
 * @param postId - Document ID
 * @returns Post or null if not found
 */
export declare function getPost(postId: string): Promise<MarketingPost | null>;
/**
 * List posts for a tenant/user, optionally filtered by campaignId
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @param campaignId - Optional campaign filter
 * @param limitCount - Max results (default 100)
 * @returns Array of posts
 */
export declare function listPosts(tenantId: string, userId: string, campaignId?: string, limitCount?: number): Promise<MarketingPost[]>;
/**
 * Update a post
 *
 * @param postId - Document ID
 * @param updates - Partial post data
 */
export declare function updatePost(postId: string, updates: Partial<MarketingPost>): Promise<void>;
/**
 * Delete a post
 *
 * @param postId - Document ID
 */
export declare function deletePost(postId: string): Promise<void>;
//# sourceMappingURL=marketingPosts.d.ts.map