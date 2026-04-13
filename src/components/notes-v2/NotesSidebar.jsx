import React, { useState } from 'react';

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
                <span className="tree-bullet">{isFolder ? (isOpen ? '[-]' : '[+]') : '■'}</span>
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
                <span className="sidebar-label">// FILE TREE</span>
                {isAdmin && (
                    <div className="sidebar-actions" id="admin-actions">
                        <button
                            className="btn-sm btn-em"
                            onClick={() => onAddNode('folder', 'root')}
                            title="Nouveau dossier"
                        >
                            +G
                        </button>
                        <button
                            className="btn-sm btn-em"
                            onClick={() => onAddNode('note', 'root')}
                            title="Nouvelle note"
                        >
                            +N
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
                    <div style={{ padding: '16px', fontSize: '10px', color: 'var(--txt3)', textAlign: 'center' }}>
                        // arbre vide
                    </div>
                )}
            </div>
        </div>
    );
}
