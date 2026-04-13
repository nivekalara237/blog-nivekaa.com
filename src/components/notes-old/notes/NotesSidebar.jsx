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
    toggleFolder,
    isAdmin
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
        <div className="w-full select-none font-mono">
            <div
                draggable={isAdmin ? true : undefined}
                onDragStart={isAdmin ? handleDragStart : undefined}
                onDragOver={isAdmin ? handleDragOver : undefined}
                onDragLeave={isAdmin ? handleDragLeave : undefined}
                onDrop={isAdmin ? handleDrop : undefined}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isFolder) toggleFolder(node.id);
                    onSelectNode(node);
                }}
                className={`group flex items-center justify-between px-3 py-1.5 mx-2 my-0.5 rounded cursor-pointer text-sm transition-all border ${isActive
                        ? 'bg-white dark:bg-black text-[#2f855a] dark:text-[#48bb78] border-2 border-[#48bb78] shadow-[2px_2px_0_rgba(72,187,120,0.3)]'
                        : 'text-[#718096] dark:text-gray-400 border-transparent hover:bg-[#48bb78]/10 hover:text-[#2f855a] dark:hover:text-[#48bb78] hover:border-[#48bb78]/20'
                    }`}
                style={{
                    paddingLeft: `${(level * 16) + 12}px`,
                }}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {isFolder ? (
                        <span className={`flex items-center justify-center h-5 px-1 leading-none border rounded-sm ${isActive ? 'bg-[#c6f6d5] dark:bg-[#48bb78]/20 border-[#2f855a] dark:border-[#48bb78] text-[#2f855a] dark:text-[#48bb78]' : 'bg-white dark:bg-[#111] border-[#48bb78] text-[#48bb78]'}`}>
                            {isExpanded ? '[-]' : '[+]'}
                        </span>
                    ) : (
                        <span className={`opacity-50 min-w-[1.2rem] ${isActive ? 'text-[#2f855a] dark:text-[#48bb78]' : 'text-gray-400 dark:text-gray-600'}`}>
                            └─
                        </span>
                    )}

                    <span className={`truncate ${isFolder ? 'font-bold uppercase tracking-wider text-[0.8em]' : (isActive ? 'font-bold' : '')}`}>
                        {node.title}
                    </span>
                </div>

                {isFolder && isAdmin && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            className="px-1.5 py-0.5 hover:bg-[#c6f6d5] dark:hover:bg-[#48bb78]/20 rounded text-[#2f855a] dark:text-[#48bb78] font-bold text-xs border border-transparent hover:border-[#48bb78]"
                            onClick={(e) => { e.stopPropagation(); onAddNode(node.id, 'note'); }}
                            title="Ajouter une note"
                        >
                            +N
                        </button>
                        <button
                            className="px-1.5 py-0.5 hover:bg-[#ebf8ff] dark:hover:bg-[#3182ce]/20 rounded text-[#3182ce] dark:text-[#63b3ed] font-bold text-xs border border-transparent hover:border-[#63b3ed]"
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
                    isAdmin={isAdmin}
                />
            ))}
        </div>
    );
};

export default function NotesSidebar({ tree, lang, activeNodeId, onSelectNode, onAddNode, onTreeChange, isAdmin }) {
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
        <aside className="w-80 h-full flex flex-col bg-[#f4eee4] dark:bg-[#0a0a0a] border-r-2 border-[#d4c5b0] dark:border-gray-800 z-10 relative transition-colors">
            <div className="p-6 border-b-2 border-[#d4c5b0] dark:border-gray-800 bg-[#eae2d3] dark:bg-[#111] flex items-center justify-between transition-colors">
                <h2 className="font-mono font-bold text-[#2f855a] dark:text-[#48bb78] tracking-widest text-2xl uppercase">
                    sys.NOTES
                </h2>
                {isAdmin && (
                    <div className="flex gap-2">
                        <button
                            className="px-2 py-1 bg-[#48bb78] text-white border-2 border-[#2f855a] font-mono font-bold text-[10px] uppercase shadow-[2px_2px_0_#2f855a] hover:bg-[#38a169] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all"
                            onClick={() => onAddNode('root', 'note')}
                        >
                            +Note
                        </button>
                        <button
                            className="px-2 py-1 bg-[#3182ce] text-white border-2 border-[#2b6cb0] font-mono font-bold text-[10px] uppercase shadow-[2px_2px_0_#2b6cb0] hover:bg-[#2b6cb0] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all"
                            onClick={() => onAddNode('root', 'folder')}
                        >
                            +Groupe
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                {tree.map(node => (
                    <TreeNode
                        key={node.id}
                        node={node}
                        activeNodeId={activeNodeId}
                        onSelectNode={onSelectNode}
                        onAddNode={onAddNode}
                        onMoveNode={isAdmin ? handleMoveNode : undefined}
                        expandedFolders={expandedFolders}
                        toggleFolder={toggleFolder}
                        isAdmin={isAdmin}
                    />
                ))}
                {tree.length === 0 && (
                    <div className="p-6 text-center text-sm font-mono text-[#718096] dark:text-gray-500">
                        // Aucune note.
                        <br />
                        // Créez un groupe pour commencer.
                    </div>
                )}
            </div>

            {isAdmin && (
                <div className="p-3 border-t-2 border-[#d4c5b0] dark:border-gray-800 bg-[#eae2d3] dark:bg-[#111] text-[10px] font-mono text-[#718096] dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 transition-colors">
                    <span className="bg-white dark:bg-black px-1 rounded-sm border border-[#d4c5b0] dark:border-gray-700">Drag</span>
                    <span>& Drop pour réorganiser</span>
                </div>
            )}
        </aside>
    );
}
