import React, { useState } from 'react';

// Help functions to calculate and move nodes in tree
const findNodeWithParent = (nodes, id, parent = null) => {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.id === id) return { node, parent, index: i };
        if (node.children) {
            const found = findNodeWithParent(node.children, id, node);
            if (found) return found;
        }
    }
    return null;
};

const calculateDepth = (node) => {
    if (!node.children || node.children.length === 0) return 0;
    let max = 0;
    for (const child of node.children) {
        max = Math.max(max, calculateDepth(child));
    }
    return max + 1;
};

const getDepthFromRoot = (nodes, targetId, currentDepth = 0) => {
    for (const node of nodes) {
        if (node.id === targetId) return currentDepth;
        if (node.children) {
            const d = getDepthFromRoot(node.children, targetId, currentDepth + 1);
            if (d !== -1) return d;
        }
    }
    return -1;
};

// Tree Node Component
const TreeNode = ({ 
    node, 
    level = 0, 
    activeNodeId, 
    onSelectNode, 
    onAddNode,
    onMoveNode,
    expandedFolders,
    toggleFolder
}) => {
    const isFolder = node.type === 'folder';
    const isExpanded = isFolder && expandedFolders.has(node.id);
    const isActive = activeNodeId === node.id;
    
    // Drag & Drop State
    const [dragOverPosition, setDragOverPosition] = useState(null); // 'top', 'bottom', 'inside'

    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', node.id);
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        
        let position = 'inside';
        if (y < rect.height * 0.25) position = 'top';
        else if (y > rect.height * 0.75) position = 'bottom';
        // if not a folder, we can only insert before or after, not inside
        if (!isFolder && position === 'inside') {
            position = y < rect.height / 2 ? 'top' : 'bottom';
        }

        setDragOverPosition(position);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverPosition(null); // Remove highlight
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverPosition(null);
        
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId && draggedId !== node.id) {
            onMoveNode(draggedId, node.id, dragOverPosition); // Move dragId to node.id at position
        }
    };

    let borderStyles = {};
    if (dragOverPosition === 'top') borderStyles = { borderTop: '2px solid var(--yellow-dark)' };
    else if (dragOverPosition === 'bottom') borderStyles = { borderBottom: '2px solid var(--yellow-dark)' };
    else if (dragOverPosition === 'inside') borderStyles = { background: 'rgba(35,114,39,0.3)', border: '2px dashed var(--yellow-dark)' };

    return (
        <div className="w-full select-none">
            <div 
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isFolder) toggleFolder(node.id);
                    onSelectNode(node);
                }}
                className="group flex items-center justify-between px-3 py-1.5 cursor-pointer text-sm font-mono transition-colors"
                style={{
                    paddingLeft: `${(level * 16) + 12}px`,
                    background: isActive ? 'rgba(35,114,39,0.15)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--green-dark)' : '3px solid transparent',
                    color: isActive ? 'var(--yellow-light)' : 'var(--text-secondary)',
                    ...borderStyles
                }}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span style={{ color: isFolder ? 'var(--yellow-dark)' : 'var(--text-dim)', fontSize: '12px' }}>
                        {isFolder ? (isExpanded ? '▼' : '▶') : '📄'}
                    </span>
                    <span className="truncate">{node.title}</span>
                </div>
                
                {/* Actions strictly for folders */}
                {isFolder && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            className="p-1 hover:bg-[rgba(35,114,39,0.2)] rounded text-[var(--green-light)]"
                            onClick={(e) => { e.stopPropagation(); onAddNode(node.id, 'note'); }}
                            title="Ajouter une note"
                        >
                            +N
                        </button>
                        <button 
                            className="p-1 hover:bg-[rgba(35,114,39,0.2)] rounded text-[var(--yellow-dark)]"
                            onClick={(e) => { e.stopPropagation(); onAddNode(node.id, 'folder'); }}
                            title="Ajouter un sous-groupe"
                        >
                            +G
                        </button>
                    </div>
                )}
            </div>
            
            {isExpanded && node.children && node.children.map(child => (
                <TreeNode 
                    key={child.id} 
                    node={child} 
                    level={level + 1}
                    activeNodeId={activeNodeId}
                    onSelectNode={onSelectNode}
                    onAddNode={onAddNode}
                    onMoveNode={onMoveNode}
                    expandedFolders={expandedFolders}
                    toggleFolder={toggleFolder}
                />
            ))}
        </div>
    );
};

