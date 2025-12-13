import React, { useState, useEffect, useRef } from 'react';

export default function ArticleCard({ article }) {
    const [imageError, setImageError] = useState(false);
    const imgRef = useRef(null);

    // Check image validity on mount (handles cached broken images)
    useEffect(() => {
        if (!article.cover) {
            setImageError(true);
            return;
        }

        const img = imgRef.current;
        if (img && img.complete) {
            // Image already loaded (from cache)
            if (img.naturalHeight === 0) {
                // Image failed to load
                setImageError(true);
            }
        }
    }, [article.cover]);

    // Handler for new image loading errors
    const handleImageError = (e) => {
        setImageError(true);
    };

    // Determine if we should show gradient (no cover or image error)
    const showGradient = !article.cover || imageError;

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <a
            href={`/article/${article.slug}`}
            className="group block relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none z-10" />

            {/* Image or Gradient Fallback */}
            <div className="relative h-56 overflow-hidden">
                {showGradient ? (
                    // Gradient fallback with category color
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6 relative">
                        {/* Decorative circles */}
                        <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />

                        <div className="text-center text-white px-4 relative z-10">
                            <div className="text-xl md:text-2xl font-bold line-clamp-4 leading-tight">
                                {article.title}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                        <img
                            ref={imgRef}
                            src={article.cover}
                            alt={article.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            onError={handleImageError}
                            loading="lazy"
                        />
                    </>
                )}

                {/* Category badge floating on image - always visible */}
                <div className="absolute top-4 left-4 z-20">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-indigo-600 font-semibold text-sm rounded-full shadow-lg border border-white/20">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                        {article.category}
                    </span>
                </div>

                {/* Date badge */}
                <div className="absolute bottom-4 right-4 z-20">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/10">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(article.date)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="relative p-6 z-20">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                    {article.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                    {article.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.slice(0, 3).map(tag => (
                        <span
                            key={tag}
                            className="px-2.5 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-md border border-gray-100 dark:border-gray-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-100 dark:group-hover:border-indigo-700 transition-colors duration-300"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Read more with arrow */}
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                    <span>Lire l'article</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>

            {/* Accent border on hover */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </a>
    );
}
