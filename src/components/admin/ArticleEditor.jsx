import React, { useState, useEffect, useRef } from 'react';
import MarkdownRenderer from '../MarkdownRenderer.jsx';
import AuthorCard from '../AuthorCard.jsx';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { mapKindeUserToAuthor } from '../../utils/user-mapper';
import { kindeApi } from '../../lib/kinde-api';

export default function ArticleEditor({ categories, tags, onSaveSuccess = (result) => { } }) {
    const [editSlug, setEditSlug] = useState(null);
    const { user, isLoading } = useKindeAuth();
    const [author, setAuthor] = useState(null);

    useEffect(() => {
        const fetchAuthorData = async () => {
            if (!user?.id) return;
            try {
                const fullData = await kindeApi.getUserDetails(user.id);
                setAuthor(mapKindeUserToAuthor(fullData));
            } catch (error) {
                console.warn('Failed to fetch full author details, using session data:', error);
                setAuthor(mapKindeUserToAuthor(user));
            }
        };

        if (!isLoading && user) {
            fetchAuthorData();
        }
    }, [isLoading, user]);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('# Mon Article\n\nÉcrivez votre contenu ici...');
    const [selectedTags, setSelectedTags] = useState([]);
    const [activeTab, setActiveTab] = useState('write');
    const [selectedCategory, setSelectedCategory] = useState(categories[0] || '');
    const [tagInput, setTagInput] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedImages, setUploadedImages] = useState(new Map()); // Track uploaded images {key: {url, filename, timestamp}}
    const [status, setStatus] = useState('published'); // 'draft' | 'published'
    const [isLoadingArticle, setIsLoadingArticle] = useState(false);
    const [existingCoverKey, setExistingCoverKey] = useState('');
    const textareaRef = useRef(null);
    const titleTextareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const contentImageInputRef = useRef(null);
    const isInitialMount = useRef(true);

    const API_URL = import.meta.env.PUBLIC_API_URL || 'https://cloudnive-api.nivekaa.com';

    // Check if form is valid
    const isFormValid = title.trim() !== '' && content.trim() !== '' && selectedCategory !== '';

    // Filter tags based on input
    const filteredTags = tags.filter(tag =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !selectedTags.includes(tag)
    );

    // Auto-slug generation
    useEffect(() => {
        const newSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setSlug(newSlug);
    }, [title]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    }, [content]);

    // Auto-resize title textarea
    useEffect(() => {
        const textarea = titleTextareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    }, [title]);

    // Auto-save to localStorage (skip on initial mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const draftData = {
            title,
            description,
            content,
            selectedTags,
            selectedCategory,
            coverPreview,
            timestamp: Date.now()
        };
        localStorage.setItem('articleDraft', JSON.stringify(draftData));
    }, [title, description, content, selectedTags, selectedCategory, coverPreview]);

    // Restore from API (Edition) or localStorage (Auto-save) on mount
    useEffect(() => {
        const loadArticle = async () => {
            // Check for edit parameter in URL
            const urlParams = new URLSearchParams(window.location.search);
            const slugFromUrl = urlParams.get('edit');

            if (slugFromUrl) {
                setEditSlug(slugFromUrl);
                // EDITION MODE: Fetch specific article from API
                try {
                    setIsLoadingArticle(true);
                    const response = await fetch(`${API_URL}/articles/${slugFromUrl}`);
                    if (response.ok) {
                        const article = await response.json();
                        setTitle(article.title || '');
                        setDescription(article.description || '');
                        setContent(article.contentMarkdown || '');
                        setSelectedTags(article.tags || []);
                        setSelectedCategory(article.category || categories[0]);
                        setCoverPreview(article.cover || '');
                        // Store the existing key to preserve it if not changed
                        if (article.cover) {
                            // Extract key from URL or use as is if it's already a key
                            const keyMatch = article.cover.match(/images\/covers\/[^/?#]+/);
                            setExistingCoverKey(keyMatch ? keyMatch[0] : article.cover);
                        }
                        console.log('Loaded article for edition:', slugFromUrl);
                    } else {
                        console.error('Failed to load article for edition');
                        alert('❌ Impossible de charger l\'article pour modification');
                    }
                } catch (error) {
                    console.error('Error loading article:', error);
                } finally {
                    setIsLoadingArticle(false);
                }
            } else {
                // CREATE MODE: Start empty (as requested: "formulaire vide")
                console.log('Create mode: starting with empty form');
                setEditSlug(null);
            }
        };

        if (!isLoading && user) {
            loadArticle();
        }
    }, [isLoading, user, categories]);

    const handleAddTag = (tag) => {
        if (tag && !selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
            setTagInput('');
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (newTag) {
                handleAddTag(newTag);
            }
        }
    };

    const handleTagToggle = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    // Handle image file selection
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image ne doit pas dépasser 5MB');
            return;
        }

        setCoverImage(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setCoverPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Upload image to backend
    const uploadImage = async (file) => {
        setIsUploading(true);
        try {
            // Convert to base64
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    // Remove data:image/xxx;base64, prefix
                    const base64String = reader.result.split(',')[1];
                    resolve(base64String);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const response = await fetch(`${API_URL}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: file.name,
                    content: base64,
                    contentType: file.type
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'upload');
            }

            const data = await response.json();
            return { key: data.key, url: data.url }; // Returns: images/covers/timestamp-filename.jpg
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    // Remove image
    const handleRemoveImage = () => {
        setCoverImage(null);
        setCoverPreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Clear draft from localStorage
    const clearDraft = () => {
        if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer le brouillon ? Cette action est irréversible.')) {
            localStorage.removeItem('articleDraft');
            // Reset form
            setTitle('');
            setDescription('');
            setContent('# Mon Article\n\nÉcrivez votre contenu ici...');
            setSelectedTags([]);
            setSelectedCategory(categories[0] || '');
            setCoverImage(null);
            setCoverPreview('');
            alert('🗑️ Brouillon supprimé');
        }
    };

    const insertMarkdown = (prefix, suffix = '', isBlock = false) => {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        let newText;
        if (isBlock) {
            // For block elements, add newlines before and after
            const beforeCursor = content.substring(0, start);
            const afterCursor = content.substring(end);
            const needsNewlineBefore = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
            const needsNewlineAfter = afterCursor.length > 0 && !afterCursor.startsWith('\n');

            newText = beforeCursor +
                (needsNewlineBefore ? '\n' : '') +
                prefix + selectedText + suffix +
                (needsNewlineAfter ? '\n' : '') +
                afterCursor;
        } else {
            newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
        }

        setContent(newText);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + prefix.length + (isBlock && !content.substring(0, start).endsWith('\n') ? 1 : 0);
            textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
        }, 0);
    };

    // Handle content image upload
    const handleContentImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image ne doit pas dépasser 5MB');
            return;
        }

        setIsUploading(true);
        try {
            const { key, url } = await uploadImage(file);
            const imageUrl = `${url}`;

            // Track the uploaded image
            setUploadedImages(prev => new Map(prev).set(key, {
                url: imageUrl,
                filename: file.name,
                timestamp: Date.now()
            }));

            // Insert markdown at cursor position
            const textarea = textareaRef.current;
            const start = textarea.selectionStart;
            const altText = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
            const markdownImage = `![${altText}](${imageUrl})`;

            const newContent = content.substring(0, start) + markdownImage + content.substring(start);
            setContent(newContent);

            // Reset file input
            if (contentImageInputRef.current) {
                contentImageInputRef.current.value = '';
            }

            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + markdownImage.length, start + markdownImage.length);
            }, 0);

        } catch (error) {
            console.error('Upload error:', error);
            alert('❌ Erreur lors de l\'upload de l\'image');
        } finally {
            setIsUploading(false);
        }
    };

    // Extract image URLs from markdown content
    const extractImageUrls = (markdownContent) => {
        const regex = /!\[.*?\]\((.*?)\)/g;
        const urls = [];
        let match;
        while ((match = regex.exec(markdownContent)) !== null) {
            urls.push(match[1]);
        }
        return urls;
    };

    // Clean up unused images from S3
    const cleanupUnusedImages = async (currentContent) => {
        const usedImageUrls = extractImageUrls(currentContent);
        const imagesToDelete = [];

        // Check which uploaded images are not in the content
        uploadedImages.forEach((imageData, imageKey) => {
            if (!usedImageUrls.includes(imageData.url)) {
                imagesToDelete.push(imageKey);
            }
        });

        // Delete unused images from S3
        for (const imageKey of imagesToDelete) {
            try {
                await fetch(`${API_URL}/images/${imageKey}`, {
                    method: 'DELETE'
                });
                console.log('Deleted unused image:', imageKey);
            } catch (error) {
                console.error('Error deleting image:', imageKey, error);
            }
        }

        // Update uploadedImages Map
        const newMap = new Map(uploadedImages);
        imagesToDelete.forEach(key => newMap.delete(key));
        setUploadedImages(newMap);
    };

    const handleSubmit = async (e, submitStatus = 'published') => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);
        setStatus(submitStatus);

        try {
            // Clean up unused images first
            await cleanupUnusedImages(content);
            // Upload cover image if present
            let finalCoverKey = existingCoverKey;
            if (coverImage) {
                const { key } = await uploadImage(coverImage);
                finalCoverKey = key;
            }

            // Create article
            const articleData = {
                title,
                description,
                content,
                category: selectedCategory,
                tags: selectedTags,
                cover: finalCoverKey,
                isDrafted: submitStatus === 'draft',
                authorEmail: user?.email || '',
                authorName: author?.name || '',
                author: {
                    name: author?.name || '',
                    avatar: author?.avatar || '',
                    role: author?.jobPositions?.join(', ') || author?.role || '',
                    bio: author?.bio || '',
                    medias: author?.medias || []
                }
            };

            const url = editSlug ? `${API_URL}/articles/${editSlug}` : `${API_URL}/articles`;
            const method = editSlug ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(articleData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de l\'article');
            }

            const result = await response.json();
            console.log('Article créé:', result);

            const statusMessage = submitStatus === 'draft' ? 'Brouillon enregistré' : 'Article publié';
            alert(`✅ ${statusMessage} avec succès !\nSlug: ${result.slug}`);

            // NEW: Clear local storage upon successful server save
            localStorage.removeItem('articleDraft');

            if (onSaveSuccess) {
                onSaveSuccess(result);
                return;
            }

            // Reset form
            setTitle('');
            setDescription('');
            setContent('# Mon Article\n\nÉcrivez votre contenu ici...');
            setSelectedTags([]);
            setCoverImage(null);
            setCoverPreview('');
            setUploadedImages(new Map());
            setStatus('published');

        } catch (error) {
            console.error('Error:', error);
            alert('❌ Erreur lors de la création de l\'article: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {isLoadingArticle && (
                <div className="fixed inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest text-xs">Chargement de l'article...</p>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Action Buttons - Top */}
                <div className="flex justify-end gap-3">
                    {/* Clear Draft Button */}
                    <button
                        type="button"
                        onClick={clearDraft}
                        className="px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 hover:shadow-lg"
                        title="Supprimer le brouillon"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {/* Draft Button */}
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'draft')}
                        disabled={!isFormValid || isSubmitting}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${isFormValid && !isSubmitting
                            ? 'bg-gray-500 dark:bg-gray-600 text-white hover:bg-gray-600 dark:hover:bg-gray-700 hover:shadow-lg'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting && status === 'draft' ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sauvegarde...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                                </svg>
                                Brouillon
                            </>
                        )}
                    </button>
                    {/* Publish Button */}
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'published')}
                        disabled={!isFormValid || isSubmitting}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${isFormValid && !isSubmitting
                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-lg'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting && status === 'published' ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Publication...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                                    <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                                </svg>
                                Publier
                            </>
                        )}
                    </button>
                </div>

                {/* Cover Image Upload - NOW AT TOP */}
                <div>
                    <label htmlFor="cover" className="block text-xs font-medium text-gray-500 dark:text-gray-500 mb-3">
                        IMAGE DE COUVERTURE
                    </label>

                    {!coverPreview ? (
                        <div className="relative">
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="cover"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="cover"
                                className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-200 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 group"
                            >
                                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Cliquez pour choisir</span>
                                    <span className="text-gray-500 dark:text-gray-500"> ou glissez-déposez</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">PNG, JPG, WEBP jusqu'à 5MB</p>
                            </label>
                        </div>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                            <div className="aspect-video w-full overflow-hidden">
                                <img
                                    src={coverPreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors backdrop-blur-sm bg-opacity-90"
                                    title="Supprimer l'image"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
                                        <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload en cours...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Title Input */}
                <div>
                    <textarea
                        ref={titleTextareaRef}
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        rows={1}
                        className="w-full text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-700 resize-none overflow-hidden"
                        placeholder="Titre de l'article..."
                        style={{ minHeight: '3rem' }}
                    />
                </div>

                {/* Category and Slug row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        <label htmlFor="category" className="block text-xs font-medium text-gray-500 dark:text-gray-500 mb-2">CATÉGORIE</label>
                        <select
                            id="category"
                            name="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-xs font-medium text-gray-500 dark:text-gray-500 mb-2">SLUG (AUTO-GÉNÉRÉ)</label>
                        <input
                            type="text"
                            id="slug"
                            value={slug}
                            readOnly
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full text-xl text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-700"
                        placeholder="Description courte et accrocheuse..."
                    />
                </div>

                {/* Tags - Dynamic with autocomplete */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-500 mb-3">TAGS</label>

                    {/* Selected tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {selectedTags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md text-xs font-medium"
                            >
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                                    className="hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-full p-0.5"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Tag input with autocomplete */}
                    <div className="relative">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder="Tapez pour rechercher ou ajouter un tag (Entrée pour ajouter)..."
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />

                        {/* Autocomplete dropdown */}
                        {tagInput && filteredTags.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredTags.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleAddTag(tag)}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-900 dark:text-gray-100 transition-colors"
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Hint for new tag */}
                        {tagInput && !tags.includes(tagInput.toLowerCase()) && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                Appuyez sur <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono">Entrée</kbd> pour ajouter "{tagInput}" comme nouveau tag
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Editor */}
                <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-500 mb-3">CONTENU</label>

                    {/* Toolbar and Edit/Preview buttons on same line */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                        {/* Toolbar buttons */}
                        <div className="flex flex-wrap gap-1">
                            <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="Gras">
                                <strong className="text-sm">B</strong>
                            </button>
                            <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors italic" title="Italique">
                                <span className="text-sm">I</span>
                            </button>
                            <button type="button" onClick={() => insertMarkdown('`', '`')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors font-mono text-xs" title="Code">
                                {'</>'}
                            </button>
                            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                            <button type="button" onClick={() => insertMarkdown('## ', '', true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors font-bold text-sm" title="Titre">
                                H2
                            </button>
                            <button type="button" onClick={() => insertMarkdown('### ', '', true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors font-semibold text-xs" title="Sous-titre">
                                H3
                            </button>
                            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                            <button type="button" onClick={() => insertMarkdown('- ', '', true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-sm" title="Liste à puces">
                                •
                            </button>
                            <button type="button" onClick={() => insertMarkdown('1. ', '', true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-sm font-mono" title="Liste numérotée">
                                1.
                            </button>
                            <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-sm" title="Lien">
                                🔗
                            </button>
                            <button
                                type="button"
                                onClick={() => contentImageInputRef.current?.click()}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Insérer une image"
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <svg className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                            <input
                                ref={contentImageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleContentImageUpload}
                                className="hidden"
                            />
                            <button type="button" onClick={() => insertMarkdown('```shell\n', '\n```', true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors font-mono text-xs" title="Bloc de code">
                                {'{ }'}
                            </button>
                        </div>

                        {/* Edit/Preview toggle */}
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setActiveTab('write')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'write'
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Éditer
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('preview')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'preview'
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Aperçu
                            </button>
                        </div>
                    </div>

                    {/* Content area */}
                    {activeTab === 'write' ? (
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-0 text-gray-900 dark:text-gray-100 bg-transparent border-none resize-none focus:outline-none font-mono text-sm leading-relaxed"
                            placeholder="# Entrez le contenu de votre article..."
                            style={{ minHeight: '500px' }}
                        />
                    ) : (
                        <MarkdownRenderer
                            content={content}
                            className="min-h-[500px]"
                        />
                    )}
                </div>

                {/* Bottom Publish Button */}
                <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'published')}
                        disabled={!isFormValid || isSubmitting}
                        className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 ${isFormValid && !isSubmitting
                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-lg'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting && status === 'published' ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Publication...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                                    <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                                </svg>
                                Publier l'article
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="max-w-4xl mx-auto pt-12 border-t border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Aperçu de votre carte auteur</h2>
                {author && <AuthorCard author={author} />}
            </div>
        </div>
    );
}
