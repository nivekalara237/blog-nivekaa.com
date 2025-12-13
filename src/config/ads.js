// Advertisement Configuration

// Enable or disable ads globally
export const ADS_ENABLED = false;

// Ad placement configuration
export const AD_CONFIG = {
    // Show ad after the article header (before content)
    showBeforeContent: true,

    // Show ad in the middle of the article content
    showInContent: true,

    // Show ad after the article content (before author card)
    showAfterContent: true,

    // Show ad in the sidebar
    showInSidebar: true,
};

// Ad content - You can customize these
export const AD_SLOTS = {
    // Banner ad before content
    beforeContent: {
        title: "Partenaire",
        description: "Découvrez nos solutions",
        link: "https://example.com",
        image: "https://via.placeholder.com/728x90/6366f1/ffffff?text=Votre+Publicité+Ici",
        cta: "En savoir plus",
    },

    // Sidebar ad
    sidebar: {
        title: "Recommandé",
        description: "Service premium pour développeurs",
        link: "https://example.com",
        image: "https://via.placeholder.com/300x250/6366f1/ffffff?text=Publicité",
        cta: "Découvrir",
    },

    // In-content ad
    inContent: {
        title: "Sponsorisé",
        description: "Outils essentiels pour votre workflow",
        link: "https://example.com",
        image: "https://via.placeholder.com/728x90/6366f1/ffffff?text=Contenu+Sponsorisé",
        cta: "Voir l'offre",
    },

    // After content ad
    afterContent: {
        title: "Partenaire",
        description: "Formation en ligne pour développeurs",
        link: "https://example.com",
        image: "https://via.placeholder.com/728x90/6366f1/ffffff?text=Publicité",
        cta: "S'inscrire",
    },
};
