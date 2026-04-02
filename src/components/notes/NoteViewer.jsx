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

export default function NoteViewer({ node, lang, tree, onEdit, onDelete, onNavigate }) {
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
            <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
                <div className="mb-8 flex items-center justify-between border-b-2 border-[var(--bg-border)] pb-4">
                    <div>
                        <h1 className="text-3xl font-black text-[var(--yellow-light)] tracking-wider uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {node.title || 'Bibliothèque'}
                        </h1>
                        <p className="text-[var(--text-dim)] font-mono mt-2 flex items-center gap-2">
                            <span>🗂</span> {displayItems.length} élément(s)
                        </p>
                    </div>
                </div>

                <SearchInput onSearch={setSearchQuery} />

                <div className="flex-1 overflow-y-auto">
                    {displayItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => onNavigate(item)}
                                    className="p-4 border-2 border-[var(--bg-border)] rounded hover:border-[var(--green-dark)] cursor-pointer transition-colors group bg-[rgba(0,0,0,0.1)] hover:bg-[rgba(35,114,39,0.05)]"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xl">{item.type === 'folder' ? '🗂' : '📄'}</span>
                                        <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--green-light)] transition-colors line-clamp-1">{item.title}</h3>
                                    </div>
                                    <div className="text-xs font-mono text-[var(--text-dim)]">
                                        Type: <span className="text-[var(--yellow-dark)] uppercase">{item.type}</span>
                                    </div>
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
                    </div>

                    <div className="markdown-content">
                        <MarkdownRenderer content={noteData.content} />
                    </div>
                </article>
            )}
        </div>
    );
}
