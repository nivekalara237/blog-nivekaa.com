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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 px-4 md:px-0">
            {cards.map(card => (
                <CategoryCard
                    key={card.name}
                    category={card.name}
                    count={card.count}
                />
            ))}

            {/* "More" Card */}
            <a
                href="/categories"
                className="group block h-full"
            >
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 flex flex-col items-center text-center border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full min-h-[200px] justify-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors duration-300">
                        <span className="text-2xl font-bold text-gray-400 group-hover:text-indigo-600 dark:text-gray-500 dark:group-hover:text-indigo-400">+3</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Plus de catégories
                    </h3>

                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm flex items-center gap-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Voir tout
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </span>
                </div>
            </a>
        </div>
    );
}
