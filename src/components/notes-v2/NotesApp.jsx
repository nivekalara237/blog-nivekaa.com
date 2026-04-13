import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import NotesSidebar from './NotesSidebar.jsx';
import NoteViewer from './NoteViewer.jsx';
import { CreateEditModal, DeleteModal, FolderModal } from './NoteEditorModal.jsx';
import '../../styles/notes-v2-theme.css';

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

    const handleEdit = (nodeData) => {
        if (!isAdmin) return;
        if (nodeData.type === 'folder') {
            setModal({ kind: 'editFolder', nodeType: 'folder', initialData: nodeData });
        } else {
            setModal({ kind: 'edit', nodeType: 'note', initialData: nodeData });
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

    const handleEditSuccess = async () => {
        setModal(null);
        await loadTree();
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
        : '// SELECT A NODE';

    return (
        <div className="sys-notes-v2">
            {/* Topbar */}
            <div className="topbar">
                <div className="logo">sys.NOTES</div>
                <div className="topbar-title">
                    // TARGET: TECH-KNOWLEDGE-BASE <span className="cursor">_</span>
                </div>
                <div className="topbar-badges">
                    <span className={`badge${isAdmin ? ' active' : ''}`}>
                        {isAdmin ? '[ ADMIN ]' : '[ PUBLIC ]'}
                    </span>
                </div>
                <div className="search-bar">
                    <span style={{ color: 'var(--txt3)', fontSize: '11px' }}>//</span>
                    <input
                        type="text"
                        placeholder='grep -r "query" .'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value.trim())}
                    />
                </div>
            </div>

            {/* Main layout */}
            <div className="main">
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '11px', color: 'var(--txt3)' }}>
                        // Chargement...<span className="cursor">_</span>
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
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAddNode={handleAddNode}
                        />
                    </>
                )}
            </div>

            {/* Status bar */}
            <div className="status-bar">
                <span className="status-item ok">● CONNECTED</span>
                <span className="status-item">{stats.notes} notes</span>
                <span className="status-item">{stats.folders} dossiers</span>
                <span className="status-item">{currentLabel}</span>
            </div>

            {/* Modals */}
            {(modal?.kind === 'create') && (
                <div className="sys-notes-v2" style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
                    <CreateEditModal
                        mode="create"
                        parentId={modal.parentId}
                        lang={lang}
                        user={user}
                        onClose={closeModal}
                        onSuccess={handleCreateSuccess}
                    />
                </div>
            )}
            {modal?.kind === 'edit' && (
                <div className="sys-notes-v2" style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
                    <CreateEditModal
                        mode="edit"
                        initialData={modal.initialData}
                        lang={lang}
                        user={user}
                        onClose={closeModal}
                        onSuccess={handleEditSuccess}
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
