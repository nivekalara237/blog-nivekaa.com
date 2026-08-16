import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

const CloseIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>;

function useEscapeKey(onClose) {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);
}

// ── Create Note — name + category chips only.
// Content is added afterward, directly on the note view page.
function CreateNoteModal({ parentId, lang, user, onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [chips, setChips] = useState([]);
    const [chipInput, setChipInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEscapeKey(onClose);

    const addChip = () => {
        const val = chipInput.trim().replace(/,$/, '');
        if (val && !chips.includes(val)) setChips([...chips, val]);
        setChipInput('');
    };

    const handleChipKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addChip(); }
        else if (e.key === 'Backspace' && !chipInput && chips.length) {
            setChips(chips.slice(0, -1));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const created = await api.createNote({
                tags: chips,
                authorEmail: user?.email || '',
                authorName: user?.given_name || '',
                parentId: parentId || 'root',
                locales: { [lang]: { title: name.trim(), content: '' } },
            });
            onSuccess(created);
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div className="modal-title" style={{ margin: 0 }}>Nouvelle note</div>
                    <button className="btn-icon" onClick={onClose} style={{ color: 'var(--txt3)' }}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ marginBottom: '12px', padding: '8px 10px', borderRadius: '6px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.35)', fontSize: '12px', color: '#EF4444' }}>
                            {error}
                        </div>
                    )}
                    <div className="modal-field">
                        <label className="modal-label">Nom</label>
                        <input
                            className="modal-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Nom de la note"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">Catégorie</label>
                        <div className="chip-wrap" onClick={() => document.getElementById('note-chip-input')?.focus()}>
                            {chips.map((c, i) => (
                                <span key={c} className="chip">
                                    {c}
                                    <button type="button" onClick={() => setChips(chips.filter((_, idx) => idx !== i))}><CloseIcon /></button>
                                </span>
                            ))}
                            <input
                                id="note-chip-input"
                                className="chip-input"
                                value={chipInput}
                                onChange={e => setChipInput(e.target.value)}
                                onKeyDown={handleChipKeyDown}
                                placeholder="Ajouter une catégorie…"
                            />
                        </div>
                        <p className="chip-hint">Entrée ou virgule pour ajouter une catégorie</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Création...' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Delete Confirm Modal ─────────────────────────────────────────
function DeleteModal({ node, lang, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEscapeKey(onClose);

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
                <div className="modal-title" style={{ color: '#EF4444' }}>Supprimer cette note ?</div>
                {error && (
                    <div style={{ marginBottom: '12px', padding: '8px 10px', borderRadius: '6px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.35)', fontSize: '12px', color: '#EF4444' }}>
                        {error}
                    </div>
                )}
                <p style={{ fontSize: '13px', color: 'var(--txt2)', lineHeight: 1.6, margin: '8px 0 16px' }}>
                    Supprimer <strong style={{ color: 'var(--txt)' }}>« {name} »</strong> ? Cette action est irréversible.
                </p>
                <div className="modal-footer">
                    <button className="btn-ghost" onClick={onClose}>Annuler</button>
                    <button
                        className="btn-primary btn-danger"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? 'Suppression...' : 'Supprimer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Folder Create / Rename Modal ──────────────────────────────────
function FolderModal({ mode, parentId, initialData, lang, onClose, onSuccess }) {
    const [name, setName] = useState(mode === 'edit' ? (initialData?.name || initialData?.title || '') : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEscapeKey(onClose);

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
                    {mode === 'edit' ? 'Renommer le dossier' : 'Nouveau dossier'}
                </div>
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ marginBottom: '12px', padding: '8px 10px', borderRadius: '6px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.35)', fontSize: '12px', color: '#EF4444' }}>
                            {error}
                        </div>
                    )}
                    <div className="modal-field">
                        <label className="modal-label">Nom</label>
                        <input
                            className="modal-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Nom du dossier"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Enregistrement...' : (mode === 'edit' ? 'Enregistrer' : 'Créer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export { CreateNoteModal, DeleteModal, FolderModal };
