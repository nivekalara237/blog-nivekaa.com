import React, { useState } from 'react';

// ── Icons (Flowbite/Heroicons-style outline SVG) ──────────────────
const ChevronRight = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>;
const ChevronDown = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>;
const FolderIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5a1.5 1.5 0 011.5-1.5h4.19a1.5 1.5 0 011.06.44l1.12 1.12a1.5 1.5 0 001.06.44H19.5A1.5 1.5 0 0121 9.5v8a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-10z"/></svg>;
const NoteIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75h5.379a1.5 1.5 0 011.06.44l3.622 3.62a1.5 1.5 0 01.439 1.061V19.5a1.5 1.5 0 01-1.5 1.5H8.25a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z"/></svg>;
const FolderPlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5a1.5 1.5 0 011.5-1.5h4.19a1.5 1.5 0 011.06.44l1.12 1.12a1.5 1.5 0 001.06.44H19.5A1.5 1.5 0 0121 9.5v8a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-10z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 11.5v4M10 13.5h4"/></svg>;
const NotePlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75h5.379a1.5 1.5 0 011.06.44l3.622 3.62a1.5 1.5 0 01.439 1.061V19.5a1.5 1.5 0 01-1.5 1.5H8.25a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v5.25M9.375 13.125h5.25"/></svg>;

// ── Recursive TreeNode ───────────────────────────────────────────
function TreeNode({ node, depth = 0, activeId, openFolders, searchQuery, isAdmin, onSelect, onToggleFolder, onAddNode }) {
    const isFolder = node.type === 'folder';
    const isOpen = openFolders.has(node.id);
    const isActive = activeId === node.id;

    // Filter notes in sidebar when searching
    if (!isFolder && searchQuery && !node.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(node.tags && node.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))) {
        return null;
    }

    const indent = depth * 14;

    return (
        <div className={`tree-node${isFolder ? ' tree-folder' + (isOpen ? ' open' : '') : ''}`}>
            <div
                className={`tree-row${isActive ? ' active' : ''}`}
                onClick={() => {
                    if (isFolder) onToggleFolder(node.id);
                    onSelect(node);
                }}
            >
                <span style={{ minWidth: `${indent}px`, display: 'inline-block' }} />
                {isFolder && <span className="tree-bullet">{isOpen ? <ChevronDown /> : <ChevronRight />}</span>}
                <span className="tree-bullet" style={!isFolder ? { color: 'var(--em)' } : undefined}>
                    {isFolder ? <FolderIcon /> : <NoteIcon />}
                </span>
                <span className="tree-name">{node.name || node.title}</span>
                {isFolder && (
                    <span className="tree-tag">{node.children ? node.children.length : 0}</span>
                )}
            </div>
            {isFolder && isOpen && node.children && node.children.length > 0 && (
                <div className="tree-children" style={{ display: 'block' }}>
                    {node.children.map(child => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            activeId={activeId}
                            openFolders={openFolders}
                            searchQuery={searchQuery}
                            isAdmin={isAdmin}
                            onSelect={onSelect}
                            onToggleFolder={onToggleFolder}
                            onAddNode={onAddNode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Sidebar Component ───────────────────────────────────────
export default function NotesSidebar({ tree, activeId, openFolders, searchQuery, isAdmin, onSelect, onToggleFolder, onAddNode }) {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <span className="sidebar-label">Arborescence</span>
                {isAdmin && (
                    <div className="sidebar-actions" id="admin-actions">
                        <button
                            className="btn-icon"
                            onClick={() => onAddNode('folder', 'root')}
                            title="Nouveau dossier"
                        >
                            <FolderPlusIcon />
                        </button>
                        <button
                            className="btn-icon"
                            onClick={() => onAddNode('note', 'root')}
                            title="Nouvelle note"
                        >
                            <NotePlusIcon />
                        </button>
                    </div>
                )}
            </div>
            <div className="sidebar-tree">
                {tree.map(node => (
                    <TreeNode
                        key={node.id}
                        node={node}
                        depth={0}
                        activeId={activeId}
                        openFolders={openFolders}
                        searchQuery={searchQuery}
                        isAdmin={isAdmin}
                        onSelect={onSelect}
                        onToggleFolder={onToggleFolder}
                        onAddNode={onAddNode}
                    />
                ))}
                {tree.length === 0 && (
                    <div style={{ padding: '16px', fontSize: '12px', color: 'var(--txt3)', textAlign: 'center' }}>
                        Arbre vide
                    </div>
                )}
            </div>
        </div>
    );
}
