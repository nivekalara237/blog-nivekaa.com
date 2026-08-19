import React from 'react';
import { getCategoryIconComponent, Icons } from './IconHelper.jsx';

export default function CategoryCard({ category, href = null, count = null, icon = null, active = false }) {
    const link = href || `/category/${encodeURIComponent(category)}`;

    // Determine the Icon component
    let IconComponent;
    if (typeof icon === 'function') {
        IconComponent = icon;
    } else if (typeof icon === 'string' && Icons[icon]) {
        IconComponent = Icons[icon];
    } else {
        IconComponent = getCategoryIconComponent(category);
    }

    return (
        <a
            href={link}
            className="category-pill flex flex-col items-center justify-center gap-2 no-underline flex-shrink-0 transition-all duration-100"
            style={{
                padding: '12px 22px',
                minWidth: '110px',
                borderRight: '1px solid var(--bg-border)',
                cursor: 'pointer',
                background: active ? 'var(--bg-panel)' : 'transparent',
                textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-panel)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--bg-panel)' : 'transparent'; }}
        >
            <span style={{ color: 'var(--green-dark)', transition: 'color 0.1s' }}>
                <IconComponent className="w-6 h-6" />
            </span>
            <span
                className="text-center font-medium uppercase"
                style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'color 0.1s',
                }}
            >
                {category}
            </span>
            {count !== null && (
                <span
                    style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '9px',
                        borderRadius: '999px',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-panel)',
                        padding: '1px 6px',
                        border: '1px solid var(--bg-border)',
                    }}
                >
                    {count}
                </span>
            )}
        </a>
    );
}
