import React from 'react';

export default function CategoryCard({ category, href = null, icon = null }) {
    // If href is not provided, generate default
    const link = href || `/category/${category}`;

    return (
        <a href={link} className="group inline-block flex-shrink-0">
            <div className="relative inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-400 dark:hover:text-indigo-400 whitespace-nowrap gap-2">
                <span className="font-medium text-sm capitalize">
                    {category}
                </span>
                {icon && <span className="flex items-center">{icon}</span>}
            </div>
        </a>
    );
}
