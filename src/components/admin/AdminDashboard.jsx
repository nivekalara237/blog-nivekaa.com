import React, { useState, useEffect, useMemo } from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import KindeAuthProvider from '../KindeAuthProvider';
import AdminGuard from './AdminGuard';
import { api } from '../../lib/api';
import DeleteConfirmationModal from './DeleteConfirmationModal';

function AdminDashboardContent() {
    const { user, isLoading: authLoading } = useKindeAuth();
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Deletion state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, article: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchUserArticles = React.useCallback(async () => {
        if (!user?.email) return;

        setIsLoading(true);
        try {
            // Fetch all articles for this user, including drafts
            const data = await api.getArticles({
                authorEmail: user.email,
                includeDrafts: 'true',
                limit: 100 // Get enough for stats
            });
            setArticles(data.items || []);
        } catch (err) {
            console.error('Error fetching articles:', err);
            setError('Impossible de charger vos articles.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.email]);

    const handleDelete = async () => {
        if (!deleteModal.article) return;

        setIsDeleting(true);
        try {
            const API_URL = import.meta.env.PUBLIC_API_URL || 'https://cloudnive-api.nivekaa.com';
            const response = await fetch(`${API_URL}/articles/${deleteModal.article.slug}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Erreur lors de la suppression');

            // Refresh list
            await fetchUserArticles();
            setDeleteModal({ isOpen: false, article: null });
            alert('✅ Article supprimé avec succès');
        } catch (err) {
            console.error('Delete error:', err);
            alert('❌ Erreur lors de la suppression');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchUserArticles();
        }
    }, [user, authLoading, fetchUserArticles]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = articles.length;
        const drafts = articles.filter(a => a.isDrafted === true).length;
        const categories = articles.reduce((acc, a) => {
            acc[a.category] = (acc[a.category] || 0) + 1;
            return acc;
        }, {});

        return { total, drafts, categories };
    }, [articles]);

    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-50 text-red-700 rounded-3xl border border-red-100">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pl-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Content Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Bienvenue, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.first_name || user?.given_name}</span>. Voici un aperçu de votre activité.
                    </p>
                </div>

                <a
                    href="/admin/create"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex items-center gap-2"
                >
                    <span>+</span> Nouvel article
                </a>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Total Articles</h3>
                    </div>
                    <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{stats.total}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Brouillons</h3>
                    </div>
                    <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{stats.drafts}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Catégories</h3>
                    </div>
                    <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{Object.keys(stats.categories).length}</p>
                    <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 7a1 1 0 011-1h5V5a1 1 0 00-1-1H4a2 2 0 00-2 2v7a2 2 0 002 2h3V7z" />
                            <path fillRule="evenodd" d="M10 8a1 1 0 011-1h5a2 2 0 012 2v7a2 2 0 01-2 2H11a2 2 0 01-2-2V8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Main content: Article list */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100">Vos Articles Récents</h2>
                    <span className="text-xs px-3 py-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 text-gray-500 font-bold uppercase tracking-widest">
                        {articles.length} total
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-50 dark:border-gray-700">
                                <th className="px-6 py-4 font-bold">Article</th>
                                <th className="px-6 py-4 font-bold">Statut</th>
                                <th className="px-6 py-4 font-bold">Catégorie</th>
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {articles.map((article) => (
                                <tr key={article.slug} className="group hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {article.cover ? (
                                                <img src={article.cover} className="w-12 h-12 rounded-xl object-cover shadow-sm bg-gray-100" alt="" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-300">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[300px]">{article.title}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[300px]">/article/{article.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${!article.isDrafted
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                            {!article.isDrafted ? 'Publié' : 'Brouillon'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                                            {article.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-500">
                                            {new Date(article.date).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={`/article/${article.slug}`}
                                                target="_blank"
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                title="Voir l'article"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                            <a
                                                href={`/admin/create?edit=${article.slug}`}
                                                className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all"
                                                title="Modifier l'article"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </a>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, article })}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                title="Supprimer"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {articles.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Vous n'avez pas encore d'articles.</p>
                        <a href="/admin/create" className="text-indigo-600 font-bold mt-2 hover:underline block">Créez votre premier article</a>
                    </div>
                )}
            </div>
            {/* Deletion Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, article: null })}
                onConfirm={handleDelete}
                title={deleteModal.article?.title}
                slug={deleteModal.article?.slug}
                isDeleting={isDeleting}
            />
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <KindeAuthProvider>
            <AdminGuard>
                <AdminDashboardContent />
            </AdminGuard>
        </KindeAuthProvider>
    );
}
