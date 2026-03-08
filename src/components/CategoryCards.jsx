import React from 'react';
import CategoryCard from './CategoryCard.jsx';

// All-categories definition with icon keys + priority order
const ALL_CATEGORIES = [
    { name: 'Cloud', icon: 'cloud', key: 'cloud' },
    { name: 'AWS', icon: 'cloud', key: 'aws' },
    { name: 'Terraform', icon: 'cog', key: 'terraform' },
    { name: 'Docker', icon: 'box', key: 'docker' },
    { name: 'Kubernetes', icon: 'box', key: 'kubernetes' },
    { name: 'CI/CD', icon: 'refresh', key: 'cicd' },
    { name: 'DevOps', icon: 'refresh', key: 'devops' },
    { name: 'Dev Backend', icon: 'code', key: 'backend' },
    { name: 'Sécurité', icon: 'lock', key: 'securite' },
    { name: 'Dev Frontend', icon: 'desktop', key: 'frontend' },
    { name: 'Linux', icon: 'terminal', key: 'linux' },
];

export default function CategoryCards({ counts = {} }) {
    // Normalize counts to find total
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    // Build list: filter to categories that have articles, keep rest as-is
    const normalizedCounts = {};
    Object.keys(counts).forEach(key => {
        normalizedCounts[key.toLowerCase()] = counts[key];
    });

    // Map ALL_CATEGORIES, enrich with count if available
    const enriched = ALL_CATEGORIES.map(cat => ({
        ...cat,
        count: normalizedCounts[cat.key] || normalizedCounts[cat.name.toLowerCase()] || null,
    })).filter(cat => cat.count); // only show categories with articles

    // If nothing matched, fall back to raw counts
    const display = enriched.length > 0
        ? enriched
        : Object.keys(counts).map(name => ({
            name,
            icon: 'document',
            count: counts[name],
        }));

    return (
        <div
            className="w-full"
            style={{
                background: 'var(--bg-surface)',
                borderTop: '3px solid var(--bg-border)',
                borderBottom: '3px solid var(--bg-border)',
            }}
        >
            {/* Inner container to center items */}
            <div className="max-w-7xl mx-auto flex justify-center items-stretch overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                <CategoryCard
                    category="Tous"
                    href="/articles"
                    count={total}
                    icon="globe"
                    active={false}
                />
                {display.map(cat => (
                    <CategoryCard
                        key={cat.name}
                        category={cat.name}
                        count={cat.count}
                        icon={cat.icon}
                    />
                ))}
                <CategoryCard
                    category="Voir tout"
                    href="/categories"
                    icon="arrowRight"
                />
            </div>
        </div>
    );
}
