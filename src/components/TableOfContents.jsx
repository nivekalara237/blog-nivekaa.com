import React, { useEffect, useState } from 'react';

export default function TableOfContents({ content }) {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        // Extract headings from Markdown content
        const lines = content.split('\n');
        const extractedHeadings = [];
        let insideCodeBlock = false;

        lines.forEach((line, index) => {
            // Check if we're entering or exiting a code block
            if (line.trim().startsWith('```')) {
                insideCodeBlock = !insideCodeBlock;
                return; // Skip the code fence line itself
            }

            // Skip headings inside code blocks
            if (insideCodeBlock) {
                return;
            }

            // Match Markdown headings (# to ##### )
            const match = line.match(/^(#{1,5})\s+(.+)$/);
            if (match) {
                const markdownLevel = match[1].length; // Number of # symbols
                const text = match[2].trim();
                const baseId = text
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '');

                // Custom level mapping:
                // # and ## -> displayLevel 1
                // ### -> displayLevel 2
                // #### -> displayLevel 3
                // ##### -> displayLevel 4
                let displayLevel;
                if (markdownLevel <= 2) {
                    displayLevel = 1;
                } else {
                    displayLevel = markdownLevel - 1;
                }

                // Add index to ensure unique IDs even if text is duplicated
                const uniqueId = baseId ? `${baseId}-${index}` : `heading-${index}`;

                extractedHeadings.push({
                    id: uniqueId,
                    text: text,
                    level: displayLevel,
                    markdownLevel: markdownLevel
                });
            }
        });

        setHeadings(extractedHeadings);

        // Setup intersection observer for active heading
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

        // Observe all headings
        document.querySelectorAll('.prose h1, .prose h2, .prose h3, .prose h4, .prose h5').forEach((heading) => {
            observer.observe(heading);
        });

        return () => observer.disconnect();
    }, [content]);

    const scrollToHeading = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100; // Offset for fixed headers
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    if (headings.length === 0) return null;

    return (
        <nav className="sticky top-8">
            <div className="py-4">
                <h2 className="text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--bg-border)', fontFamily: "'Space Grotesk', sans-serif" }}>
                    <span style={{ color: 'var(--yellow-dark)' }}>//</span> INDEX
                </h2>
                <ul className="space-y-1">
                    {headings.map((heading) => (
                        <li
                            key={heading.id}
                            style={{ paddingLeft: `${(heading.level - 1) * 1.25}rem` }}
                        >
                            <button
                                onClick={() => scrollToHeading(heading.id)}
                                className={`group block w-full text-left py-1.5 px-3 border-l-2 transition-all duration-100 ${activeId === heading.id
                                        ? 'border-[var(--green-light)] bg-[rgba(81,154,102,0.15)] text-[var(--yellow-light)]'
                                        : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--green-light)] hover:text-[var(--yellow-dark)] hover:border-[var(--yellow-dark)]'
                                    }`}
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                <span className={`block relative ${activeId === heading.id
                                    ? 'before:content-[">"] before:absolute before:-left-4 before:text-yellow-light before:font-bold'
                                    : 'group-hover:before:content-[">"] group-hover:before:absolute group-hover:before:-left-4 group-hover:before:text-yellow-dark'
                                    } ${heading.level > 1 ? 'text-xs' : 'text-sm font-bold'}`}>
                                    {heading.text}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
