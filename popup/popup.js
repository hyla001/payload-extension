// ===== PELURU LUHUT v2.0 - UPGRADED =====
// Features: Persistent Storage, GitHub Fetch, Subcategory, Delete, Theme, Advanced Search

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/hyla001/luhut-binshar/main';
const STORAGE_KEYS = {
    USER_PAYLOADS: 'userPayloads',
    FAVORITES: 'favorites',
    GITHUB_PAYLOADS: 'githubPayloads',
    THEME: 'theme',
    LAST_SYNC: 'lastSync'
};

// ===== STATE =====
let githubPayloads = [];
let userPayloads = [];
let favorites = new Set();
let allPayloads = [];
let activeCategory = 'All';
let activeSubcategory = null;
let selectedFormCategory = 'XSS';
let currentTheme = 'dark';
let searchMode = 'normal'; // 'normal' or 'regex'

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function () {
    await loadTheme();
    await loadFromStorage();
    await fetchGitHubPayloads();
    combinePayloads();
    renderPayloads();
    renderSubcategories();
    setupEventListeners();
});

// ===== STORAGE FUNCTIONS =====
async function loadFromStorage() {
    try {
        const result = await chrome.storage.local.get([
            STORAGE_KEYS.USER_PAYLOADS,
            STORAGE_KEYS.FAVORITES,
            STORAGE_KEYS.GITHUB_PAYLOADS,
            STORAGE_KEYS.THEME
        ]);

        userPayloads = result[STORAGE_KEYS.USER_PAYLOADS] || [];
        favorites = new Set(result[STORAGE_KEYS.FAVORITES] || []);
        githubPayloads = result[STORAGE_KEYS.GITHUB_PAYLOADS] || [];
        currentTheme = result[STORAGE_KEYS.THEME] || 'dark';
    } catch (e) {
        console.warn('Storage load failed:', e);
    }
}

async function saveUserPayloads() {
    try {
        await chrome.storage.local.set({ [STORAGE_KEYS.USER_PAYLOADS]: userPayloads });
    } catch (e) {
        console.warn('Save failed:', e);
    }
}

async function saveFavorites() {
    try {
        await chrome.storage.local.set({ [STORAGE_KEYS.FAVORITES]: Array.from(favorites) });
    } catch (e) {
        console.warn('Save favorites failed:', e);
    }
}

async function saveTheme() {
    try {
        await chrome.storage.local.set({ [STORAGE_KEYS.THEME]: currentTheme });
    } catch (e) {
        console.warn('Save theme failed:', e);
    }
}

// ===== GITHUB FETCH =====
async function fetchGitHubPayloads(forceRefresh = false) {
    try {
        // Check if we have cached data and it's recent (less than 1 hour old)
        const result = await chrome.storage.local.get([STORAGE_KEYS.GITHUB_PAYLOADS, STORAGE_KEYS.LAST_SYNC]);
        const lastSync = result[STORAGE_KEYS.LAST_SYNC] || 0;
        const oneHour = 60 * 60 * 1000;

        if (!forceRefresh && result[STORAGE_KEYS.GITHUB_PAYLOADS]?.length > 0 && (Date.now() - lastSync) < oneHour) {
            githubPayloads = result[STORAGE_KEYS.GITHUB_PAYLOADS];
            return;
        }

        const categories = ['xss', 'sqli', 'ssrf', 'lfi', 'rfi', 'cmdi', 'ssti', 'open_redirect', 'csrf'];
        const fetched = [];

        for (const cat of categories) {
            try {
                const response = await fetch(`${GITHUB_RAW_BASE}/payloads/${cat}.json`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.payloads) {
                        fetched.push(...data.payloads.map(p => ({
                            ...p,
                            source: 'github',
                            id: p.id || `gh_${cat}_${Math.random().toString(36).substr(2, 9)}`
                        })));
                    }
                }
            } catch (e) {
                console.warn(`Failed to fetch ${cat}:`, e);
            }
        }

        if (fetched.length > 0) {
            githubPayloads = fetched;
            await chrome.storage.local.set({
                [STORAGE_KEYS.GITHUB_PAYLOADS]: fetched,
                [STORAGE_KEYS.LAST_SYNC]: Date.now()
            });
        }
    } catch (e) {
        console.warn('GitHub fetch failed:', e);
    }
}

