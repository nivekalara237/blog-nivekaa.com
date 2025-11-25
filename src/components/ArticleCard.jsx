import React from 'react';

export default function ArticleCard({ article }) {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img
                src={article.cover}
                alt={article.title}
                className="w-full h-48 object-cover"
            />
            <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                        {article.category}
                    </span>
                    <span className="text-sm text-gray-500">{article.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    <a href={`/article/${article.slug}`} className="hover:text-indigo-600 transition-colors">
                        {article.title}
                    </a>
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.description}
                </p>
                <div className="flex flex-wrap gap-2">
                    {article.tags.map(tag => (
                        <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
