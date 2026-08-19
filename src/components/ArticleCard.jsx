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
                border: '1px solid var(--bg-border)',
                borderRadius: '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.15s, border-color 0.15s',
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = 'var(--green-dark)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
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
                            background: 'var(--bg-deep)',
                            color: 'var(--text-primary)',
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            fontSize: '10px',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            border: '1px solid var(--bg-border)',
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
                    {article.serie?.name && (
                        <span style={{ marginLeft: 'auto', color: '#4B5694', fontWeight: 600 }}>
                            Série{article.serie.indexNo ? ` · ${article.serie.indexNo}` : ''}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3
                    className="text-sm font-semibold leading-snug line-clamp-2 m-0"
                    style={{
                        fontFamily: "'Inter', sans-serif",
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
                                    padding: '1px 8px',
                                    borderRadius: '999px',
                                    background: 'var(--bg-panel)',
                                    border: '1px solid var(--bg-border)',
                                    color: 'var(--text-secondary)',
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
                            className="flex items-center justify-center text-xs font-semibold rounded-full"
                            style={{
                                width: '24px', height: '24px',
                                background: 'var(--green-dark)',
                                color: 'var(--bg-deep)',
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
