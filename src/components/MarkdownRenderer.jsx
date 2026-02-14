import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { getHighlighter } from '../utils/shiki';
import mermaid from 'mermaid';

// API Configuration - import from api.js or define here
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://cloudnive-api.nivekaa.com';
const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_URL || `${API_BASE_URL}/images`;

// Initialize mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: (typeof window !== 'undefined' && localStorage.getItem("theme") === 'dark' ? 'dark' : 'neutral') || 'default',
    securityLevel: 'loose',
    fontFamily: 'inherit',
});

const Mermaid = ({ chart }) => {
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(null);
    const id = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`).current;

    useEffect(() => {
        if (chart) {

            let withPieInsteadBar = chart.trim();
            if (chart.startsWith("bar")) {
                withPieInsteadBar = "pie" + chart.substring(3);
            }

            mermaid.render(id, withPieInsteadBar)
                .then(({ svg }) => {
                    setSvg(svg);
                    setError(null);
                })
                .catch((err) => {
                    console.error('Mermaid render error:', err);
                    setError('Erreur de rendu du diagramme');
                });
        }
    }, [chart, id]);

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                {error}
                <pre className="mt-2 text-xs overflow-auto">{chart}</pre>
            </div>
        );
    }

    console.log(svg);
    return (
        <div className="mermaid my-8 flex justify-center overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />
    );
};

// Code block component with Shiki syntax highlighting
const CodeBlock = ({ inline, className, children, ...props }) => {
    const [html, setHtml] = useState(null);
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : 'text';
    const code = String(children).replace(/\n$/, '');

    // Detect inline code: no className means inline code
    const isInline = !className || inline;

    // Handle Mermaid diagrams
    if (!isInline && lang === 'mermaid') {
        return <Mermaid chart={code} />;
    }

    useEffect(() => {
        if (isInline) return; // Skip for inline code

        const highlightCode = async () => {
            try {
                const highlighter = await getHighlighter();

                const highlighted = highlighter.codeToHtml(code, {
                    lang: lang,
                    themes: {
                        light: 'github-light',
                        dark: 'github-dark',
                    }
                });
                setHtml(highlighted);
            } catch (e) {
                console.error("Shiki error:", e);
                setHtml(`<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto"><code>${code}</code></pre>`);
            }
        };

        highlightCode();
    }, [code, lang, isInline]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    // Inline code
    if (isInline) {
        return (
            <code
                className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 font-bold dark:text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
            >
                {children}
            </code>
        );
    }

    // Block code with highlighting
    if (html) {
        return (
            <div className="not-prose my-4 rounded-xl overflow-hidden shadow-sm relative group" style={{ maxWidth: '100%' }}>
                <button
                    onClick={copyToClipboard}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 z-10"
                    title={copied ? "Copié!" : "Copier le code"}
                >
                    {copied ? (
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
                <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        );
    }

    // Fallback
    return (
        <div className="relative group">·
            <button
                onClick={copyToClipboard}
                className="absolute top-3 right-3 p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 z-10"
                title={copied ? "Copié!" : "Copier le code"}
            >
                {copied ? (
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                )}
            </button>
            <pre className="bg-gray-50 dark:bg-gray-800/60 p-6 rounded-xl overflow-x-auto my-8 shadow-sm border-none">
                <code className={`${className} text-sm text-gray-800 dark:text-gray-100 leading-relaxed`} {...props}>
                    {children}
                </code>
            </pre>
        </div>
    );
};

// Custom Image component to handle relative paths and errors
const CustomImage = ({ src, alt, ...props }) => {
    const [imageError, setImageError] = useState(false);
    const imgRef = React.useRef(null);

    // Check if the src is a relative path (doesn't start with http:// or https:// or /)
    const isRelativePath = src && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('/');

    // Convert relative paths to absolute API URLs
    const imageSrc = isRelativePath ? `${IMAGE_BASE_URL}/${src}` : src;

    // Check image validity on mount (handles cached broken images)
    useEffect(() => {
        if (!imageSrc) {
            setImageError(true);
            return;
        }

        const img = imgRef.current;
        if (img && img.complete) {
            // Image already loaded (from cache)
            if (img.naturalHeight === 0) {
                // Image failed to load
                setImageError(true);
            }
        }
    }, [imageSrc]);

    const handleImageError = () => {
        setImageError(true);
    };

    if (imageError) {
        return (
            <div className="my-8 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-3 text-gray-400 dark:text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 italic">
                    {alt || "Image non disponible"}
                </p>
            </div>
        );
    }

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt || ''}
            className="rounded-lg my-6 max-w-full h-auto shadow-lg"
            loading="lazy"
            onError={handleImageError}
            {...props}
        />
    );
};

