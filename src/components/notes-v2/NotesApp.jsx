import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import NotesSidebar from './NotesSidebar.jsx';
import NoteViewer from './NoteViewer.jsx';
import { CreateNoteModal, DeleteModal, FolderModal } from './NoteEditorModal.jsx';
import '../../styles/notes-v2-theme.css';

// ── Theme toggle — the main site navbar (and its own toggle) is hidden on
// this page, so notes-v2 needs its own dark/light control.
function ThemeToggle() {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.theme = next ? 'dark' : 'light';
    };

    return (
        <button className="btn-icon" onClick={toggle} title="Basculer le thème" aria-label="Basculer le thème">
            {isDark ? (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            ) : (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5m0 15V21m9-9h-1.5M4.5 12H3m15.364-6.364l-1.06 1.06M6.697 17.303l-1.06 1.06m12.727 0l-1.06-1.06M6.697 6.697l-1.06-1.06M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
            )}
        </button>
    );
}

export default function NotesApp({ lang = 'fr', isAdmin = false, user = null }) {
    // ── State
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeNode, setActiveNode] = useState(null); // null = root
    const [openFolders, setOpenFolders] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [modal, setModal] = useState(null);
    // modal = { type: 'create'|'edit'|'delete', nodeType: 'note'|'folder', parentId, initialData }

    // Stats
    const [stats, setStats] = useState({ notes: 0, folders: 0 });

    // ── Load tree on mount / lang change
    useEffect(() => {
        loadTree();
    }, [lang]);

    // ── Handle URL ?n=slug on first load after tree is ready
    useEffect(() => {
        if (tree.length === 0) return;
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('n');
        if (slug && (!activeNode || activeNode.id !== slug)) {
            const found = findNode(slug, tree);
            if (found) setActiveNode(found);
            else setActiveNode({ id: slug, type: 'note', name: 'Loading...' });
        }
    }, [tree]);

    const loadTree = async () => {
        setLoading(true);
        try {
            const res = await api.getNotesTree(lang);
            const t = res.tree || [];
            setTree(t);
            computeStats(t);
            // Auto-open first-level folders
            const firstLevel = new Set(t.filter(n => n.type === 'folder').map(n => n.id));
            setOpenFolders(firstLevel);
        } catch (err) {
            console.error('Failed to load tree', err);
        } finally {
            setLoading(false);
        }
    };

    // ── Helpers
    function findNode(id, nodes) {
        for (const n of nodes) {
            if (n.id === id) return n;
            if (n.children) { const f = findNode(id, n.children); if (f) return f; }
        }
        return null;
    }

    function computeStats(nodes) {
        let notes = 0, folders = 0;
        const walk = (arr) => {
            for (const n of arr) {
                if (n.type === 'note') notes++;
                else if (n.type === 'folder') { folders++; if (n.children) walk(n.children); }
            }
        };
        walk(nodes);
        setStats({ notes, folders });
    }

    function removeNode(id, nodes) {
        const next = nodes.filter(n => n.id !== id);
        return next.map(n => n.children ? { ...n, children: removeNode(id, n.children) } : n);
    }

    // ── Handlers
    const handleSelect = (node) => {
        setActiveNode(node);
        const url = new URL(window.location);
        url.searchParams.set('n', node.id);
        window.history.pushState({}, '', url);
    };

    const handleToggleFolder = (id) => {
        setOpenFolders(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleAddNode = (type, parentId) => {
        if (!isAdmin) return;
        if (type === 'folder') {
            setModal({ kind: 'createFolder', nodeType: 'folder', parentId: parentId || 'root' });
        } else {
            setModal({ kind: 'create', nodeType: 'note', parentId: parentId || 'root' });
        }
    };

    const handleDelete = (nodeData) => {
        if (!isAdmin) return;
        setModal({ kind: 'delete', initialData: nodeData });
    };

    const handleCreateSuccess = async (created) => {
        setModal(null);
        await loadTree();
        if (created && created.id) setActiveNode(created);
    };

    const handleDeleteSuccess = async (deleted) => {
        setModal(null);
        const newTree = removeNode(deleted.id, tree);
        setTree(newTree);
        computeStats(newTree);
        try { await api.updateNotesTree(newTree); } catch (e) { console.error(e); loadTree(); }
        if (activeNode && activeNode.id === deleted.id) setActiveNode(null);
    };

    const closeModal = () => setModal(null);

    // ── Render
    const currentLabel = activeNode
        ? `// ${(activeNode.name || activeNode.title || '').toUpperCase()}`
        : '';

    const homeHref = lang === 'fr' ? '/fr' : '/';

    return (
        <div className="sys-notes-v2">
            {/* Topbar */}
            <div className="topbar">
                <a href={homeHref} className="logo" style={{ textDecoration: 'none' }}>
                    <span className="logo-badge">N</span>
                    Notes
                </a>
                <div className="topbar-title">
                    base de connaissances technique
                </div>
                {isAdmin && (
                    <div className="topbar-badges">
                        <span className="badge active">Admin</span>
                    </div>
                )}
                <a href={homeHref} className="blog-link">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
                    Blog
                </a>
                <div className="search-bar">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M18 11a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <input
                        type="text"
                        placeholder="Rechercher une note, un tag..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value.trim())}
                    />
                </div>
                <ThemeToggle />
            </div>

            {/* Main layout */}
            <div className="main">
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '13px', color: 'var(--txt3)' }}>
                        Chargement...
                    </div>
                ) : (
                    <>
                        <NotesSidebar
                            tree={tree}
                            activeId={activeNode?.id || null}
                            openFolders={openFolders}
                            searchQuery={searchQuery}
                            isAdmin={isAdmin}
                            onSelect={handleSelect}
                            onToggleFolder={handleToggleFolder}
                            onAddNode={handleAddNode}
                        />

                        <NoteViewer
                            activeNode={activeNode}
                            tree={tree}
                            searchQuery={searchQuery}
                            isAdmin={isAdmin}
                            lang={lang}
                            onNavigate={handleSelect}
                            onDelete={handleDelete}
                            onAddNode={handleAddNode}
                        />
                    </>
                )}
            </div>

            {/* Status bar */}
            <div className="status-bar">
                <span className="status-item">{stats.notes} notes</span>
                <span className="status-item">{stats.folders} dossiers</span>
                <span className="status-item" style={{ marginLeft: 'auto' }}>{currentLabel}</span>
            </div>

            {/* Modals */}
            {(modal?.kind === 'create') && (
                <div className="sys-notes-v2" style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
                    <CreateNoteModal
                        parentId={modal.parentId}
                        lang={lang}
                        user={user}
                        onClose={closeModal}
                        onSuccess={handleCreateSuccess}
                    />
                </div>
            )}
            {(modal?.kind === 'createFolder' || modal?.kind === 'editFolder') && (
                <div className="sys-notes-v2" style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
                    <FolderModal
                        mode={modal.kind === 'createFolder' ? 'create' : 'edit'}
                        parentId={modal.parentId}
                        initialData={modal.initialData}
                        lang={lang}
                        onClose={closeModal}
                        onSuccess={handleCreateSuccess}
                    />
                </div>
            )}
            {modal?.kind === 'delete' && (
                <div className="sys-notes-v2" style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
                    <DeleteModal
                        node={modal.initialData}
                        lang={lang}
                        onClose={closeModal}
                        onSuccess={handleDeleteSuccess}
                    />
                </div>
            )}
        </div>
    );
}
