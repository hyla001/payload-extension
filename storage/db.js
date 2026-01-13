/**
 * LUHUT BINSHAR - IndexedDB Storage
 * Database initialization and helpers
 */

const DB_NAME = 'payloadVault';
const DB_VERSION = 1;

const STORES = {
    GITHUB_PAYLOADS: 'github_payloads',
    USER_PAYLOADS: 'user_payloads',
    FAVORITES: 'favorites',
    META: 'meta'
};

let db = null;

/**
 * Initialize IndexedDB
 */
export function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // GitHub payloads store
            if (!database.objectStoreNames.contains(STORES.GITHUB_PAYLOADS)) {
                const githubStore = database.createObjectStore(STORES.GITHUB_PAYLOADS, { keyPath: 'id' });
                githubStore.createIndex('category', 'category', { unique: false });
                githubStore.createIndex('subcategory', 'subcategory', { unique: false });
                githubStore.createIndex('title', 'title', { unique: false });
                githubStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
            }

            // User payloads store
            if (!database.objectStoreNames.contains(STORES.USER_PAYLOADS)) {
                const userStore = database.createObjectStore(STORES.USER_PAYLOADS, { keyPath: 'id' });
                userStore.createIndex('category', 'category', { unique: false });
                userStore.createIndex('subcategory', 'subcategory', { unique: false });
                userStore.createIndex('title', 'title', { unique: false });
                userStore.createIndex('createdAt', 'createdAt', { unique: false });
            }

            // Favorites store
            if (!database.objectStoreNames.contains(STORES.FAVORITES)) {
                database.createObjectStore(STORES.FAVORITES, { keyPath: 'id' });
            }

            // Meta store
            if (!database.objectStoreNames.contains(STORES.META)) {
                database.createObjectStore(STORES.META, { keyPath: 'key' });
            }
        };
    });
}

/**
 * Get database instance
 */
export function getDB() {
    return db;
}

/**
 * Generic store operations
 */
export function getStore(storeName, mode = 'readonly') {
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
}

export function getAllFromStore(storeName) {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function addToStore(storeName, data) {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, 'readwrite');
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function deleteFromStore(storeName, key) {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, 'readwrite');
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export function clearStore(storeName) {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, 'readwrite');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export function getFromStore(storeName, key) {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export { STORES };
