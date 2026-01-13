/**
 * LUHUT BINSHAR - User Payload Storage
 * CRUD operations for user-created payloads
 */

import { STORES, getAllFromStore, addToStore, deleteFromStore, getFromStore } from './db.js';

/**
 * Generate unique ID for user payloads
 */
function generateId() {
    return 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get all user payloads
 */
export async function getUserPayloads() {
    return await getAllFromStore(STORES.USER_PAYLOADS);
}

/**
 * Add new user payload
 */
export async function addUserPayload(payloadData) {
    const payload = {
        id: generateId(),
        title: payloadData.title,
        payload: payloadData.payload,
        category: payloadData.category,
        subcategory: payloadData.subcategory || 'Custom',
        context: payloadData.context || [],
        level: payloadData.level || 'medium',
        tags: payloadData.tags || [],
        notes: payloadData.notes || '',
        source: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await addToStore(STORES.USER_PAYLOADS, payload);
    return payload;
}

/**
 * Update user payload
 */
export async function updateUserPayload(id, updates) {
    const existing = await getFromStore(STORES.USER_PAYLOADS, id);
    if (!existing) {
        throw new Error('Payload not found');
    }

    const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString()
    };

    await addToStore(STORES.USER_PAYLOADS, updated);
    return updated;
}

/**
 * Delete user payload
 */
export async function deleteUserPayload(id) {
    await deleteFromStore(STORES.USER_PAYLOADS, id);
    // Also remove from favorites
    await deleteFromStore(STORES.FAVORITES, id);
}

/**
 * Get favorites
 */
export async function getFavorites() {
    return await getAllFromStore(STORES.FAVORITES);
}

/**
 * Toggle favorite
 */
export async function toggleFavorite(payloadId) {
    const existing = await getFromStore(STORES.FAVORITES, payloadId);

    if (existing) {
        await deleteFromStore(STORES.FAVORITES, payloadId);
        return false;
    } else {
        await addToStore(STORES.FAVORITES, { id: payloadId, addedAt: new Date().toISOString() });
        return true;
    }
}

/**
 * Check if payload is favorite
 */
export async function isFavorite(payloadId) {
    const favorite = await getFromStore(STORES.FAVORITES, payloadId);
    return !!favorite;
}

/**
 * Export user payloads as JSON
 */
export async function exportUserPayloads() {
    const payloads = await getUserPayloads();
    return JSON.stringify({
        exportedAt: new Date().toISOString(),
        count: payloads.length,
        payloads
    }, null, 2);
}

/**
 * Import user payloads from JSON
 */
export async function importUserPayloads(jsonString) {
    const data = JSON.parse(jsonString);
    const payloads = data.payloads || data;

    let imported = 0;
    for (const p of payloads) {
        // Regenerate ID to avoid conflicts
        const newPayload = {
            ...p,
            id: generateId(),
            source: 'user',
            importedAt: new Date().toISOString()
        };
        await addToStore(STORES.USER_PAYLOADS, newPayload);
        imported++;
    }

    return imported;
}
