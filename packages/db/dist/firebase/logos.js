/**
 * Logo persistence functions (client-side)
 * Stores and manages AI-generated logos in Firestore
 */
import { db, Timestamp, collection, addDoc, query, where, orderBy, limit, getDocs, getDoc, doc, updateDoc, deleteDoc, } from './client.js';
/**
 * Create new logo document
 *
 * @param logo - Logo data to create
 * @returns Document ID
 */
export async function createLogo(logo) {
    try {
        const docRef = await addDoc(collection(db, 'logos'), {
            ...logo,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        console.log(`[Firestore] Created logo: ${docRef.id}`);
        return docRef.id;
    }
    catch (error) {
        console.error('[Firestore] Failed to create logo:', error);
        throw error;
    }
}
/**
 * Get logo by ID
 *
 * @param logoId - Document ID
 * @returns Logo or null if not found
 */
export async function getLogo(logoId) {
    try {
        const docRef = doc(db, 'logos', logoId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return null;
        }
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            generationMetadata: data.generationMetadata
                ? {
                    ...data.generationMetadata,
                    generatedAt: data.generationMetadata.generatedAt?.toDate?.() || data.generationMetadata.generatedAt,
                }
                : null,
        };
    }
    catch (error) {
        console.error('[Firestore] Failed to get logo:', error);
        throw error;
    }
}
/**
 * Recursively remove undefined values from an object
 * Firestore doesn't allow undefined values - they must be null or omitted
 */
function removeUndefined(obj) {
    if (obj === null || obj === undefined) {
        return null;
    }
    if (Array.isArray(obj)) {
        return obj.map(removeUndefined);
    }
    if (typeof obj === 'object') {
        const cleaned = {};
        for (const key in obj) {
            const value = obj[key];
            if (value !== undefined) {
                cleaned[key] = removeUndefined(value);
            }
        }
        return cleaned;
    }
    return obj;
}
/**
 * Update logo document
 *
 * @param logoId - Document ID
 * @param updates - Partial logo data to update
 */
export async function updateLogo(logoId, updates) {
    try {
        const docRef = doc(db, 'logos', logoId);
        // Convert Date objects to Timestamps for Firestore
        let firestoreUpdates = { ...updates };
        if (firestoreUpdates.generationMetadata?.generatedAt instanceof Date) {
            firestoreUpdates.generationMetadata = {
                ...firestoreUpdates.generationMetadata,
                generatedAt: Timestamp.fromDate(firestoreUpdates.generationMetadata.generatedAt),
            };
        }
        // Remove undefined values (Firestore doesn't accept them)
        firestoreUpdates = removeUndefined(firestoreUpdates);
        await updateDoc(docRef, {
            ...firestoreUpdates,
            updatedAt: Timestamp.now(),
        });
        console.log(`[Firestore] Updated logo: ${logoId}`);
    }
    catch (error) {
        console.error('[Firestore] Failed to update logo:', error);
        throw error;
    }
}
/**
 * List logos for a tenant/user
 *
 * @param tenantId - Tenant ID
 * @param userId - Optional user ID filter
 * @param limitCount - Number of logos to fetch (default 20)
 * @returns Array of logos
 */
export async function listLogos(tenantId, userId, limitCount = 20) {
    try {
        let q;
        if (userId) {
            q = query(collection(db, 'logos'), where('tenantId', '==', tenantId), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(limitCount));
        }
        else {
            q = query(collection(db, 'logos'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'), limit(limitCount));
        }
        const snapshot = await getDocs(q);
        const logos = snapshot.docs
            .map((doc) => {
            const rawData = doc.data();
            if (!rawData)
                return null;
            const data = rawData;
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
                generationMetadata: data.generationMetadata
                    ? {
                        ...data.generationMetadata,
                        generatedAt: data.generationMetadata.generatedAt?.toDate?.() || data.generationMetadata.generatedAt,
                    }
                    : null,
            };
        })
            .filter((logo) => logo !== null);
        console.log(`[Firestore] Fetched ${logos.length} logos for tenant ${tenantId}`);
        return logos;
    }
    catch (error) {
        console.error('[Firestore] Failed to list logos:', error);
        throw error;
    }
}
/**
 * Delete logo
 *
 * @param logoId - Document ID
 */
export async function deleteLogo(logoId) {
    try {
        const docRef = doc(db, 'logos', logoId);
        await deleteDoc(docRef);
        console.log(`[Firestore] Deleted logo: ${logoId}`);
    }
    catch (error) {
        console.error('[Firestore] Failed to delete logo:', error);
        throw error;
    }
}
/**
 * Get primary logo for a user
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @returns Primary logo or null if not found
 */
export async function getPrimaryLogo(tenantId, userId) {
    try {
        const q = query(collection(db, 'logos'), where('tenantId', '==', tenantId), where('userId', '==', userId), where('isPrimary', '==', true), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return null;
        }
        const data = snapshot.docs[0].data();
        return {
            id: snapshot.docs[0].id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            generationMetadata: data.generationMetadata
                ? {
                    ...data.generationMetadata,
                    generatedAt: data.generationMetadata.generatedAt?.toDate?.() || data.generationMetadata.generatedAt,
                }
                : null,
        };
    }
    catch (error) {
        console.error('[Firestore] Failed to get primary logo:', error);
        throw error;
    }
}
/**
 * Unset isPrimary for all logos belonging to a user
 * Only one logo can be primary per user
 *
 * @param tenantId - Tenant ID
 * @param userId - User ID
 */
export async function unsetPrimaryLogoForUser(tenantId, userId) {
    try {
        const q = query(collection(db, 'logos'), where('tenantId', '==', tenantId), where('userId', '==', userId), where('isPrimary', '==', true));
        const snapshot = await getDocs(q);
        // Update each logo to unset isPrimary
        const updatePromises = snapshot.docs.map((docSnap) => updateDoc(doc(db, 'logos', docSnap.id), {
            isPrimary: false,
            updatedAt: Timestamp.now(),
        }));
        await Promise.all(updatePromises);
        console.log(`[Firestore] Unset primary logo for user ${userId} (${snapshot.docs.length} logos updated)`);
    }
    catch (error) {
        console.error('[Firestore] Failed to unset primary logo:', error);
        throw error;
    }
}
// ============================================================================
// VERSION HISTORY FUNCTIONS (Phase 3 Feature 4)
// ============================================================================
/**
 * Save current logo spec as a new version
 *
 * @param logoId - Logo document ID
 * @param label - Optional label for this version
 * @returns Version ID
 */
export async function saveLogoVersion(logoId, label) {
    try {
        // Get current logo
        const logo = await getLogo(logoId);
        if (!logo) {
            throw new Error('Logo not found');
        }
        // Create version entry
        const versionId = `v_${Date.now()}`;
        const version = {
            versionId,
            spec: logo.currentSpec,
            label,
            savedAt: new Date(),
        };
        // Prepare versions array
        const versions = logo.versions || [];
        const updatedVersions = [version, ...versions]; // Add new version at beginning
        // Limit to 20 most recent versions
        const limitedVersions = updatedVersions.slice(0, 20);
        // Convert savedAt to Timestamp for Firestore
        const firestoreVersions = limitedVersions.map((v) => ({
            ...v,
            savedAt: v.savedAt instanceof Date ? Timestamp.fromDate(v.savedAt) : v.savedAt,
        }));
        // Update logo document
        await updateLogo(logoId, {
            versions: firestoreVersions,
        });
        console.log(`[Firestore] Saved version ${versionId} for logo ${logoId}`);
        return versionId;
    }
    catch (error) {
        console.error('[Firestore] Failed to save logo version:', error);
        throw error;
    }
}
/**
 * Get all versions for a logo
 *
 * @param logoId - Logo document ID
 * @returns Array of versions (most recent first)
 */
export async function getLogoVersions(logoId) {
    try {
        const logo = await getLogo(logoId);
        if (!logo) {
            return [];
        }
        // Convert Firestore timestamps back to Date objects
        const versions = (logo.versions || []).map((v) => ({
            ...v,
            savedAt: v.savedAt instanceof Date ? v.savedAt : v.savedAt?.toDate?.() || new Date(v.savedAt),
        }));
        return versions;
    }
    catch (error) {
        console.error('[Firestore] Failed to get logo versions:', error);
        throw error;
    }
}
/**
 * Restore a specific version to currentSpec
 *
 * @param logoId - Logo document ID
 * @param versionId - Version ID to restore
 */
export async function restoreLogoVersion(logoId, versionId) {
    try {
        const versions = await getLogoVersions(logoId);
        const version = versions.find((v) => v.versionId === versionId);
        if (!version) {
            throw new Error(`Version ${versionId} not found`);
        }
        // Update currentSpec with the version's spec
        await updateLogo(logoId, {
            currentSpec: version.spec,
        });
        console.log(`[Firestore] Restored version ${versionId} for logo ${logoId}`);
    }
    catch (error) {
        console.error('[Firestore] Failed to restore logo version:', error);
        throw error;
    }
}
/**
 * Delete a specific version
 *
 * @param logoId - Logo document ID
 * @param versionId - Version ID to delete
 */
export async function deleteLogoVersion(logoId, versionId) {
    try {
        const logo = await getLogo(logoId);
        if (!logo) {
            throw new Error('Logo not found');
        }
        // Filter out the version to delete
        const versions = (logo.versions || []).filter((v) => v.versionId !== versionId);
        // Convert savedAt to Timestamp for Firestore
        const firestoreVersions = versions.map((v) => ({
            ...v,
            savedAt: v.savedAt instanceof Date ? Timestamp.fromDate(v.savedAt) : v.savedAt,
        }));
        // Update logo document
        await updateLogo(logoId, {
            versions: firestoreVersions,
        });
        console.log(`[Firestore] Deleted version ${versionId} from logo ${logoId}`);
    }
    catch (error) {
        console.error('[Firestore] Failed to delete logo version:', error);
        throw error;
    }
}
//# sourceMappingURL=logos.js.map