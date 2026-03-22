import React from 'react';

/**
 * AdPanel - Composant de panneau publicitaire élégant
 * 
 * @param {Object} props
 * @param {Object} [props.ad] - Contenu de la publicité
 * @param {string} [props.variant] - Style variant: 'banner', 'sidebar', 'card'
 */
export default function AdPanel({ ad, variant = 'banner' }) {
    if (!ad) return null;

    const variants = {
        banner: 'w-full max-w-4xl mx-auto',
        sidebar: 'w-full',
        card: 'w-full max-w-2xl mx-auto',
    };

    return (
        <div className={`${variants[variant]} my-8`}>
            {/* Sponsored label */}
            <div className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2 text-center">
                Sponsorisé
            </div>

            <a
                href={ad.link}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block group"
            >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-lg">
                    {/* Image */}
                    {ad.image && (
                        <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700">
                            <img
                                src={ad.image}
                                alt={ad.title}
                                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {ad.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {ad.description}
                                </p>
                            </div>

                            {/* CTA Button */}
                            {ad.cta && (
                                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                                    {ad.cta}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
}
