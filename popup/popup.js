// ===== STATE =====
let payloads = [
    { id: 1, title: 'Simple Alert', category: 'XSS', code: "<script>alert('XSS')</script>", tags: ['basic', 'script'], favorite: false },
    { id: 2, title: 'Error-Based SQLi', category: 'SQLi', code: "admin' OR 1=1--", tags: ['auth', 'bypass'], favorite: true },
    { id: 3, title: 'Local File Inclusion', category: 'LFI', code: "../../../../../etc/passwd", tags: ['linux', 'files'], favorite: false },
    { id: 4, title: 'Metadata SSRF', category: 'SSRF', code: "http://169.254.169.254/latest/meta-data/", tags: ['aws', 'cloud'], favorite: false },
    { id: 5, title: 'Ping Command Injection', category: 'CMDi', code: "; ping -c 10 127.0.0.1 #", tags: ['rce', 'linux'], favorite: false },
    { id: 6, title: 'Jinja2 SSTI', category: 'SSTI', code: "{{config.items()}}", tags: ['python', 'flask'], favorite: false },
];
let activeCategory = 'All';
let selectedFormCategory = 'XSS';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
    renderPayloads();
    setupEventListeners();
});

function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', filterPayloads);

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

    // Buttons
    document.getElementById('settingsBtn').addEventListener('click', () => showScreen('settings'));
    document.getElementById('addBtn').addEventListener('click', () => showScreen('add'));
    document.getElementById('backFromAdd').addEventListener('click', () => showScreen('main'));
    document.getElementById('backFromSettings').addEventListener('click', () => showScreen('main'));
    document.getElementById('cancelAdd').addEventListener('click', () => showScreen('main'));
    document.getElementById('savePayloadBtn').addEventListener('click', savePayload);

    // Settings buttons
    document.getElementById('syncBtn').addEventListener('click', () => showToast('Sync dimulai...'));
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('wipeBtn').addEventListener('click', () => showToast('Operasi dibatalkan'));
}

// ===== SCREENS =====
function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(name + 'Screen').classList.remove('hidden');
}

// ===== CATEGORIES =====
function setCategory(cat, btn) {
    activeCategory = cat;
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    filterPayloads();
}

function selectCategory(cat, btn) {
    selectedFormCategory = cat;
    document.querySelectorAll('.category-option').forEach(o => o.classList.remove('active'));
    btn.classList.add('active');
}

// ===== FILTER & RENDER =====
function filterPayloads() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = payloads.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(query) || p.code.toLowerCase().includes(query);
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        return matchSearch && matchCat;
    });
    renderPayloads(filtered);
}

function renderPayloads(list) {
    if (!list) list = payloads;
    const container = document.getElementById('payloadsList');
    const empty = document.getElementById('emptyState');

    if (list.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'flex';
        return;
    }

    empty.style.display = 'none';
    container.innerHTML = list.map(p => `
    <div class="payload-card" data-id="${p.id}">
      <div class="payload-header">
        <div class="payload-info">
          <h3>${escapeHtml(p.title)}</h3>
          <span class="payload-category-badge">${p.category}</span>
        </div>
        <button class="favorite-btn ${p.favorite ? 'active' : ''}" data-action="favorite" data-id="${p.id}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${p.favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      </div>
      <div class="payload-code">${escapeHtml(p.code)}</div>
      <div class="payload-footer">
        <div class="payload-tags">${p.tags.slice(0, 2).map(t => `<span class="payload-tag">#${t}</span>`).join('')}</div>
        <div class="payload-actions">
          <button class="copy-btn" data-action="copy" data-code="${escapeHtml(p.code)}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copy
          </button>
          <button class="weaponize-btn" data-action="weaponize">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 2v7.527a2 2 0 01-.211.896L4.72 20.55a1 1 0 00.9 1.45h12.76a1 1 0 00.9-1.45l-5.069-10.127A2 2 0 0114 9.527V2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

    // Add event listeners to dynamically created buttons
    container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', handlePayloadAction);
    });
}

function handlePayloadAction(e) {
    const btn = e.currentTarget;
    const action = btn.dataset.action;

    if (action === 'copy') {
        const code = btn.dataset.code;
        navigator.clipboard.writeText(code).then(() => showToast('Amunisi disalin'));
    } else if (action === 'favorite') {
        const id = parseInt(btn.dataset.id);
        toggleFavorite(id);
    } else if (action === 'weaponize') {
        showToast('Weaponized!');
    }
}

// ===== ACTIONS =====
function toggleFavorite(id) {
    const p = payloads.find(x => x.id === id);
    if (p) {
        p.favorite = !p.favorite;
        filterPayloads();
        showToast(p.favorite ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit');
    }
}

function savePayload() {
    const title = document.getElementById('payloadTitle').value.trim();
    const code = document.getElementById('payloadContent').value.trim();

    if (!title || !code) {
        showToast('Lengkapi data amunisi');
        return;
    }

    payloads.unshift({
        id: Date.now(),
        title,
        category: selectedFormCategory,
        code,
        tags: ['custom'],
        favorite: false
    });

    document.getElementById('payloadTitle').value = '';
    document.getElementById('payloadContent').value = '';

    showScreen('main');
    filterPayloads();
    showToast('Amunisi diproduksi');
}

function exportData() {
    const data = JSON.stringify({ exportedAt: new Date().toISOString(), payloads }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'peluru-luhut-export.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export berhasil');
}

// ===== TOAST =====
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// ===== UTILS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
