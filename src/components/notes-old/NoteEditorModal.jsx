import React from 'react';
import ArticleEditor from '../admin/ArticleEditor.jsx';

/**
 * NoteEditorModal — wraps the existing ArticleEditor with mode="note"
 * so notes get the same editing experience as articles (markdown toolbar,
 * language tabs, preview, tag picker) without any code duplication.
 */
export default function NoteEditorModal({ lang, mode, type, parentId, initialData, onClose, onSuccess }) {
    // Only usable for notes, not folders
    if (type === 'folder') {
        return <FolderModal lang={lang} mode={mode} parentId={parentId} initialData={initialData} onClose={onClose} onSuccess={onSuccess} />;
    }

    const noteSlug = mode === 'edit' ? initialData?.slug : null;

    const handleSaved = (result) => {
        if (onSuccess) onSuccess(result);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div
                className="w-full max-w-4xl my-8 bg-[var(--bg-surface)] rounded-xl shadow-2xl flex flex-col border border-[var(--bg-border)]"
            >
                {/* Modal header */}
                <div className="p-4 border-b border-[var(--bg-border)] flex items-center justify-between sticky top-0 bg-[var(--bg-surface)] z-10 rounded-t-xl">
                    <h2 className="text-lg font-bold text-[var(--yellow-light)] flex items-center gap-2">
                        {mode === 'create' ? '➕ Nouvelle Note' : '✎ Modifier la Note'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[var(--text-dim)] hover:text-white transition-colors text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Reuse ArticleEditor in note mode */}
                <div className="p-6">
                    <ArticleEditor
                        mode="note"
                        noteSlug={noteSlug}
                        noteParentId={parentId || 'root'}
                        tags={[]}
                        categories={[]}
                        onNoteClose={handleSaved}
                    />
                </div>
            </div>
        </div>
    );
}

// ── Lightweight folder editor (unchanged functionality) ──────────────────────
import { api } from '../../lib/api';
import { useState } from 'react';

function FolderModal({ lang, mode, parentId, initialData, onClose, onSuccess }) {
    const [title, setTitle] = useState(mode === 'edit' ? (initialData?.title || '') : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const findAndInsertFolder = (nodes, parentId, newNode) => {
        if (parentId === 'root') { nodes.push(newNode); return true; }
        for (let node of nodes) {
            if (node.id === parentId && node.type === 'folder') {
                if (!node.children) node.children = [];
                node.children.push(newNode);
                return true;
            }
            if (node.children && findAndInsertFolder(node.children, parentId, newNode)) return true;
        }
        return false;
    };

    const findAndUpdateFolder = (nodes, id, newTitle) => {
        for (let node of nodes) {
            if (node.id === id) {
                if (lang === 'fr') node.titleFr = newTitle;
                else node.titleEn = newTitle;
                return true;
            }
            if (node.children && findAndUpdateFolder(node.children, id, newTitle)) return true;
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const treeRes = await api.getNotesTree(lang);
            let currentTree = treeRes.tree || [];

            if (mode === 'create') {
                const newFolder = {
                    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 8),
                    type: 'folder',
                    titleEn: lang === 'en' ? title : '',
                    titleFr: lang === 'fr' ? title : '',
                    children: []
                };
                findAndInsertFolder(currentTree, parentId, newFolder);
            } else {
                findAndUpdateFolder(currentTree, initialData.id, title);
            }

            await api.updateNotesTree(currentTree);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div className="w-full max-w-md bg-[var(--bg-surface)] rounded-lg shadow-2xl border border-[var(--bg-border)]">
                <div className="p-4 border-b border-[var(--bg-border)] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--yellow-light)]">
                        {mode === 'create' ? '➕ Nouveau Groupe' : '✎ Modifier le Groupe'}
                    </h2>
                    <button onClick={onClose} className="text-[var(--text-dim)] hover:text-white transition-colors">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 text-sm rounded">{error}</div>}
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 font-mono">
                            Nom du groupe ({lang === 'fr' ? 'Français' : 'English'}) *
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[var(--bg-deep)] border border-[var(--bg-border)] text-[var(--text-primary)] px-4 py-2 focus:border-[var(--green-light)] outline-none font-mono text-sm rounded"
                            placeholder="Nom du groupe..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-mono text-sm text-[var(--text-dim)] hover:text-white transition-colors">Annuler</button>
                        <button type="submit" disabled={loading} className="btn btn--primary opacity-100 disabled:opacity-50" style={{ padding: '8px 16px', fontSize: '12px' }}>
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
