// API Configuration
export const API_CONFIG = {
    baseUrl: import.meta.env.PUBLIC_API_URL || 'https://cloudnive-api.nivekaa.com',
    imageUrl: import.meta.env.PUBLIC_IMAGE_URL,
    endpoints: {
        articles: '/articles',
        article: (slug) => `/articles/${slug}`,
        notes: '/notes',
        notesTree: '/notes/tree',
        notesSearch: '/notes/search',
        note: (slug) => `/notes/${slug}`,
        images: '/images',
        image: (filename) => `/images/${filename}`
    }
};

// API Helper Functions
export const api = {
    // Get all articles with optional filters
    async getArticles(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.articles}${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
            // Return empty result instead of throwing
            return {
                items: [],
                total: 0,
                page: params.page || 1,
                limit: params.limit || 10,
                totalPages: 0
            };
        }
        return response.json();
    },


    // Get single article by slug
    async getArticle(slug, lang) {
        const langParam = lang ? `?lang=${lang}` : '';
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.article(slug)}${langParam}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Article not found');
        }
        return response.json();
    },

    // Create new article
    async createArticle(articleData) {
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.articles}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(articleData)
        });

        if (!response.ok) throw new Error('Failed to create article');
        return response.json();
    },

    // Upload cover image
    async uploadImage(imageData) {
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.images}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(imageData)
        });

        if (!response.ok) throw new Error('Failed to upload image');
        return response.json();
    },

    // Delete cover image
    async deleteImage(filename) {
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.image(filename)}`;

        const response = await fetch(url, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete image');
        return response.json();
    },

    // --- NOTES API ---
    async getNotesTree(lang) {
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.notesTree}${lang ? `?lang=${lang}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) return { tree: [] };
        return response.json();
    },
    async updateNotesTree(treeData) {
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.notesTree}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tree: treeData })
        });
        if (!response.ok) throw new Error('Failed to update notes tree');
        return response.json();
    },
    async getNote(slug, lang) {
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.note(slug)}${lang ? `?lang=${lang}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Note not found');
        return response.json();
    },
    async createNote(noteData) {
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.notes}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        });
        if (!response.ok) throw new Error('Failed to create note');
        return response.json();
    },
    async updateNote(slug, noteData) {
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.note(slug)}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        });
        if (!response.ok) throw new Error('Failed to update note');
        return response.json();
    },
    async deleteNote(slug) {
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.note(slug)}`;
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete note');
        return response.json();
    }
};
