import React, { useState, useEffect, useRef } from 'react';

function formatDate(dateString, lang) {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    } catch {
        return dateString;
    }
}

/**
 * ArticleListRow - horizontal row used on list pages (articles / category / page).
 * Same article data contract as ArticleCard, only the layout differs.
 *
 * `badge` is optional and overrides the category pill text (used by the
 * series detail page to show "Partie N" instead of the category).
 */
export default function ArticleListRow({ article, lang = 'en', badge = '' }) {
    const [imageError, setImageError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        if (!article.cover) return;
        const img = imgRef.current;
        if (img?.complete && img.naturalHeight === 0) setImageError(true);
    }, [article.cover]);

    const showFallback = !article.cover || imageError;

    return (
        <a
            href={`/article/${article.slug}`}
            className="group flex gap-5 py-5 no-underline"
            style={{ borderBottom: '1px solid var(--bg-border)' }}
        >
            <div
                className="w-24 h-16 shrink-0 overflow-hidden rounded-md"
                style={{ background: 'var(--bg-panel)' }}
            >
                <img
                    ref={imgRef}
                    src={showFallback ? `/api/cover/${article.slug}.svg` : article.cover}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    loading="lazy"
                />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                    {(badge || article.category) && (
                        <span
                            className="text-[11px] font-medium px-2 py-0.5 rounded"
                            style={badge
                                ? { background: 'rgba(75,86,148,0.1)', color: '#4B5694' }
                                : { background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
                        >
                            {badge || article.category}
                        </span>
                    )}
                    <span className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                        {formatDate(article.date, lang)}
                    </span>
                    {article.readingTime && (
                        <>
                            <span style={{ color: 'var(--text-dim)' }}>·</span>
                            <span className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                                {article.readingTime} min
                            </span>
                        </>
                    )}
                </div>
                <h2
                    className="text-[16px] font-semibold leading-snug group-hover:underline"
                    style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", textUnderlineOffset: '2px' }}
                >
                    {article.title}
                </h2>
                {article.description && (
                    <p
                        className="text-[14px] mt-1 leading-relaxed line-clamp-2"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {article.description}
                    </p>
                )}
            </div>
        </a>
    );
}