function combinePayloads() {
    // Mark user payloads with source
    const marked = userPayloads.map(p => ({ ...p, source: 'user' }));
    allPayloads = [...marked, ...githubPayloads];

    // Apply favorites
    allPayloads.forEach(p => {
        p.favorite = favorites.has(p.id);
    });
}

// ===== THEME =====
async function loadTheme() {
    try {
        const result = await chrome.storage.local.get(STORAGE_KEYS.THEME);
        currentTheme = result[STORAGE_KEYS.THEME] || 'dark';
        applyTheme();
    } catch (e) {
        currentTheme = 'dark';
        applyTheme();
    }
}

function applyTheme() {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${currentTheme}`);

    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        themeBtn.innerHTML = currentTheme === 'dark'
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveTheme();
    showToast(`Theme: ${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Search input with debounce
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => filterPayloads(), 150);
    });

    // Search mode toggle (normal/regex)
    document.getElementById('searchModeBtn')?.addEventListener('click', toggleSearchMode);

    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            setCategory(this.dataset.category, this);
        });
    });

    // Category options in form
    document.querySelectorAll('.category-option').forEach(opt => {
        opt.addEventListener('click', function () {
            selectCategory(this.dataset.category, this);
        });
    });

    // Navigation buttons
    document.getElementById('settingsBtn').addEventListener('click', () => showScreen('settings'));
    document.getElementById('addBtn').addEventListener('click', () => showScreen('add'));
    document.getElementById('backFromAdd').addEventListener('click', () => showScreen('main'));
    document.getElementById('backFromSettings').addEventListener('click', () => showScreen('main'));
    document.getElementById('cancelAdd').addEventListener('click', () => showScreen('main'));
    document.getElementById('savePayloadBtn').addEventListener('click', savePayload);

    // Settings buttons
    document.getElementById('syncBtn').addEventListener('click', syncPayloads);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('wipeBtn').addEventListener('click', wipeUserData);
    document.getElementById('themeBtn')?.addEventListener('click', toggleTheme);

    // Subcategory clicks
    document.getElementById('subcategoryList')?.addEventListener('click', handleSubcategoryClick);

    // Custom category input
    document.getElementById('addCustomCategoryBtn')?.addEventListener('click', addCustomCategory);
    document.getElementById('customCategory')?.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addCustomCategory();
    });
}

// ===== SCREENS =====
function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(name + 'Screen').classList.remove('hidden');
}

// ===== CATEGORIES & SUBCATEGORIES =====
function setCategory(cat, btn) {
    activeCategory = cat;
    activeSubcategory = null;
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderSubcategories();
    filterPayloads();
}

function selectCategory(cat, btn) {
    selectedFormCategory = cat;
    document.querySelectorAll('.category-option').forEach(o => o.classList.remove('active'));
    btn.classList.add('active');
    // Clear custom input when selecting predefined category
    const customInput = document.getElementById('customCategory');
    if (customInput) customInput.value = '';
}

function addCustomCategory() {
    const input = document.getElementById('customCategory');
    const value = input?.value.trim().toUpperCase();

    if (!value) {
        showToast('Masukkan nama kaliber');
        return;
    }

    if (value.length > 15) {
        showToast('Maksimal 15 karakter');
        return;
    }

    // Check if category already exists
    const existingBtn = document.querySelector(`.category-option[data-category="${value}"]`);
    if (existingBtn) {
        selectCategory(value, existingBtn);
        input.value = '';
        showToast('Kaliber sudah ada, dipilih');
        return;
    }

    // Create new category button with delete capability
    const grid = document.querySelector('.category-grid');
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-category-wrapper';
    wrapper.dataset.category = value;

    const newBtn = document.createElement('button');
    newBtn.type = 'button';
    newBtn.className = 'category-option custom active';
    newBtn.dataset.category = value;
    newBtn.innerHTML = `<span>${value}</span><span class="delete-category" data-cat="${value}">×</span>`;

    newBtn.addEventListener('click', function (e) {
        // If clicking delete button
        if (e.target.classList.contains('delete-category')) {
            e.stopPropagation();
            deleteCustomCategory(e.target.dataset.cat);
            return;
        }
        selectCategory(this.dataset.category, this);
    });

    // Deselect others and add new
    document.querySelectorAll('.category-option').forEach(o => o.classList.remove('active'));
    grid.appendChild(newBtn);
    selectedFormCategory = value;
    input.value = '';
    showToast(`Kaliber "${value}" ditambahkan`);
}

