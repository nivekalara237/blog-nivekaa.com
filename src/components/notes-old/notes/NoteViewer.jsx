import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import MarkdownRenderer from '../MarkdownRenderer.jsx';

function SearchInput({ onSearch }) {
    return (
        <div className="relative mb-6">
            <span className="absolute left-3 top-2 opacity-50">🔍</span>
            <input
                type="text"
                placeholder="Rechercher dans les notes..."
                className="w-full bg-[rgba(0,0,0,0.2)] border-2 border-[var(--bg-border)] text-[var(--text-primary)] px-10 py-2 rounded focus:border-[var(--green-light)] outline-none font-mono text-sm transition-colors"
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
    );
}

export default function NoteViewer({ node, lang, tree, onEdit, onDelete, onNavigate, isAdmin }) {
    const [noteData, setNoteData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const isFolder = node.type === 'folder';

    useEffect(() => {
        if (!isFolder && node.id) {
            loadNote(node.id);
        }
    }, [node.id, isFolder]);

    useEffect(() => {
        if (searchQuery.trim().length > 2) {
            // Simulated search or API search
            // For now, let's just do a naive local search on the tree titles if it's a folder view
            const results = [];
            const searchFn = (nodes) => {
                for (let n of nodes) {
                    if (n.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                        results.push(n);
                    }
                    if (n.children) searchFn(n.children);
                }
            };
            searchFn(tree);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, tree]);

    const loadNote = async (id) => {
        setLoading(true);
        try {
            const data = await api.getNote(id, lang);
            setNoteData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Render Table of Contents for a folder
    if (isFolder) {
        // Find this node in the tree to get its children
        let currentTreeContext = [];
        const findContext = (nodes, id) => {
            for (let n of nodes) {
                if (n.id === id) return n.children || [];
                if (n.children) {
                    const r = findContext(n.children, id);
                    if (r) return r;
                }
            }
            return null;
        };

        if (node.id === 'root') {
            currentTreeContext = tree;
        } else {
            currentTreeContext = findContext(tree, node.id) || [];
        }

        const displayItems = searchQuery.length > 2 ? searchResults : currentTreeContext;

        return (
            <div className="p-8 max-w-4xl mx-auto h-full flex flex-col bg-[#fdfaf6] dark:bg-transparent transition-colors" style={{
                backgroundImage: 'linear-gradient(rgba(72,187,120,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(72,187,120,0.08) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}>
                <div className="mb-8 flex justify-between items-end border-b-2 border-dashed border-[#48bb78] dark:border-[#2f855a] pb-6 transition-colors">
                    <div>
                        <p className="text-[#2f855a] dark:text-[#48bb78] font-mono mb-2 text-sm font-bold bg-[#c6f6d5] dark:bg-[#48bb78]/20 inline-block px-2 py-0.5 rounded-sm transition-colors">
                            // TARGET: {node.title?.toUpperCase() || 'ROOT'} ({displayItems.length} ENTITÉS)
                        </p>
                        <h1 className="text-4xl text-[#2d3748] dark:text-gray-100 font-mono font-black tracking-tight mt-2 uppercase transition-colors">
                            &gt; {node.title || 'BIBLIOTHÈQUE'}_
                        </h1>
                    </div>
                </div>

                <SearchInput onSearch={setSearchQuery} />

                <div className="flex-1 overflow-y-auto mt-6 px-1 custom-scrollbar">
                    {displayItems.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {displayItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => onNavigate(item)}
                                    className="bg-white dark:bg-black border-2 border-[#e2e8f0] dark:border-gray-800 rounded-lg transition-all duration-200 font-mono group px-4 py-4 cursor-pointer hover:border-[#48bb78] dark:hover:border-[#48bb78] hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(72,187,120,0.3)] flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`font-bold transition-colors ${item.type === 'folder' ? 'text-[#3182ce] dark:text-[#63b3ed] group-hover:text-[#2b6cb0] dark:group-hover:text-[#3182ce] text-xl group-hover:animate-pulse' : 'text-[#48bb78] group-hover:text-[#2f855a] dark:group-hover:text-[#48bb78] text-lg group-hover:animate-bounce'}`}>
                                            ■
                                        </span>
                                        <h3 className={`font-bold text-lg transition-colors mt-0.5 ${item.type === 'folder' ? 'text-[#2d3748] dark:text-gray-200 group-hover:text-[#3182ce] dark:group-hover:text-[#63b3ed] uppercase tracking-widest' : 'text-[#2d3748] dark:text-gray-300 group-hover:text-[#2f855a] dark:group-hover:text-[#48bb78]'}`}>
                                            {item.title}
                                        </h3>
                                    </div>
                                    <span className={`text-[10px] font-bold tracking-widest uppercase border px-2 py-1 rounded transition-colors ${item.type === 'folder' ? 'bg-[#f7fafc] dark:bg-[#2b6cb0]/10 text-[#3182ce] dark:text-[#63b3ed] border-[#bee3f8] dark:border-[#3182ce]/30 group-hover:text-[#2b6cb0] dark:group-hover:text-[#90cdf4]' : 'bg-[#f7fafc] dark:bg-gray-800/50 text-[#718096] dark:text-gray-400 border-[#e2e8f0] dark:border-gray-700 group-hover:text-[#48bb78] dark:group-hover:text-[#68d391]'}`}>
                                        Type: {item.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-12 border-2 border-dashed border-[var(--bg-border)] rounded text-[var(--text-dim)] font-mono">
                            {searchQuery ? 'Aucun résultat correspondant.' : 'Ce groupe est vide. Ajoutez des notes ou des sous-groupes via le menu de gauche.'}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Render a single Note
    return (
        <div className="p-8 max-w-4xl mx-auto pb-32">
            {loading || !noteData ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-[var(--bg-surface)] rounded w-3/4"></div>
                    <div className="h-4 bg-[var(--bg-surface)] rounded w-1/4 mb-8"></div>
                    <div className="h-64 bg-[var(--bg-surface)] rounded w-full"></div>
                </div>
            ) : (
                <article className="prose prose-invert prose-green max-w-none prose-pre:bg-[var(--bg-surface)] prose-pre:border prose-pre:border-[var(--bg-border)]">
                    <div className="flex items-start justify-between mb-8 border-b border-[var(--bg-border)] pb-8">
                        <div>
                            <h1 className="text-4xl font-black mb-2 m-0 text-[var(--yellow-light)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {noteData.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-[var(--text-dim)] mt-4">
                                {noteData.tags && noteData.tags.length > 0 && (
                                    <div className="flex gap-2">
                                        <span className="opacity-50">🏷</span>
                                        {noteData.tags.map(tag => (
                                            <span key={tag} className="text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded uppercase text-xs">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2 items-center">
                                    <span className="opacity-50">⏱</span>
                                    <span>{new Date(noteData.lastUpdated || noteData.createdAt).toLocaleDateString(lang)}</span>
                                </div>
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onEdit(noteData)}
                                    className="btn btn--secondary"
                                    style={{ padding: '6px 12px', fontSize: '11px' }}
                                >
                                    ✎ Éditer
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="border-2 border-red-900 text-red-400 hover:bg-red-900 hover:text-red-100 font-bold uppercase tracking-widest cursor-pointer transition-colors rounded"
                                    style={{ padding: '6px 12px', fontSize: '11px', fontFamily: "'Inter', sans-serif" }}
                                >
                                    Supprimer
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="markdown-content">
                        <MarkdownRenderer content={noteData.content} />
                    </div>
                </article>
            )}
        </div>
    );
}
