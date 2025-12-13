import React from 'react';

const CategoryIcon = ({ category }) => {
    const normalizedCategory = category.toLowerCase();

    // Icon sizes and base styles
    const iconClass = "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110";

    if (normalizedCategory === 'cloud') {
        return (
            <div className={`${iconClass} bg-indigo-600 text-white shadow-lg shadow-indigo-200`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
            </div>
        );
    }

    if (normalizedCategory === 'frontend') {
        return (
            <div className={`${iconClass} bg-pink-500 text-white shadow-lg shadow-pink-200`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
            </div>
        );
    }

    if (normalizedCategory === 'devops') {
        return (
            <div className={`${iconClass} bg-emerald-500 text-white shadow-lg shadow-emerald-200`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
        );
    }

    // Backend / Default
    return (
        <div className={`${iconClass} bg-blue-500 text-white shadow-lg shadow-blue-200`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
        </div>
    );
};

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
                <a
                    key={card.name}
                    href={`/category/${card.name}`}
                    className="group block"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 flex flex-col items-center text-center border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full min-h-[200px] justify-center">
                        <CategoryIcon category={card.name} />

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {card.name}
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                            {card.count} articles
                        </p>
                    </div>
                </a>
            ))}

            {/* "More" Card */}
            <a
                href="/categories"
                className="group block"
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
