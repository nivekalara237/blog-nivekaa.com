import React, { useState, useEffect, useRef } from 'react';

import { getCategoryIconComponent } from './IconHelper.jsx';

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        });
    } catch {
        return dateString;
    }
}

export default function ArticleCard({ article }) {
    const [imageError, setImageError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        if (!article.cover) { setImageError(true); return; }
        const img = imgRef.current;
        if (img?.complete && img.naturalHeight === 0) setImageError(true);
    }, [article.cover]);

    const showFallback = !article.cover || imageError;

    // console.log(article);

    return (
        <a
            href={`/article/${article.slug}`}
            className="article-card group block no-underline"
            style={{
                background: 'var(--bg-surface)',
                border: '3px solid var(--bg-border)',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.1s, box-shadow 0.1s, border-color 0.1s',
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translate(-3px,-3px)';
                e.currentTarget.style.boxShadow = '7px 7px 0 rgba(0,0,0,0.4), 0 0 20px rgba(35,114,39,0.2)';
                e.currentTarget.style.borderColor = 'var(--green-dark)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translate(0,0)';
                e.currentTarget.style.boxShadow = '4px 4px 0 rgba(0,0,0,0.4)';
                e.currentTarget.style.borderColor = 'var(--bg-border)';
            }}
        >
            {/* Cover area */}
            <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                {showFallback ? (
                    <img
                        src={`/api/cover/${article.slug}.svg`}
                        alt={`Default cover for ${article.title}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img
                        ref={imgRef}
                        src={article.cover}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                )}

                {/* Category tag */}
                {article.category && (
                    <div
                        style={{
                            position: 'absolute', top: '10px', left: '10px',
                            background: 'var(--green-dark)',
                            color: 'var(--yellow-light)',
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 700,
                            fontSize: '10px',
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase',
                            padding: '3px 10px',
                            border: '2px solid var(--green-light)',
                            zIndex: 2,
                        }}
                    >
                        {article.category}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-4 gap-2">
                {/* Meta */}
                <div
                    className="flex items-center gap-2 text-xs"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-dim)' }}
                >
                    <span style={{ color: 'var(--green-light)' }}>{article.category || 'Article'}</span>
                    <span style={{ color: 'var(--green-dark)' }}>•</span>
                    <span>{formatDate(article.date)}</span>
                    {article.readingTime && (
                        <>
                            <span style={{ color: 'var(--green-dark)' }}>•</span>
                            <span>{article.readingTime} min</span>
                        </>
                    )}
                </div>

                {/* Title */}
                <h3
                    className="text-sm font-bold leading-snug line-clamp-2 m-0"
                    style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        lineHeight: 1.4,
                        transition: 'color 0.1s',
                        WebkitLineClamp: 2,
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {article.title}
                </h3>

                {/* Excerpt */}
                {article.description && (
                    <p
                        className="text-xs m-0"
                        style={{
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '13px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            lineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {article.description}
                    </p>
                )}

                {/* Tags */}
                {article.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {article.tags.slice(0, 3).map(tag => (
                            <span
                                key={tag}
                                style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '10px',
                                    padding: '1px 6px',
                                    background: 'rgba(35,114,39,0.12)',
                                    border: '1px solid var(--green-dark)',
                                    color: 'var(--green-light)',
                                }}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div
                    className="flex items-center justify-between mt-auto pt-3"
                    style={{ borderTop: '1px solid var(--bg-border)' }}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="flex items-center justify-center text-xs font-bold"
                            style={{
                                width: '24px', height: '24px',
                                background: 'var(--green-dark)',
                                border: '2px solid var(--green-light)',
                                color: 'var(--yellow-light)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '9px',
                            }}
                        >
                            NK
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: "'Inter', sans-serif" }}>
                            {article.autorName || "Kevin Lactio Kemta"}
                        </span>
                    </div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '14px', transition: 'color 0.1s' }}>→</span>
                </div>
            </div>
        </a>
    );
}