function deleteCustomCategory(cat) {
    const btn = document.querySelector(`.category-option[data-category="${cat}"]`);
    if (btn && btn.classList.contains('custom')) {
        btn.remove();
        // Select first category if the deleted one was selected
        if (selectedFormCategory === cat) {
            const firstBtn = document.querySelector('.category-option');
            if (firstBtn) {
                selectCategory(firstBtn.dataset.category, firstBtn);
            }
        }
        showToast(`Kaliber "${cat}" dihapus`);
    }
}

function getSubcategories(category) {
    if (category === 'All') return [];
    const subs = new Set();
    allPayloads.filter(p => p.category === category).forEach(p => {
        if (p.subcategory) subs.add(p.subcategory);
    });
    return Array.from(subs).sort();
}

function renderSubcategories() {
    const container = document.getElementById('subcategoryList');
    if (!container) return;

    const subs = getSubcategories(activeCategory);
    if (subs.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    container.innerHTML = `
    <button class="subcategory-btn ${!activeSubcategory ? 'active' : ''}" data-sub="">All</button>
    ${subs.map(s => `<button class="subcategory-btn ${activeSubcategory === s ? 'active' : ''}" data-sub="${s}">${s}</button>`).join('')}
  `;
}

function handleSubcategoryClick(e) {
    const btn = e.target.closest('.subcategory-btn');
    if (!btn) return;

    activeSubcategory = btn.dataset.sub || null;
    document.querySelectorAll('.subcategory-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterPayloads();
}

// ===== SEARCH =====
function toggleSearchMode() {
    searchMode = searchMode === 'normal' ? 'regex' : 'normal';
    const btn = document.getElementById('searchModeBtn');
    if (btn) {
        btn.classList.toggle('active', searchMode === 'regex');
        btn.title = searchMode === 'regex' ? 'Regex Mode ON' : 'Normal Search';
    }
    showToast(`Search: ${searchMode === 'regex' ? 'Regex Mode' : 'Normal'}`);
    filterPayloads();
}

function matchesSearch(payload, query) {
    if (!query) return true;

    if (searchMode === 'regex') {
        try {
            const regex = new RegExp(query, 'i');
            return regex.test(payload.title) ||
                regex.test(payload.payload || payload.code) ||
                (payload.tags || []).some(t => regex.test(t)) ||
                regex.test(payload.subcategory || '');
        } catch (e) {
            return false; // Invalid regex
        }
    } else {
        const q = query.toLowerCase();
        return payload.title.toLowerCase().includes(q) ||
            (payload.payload || payload.code || '').toLowerCase().includes(q) ||
            (payload.tags || []).some(t => t.toLowerCase().includes(q)) ||
            (payload.subcategory || '').toLowerCase().includes(q);
    }
}

// ===== FILTER & RENDER =====
function filterPayloads() {
    const query = document.getElementById('searchInput').value;

    const filtered = allPayloads.filter(p => {
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        const matchSub = !activeSubcategory || p.subcategory === activeSubcategory;
        const matchQuery = matchesSearch(p, query);
        return matchCat && matchSub && matchQuery;
    });

    // Sort: favorites first, then by title
    filtered.sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return a.title.localeCompare(b.title);
    });

    renderPayloads(filtered);
}

