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

export default function CategoryCard({ category, count = null, href = null }) {
    // If href is not provided, generate default
    const link = href || `/category/${category}`;

    return (
        <a href={link} className="group block h-full">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 flex flex-col items-center text-center border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full min-h-[200px] justify-center">
                <CategoryIcon category={category} />

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 capitalize">
                    {category}
                </h3>

                {/* Only display count if it is provided (not undefined/null) */}
                {count !== undefined && count !== null && (
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                        {count} articles
                    </p>
                )}
            </div>
        </a>
    );
}
