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
                <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
                    📑 Table des matières
                </h2>
                <ul className="space-y-1">
                    {headings.map((heading) => (
                        <li
                            key={heading.id}
                            style={{ paddingLeft: `${(heading.level - 1) * 1.25}rem` }}
                        >
                            <button
                                onClick={() => scrollToHeading(heading.id)}
                                className={`group block w-full text-left pb-1 px-3 rounded-md transition-all duration-200 ${activeId === heading.id
                                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-900/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }`}
                            >
                                <span className={`block relative ${activeId === heading.id
                                    ? 'before:content-["→"] before:absolute before:-left-4 before:text-indigo-600 dark:before:text-indigo-400 before:font-bold'
                                    : 'group-hover:before:content-["→"] group-hover:before:absolute group-hover:before:-left-4 group-hover:before:text-gray-400 group-hover:before:opacity-50'
                                    } ${heading.level > 1 ? 'text-xs' : 'text-sm font-medium'}`}>
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
