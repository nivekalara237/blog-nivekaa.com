import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createHighlighter } from 'shiki';

// Code block component with Shiki
// Code block component with Shiki
const CodeBlock = ({ inline, className, children, ...props }) => {
    const [html, setHtml] = useState(null);
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : 'text';
    const code = String(children).replace(/\n$/, '');

    // Heuristic: It's a block if it has a language class OR if it contains newlines
    const isBlock = match || String(children).includes('\n');

    useEffect(() => {
        if (!isBlock) return;

        let highlighter;
        const initHighlighter = async () => {
            try {
                highlighter = await createHighlighter({
                    themes: ['github-light', 'github-dark'],
                    langs: ['javascript', 'typescript', 'css', 'html', 'json', 'bash', 'markdown', 'jsx', 'tsx', 'astro'],
                });

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
                // Fallback
                setHtml(`<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code>${code}</code></pre>`);
            }
        };

        initHighlighter();

        return () => {
            if (highlighter) highlighter.dispose();
        }
    }, [code, lang, isBlock]);

    if (!isBlock) {
        return (
            <code
                className="bg-gray-100 text-red-500 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200"
                {...props}
            >
                {children}
            </code>
        );
    }

    if (html) {
        return <div className="not-prose my-4" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    return (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4">
            <code className={className} {...props}>
                {children}
            </code>
        </pre>
    );
};

export default function ArticleEditor({ categories, tags }) {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [activeTab, setActiveTab] = useState('write');
    const [selectedTags, setSelectedTags] = useState([]);

    // Auto-slug generation
    useEffect(() => {
        const newSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setSlug(newSlug);
    }, [title]);

    const handleTagToggle = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            title,
            slug,
            description: e.target.description.value,
            category: e.target.category.value,
            date: e.target.date.value,
            cover: e.target.cover.value,
            tags: selectedTags,
            content
        };
        console.log('Article Created:', formData);
        alert('Article créé ! (Voir console)');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

            {/* Title & Slug Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700">Titre</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white outline-none text-gray-900 placeholder-gray-400"
                        placeholder="Mon super article..."
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="slug" className="block text-sm font-semibold text-gray-700">Slug (Automatique)</label>
                    <input
                        type="text"
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white outline-none text-gray-600 font-mono text-sm"
                    />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">Description courte</label>
                <input
                    type="text"
                    id="description"
                    name="description"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white outline-none text-gray-900"
                    placeholder="Un résumé accrocheur..."
                />
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-700">Catégorie</label>
                    <div className="relative">
                        <select
                            id="category"
                            name="category"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white outline-none appearance-none cursor-pointer"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="date" className="block text-sm font-semibold text-gray-700">Date de publication</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white outline-none"
                    />
                </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
                <label htmlFor="cover" className="block text-sm font-semibold text-gray-700">Image de couverture</label>
                <input
                    type="url"
                    id="cover"
                    name="cover"
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white outline-none font-mono text-sm"
                />
            </div>

            {/* Tags Selection */}
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Tags</label>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${selectedTags.includes(tag)
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                                }`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rich Markdown Editor */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">Contenu</label>
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setActiveTab('write')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'write'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Éditer
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('preview')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'preview'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Aperçu
                        </button>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[500px] bg-white">
                    {activeTab === 'write' ? (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-[500px] p-6 outline-none resize-none font-mono text-sm text-gray-800 bg-gray-50/50 focus:bg-white transition-colors"
                            placeholder="# Commencez à écrire votre histoire..."
                        />
                    ) : (
                        <div className="prose prose-indigo max-w-none p-8 h-[500px] overflow-y-auto">
                            {content ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code: CodeBlock
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            ) : (
                                <p className="text-gray-400 italic text-center mt-20">Rien à prévisualiser pour le moment...</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-6 border-t border-gray-100">
                <button
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold text-lg"
                >
                    Publier l'article
                </button>
            </div>
        </form>
    );
}
