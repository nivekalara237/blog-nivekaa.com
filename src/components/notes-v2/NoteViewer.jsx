import React, { useState } from 'react';
import { api } from '../../lib/api';
import MarkdownRenderer from '../MarkdownRenderer.jsx';

// ── Icons (Flowbite/Heroicons-style outline SVG) ──────────────────
const FolderIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5a1.5 1.5 0 011.5-1.5h4.19a1.5 1.5 0 011.06.44l1.12 1.12a1.5 1.5 0 001.06.44H19.5A1.5 1.5 0 0121 9.5v8a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-10z"/></svg>;
const NoteIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75h5.379a1.5 1.5 0 011.06.44l3.622 3.62a1.5 1.5 0 01.439 1.061V19.5a1.5 1.5 0 01-1.5 1.5H8.25a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z"/></svg>;
const NotePlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75h5.379a1.5 1.5 0 011.06.44l3.622 3.62a1.5 1.5 0 01.439 1.061V19.5a1.5 1.5 0 01-1.5 1.5H8.25a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v5.25M9.375 13.125h5.25"/></svg>;
const FolderPlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5a1.5 1.5 0 011.5-1.5h4.19a1.5 1.5 0 011.06.44l1.12 1.12a1.5 1.5 0 001.06.44H19.5A1.5 1.5 0 0121 9.5v8a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-10z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 11.5v4M10 13.5h4"/></svg>;
const PencilIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>;
const TrashIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>;
const SearchIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M18 11a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;

// ── Helpers ──────────────────────────────────────────────────────
function getAllNotes(nodes) {
    let out = [];
    for (const n of nodes) {
        if (n.type === 'note') out.push(n);
        if (n.children) out = out.concat(getAllNotes(n.children));
    }
    return out;
}

// ── Folder / note row (folder view listing) ──────────────────────
function Row({ item, onNavigate }) {
    const isFolder = item.type === 'folder';
    const name = item.name || item.title || 'Sans titre';
    const tags = item.tags || [];
    const count = isFolder ? (item.children ? item.children.length : 0) : null;

    return (
        <button className="folder-row" onClick={() => onNavigate(item)}>
            <span className={`icon${isFolder ? '' : ' note'}`}>{isFolder ? <FolderIcon /> : <NoteIcon />}</span>
            <span className="name">{name}</span>
            {isFolder ? (
                <span className="meta">{count} élément{count === 1 ? '' : 's'}</span>
            ) : (
                tags.length > 0 && (
                    <span className="tags" style={{ marginLeft: 'auto' }}>
                        {tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
                    </span>
                )
            )}
        </button>
    );
}

// ── Folder View ───────────────────────────────────────────────────
function FolderView({ node, children, searchQuery, isAdmin, onNavigate }) {
    if (searchQuery) {
        const allNotes = getAllNotes(children);
        const q = searchQuery.toLowerCase();
        const filtered = allNotes.filter(n =>
            (n.name || n.title || '').toLowerCase().includes(q) ||
            (n.tags && n.tags.some(t => t.toLowerCase().includes(q))) ||
            (n.content && n.content.toLowerCase().includes(q))
        );
        if (filtered.length === 0) {
            return (
                <div className="empty-state">
                    <SearchIcon />
                    <span>Aucun résultat</span>
                </div>
            );
        }
        return (
            <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--txt3)', marginBottom: '12px' }}>
                    {filtered.length} résultat{filtered.length === 1 ? '' : 's'}
                </div>
                {filtered.map(item => <Row key={item.id} item={item} onNavigate={onNavigate} />)}
            </div>
        );
    }

    if (children.length === 0) {
        return (
            <div className="empty-state">
                <FolderIcon />
                <span>{isAdmin ? 'Dossier vide — créez une note ou un sous-dossier' : 'Ce dossier est vide'}</span>
            </div>
        );
    }

    const totalNotes = getAllNotes(children).length;
    const totalFolders = (() => {
        let f = 0;
        const walk = (arr) => { for (const n of arr) { if (n.type === 'folder') { f++; if (n.children) walk(n.children); } } };
        walk(children);
        return f;
    })();

    return (
        <div>
            {children.map(item => <Row key={item.id} item={item} onNavigate={onNavigate} />)}
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--txt3)', marginTop: '16px' }}>
                {totalFolders} dossier{totalFolders === 1 ? '' : 's'}, {totalNotes} note{totalNotes === 1 ? '' : 's'}
            </p>
        </div>
    );
}

