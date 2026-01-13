/**
 * PELURU LUHUT - Tactical Vault
 * Main Popup Script - 100% Match React Design
 */

import { initDB, getAllFromStore, STORES } from '../storage/db.js';
import { getUserPayloads, addUserPayload, toggleFavorite, getFavorites } from '../storage/user.js';
import { searchPayloads } from '../utils/search.js';

// State
let allPayloads = [];
let filteredPayloads = [];
let favorites = new Set();
let currentCategory = 'all';
let searchQuery = '';
let selectedCategory = 'XSS';

// DOM Elements
const mainScreen = document.getElementById('mainScreen');
const addScreen = document.getElementById('addScreen');
const settingsScreen = document.getElementById('settingsScreen');
const searchInput = document.getElementById('searchInput');
const payloadsList = document.getElementById('payloadsList');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        await loadPayloads();
        await loadFavorites();
        setupEventListeners();
        renderPayloads();
    } catch (error) {
        console.error('Init failed:', error);
    }
});

async function loadPayloads() {
    const githubPayloads = await getAllFromStore(STORES.GITHUB_PAYLOADS);
    const userPayloads = await getUserPayloads();

    if (githubPayloads.length === 0) {
        const embedded = await loadEmbeddedPayloads();
        allPayloads = [...embedded, ...userPayloads];
    } else {
        allPayloads = [...githubPayloads, ...userPayloads];
    }

    filteredPayloads = allPayloads;
}

async function loadEmbeddedPayloads() {
    const categories = ['xss', 'sqli', 'ssrf', 'lfi', 'rfi', 'cmdi', 'ssti', 'open_redirect', 'csrf'];
    const payloads = [];

    for (const category of categories) {
        try {
            const url = chrome.runtime.getURL(`payloads/${category}.json`);
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.payloads) payloads.push(...data.payloads);
            }
        } catch (e) { }
    }

    return payloads;
}

async function loadFavorites() {
    const favList = await getFavorites();
    favorites = new Set(favList.map(f => f.id));
}

function setupEventListeners() {
    // Search
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value;
            filterAndRender();
        }, 150);
    });

    // Category tabs
    document.querySelectorAll('.category-scroll .category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.category-scroll .category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            filterAndRender();
        });
    });

    // Add button (promo card)
    document.getElementById('addBtn').addEventListener('click', () => showScreen('add'));

    // Back buttons
    document.getElementById('backFromAdd').addEventListener('click', () => showScreen('main'));
    document.getElementById('backFromSettings').addEventListener('click', () => showScreen('main'));
    document.getElementById('cancelAdd').addEventListener('click', () => showScreen('main'));

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => showScreen('settings'));

    // Category options in form
    document.querySelectorAll('.category-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.category-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            selectedCategory = opt.dataset.value;
            document.getElementById('payloadCategory').value = selectedCategory;
        });
    });

    // Add payload form
    document.getElementById('addPayloadForm').addEventListener('submit', handleAddPayload);

    // Payload list clicks
    payloadsList.addEventListener('click', handlePayloadClick);

    // Settings buttons
    document.getElementById('syncBtn').addEventListener('click', () => showToast('Sync dimulai...'));
    document.getElementById('exportBtn').addEventListener('click', handleExport);
    document.getElementById('wipeBtn').addEventListener('click', () => showToast('Operasi dibatalkan'));
}

function showScreen(screen) {
    mainScreen.classList.add('hidden');
    addScreen.classList.add('hidden');
    settingsScreen.classList.add('hidden');

    if (screen === 'main') mainScreen.classList.remove('hidden');
    if (screen === 'add') addScreen.classList.remove('hidden');
    if (screen === 'settings') settingsScreen.classList.remove('hidden');
}

function filterAndRender() {
    filteredPayloads = searchPayloads(allPayloads, searchQuery, {
        category: currentCategory,
        subcategory: null
    });
    renderPayloads();
}

function renderPayloads() {
    if (filteredPayloads.length === 0) {
        payloadsList.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';

    payloadsList.innerHTML = filteredPayloads.map(p => `
    <div class="payload-card" data-id="${p.id}">
      <div class="payload-header">
        <div class="payload-info">
          <h3>${escapeHtml(p.title)}</h3>
          <span class="payload-category-badge">${p.category}</span>
        </div>
        <button class="favorite-btn ${favorites.has(p.id) ? 'active' : ''}" data-action="favorite">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${favorites.has(p.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      </div>
      
      <div class="payload-code">${escapeHtml(p.payload)}</div>
      
      <div class="payload-footer">
        <div class="payload-tags">
          ${(p.tags || []).slice(0, 2).map(t => `<span class="payload-tag">#${t}</span>`).join('')}
        </div>
        <div class="payload-actions">
          <button class="copy-btn" data-action="copy">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copy
          </button>
          <button class="weaponize-btn" data-action="weaponize">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 2v7.527a2 2 0 01-.211.896L4.72 20.55a1 1 0 00.9 1.45h12.76a1 1 0 00.9-1.45l-5.069-10.127A2 2 0 0114 9.527V2"/>
              <path d="M8.5 2h7M7 16h10"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

async function handlePayloadClick(e) {
    const card = e.target.closest('.payload-card');
    if (!card) return;

    const payloadId = card.dataset.id;
    const payload = allPayloads.find(p => p.id === payloadId);
    if (!payload) return;

    const actionBtn = e.target.closest('[data-action]');

    if (actionBtn) {
        e.stopPropagation();
        const action = actionBtn.dataset.action;

        if (action === 'copy') {
            await copyToClipboard(payload.payload);
            showToast('Amunisi disalin');
        } else if (action === 'favorite') {
            const isFav = await toggleFavorite(payloadId);
            if (isFav) {
                favorites.add(payloadId);
                actionBtn.classList.add('active');
            } else {
                favorites.delete(payloadId);
                actionBtn.classList.remove('active');
            }
            actionBtn.querySelector('svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
        } else if (action === 'weaponize') {
            showToast('Weaponized!');
        }
    } else {
        await copyToClipboard(payload.payload);
        showToast('Amunisi disalin');
    }
}

async function handleAddPayload(e) {
    e.preventDefault();

    const title = document.getElementById('payloadTitle').value.trim();
    const content = document.getElementById('payloadContent').value.trim();

    if (!title || !content) {
        showToast('Lengkapi data');
        return;
    }

    try {
        const newPayload = await addUserPayload({
            title,
            payload: content,
            category: selectedCategory,
            subcategory: 'Custom',
            tags: [],
            notes: ''
        });

        allPayloads.unshift(newPayload);
        filterAndRender();
        showScreen('main');

        document.getElementById('addPayloadForm').reset();
        document.querySelectorAll('.category-option').forEach(o => o.classList.remove('active'));
        document.querySelector('.category-option[data-value="XSS"]').classList.add('active');
        selectedCategory = 'XSS';

        showToast('Amunisi diproduksi');
    } catch (error) {
        showToast('Gagal menyimpan');
    }
}

async function handleExport() {
    try {
        const userPayloads = await getUserPayloads();
        const data = JSON.stringify({ exportedAt: new Date().toISOString(), payloads: userPayloads }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'peluru-luhut-export.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Export berhasil');
    } catch (error) {
        showToast('Export gagal');
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
