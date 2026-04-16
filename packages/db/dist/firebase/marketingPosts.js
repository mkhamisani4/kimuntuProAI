/**
 * Marketing Posts persistence functions
 * CRUD for marketing_posts collection in Firestore
 */
import { db, Timestamp, collection, addDoc, query, where, orderBy, limit, getDocs, getDoc, doc, updateDoc, deleteDoc, } from './client.js';
/**
 * Create a new marketing post
 *
 * @param post - Post data to create
 * @returns Document ID
 */
export async function createPost(post) {
    try {
        const firestoreData = {
            ...post,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        // Convert scheduledAt Date to Firestore Timestamp
        if (post.scheduledAt instanceof Date) {
            firestoreData.scheduledAt = Timestamp.fromDate(post.scheduledAt);
        }
        const docRef = await addDoc(collection(db, 'marketing_posts'), firestoreData);
        console.log(`[Firestore] Created marketing post: ${docRef.id}`);
        return docRef.id;
    }
    catch (error) {
        console.error('[Firestore] Failed to create marketing post:', error);
        throw error;
    }
}
/**
 * Get a post by ID
 *
 * @param postId - Document ID
 * @returns Post or null if not found
 */
export async function getPost(postId) {
    try {
        const docRef = doc(db, 'marketing_posts', postId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return null;
        }
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            scheduledAt: data.scheduledAt?.toDate?.() || null,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        };
    }
    catch (error) {
        console.error('[Firestore] Failed to get marketing post:', error);
        throw error;
    }
}
/**
 * List posts for a tenant/user, optionally filtered by campaignId
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @param campaignId - Optional campaign filter
 * @param limitCount - Max results (default 100)
 * @returns Array of posts
 */
export async function listPosts(tenantId, userId, campaignId, limitCount = 100) {
    try {
        const constraints = [
            where('tenantId', '==', tenantId),
            where('userId', '==', userId),
        ];
        if (campaignId) {
            constraints.push(where('campaignId', '==', campaignId));
        }
        const q = query(collection(db, 'marketing_posts'), ...constraints, orderBy('createdAt', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);
        const posts = snapshot.docs
            .map((doc) => {
            const data = doc.data();
            if (!data)
                return null;
            return {
                id: doc.id,
                ...data,
                scheduledAt: data.scheduledAt?.toDate?.() || null,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            };
        })
            .filter((p) => p !== null);
        console.log(`[Firestore] Fetched ${posts.length} marketing posts for tenant ${tenantId}`);
        return posts;
    }
    catch (error) {
        console.error('[Firestore] Failed to list marketing posts:', error);
        throw error;
    }
}
/**
 * Update a post
 *
 * @param postId - Document ID
 * @param updates - Partial post data
 */
export async function updatePost(postId, updates) {
    try {
        const docRef = doc(db, 'marketing_posts', postId);
        const firestoreUpdates = {
            ...updates,
            updatedAt: Timestamp.now(),
        };
        // Convert scheduledAt Date to Firestore Timestamp
        if (updates.scheduledAt instanceof Date) {
            firestoreUpdates.scheduledAt = Timestamp.fromDate(updates.scheduledAt);
        }
        await updateDoc(docRef, firestoreUpdates);
        console.log(`[Firestore] Updated marketing post: ${postId}`);
    }
    catch (error) {
        console.error('[Firestore] Failed to update marketing post:', error);
        throw error;
    }
}
/**
 * Delete a post
 *
 * @param postId - Document ID
 */
export async function deletePost(postId) {
    try {
        const docRef = doc(db, 'marketing_posts', postId);
        await deleteDoc(docRef);
        console.log(`[Firestore] Deleted marketing post: ${postId}`);
    }
    catch (error) {
        console.error('[Firestore] Failed to delete marketing post:', error);
        throw error;
    }
}
//# sourceMappingURL=marketingPosts.js.map