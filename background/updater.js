/**
 * LUHUT BINSHAR - Background Updater
 * Service worker for payload updates
 */

// Check for updates on install
chrome.runtime.onInstalled.addListener(async () => {
    console.log('LUHUT BINSHAR installed');

    // Set alarm for periodic updates (every 24 hours)
    if (chrome.alarms) {
        chrome.alarms.create('checkUpdates', { periodInMinutes: 1440 });
    }

    // Initial update check
    await checkForUpdates();
});

// Handle alarm (with safety check)
if (chrome.alarms) {
    chrome.alarms.onAlarm.addListener(async (alarm) => {
        if (alarm.name === 'checkUpdates') {
            await checkForUpdates();
        }
    });
}

// Check for payload updates from GitHub
async function checkForUpdates() {
    try {
        const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/hyla001/luhut-binshar/main';

        // Fetch version info
        const response = await fetch(`${GITHUB_RAW_BASE}/version.json`);
        if (!response.ok) return;

        const remoteVersion = await response.json();

        // Get local version from storage
        const result = await chrome.storage.local.get('payloadVersion');
        const localVersion = result.payloadVersion;

        // If version changed, notify popup to refresh
        if (!localVersion || localVersion !== remoteVersion.version) {
            console.log('New payloads available:', remoteVersion.version);

            // Fetch all payloads
            await updatePayloadsCache(GITHUB_RAW_BASE);

            // Update stored version
            await chrome.storage.local.set({ payloadVersion: remoteVersion.version });
        }
    } catch (error) {
        console.warn('Update check failed:', error);
    }
}

async function updatePayloadsCache(baseUrl) {
    const categories = ['xss', 'sqli', 'ssrf', 'lfi', 'rfi', 'cmdi', 'ssti', 'open_redirect', 'csrf', '2fa_bypass', 'waf_bypass'];
    const allPayloads = [];

    for (const category of categories) {
        try {
            const response = await fetch(`${baseUrl}/payloads/${category}.json`);
            if (response.ok) {
                const data = await response.json();
                if (data.payloads) {
                    allPayloads.push(...data.payloads);
                }
            }
        } catch (error) {
            console.warn(`Failed to fetch ${category}:`, error);
        }
    }

    // Store in chrome.storage for quick access
    if (allPayloads.length > 0) {
        await chrome.storage.local.set({
            cachedPayloads: allPayloads,
            lastUpdate: new Date().toISOString()
        });
        console.log(`Cached ${allPayloads.length} payloads`);
    }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'checkUpdates') {
        checkForUpdates().then(() => sendResponse({ success: true }));
        return true;
    }

    if (message.action === 'getCachedPayloads') {
        chrome.storage.local.get('cachedPayloads').then(result => {
            sendResponse({ payloads: result.cachedPayloads || [] });
        });
        return true;
    }
});