export default function NotesSidebar({ tree, lang, activeNodeId, onSelectNode, onAddNode, onTreeChange }) {
    const [expandedFolders, setExpandedFolders] = useState(new Set(['root'])); // assuming 'root' is visually flat

    const toggleFolder = (nodeId) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) next.delete(nodeId);
            else next.add(nodeId);
            return next;
        });
    };

    const handleMoveNode = (dragId, dropId, position) => {
        // Deep copy tree
        let newTree = JSON.parse(JSON.stringify(tree));
        
        // Find the node being dragged
        const draggedContext = findNodeWithParent(newTree, dragId, { children: newTree }); // Mock root parent
        if (!draggedContext) return;
        const { node: draggedNode, parent: draggedParent, index: draggedIndex } = draggedContext;
        
        // Prevent moving a node into itself or its descendants
        const isDescendant = (parent, potentialChildId) => {
            if (parent.id === potentialChildId) return true;
            if (!parent.children) return false;
            return parent.children.some(c => isDescendant(c, potentialChildId));
        };
        if (isDescendant(draggedNode, dropId)) {
            alert("Action impossible: Vous ne pouvez pas déplacer un dossier dans lui-même.");
            return;
        }

        // Find the target node
        const dropContext = findNodeWithParent(newTree, dropId, { children: newTree });
        if (!dropContext) return;
        
        const { node: dropNode, parent: dropParent, index: dropIndex } = dropContext;

        // Depth restriction check (Max depth 5)
        let targetDepth = 0;
        if (position === 'inside') {
            targetDepth = getDepthFromRoot(tree, dropId) + 1; // It will become a child of dropId
        } else {
            targetDepth = getDepthFromRoot(tree, dropParent.id || 'root_pseudo'); // sibling
        }
        
        const branchDepth = calculateDepth(draggedNode);
        if (targetDepth + branchDepth > 5) {
            alert("Action impossible: La profondeur maximale est de 5 niveaux.");
            return;
        }

        // 1. Remove node from old location
        draggedParent.children.splice(draggedIndex, 1);

        // 2. Insert into new location
        if (position === 'inside') {
            if (!dropNode.children) dropNode.children = [];
            dropNode.children.push(draggedNode);
            // auto-expand target
            setExpandedFolders(prev => new Set(prev).add(dropNode.id));
        } else {
            // Recalculate drop index since we might have removed a sibling above it in the same array
            const newDropIndex = dropParent.children.findIndex(n => n.id === dropId);
            const insertIndex = position === 'top' ? newDropIndex : newDropIndex + 1;
            dropParent.children.splice(insertIndex, 0, draggedNode);
        }

        onTreeChange(draggedParent.id ? newTree : draggedParent.children);
    };

    return (
        <aside className="w-80 h-full flex flex-col bg-[var(--bg-surface)] overflow-hidden">
            <div className="p-4 border-b border-[var(--bg-border)] flex items-center justify-between">
                <h2 className="font-bold text-[var(--yellow-dark)] tracking-wider flex items-center gap-2">
                    <span className="text-xl">🗂</span> NOTES
                </h2>
                <div className="flex gap-2">
                    <button 
                        className="btn btn--primary" 
                        style={{ padding: '4px 8px', fontSize: '10px' }}
                        onClick={() => onAddNode('root', 'note')}
                    >
                        +Note
                    </button>
                    <button 
                        className="btn btn--secondary" 
                        style={{ padding: '4px 8px', fontSize: '10px' }}
                        onClick={() => onAddNode('root', 'folder')}
                    >
                        +Groupe
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                {tree.map(node => (
                    <TreeNode
                        key={node.id}
                        node={node}
                        activeNodeId={activeNodeId}
                        onSelectNode={onSelectNode}
                        onAddNode={onAddNode}
                        onMoveNode={handleMoveNode}
                        expandedFolders={expandedFolders}
                        toggleFolder={toggleFolder}
                    />
                ))}
                {tree.length === 0 && (
                    <div className="p-6 text-center text-sm font-mono text-[var(--text-dim)]">
                        Aucune note. Créez un groupe ou une note pour commencer.
                    </div>
                )}
            </div>
            
            <div className="p-4 border-t border-[var(--bg-border)] text-xs font-mono text-[var(--text-dim)] flex items-center gap-2">
                <span>ℹ️</span> 
                <span>Glissez-déposez pour réorganiser.</span>
            </div>
        </aside>
    );
}
