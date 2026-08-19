import React, { useEffect, useState } from 'react';

const LABELS = {
    en: 'On this page',
    fr: 'Sur cette page',
};

/**
 * TableOfContents - flat sidebar list of the article's top-level sections
 * only (whatever the shallowest heading level actually used in the
 * content is — no nested tree, no expand/collapse).
 */
export default function TableOfContents({ content = '', lang = 'en' }) {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        if (!content) return;

        const lines = content.split('\n');
        const extracted = [];
        let insideCodeBlock = false;

        lines.forEach((line, index) => {
            if (line.trim().startsWith('```')) {
                insideCodeBlock = !insideCodeBlock;
                return;
            }
            if (insideCodeBlock) return;

            // Only markdown H1 (#) and H2 (##) — fixed levels 1 and 2, both
            // rendered as one flat list (H2 is not a sub-level of H1).
            const match = line.match(/^(#{1,2})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                const baseId = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                extracted.push({
                    id: baseId ? `${baseId}-${index}` : `heading-${index}`,
                    text,
                    level,
                });
            }
        });

        setHeadings(extracted);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                });
            },
            { rootMargin: '-96px 0px -80% 0px' }
        );

        extracted.forEach((h) => {
            const el = document.getElementById(h.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [content]);

    const scrollToHeading = (id) => {
        const element = document.getElementById(id);
        if (!element) return;
        const y = element.getBoundingClientRect().top + window.pageYOffset - 96;
        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    if (headings.length === 0) return null;

    return (
        <nav className="sticky" style={{ top: '96px' }}>
            <p
                style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-dim)',
                    marginBottom: '16px',
                }}
            >
                {LABELS[lang] || LABELS.en}
            </p>
            <ul className="space-y-1" style={{ borderLeft: '1px solid var(--bg-border)' }}>
                {headings.map((h) => {
                    const isActive = activeId === h.id;
                    return (
                        <li key={h.id}>
                            <button
                                type="button"
                                onClick={() => scrollToHeading(h.id)}
                                className="text-left w-full transition-colors duration-150"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '13.5px',
                                    fontWeight: isActive ? 600 : 400,
                                    lineHeight: 1.4,
                                    color: isActive ? 'var(--green-dark)' : 'var(--text-secondary)',
                                    padding: '5px 0 5px 14px',
                                    marginLeft: '-1px',
                                    borderLeft: isActive ? '2px solid var(--green-dark)' : '2px solid transparent',
                                }}
                            >
                                {h.text}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
