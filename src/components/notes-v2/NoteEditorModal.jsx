import React, { useEffect } from 'react';
import ArticleEditor from '../admin/ArticleEditor.jsx';
import { api } from '../../lib/api';

// ── Create / Edit Note via ArticleEditor ─────────────────────────
// ArticleEditor already supports mode='note' with noteSlug and noteParentId props.
// We wrap it in the sys.NOTES v2 modal shell.
function CreateEditModal({ mode, parentId, initialData, lang, user, onClose, onSuccess }) {
    const noteSlug = mode === 'edit' ? (initialData?.slug || initialData?.id) : null;

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleSaveSuccess = (result) => {
        onSuccess(result);
    };

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                style={{
                    background: 'var(--bg)',
                    border: '2px solid var(--em)',
                    boxShadow: '4px 4px 0 var(--em2), 8px 8px 0 rgba(72,187,120,.15)',
                    width: '90vw',
                    maxWidth: '860px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '0',
                    position: 'relative',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Modal header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 20px', borderBottom: '2px solid var(--border)',
                    background: 'var(--bg2)', position: 'sticky', top: 0, zIndex: 10,
                }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--em)', letterSpacing: '.1em' }}>
                        // FORGE → {mode === 'edit' ? 'MODIFIER' : 'CRÉER'} NOTE
                    </span>
                    <button className="btn-sm btn-danger" onClick={onClose} style={{ padding: '2px 8px' }}>
                        ✕ FERMER
                    </button>
                </div>

                {/* ArticleEditor in note mode */}
                <div style={{ padding: '20px' }}>
                    <ArticleEditor
                        mode="note"
                        noteSlug={noteSlug}
                        noteParentId={parentId || 'root'}
                        user={user}
                        onSaveSuccess={handleSaveSuccess}
                        onNoteClose={onClose}
                    />
                </div>
            </div>
        </div>
    );
}

// ── Delete Confirm Modal ─────────────────────────────────────────
function DeleteModal({ node, lang, onClose, onSuccess }) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            if (node.type === 'note') {
                await api.deleteNote(node.id || node.slug);
            }
            onSuccess(node);
        } catch (err) {
            setError(err.message || 'Erreur lors de la suppression');
            setLoading(false);
        }
    };

    const name = node.name || node.title || node.id;

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="confirm-delete" onClick={e => e.stopPropagation()}>
                <div className="modal-title" style={{ color: '#e53e3e' }}>// ALERT → SUPPRIMER</div>
                {error && (
                    <div style={{ marginBottom: '12px', padding: '8px', background: 'rgba(252,129,129,.1)', border: '1px solid #fc8181', fontSize: '10px', color: '#e53e3e' }}>
                        {error}
                    </div>
                )}
                <p style={{ fontSize: '11px', color: 'var(--txt2)', margin: '12px 0' }}>
                    Supprimer <strong style={{ color: 'var(--txt)' }}>"{name}"</strong> ?<br />
                    Cette action est irréversible.
                </p>
                <div className="modal-footer" style={{ borderColor: '#fc8181' }}>
                    <button className="btn-ghost" onClick={onClose}>[ ANNULER ]</button>
                    <button
                        className="btn-primary"
                        style={{ borderColor: '#e53e3e', color: '#e53e3e', background: 'rgba(252,129,129,.1)' }}
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? '[ ... ]' : '[ CONFIRMER ]'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Folder Create Modal ───────────────────────────────────────────
// Simple modal kept for folder creation (ArticleEditor is note-only)
function FolderModal({ mode, parentId, initialData, lang, onClose, onSuccess }) {
    const [name, setName] = React.useState(mode === 'edit' ? (initialData?.name || initialData?.title || '') : '');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const treeRes = await api.getNotesTree(lang);
            const currentTree = treeRes.tree || [];

            if (mode === 'edit') {
                const updateFn = (nodes) => {
                    for (let n of nodes) {
                        if (n.id === initialData.id) {
                            n.name = name.trim(); n.titleEn = name.trim(); n.titleFr = name.trim();
                            return true;
                        }
                        if (n.children && updateFn(n.children)) return true;
                    }
                    return false;
                };
                updateFn(currentTree);
                await api.updateNotesTree(currentTree);
                onSuccess(initialData);
            } else {
                const newFolder = {
                    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7),
                    type: 'folder',
                    name: name.trim(),
                    titleEn: name.trim(),
                    titleFr: name.trim(),
                    children: []
                };
                const insertFn = (nodes, pid) => {
                    if (pid === 'root') { nodes.push(newFolder); return true; }
                    for (let n of nodes) {
                        if (n.id === pid && n.type === 'folder') { (n.children = n.children || []).push(newFolder); return true; }
                        if (n.children && insertFn(n.children, pid)) return true;
                    }
                    return false;
                };
                insertFn(currentTree, parentId);
                await api.updateNotesTree(currentTree);
                onSuccess(newFolder);
            }
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-title">
                    // FORGE → {mode === 'edit' ? 'MODIFIER' : 'NOUVEAU'} DOSSIER
                </div>
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ marginBottom: '12px', padding: '8px', background: 'rgba(252,129,129,.1)', border: '1px solid #fc8181', fontSize: '10px', color: '#e53e3e' }}>
                            {error}
                        </div>
                    )}
                    <div className="modal-field">
                        <label className="modal-label">// NOM DU DOSSIER</label>
                        <input
                            className="modal-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="MonDossier"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-ghost" onClick={onClose}>[ ANNULER ]</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? '[ FORGE... ]' : `[ FORGE → ${mode === 'edit' ? 'SAUVER' : 'CRÉER'} ]`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export { CreateEditModal, DeleteModal, FolderModal };
