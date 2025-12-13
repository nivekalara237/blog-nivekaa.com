// API Configuration
export const API_CONFIG = {
    baseUrl: import.meta.env.PUBLIC_API_URL || 'https://cloudnive-api.nivekaa.com',
    imageUrl: import.meta.env.PUBLIC_IMAGE_URL,
    endpoints: {
        articles: '/articles',
        article: (slug) => `/articles/${slug}`,
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
    async getArticle(slug) {
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.article(slug)}`;

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
    }
};