/**
 * MarkdownRenderer - Composant réutilisable pour rendre le markdown
 * 
 * @param {string} content - Contenu markdown à rendre
 * @param {string} className - Classes CSS additionnelles (optionnel)
 * @param {object} props - the addional props (optionnel)
 */
export default function MarkdownRenderer({ content, className = '', ...props }) {
    // Counter to track heading occurrences for unique IDs
    const headingCounters = React.useRef({});

    // Function to generate unique IDs matching TableOfContents
    const generateHeadingId = (text) => {
        const lines = content.split('\n');
        let lineNumber = 0;

        // Find the line number of this heading
        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(/^(#{1,5})\s+(.+)$/);
            if (match && match[2].trim() === text) {
                lineNumber = i;
                break;
            }
        }

        const baseId = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        return baseId ? `${baseId}-${lineNumber}` : `heading-${lineNumber}`;
    };

    if (!content) {
        return (
            <div className={`text-gray-400 dark:text-gray-600 italic ${className}`}>
                Aucun contenu à afficher
            </div>
        );
    }

    return (
        <div className={`prose prose-lg prose-indigo dark:prose-invert max-w-none overflow-x-auto ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                    code: CodeBlock,
                    img: CustomImage,
                    h1: ({ node, children, ...props }) => {
                        const text = String(children);
                        const id = generateHeadingId(text);
                        return <h1 id={id} className="text-3xl font-bold mt-8 mb-4 scroll-mt-24" {...props}>{children}</h1>;
                    },
                    h2: ({ node, children, ...props }) => {
                        const text = String(children);
                        const id = generateHeadingId(text);
                        return <h2 id={id} className="text-2xl font-bold mt-6 mb-3 scroll-mt-24" {...props}>{children}</h2>;
                    },
                    h3: ({ node, children, ...props }) => {
                        const text = String(children);
                        const id = generateHeadingId(text);
                        return <h3 id={id} className="text-xl font-bold mt-4 mb-2 scroll-mt-24" {...props}>{children}</h3>;
                    },
                    h4: ({ node, children, ...props }) => {
                        const text = String(children);
                        const id = generateHeadingId(text);
                        return <h4 id={id} className="text-lg font-bold mt-4 mb-2 scroll-mt-24" {...props}>{children}</h4>;
                    },
                    h5: ({ node, children, ...props }) => {
                        const text = String(children);
                        const id = generateHeadingId(text);
                        return <h5 id={id} className="text-base font-bold mt-4 mb-2 scroll-mt-24" {...props}>{children}</h5>;
                    },
                    p: ({ node, ...props }) => <div className="mb-4 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc !pl-0 list-inside !my-2 space-y-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal !pl-0 list-inside mb-4 space-y-2" {...props} />,
                    li: ({ node, ...props }) => <li className="ml-4 !mb-0" {...props} />,
                    a: ({ node, ...props }) => <a className="text-indigo-600 dark:text-indigo-400 hover:underline" {...props} />,
                    em: ({ node, ...props }) => <i className="italic underline underline-offset-4" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic my-4" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />,
                    hr: ({ node, ...props }) => <hr className="my-8 border-gray-300 dark:border-gray-700" {...props} />,
                    table: ({ node, ...props }) => <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 my-4" {...props} />,
                    th: ({ node, ...props }) => <th className="px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left" {...props} />,
                    td: ({ node, ...props }) => <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