function renderPayloads(list) {
    if (!list) list = allPayloads;
    const container = document.getElementById('payloadsList');
    const empty = document.getElementById('emptyState');

    if (list.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'flex';
        return;
    }

    empty.style.display = 'none';
    container.innerHTML = list.map(p => {
        const code = p.payload || p.code || '';
        const isUserPayload = p.source === 'user';

        return `
    <div class="payload-card ${p.favorite ? 'is-favorite' : ''}" data-id="${p.id}">
      <div class="payload-header">
        <div class="payload-info">
          <h3>${escapeHtml(p.title)}</h3>
          <div class="payload-badges">
            <span class="payload-category-badge">${p.category}</span>
            ${p.subcategory ? `<span class="payload-subcategory-badge">${p.subcategory}</span>` : ''}
            ${isUserPayload ? '<span class="payload-user-badge">USER</span>' : ''}
          </div>
        </div>
        <div class="payload-header-actions">
          <button class="favorite-btn ${p.favorite ? 'active' : ''}" data-action="favorite" data-id="${p.id}" title="Favorite">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${p.favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          ${isUserPayload ? `
          <button class="delete-btn" data-action="delete" data-id="${p.id}" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
          ` : ''}
        </div>
      </div>
      <div class="payload-code">${escapeHtml(code)}</div>
      <div class="payload-footer">
        <div class="payload-tags">${(p.tags || []).slice(0, 3).map(t => `<span class="payload-tag">#${t}</span>`).join('')}</div>
        <div class="payload-actions">
          <button class="copy-btn" data-action="copy" data-code="${escapeHtml(code)}" title="Copy">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copy
          </button>
        </div>
      </div>
    </div>
  `}).join('');

    // Add event listeners
    container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', handlePayloadAction);
    });
}

function handlePayloadAction(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'copy') {
        const code = btn.dataset.code;
        navigator.clipboard.writeText(code).then(() => showToast('Amunisi disalin'));
    } else if (action === 'favorite') {
        toggleFavorite(id);
    } else if (action === 'delete') {
        deletePayload(id);
    }
}

// ===== PAYLOAD ACTIONS =====
function toggleFavorite(id) {
    if (favorites.has(id)) {
        favorites.delete(id);
    } else {
        favorites.add(id);
    }
    saveFavorites();
    combinePayloads();
    filterPayloads();
    showToast(favorites.has(id) ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit');
}

function deletePayload(id) {
    const payload = userPayloads.find(p => p.id === id);
    if (!payload) {
        showToast('Hanya bisa hapus payload buatan sendiri');
        return;
    }

    if (confirm(`Hapus payload "${payload.title}"?`)) {
        userPayloads = userPayloads.filter(p => p.id !== id);
        favorites.delete(id);
        saveUserPayloads();
        saveFavorites();
        combinePayloads();
        filterPayloads();
        showToast('Payload dihapus');
    }
}

function savePayload() {
    const title = document.getElementById('payloadTitle').value.trim();
    const code = document.getElementById('payloadContent').value.trim();

    if (!title || !code) {
        showToast('Lengkapi data amunisi');
        return;
    }

    const newPayload = {
        id: `user_${Date.now()}`,
        title,
        category: selectedFormCategory,
        subcategory: 'Custom',
        payload: code,
        tags: ['custom', 'user'],
        source: 'user'
    };

    userPayloads.unshift(newPayload);
    saveUserPayloads();
    combinePayloads();

    document.getElementById('payloadTitle').value = '';
    document.getElementById('payloadContent').value = '';

    showScreen('main');
    filterPayloads();
    showToast('Amunisi diproduksi');
}

// ===== SETTINGS ACTIONS =====
async function syncPayloads() {
    showToast('Syncing...');
    await fetchGitHubPayloads(true);
    combinePayloads();
    filterPayloads();
    showToast(`Synced! ${githubPayloads.length} payloads dari GitHub`);
}

function exportData() {
    const data = JSON.stringify({
        exportedAt: new Date().toISOString(),
        userPayloads,
        favorites: Array.from(favorites)
    }, null, 2);

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'peluru-luhut-export.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export berhasil');
}

async function wipeUserData() {
    if (confirm('Hapus semua data user (payloads & favorites)?\nPayload dari GitHub tidak akan dihapus.')) {
        userPayloads = [];
        favorites.clear();
        await saveUserPayloads();
        await saveFavorites();
        combinePayloads();
        filterPayloads();
        showToast('Data user dihapus');
    }
}

// ===== UTILITIES =====
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
