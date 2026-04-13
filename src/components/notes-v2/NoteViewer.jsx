import React, { useState } from 'react';
import { api } from '../../lib/api';
import MarkdownRenderer from '../MarkdownRenderer.jsx';

// ── Helpers ──────────────────────────────────────────────────────
function getAllNotes(nodes) {
    let out = [];
    for (const n of nodes) {
        if (n.type === 'note') out.push(n);
        if (n.children) out = out.concat(getAllNotes(n.children));
    }
    return out;
}

function notePreview(content) {
    if (!content) return '...';
    return content.replace(/[#*`\n]/g, ' ').replace(/\s+/g, ' ').substring(0, 120) + '...';
}

// ── Tree Row (Option C — 1 level + count) ────────────────────────
function TreeRow({ item, isLast, onNavigate }) {
    const isFolder = item.type === 'folder';
    const name = item.name || item.title || 'Sans titre';
    const tags = item.tags || [];
    const connector = isLast ? '└──' : '├──';

    // Count all nested children recursively to show [+X autres]
    let nestedCount = 0;
    if (isFolder && item.children) {
        const walk = (arr) => {
            nestedCount += arr.length;
            for (const n of arr) {
                if (n.type === 'folder' && n.children) walk(n.children);
            }
        };
        walk(item.children);
    }

    return (
        <div
            onClick={() => onNavigate(item)}
            style={{
                display: 'flex',
                alignItems: 'baseline',
                padding: '3px 0',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '11px',
                lineHeight: '1.6',
                userSelect: 'none',
            }}
        >
            {/* Connector */}
            <span style={{ color: 'var(--border2)', flexShrink: 0, marginRight: '6px' }}>
                {connector}
            </span>
            {/* Bullet */}
            <span style={{
                flexShrink: 0,
                marginRight: '5px',
                color: isFolder ? 'var(--em2)' : 'var(--txt3)',
                fontWeight: isFolder ? 700 : 400,
            }}>
                {isFolder ? '[+]' : '■'}
            </span>
            {/* Name */}
            <span style={{
                color: isFolder ? 'var(--em2)' : 'var(--txt)',
                fontWeight: isFolder ? 700 : 400,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}>
                {name}{isFolder ? '/' : ''}
            </span>
            {/* Tags inline (notes only) */}
            {!isFolder && tags.length > 0 && (
                <span style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '12px', flexWrap: 'nowrap' }}>
                    {tags.map(t => (
                        <span key={t} style={{
                            fontSize: '9px', padding: '1px 5px',
                            border: '1px solid var(--em)', color: 'var(--em2)',
                            background: 'var(--em3)', letterSpacing: '.04em',
                            textTransform: 'uppercase', whiteSpace: 'nowrap',
                        }}>
                            ({t})
                        </span>
                    ))}
                </span>
            )}
            {/* Nested block count (folders only) */}
            {isFolder && nestedCount > 0 && (
                <span style={{ fontSize: '9px', color: 'var(--txt3)', flexShrink: 0, marginLeft: '12px' }}>
                    [+{nestedCount} autres]
                </span>
            )}
            {isFolder && nestedCount === 0 && (
                <span style={{ fontSize: '9px', color: 'var(--txt3)', flexShrink: 0, marginLeft: '12px' }}>
                    [vide]
                </span>
            )}
        </div>
    );
}

// ── Folder View (Option B — full recursive tree) ─────────────────
function FolderView({ node, children, searchQuery, isAdmin, onNavigate, onAddNode }) {
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
                    <span className="big">//</span>
                    <span>grep: no match found</span>
                </div>
            );
        }
        return (
            <div style={{ fontFamily: 'inherit' }}>
                <div style={{ fontSize: '10px', color: 'var(--txt3)', letterSpacing: '.1em', marginBottom: '10px' }}>
                    // grep: {filtered.length} résultat(s)
                </div>
                {filtered.map((item, i) => (
                    <TreeRow key={item.id} item={item} isLast={i === filtered.length - 1} prefix="" onNavigate={onNavigate} />
                ))}
            </div>
        );
    }

    if (children.length === 0) {
        return (
            <div className="empty-state">
                <span className="big">[+]</span>
                <span>Dossier vide — {isAdmin ? 'créer une note ou un sous-dossier' : 'aucun contenu'}</span>
            </div>
        );
    }

    const parentName = node ? (node.name || node.title || 'notes') : 'notes';

    // Count total notes recursively
    const totalNotes = getAllNotes(children).length;
    const totalFolders = (() => {
        let f = 0;
        const walk = (arr) => { for (const n of arr) { if (n.type === 'folder') { f++; if (n.children) walk(n.children); } } };
        walk(children);
        return f;
    })();

    return (
        <div style={{ fontFamily: 'inherit' }}>
            {/* Root label */}
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--em)', marginBottom: '4px', letterSpacing: '.05em' }}>
                {parentName}/
            </div>
            {children.map((item, i) => (
                <TreeRow
                    key={item.id}
                    item={item}
                    isLast={i === children.length - 1}
                    depth={0}
                    prefix=""
                    onNavigate={onNavigate}
                />
            ))}
            {/* Summary */}
            <div style={{ marginTop: '12px', fontSize: '10px', color: 'var(--txt3)', borderTop: '1px dashed var(--border)', paddingTop: '8px' }}>
                {totalFolders} dossier(s), {totalNotes} note(s)
            </div>
        </div>
    );
}


