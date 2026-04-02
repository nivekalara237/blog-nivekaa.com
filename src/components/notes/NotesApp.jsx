import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import NotesSidebar from './NotesSidebar';
import NoteViewer from './NoteViewer';
import NoteEditorModal from './NoteEditorModal';

export default function NotesApp({ lang }) {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Selection state
    const [activeNode, setActiveNode] = useState(null); // { id, type, title }
    
    // Editor UI state
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorMode, setEditorMode] = useState('create'); // 'create', 'edit'
    const [editorTargetType, setEditorTargetType] = useState('note'); // 'note', 'folder'
    const [editorParentId, setEditorParentId] = useState('root');
    const [editorInitialData, setEditorInitialData] = useState(null);

    useEffect(() => {
        loadTree();
        
        // Check URL for direct note access
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('n');
        if (slug) {
            setActiveNode({ id: slug, type: 'note', title: 'Loading...' });
        }
    }, [lang]);

    const loadTree = async () => {
        setLoading(true);
        try {
            const res = await api.getNotesTree(lang);
            setTree(res.tree || []);
        } catch (err) {
            console.error('Failed to load tree', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectNode = (node) => {
        setActiveNode(node);
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('n', node.id);
        window.history.pushState({}, '', newUrl);
    };

    const handleTreeChange = async (newTree) => {
        setTree(newTree); // Optimistic UI
        try {
            await api.updateNotesTree(newTree);
        } catch (err) {
            console.error('Failed to save tree', err);
            loadTree(); // Revert on failure
        }
    };

    const openCreateModal = (parentId, type) => {
        setEditorParentId(parentId);
        setEditorTargetType(type);
        setEditorMode('create');
        setEditorInitialData(null);
        setIsEditorOpen(true);
    };

    const openEditModal = (nodeInfo, initialData) => {
        setEditorParentId(null);
        setEditorTargetType(nodeInfo.type);
        setEditorMode('edit');
        setEditorInitialData(initialData);
        setIsEditorOpen(true);
    };

    const handleDeleteNode = async (nodeId, type) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
        
        try {
            if (type === 'note') {
                await api.deleteNote(nodeId);
            }
            // If it's a folder, tree update will remove it from UI anyway
            // We just need to remove it from the tree and save
            const removeNode = (nodes, id) => {
                for (let i = 0; i < nodes.length; i++) {
                    if (nodes[i].id === id) {
                        nodes.splice(i, 1);
                        return true;
                    }
                    if (nodes[i].children && removeNode(nodes[i].children, id)) {
                        return true;
                    }
                }
                return false;
            };
            
            const newTree = JSON.parse(JSON.stringify(tree)); // Deep copy
            if (removeNode(newTree, nodeId)) {
                await handleTreeChange(newTree);
                if (activeNode?.id === nodeId) {
                    setActiveNode(null);
                }
            }
        } catch (err) {
            alert("Erreur lors de la suppression.");
            console.error(err);
        }
    };

    if (loading) {
        return <div className="p-8 text-[var(--text-secondary)] font-mono">Chargement de l'arborescence...</div>;
    }

    return (
        <div className="flex w-full h-full">
            {/* Split layout */}
            <NotesSidebar 
                tree={tree} 
                lang={lang}
                activeNodeId={activeNode?.id}
                onSelectNode={handleSelectNode}
                onAddNode={openCreateModal}
                onTreeChange={handleTreeChange}
            />
            
            <div className="flex-1 overflow-y-auto relative bg-[var(--bg-deep)]" style={{ borderLeft: '3px solid var(--bg-border)' }}>
                {activeNode ? (
                    <NoteViewer 
                        node={activeNode} 
                        lang={lang} 
                        tree={tree}
                        onEdit={(initialData) => openEditModal(activeNode, initialData)}
                        onDelete={() => handleDeleteNode(activeNode.id, activeNode.type)}
                        onNavigate={handleSelectNode}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-center" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-dim)' }}>
                        Selectionnez une note ou un groupe dans le menu de gauche.
                    </div>
                )}
            </div>

            {isEditorOpen && (
                <NoteEditorModal 
                    lang={lang}
                    mode={editorMode}
                    type={editorTargetType}
                    parentId={editorParentId}
                    initialData={editorInitialData}
                    onClose={() => setIsEditorOpen(false)}
                    onSuccess={() => {
                        setIsEditorOpen(false);
                        loadTree();
                    }}
                />
            )}
        </div>
    );
}
