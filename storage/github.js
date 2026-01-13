/**
 * LUHUT BINSHAR - GitHub Payload Fetcher
 * Fetch and cache payloads from GitHub
 */

import { STORES, clearStore, addToStore, getAllFromStore, getFromStore, addToStore as setMeta } from './db.js';

// GitHub raw content base URL - Update this with your actual repo
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/YOUR_USERNAME/luhut-binshar/main';

// Payload categories to fetch
const CATEGORIES = [
    'xss',
    'sqli',
    'ssrf',
    'lfi',
    'rfi',
    'cmdi',
    'ssti',
    'open_redirect',
    'csrf'
];

/**
 * Fetch all payloads from GitHub
 */
export async function fetchGitHubPayloads() {
    const allPayloads = [];

    for (const category of CATEGORIES) {
        try {
            const url = `${GITHUB_RAW_BASE}/payloads/${category}.json`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                if (data.payloads && Array.isArray(data.payloads)) {
                    allPayloads.push(...data.payloads);
                }
            }
        } catch (error) {
            console.warn(`Failed to fetch ${category} payloads:`, error);
        }
    }

    return allPayloads;
}

/**
 * Fetch version info from GitHub
 */
export async function fetchVersionInfo() {
    try {
        const response = await fetch(`${GITHUB_RAW_BASE}/version.json`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn('Failed to fetch version info:', error);
    }
    return null;
}

/**
 * Check if update is needed
 */
export async function needsUpdate() {
    const localVersion = await getFromStore(STORES.META, 'version');
    const remoteVersion = await fetchVersionInfo();

    if (!localVersion || !remoteVersion) {
        return true;
    }

    return localVersion.value !== remoteVersion.version;
}

/**
 * Update GitHub payloads cache
 */
export async function updatePayloadsCache() {
    try {
        const payloads = await fetchGitHubPayloads();

        if (payloads.length > 0) {
            // Clear existing cache
            await clearStore(STORES.GITHUB_PAYLOADS);

            // Add all payloads
            for (const payload of payloads) {
                await addToStore(STORES.GITHUB_PAYLOADS, payload);
            }

            // Update version
            const versionInfo = await fetchVersionInfo();
            if (versionInfo) {
                await addToStore(STORES.META, {
                    key: 'version',
                    value: versionInfo.version
                });
                await addToStore(STORES.META, {
                    key: 'lastUpdate',
                    value: new Date().toISOString()
                });
            }

            return { success: true, count: payloads.length };
        }

        return { success: false, error: 'No payloads fetched' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Get cached payloads
 */
export async function getCachedPayloads() {
    return await getAllFromStore(STORES.GITHUB_PAYLOADS);
}

/**
 * Load embedded payloads (fallback when offline)
 */
export async function loadEmbeddedPayloads() {
    // This will load from local JSON files bundled with extension
    const payloads = [];

    for (const category of CATEGORIES) {
        try {
            const url = chrome.runtime.getURL(`payloads/${category}.json`);
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.payloads) {
                    payloads.push(...data.payloads);
                }
            }
        } catch (error) {
            console.warn(`Failed to load embedded ${category}:`, error);
        }
    }

    return payloads;
}
