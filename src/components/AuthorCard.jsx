import React from 'react';

export default function AuthorCard({ author }) {
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 mt-12 border border-indigo-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">À propos de l'auteur</h3>
            <div className="flex items-start gap-6">
                <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-lg flex-shrink-0"
                />
                <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{author.name}</h4>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-3">{author.role}</p>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{author.bio}</p>
                </div>
            </div>
        </div>
    );
}
