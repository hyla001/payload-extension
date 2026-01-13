/**
 * LUHUT BINSHAR - Optimal Search Logic
 * Fast fuzzy search with scoring
 */

/**
 * Optimal search algorithm with scoring
 * @param {Array} payloads - Array of payload objects
 * @param {string} query - Search query
 * @param {Object} filters - Category and subcategory filters
 * @returns {Array} Sorted results with relevance scores
 */
export function searchPayloads(payloads, query, filters = {}) {
    const { category = 'all', subcategory = null } = filters;

    // Step 1: Filter by category
    let filtered = payloads;

    if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }

    if (subcategory) {
        filtered = filtered.filter(p => p.subcategory === subcategory);
    }

    // Step 2: If no query, return filtered results
    if (!query || query.trim() === '') {
        return filtered;
    }

    // Step 3: Normalize query
    const normalizedQuery = query.toLowerCase().trim();
    const queryTerms = normalizedQuery.split(/\s+/);

    // Step 4: Score and filter
    const scored = filtered.map(payload => {
        const score = calculateScore(payload, queryTerms, normalizedQuery);
        return { payload, score };
    });

    // Step 5: Filter out zero scores and sort by score descending
    return scored
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.payload);
}

/**
 * Calculate relevance score for a payload
 * Higher score = more relevant
 */
function calculateScore(payload, queryTerms, fullQuery) {
    let score = 0;

    const title = payload.title.toLowerCase();
    const payloadText = payload.payload.toLowerCase();
    const subcategory = (payload.subcategory || '').toLowerCase();
    const notes = (payload.notes || '').toLowerCase();
    const tags = (payload.tags || []).map(t => t.toLowerCase());

    // Exact title match (highest priority)
    if (title === fullQuery) {
        score += 100;
    }
    // Title starts with query
    else if (title.startsWith(fullQuery)) {
        score += 80;
    }
    // Title contains query
    else if (title.includes(fullQuery)) {
        score += 60;
    }

    // Check each query term
    for (const term of queryTerms) {
        // Title contains term
        if (title.includes(term)) {
            score += 20;
        }

        // Payload contains term
        if (payloadText.includes(term)) {
            score += 15;
        }

        // Subcategory matches
        if (subcategory.includes(term)) {
            score += 25;
        }

        // Tag exact match
        if (tags.includes(term)) {
            score += 30;
        }

        // Tag partial match
        if (tags.some(tag => tag.includes(term))) {
            score += 15;
        }

        // Notes contain term
        if (notes.includes(term)) {
            score += 10;
        }
    }

    // Bonus for shorter payloads (more specific)
    if (payloadText.length < 50) {
        score += 5;
    }

    return score;
}

/**
 * Get unique subcategories for a category
 */
export function getSubcategories(payloads, category) {
    if (category === 'all') return [];

    const subcategories = new Set();
    payloads.forEach(p => {
        if (p.category === category && p.subcategory) {
            subcategories.add(p.subcategory);
        }
    });

    return Array.from(subcategories).sort();
}

/**
 * Sort payloads by different criteria
 */
export function sortPayloads(payloads, sortBy = 'title') {
    const sorted = [...payloads];

    switch (sortBy) {
        case 'title':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));

        case 'level':
            const levelOrder = { 'high': 0, 'medium': 1, 'low': 2 };
            return sorted.sort((a, b) =>
                (levelOrder[a.level] || 3) - (levelOrder[b.level] || 3)
            );

        case 'recent':
            return sorted.sort((a, b) => {
                // User payloads first, then by createdAt
                if (a.source === 'user' && b.source !== 'user') return -1;
                if (a.source !== 'user' && b.source === 'user') return 1;
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return 0;
            });

        default:
            return sorted;
    }
}

/**
 * Highlight search matches in text
 */
export function highlightMatches(text, query) {
    if (!query) return escapeHtml(text);

    const escaped = escapeHtml(text);
    const terms = query.toLowerCase().split(/\s+/);

    let result = escaped;
    for (const term of terms) {
        if (!term) continue;
        const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
        result = result.replace(regex, '<mark>$1</mark>');
    }

    return result;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