// ── Note View — content edited directly on this page ─────────────
function NoteView({ noteData, isAdmin, lang, onDelete, onSaved }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(noteData.content || '');
    const [saving, setSaving] = useState(false);

    const updated = noteData.updated || (noteData.updatedAt || noteData.createdAt || '').split('T')[0] || '—';
    const name = noteData.name || noteData.title || 'Sans titre';

    const startEdit = () => { setDraft(noteData.content || ''); setEditing(true); };
    const cancelEdit = () => setEditing(false);

    const save = async () => {
        setSaving(true);
        try {
            const slug = noteData.id || noteData.slug;
            // Write to whichever locale is currently being viewed/edited —
            // `en` is the body content, `fr` is a frontmatter field, both
            // handled by the backend's per-locale merge.
            const payload = lang === 'fr'
                ? { locales: { fr: { content: draft } } }
                : { locales: { en: { title: noteData.title || name, content: draft } } };
            await api.updateNote(slug, payload);
            onSaved({ ...noteData, content: draft });
            setEditing(false);
        } catch (err) {
            console.error('Failed to save note', err);
            alert("Erreur lors de l'enregistrement de la note");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="note-view">
            <div className="note-meta-bar">
                <span className="note-meta-item">Mis à jour {updated}</span>
                {(noteData.tags || []).length > 0 && (
                    <div className="tags">
                        {(noteData.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                )}
                {isAdmin && !editing && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <button className="btn-sm" onClick={startEdit}><PencilIcon />Modifier</button>
                        <button className="btn-sm btn-danger" onClick={() => onDelete(noteData)}><TrashIcon />Supprimer</button>
                    </div>
                )}
            </div>
            <h1>{name}</h1>

            {editing ? (
                <>
                    <textarea
                        className="note-edit-area"
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder="## Introduction&#10;&#10;Écrivez le contenu de la note en markdown..."
                        autoFocus
                    />
                    <div className="note-edit-actions">
                        <button className="btn-primary" onClick={save} disabled={saving}>
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button className="btn-ghost" onClick={cancelEdit} disabled={saving}>Annuler</button>
                    </div>
                </>
            ) : (
                <MarkdownRenderer content={noteData.content || ''} />
            )}
        </div>
    );
}

function getBreadcrumb(id, nodes, path = []) {
    for (const n of nodes) {
        if (n.id === id) return [...path, n];
        if (n.children) {
            const r = getBreadcrumb(id, n.children, [...path, n]);
            if (r) return r;
        }
    }
    return null;
}

export default function NoteViewer({ activeNode, tree, searchQuery, isAdmin, lang, onNavigate, onDelete, onAddNode }) {
    const [noteData, setNoteData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadedId, setLoadedId] = useState(null);

    const isFolder = !activeNode || activeNode.type === 'folder';
    const isRoot = !activeNode || activeNode.id === 'root';

    // Load note content from API when a note is selected, or when the
    // language toggle changes while a note is already open.
    React.useEffect(() => {
        if (isFolder || !activeNode) return;
        setLoading(true);
        setNoteData(null);
        api.getNote(activeNode.id, lang)
            .then(data => { setNoteData(data); setLoadedId(activeNode.id); })
            .catch(err => { console.error('Note load error:', err); setLoading(false); })
            .finally(() => setLoading(false));
    }, [activeNode?.id, lang]);

    // Determine children to display in folder view
    let children = tree;
    if (!isRoot && activeNode) {
        const findChildren = (nodes, id) => {
            for (const n of nodes) {
                if (n.id === id) return n.children || [];
                if (n.children) {
                    const r = findChildren(n.children, id);
                    if (r !== null) return r;
                }
            }
            return null;
        };
        children = findChildren(tree, activeNode.id) || [];
    }

    const breadcrumb = activeNode && activeNode.id !== 'root'
        ? getBreadcrumb(activeNode.id, tree)
        : null;

    return (
        <div className="content">
            {/* Content header with breadcrumb and action buttons */}
            <div className="content-header">
                <div className="content-path">
                    <span>notes</span>
                    {breadcrumb && breadcrumb.map(p => (
                        <React.Fragment key={p.id}>
                            <span className="sep">/</span>
                            <span>{p.name || p.title}</span>
                        </React.Fragment>
                    ))}
                </div>
                <div className="content-actions">
                    {isAdmin && isFolder && activeNode && (
                        <>
                            <button className="btn-icon" onClick={() => onAddNode('note', activeNode.id)} title="Nouvelle note"><NotePlusIcon /></button>
                            <button className="btn-icon" onClick={() => onAddNode('folder', activeNode.id)} title="Nouveau dossier"><FolderPlusIcon /></button>
                        </>
                    )}
                </div>
            </div>

            {/* Content body */}
            <div className="content-body">
                {isFolder ? (
                    <FolderView
                        node={activeNode}
                        children={children}
                        searchQuery={searchQuery}
                        isAdmin={isAdmin}
                        onNavigate={onNavigate}
                    />
                ) : (
                    <>
                        {loading && (
                            <div style={{ padding: '20px', fontSize: '13px', color: 'var(--txt3)' }}>
                                Chargement...
                            </div>
                        )}
                        {!loading && noteData && (
                            <NoteView
                                noteData={noteData}
                                isAdmin={isAdmin}
                                lang={lang}
                                onDelete={onDelete}
                                onSaved={setNoteData}
                            />
                        )}
                        {!loading && !noteData && (
                            <div className="empty-state">
                                <NoteIcon />
                                <span>Note introuvable</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
