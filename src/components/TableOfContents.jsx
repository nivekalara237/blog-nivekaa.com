import React, { useEffect, useState } from 'react';

export default function TableOfContents({ content }) {
    const [headingsTree, setHeadingsTree] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [expandedSections, setExpandedSections] = useState(new Set());

    useEffect(() => {
        // Extract headings from Markdown content
        const lines = content.split('\n');
        const extractedHeadings = [];
        let insideCodeBlock = false;

        lines.forEach((line, index) => {
            if (line.trim().startsWith('```')) {
                insideCodeBlock = !insideCodeBlock;
                return;
            }
            if (insideCodeBlock) return;

            const match = line.match(/^(#{1,5})\s+(.+)$/);
            if (match) {
                const markdownLevel = match[1].length;
                const text = match[2].trim();
                const baseId = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                
                let displayLevel;
                if (markdownLevel <= 2) displayLevel = 1;
                else displayLevel = markdownLevel - 1;

                extractedHeadings.push({
                    id: baseId ? `${baseId}-${index}` : `heading-${index}`,
                    text: text,
                    level: displayLevel,
                });
            }
        });

        // Convert flat headings to tree
        const tree = [];
        const stack = [];
        extractedHeadings.forEach(h => {
            const node = { ...h, children: [] };
            while (stack.length > 0 && stack[stack.length - 1].level >= h.level) {
                stack.pop();
            }
            if (stack.length === 0) {
                tree.push(node);
            } else {
                stack[stack.length - 1].children.push(node);
                node.parentId = stack[stack.length - 1].id;
            }
            stack.push(node);
        });

        setHeadingsTree(tree);

        // Setup intersection observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-80px 0px -80% 0px' }
        );

        document.querySelectorAll('.prose h1, .prose h2, .prose h3, .prose h4, .prose h5').forEach((heading) => {
            observer.observe(heading);
        });

        return () => observer.disconnect();
    }, [content]);

    // Auto-expand parents of active section
    useEffect(() => {
        if (!activeId) return;

        const findParents = (nodes, targetId, parents = []) => {
            for (const node of nodes) {
                if (node.id === targetId) return parents;
                if (node.children.length > 0) {
                    const result = findParents(node.children, targetId, [...parents, node.id]);
                    if (result) return result;
                }
            }
            return null;
        };

        const parentIds = findParents(headingsTree, activeId);
        if (parentIds && parentIds.length > 0) {
            setExpandedSections(prev => {
                const next = new Set(prev);
                parentIds.forEach(id => next.add(id));
                return next;
            });
        }
    }, [activeId, headingsTree]);

    const scrollToHeading = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const toggleSection = (id, e) => {
        e.stopPropagation();
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (headingsTree.length === 0) return null;

    const renderNodes = (nodes) => {
        return (
            <ul className="relative space-y-0.5">
                {nodes.map((node) => {
                    const hasChildren = node.children.length > 0;
                    const isExpanded = expandedSections.has(node.id);
                    const isActive = activeId === node.id;

                    return (
                        <li key={node.id} className="relative group">
                            <div className="flex items-center">
                                <button
                                    onClick={() => scrollToHeading(node.id)}
                                    className={`
                                        flex-grow text-left py-1.5 px-2 transition-all duration-150 flex items-start gap-2 relative
                                        ${isActive 
                                            ? 'text-[var(--yellow-dark)]' 
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(35,114,39,0.1)]'
                                        }
                                    `}
                                    style={{ 
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: node.level === 1 ? '13px' : '12px',
                                        fontWeight: node.level === 1 ? '700' : '400',
                                        letterSpacing: '0.02em'
                                    }}
                                >
                                    {isActive && (
                                        <div 
                                            className="absolute left-0 top-1 bottom-1 w-[3px]"
                                            style={{ background: 'var(--yellow-dark)', boxShadow: '0 0 8px var(--yellow-dark)' }}
                                        />
                                    )}

                                    <span 
                                        className={`shrink-0 transition-transform duration-200 ${isActive ? 'translate-x-0' : '-translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`}
                                        style={{ color: isActive ? 'var(--yellow-dark)' : 'var(--green-light)', fontSize: '10px', marginTop: '3px' }}
                                    >
                                        [{isActive ? '>' : '+'}]
                                    </span>

                                    <span className={`block ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform duration-200`}>
                                        {node.text}
                                    </span>
                                </button>

                                {hasChildren && (
                                    <button
                                        onClick={(e) => toggleSection(node.id, e)}
                                        className="p-1 px-2 text-[10px] opacity-50 hover:opacity-100 transition-opacity"
                                        style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-dim)' }}
                                    >
                                        [{isExpanded ? '-' : '+'}]
                                    </button>
                                )}
                            </div>

                            {hasChildren && isExpanded && (
                                <div className="ml-3 pl-3 border-l" style={{ borderColor: 'var(--bg-border)' }}>
                                    {renderNodes(node.children)}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <nav className="sticky top-12 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
            <div 
                className="relative p-1"
                style={{ 
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--bg-border)',
                    boxShadow: '4px 4px 0 rgba(0,0,0,0.3)'
                }}
            >
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: 'var(--green-light)' }} />
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: 'var(--green-light)' }} />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: 'var(--green-light)' }} />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: 'var(--green-light)' }} />

                <div 
                    className="px-3 py-2 border-b flex items-center justify-between"
                    style={{ borderColor: 'var(--bg-border)', background: 'rgba(35, 114, 39, 0.1)' }}
                >
                    <h2 
                        className="text-[10px] my-2 font-black uppercase tracking-[0.2em]"
                        style={{ color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        [ Tables: <span style={{ color: 'var(--yellow-dark)' }}>Index</span> ]
                    </h2>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-green-900" />
                    </div>
                </div>

                <div className="p-3">
                    {renderNodes(headingsTree)}
                </div>

                <div 
                    className="p-2 border-t text-[9px] flex justify-between uppercase opacity-50"
                    style={{ borderColor: 'var(--bg-border)', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-dim)' }}
                >
                    <span>ID: REF_0x{headingsTree.length.toString(16).toUpperCase()}</span>
                    <span>v1.0.5</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--bg-border); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--green-dark); }
            `}} />
        </nav>
    );
}
