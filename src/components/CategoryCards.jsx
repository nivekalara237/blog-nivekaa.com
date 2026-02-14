import React from 'react';
import CategoryCard from './CategoryCard';

export default function CategoryCards({ counts }) {
    const priority = ['Cloud', 'Frontend', 'DevOps'];

    const normalizedCounts = {};
    const originalKeys = {};

    if (counts) {
        Object.keys(counts).forEach(key => {
            const lower = key.toLowerCase();
            normalizedCounts[lower] = counts[key];
            originalKeys[lower] = key;
        });
    }

    let displayKeys = priority.filter(cat => normalizedCounts[cat.toLowerCase()] !== undefined);

    if (displayKeys.length < 3) {
        const used = new Set(displayKeys.map(k => k.toLowerCase()));
        const others = Object.keys(normalizedCounts).filter(k => !used.has(k));
        displayKeys = [...displayKeys, ...others].slice(0, 3);
    }

    const cards = displayKeys.map(key => {
        const isPriority = priority.some(p => p.toLowerCase() === key.toLowerCase());
        const displayName = isPriority
            ? priority.find(p => p.toLowerCase() === key.toLowerCase())
            : originalKeys[key.toLowerCase()];

        return {
            name: displayName,
            count: normalizedCounts[key.toLowerCase()]
        };
    });

    return (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-6 mb-16 px-4 w-full">

            {/* Label Section */}
            <div className="hidden lg:block text-left flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white !m-0 !p-0 leading-none">
                    Plus de contenus
                </h2>
            </div>

            {/* Buttons List - Wrapped Left on Mobile, Wrapped Center on Desktop */}
            <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-center lg:gap-4">
                {cards.map(card => (
                    <CategoryCard
                        key={card.name}
                        category={card.name}
                    />
                ))}

                {/* 'View All' Button (Reusing CategoryCard styling) */}
                <CategoryCard
                    category="Voir tout"
                    href="/categories"
                    icon={
                        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                        </svg>
                    }
                />
            </div>
        </div>
    );
}