// ── Note View (with shared MarkdownRenderer) ─────────────────────
function NoteView({ noteData, lang, isAdmin, onEdit, onDelete }) {
    const updated = noteData.updated || (noteData.updatedAt || noteData.createdAt || '').split('T')[0] || '—';
    const name = noteData.name || noteData.title || 'Sans titre';

    return (
        <div className="note-view">
            <div className="note-meta-bar">
                <span className="note-meta-item">// ID: <span>{noteData.id || noteData.slug}</span></span>
                <span className="note-meta-item">UPDATED: <span>{updated}</span></span>
                <span className="note-meta-item">TAGS: <span>{(noteData.tags || []).join(', ') || '—'}</span></span>
                {isAdmin && (
                    <>
                        <button className="btn-sm" onClick={() => onEdit(noteData)} style={{ marginLeft: 'auto' }}>
                            [ EDITER ]
                        </button>
                        <button className="btn-sm btn-danger" onClick={() => onDelete(noteData)}>
                            [ SUPPR ]
                        </button>
                    </>
                )}
            </div>
            <h1>{name}</h1>
            <div style={{ margin: '10px 0 16px' }}>
                <div className="tags">
                    {(noteData.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
            </div>
            <div className="markdown-content">
                <MarkdownRenderer content={noteData.content || ''} />
            </div>
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

export default function NoteViewer({ activeNode, tree, searchQuery, isAdmin, lang, onNavigate, onEdit, onDelete, onAddNode }) {
    const [noteData, setNoteData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadedId, setLoadedId] = useState(null);

    const isFolder = !activeNode || activeNode.type === 'folder';
    const isRoot = !activeNode || activeNode.id === 'root';

    // Load note content from API when a note is selected
    React.useEffect(() => {
        if (!isFolder && activeNode && activeNode.id !== loadedId) {
            setLoading(true);
            setNoteData(null);
            api.getNote(activeNode.id, lang)
                .then(data => { setNoteData(data); setLoadedId(activeNode.id); })
                .catch(err => { console.error('Note load error:', err); setLoading(false); })
                .finally(() => setLoading(false));
        }
    }, [activeNode?.id]);

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

    // Breadcrumb
    const breadcrumb = activeNode && activeNode.id !== 'root'
        ? getBreadcrumb(activeNode.id, tree)
        : null;

    const statusLabel = activeNode && activeNode.id !== 'root'
        ? `// ${(activeNode.name || activeNode.title || '').toUpperCase()}`
        : '';

    return (
        <div className="content">
            {/* Content header with breadcrumb and action buttons */}
            <div className="content-header">
                <div className="content-path" id="breadcrumb">
                    <span>~</span>
                    <span className="sep">/</span>
                    <span>notes</span>
                    {breadcrumb && breadcrumb.map(p => (
                        <React.Fragment key={p.id}>
                            <span className="sep">/</span>
                            <span>{p.name || p.title}</span>
                        </React.Fragment>
                    ))}
                </div>
                <div className="content-actions" id="content-action-btns">
                    {isAdmin && isFolder && activeNode && (
                        <>
                            <button className="btn-sm btn-em" onClick={() => onAddNode('note', activeNode.id)}>+N</button>
                            <button className="btn-sm btn-em" onClick={() => onAddNode('folder', activeNode.id)}>+G</button>
                        </>
                    )}
                </div>
            </div>

            {/* Content body */}
            <div className="content-body" id="content-body">
                {isFolder ? (
                    <FolderView
                        node={activeNode}
                        children={children}
                        searchQuery={searchQuery}
                        isAdmin={isAdmin}
                        onNavigate={onNavigate}
                        onAddNode={onAddNode}
                    />
                ) : (
                    <>
                        {loading && (
                            <div style={{ padding: '20px', fontSize: '11px', color: 'var(--txt3)' }}>
                                // Chargement...<span className="cursor">_</span>
                            </div>
                        )}
                        {!loading && noteData && (
                            <NoteView
                                noteData={noteData}
                                lang={lang}
                                isAdmin={isAdmin}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        )}
                        {!loading && !noteData && (
                            <div className="empty-state">
                                <span className="big">!</span>
                                <span>Note introuvable</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
