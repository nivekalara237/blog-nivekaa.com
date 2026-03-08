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
                borderRight: '2px solid var(--bg-border)',
                cursor: 'pointer',
                background: active ? 'rgba(35,114,39,0.18)' : 'transparent',
                textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(35,114,39,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = active ? 'rgba(35,114,39,0.18)' : 'transparent'; }}
        >
            <span style={{ color: 'var(--yellow-dark)', transition: 'color 0.1s' }}>
                <IconComponent className="w-6 h-6" />
            </span>
            <span
                className="text-center font-bold uppercase"
                style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: active ? 'var(--yellow-light)' : 'var(--text-secondary)',
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
                        color: 'var(--green-light)',
                        background: 'rgba(35,114,39,0.25)',
                        padding: '1px 5px',
                        border: '1px solid var(--green-dark)',
                    }}
                >
                    {count}
                </span>
            )}
        </a>
    );
}
