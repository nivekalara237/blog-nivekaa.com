import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import KindeAuthProvider from '../KindeAuthProvider';
import AdminGuard from './AdminGuard';
import { mapKindeUserToAuthor } from '../../utils/user-mapper';
import AuthorCard from '../AuthorCard';
import { kindeApi } from '../../lib/kinde-api';

const AVAILABLE_MEDIAS = [
    { id: 'x', name: 'X (Twitter)', icon: '𝕏' },
    { id: 'github', name: 'GitHub', icon: 'GitHub' },
    { id: 'gitlab', name: 'GitLab', icon: 'GitLab' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'LinkedIn' },
    { id: 'website', name: 'Site Web', icon: '🌐' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'facebook', name: 'Facebook', icon: 'FB' },
];

function UserProfileContent() {
    const { user, isLoading } = useKindeAuth();
    const fileInputRef = useRef(null);

    // Initial data from server to compare for dirty check
    const [initialData, setInitialData] = useState(null);

    // Form states
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [bio, setBio] = useState('');
    const [hideName, setHideName] = useState(false);
    const [jobTitles, setJobTitles] = useState([]); // List of strings
    const [medias, setMedias] = useState([]); // [{type: 'github', url: '...'}]
    const [customPictureUrl, setCustomPictureUrl] = useState('');

    // Local upload states
    const [newImageFile, setNewImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const API_URL = import.meta.env.PUBLIC_API_URL || 'https://cloudnive-api.nivekaa.com';

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user?.id) return;

            try {
                const fullData = await kindeApi.getUserDetails(user.id);
                const author = mapKindeUserToAuthor(fullData);

                const data = {
                    firstName: author.first_name || '',
                    lastName: author.last_name || '',
                    role: author.role || '',
                    bio: author.bio || '',
                    hideName: author.hideName || false,
                    jobTitles: author.jobPositions || [],
                    medias: author.medias || [],
                    customPictureUrl: author.avatar || ''
                };

                setInitialData(data);

                // Set form states
                setFirstName(data.firstName);
                setLastName(data.lastName);
                setRole(data.role);
                setBio(data.bio);
                setHideName(data.hideName);
                setJobTitles(data.jobTitles);
                setMedias(data.medias);
                setCustomPictureUrl(data.customPictureUrl);
                setImagePreview(data.customPictureUrl);

            } catch (error) {
                console.warn('Backend proxy fetch failed, using session defaults:', error);
                const sessionAuthor = mapKindeUserToAuthor(user);
                setFirstName(sessionAuthor.first_name || '');
                setLastName(sessionAuthor.last_name || '');
                setRole(sessionAuthor.role || 'Writer');
                setJobTitles(sessionAuthor.jobPositions || []);
                setImagePreview(user.picture || '');
            }
        };

        if (!isLoading && user) {
            fetchProfileData();
        }
    }, [user, isLoading]);

    // Dirty check logic
    const isDirty = useMemo(() => {
        if (!initialData) return false;
        return (
            firstName !== initialData.firstName ||
            lastName !== initialData.lastName ||
            role !== initialData.role ||
            bio !== initialData.bio ||
            hideName !== initialData.hideName ||
            JSON.stringify(jobTitles) !== JSON.stringify(initialData.jobTitles) ||
            JSON.stringify(medias) !== JSON.stringify(initialData.medias) ||
            newImageFile !== null
        );
    }, [firstName, lastName, role, bio, hideName, jobTitles, medias, initialData, newImageFile]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide');
            return;
        }

        setNewImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const uploadImage = async (file) => {
        setIsUploading(true);
        try {
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const response = await fetch(`${API_URL}/images`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: `profile-${user.id}-${file.name}`,
                    content: base64,
                    contentType: file.type
                })
            });

            if (!response.ok) throw new Error('Erreur lors de l\'upload');
            const data = await response.json();
            return data.url;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!isDirty || isSaving || isUploading) return;

        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            if (!user?.id) throw new Error("ID utilisateur non trouvé");

            let finalPictureUrl = customPictureUrl;

            // 1. Upload image if new one selected
            if (newImageFile) {
                setMessage({ type: 'info', text: 'Téléversement de la photo...' });
                finalPictureUrl = await uploadImage(newImageFile);
            }

            // 2. Update Kinde profile
            const updatePayload = {
                given_name: firstName,
                family_name: lastName,
                role: role,
                bio: bio,
                hidename: hideName,
                kp_usr_job_title: jobTitles.join(', '),
                medias: JSON.stringify(medias),
                custom_picture_url: finalPictureUrl
            };

            await kindeApi.updateProfile(user.id, updatePayload);

            // Update initial data
            setInitialData({
                firstName, lastName, role, bio, hideName, jobTitles, medias, customPictureUrl: finalPictureUrl
            });
            setNewImageFile(null);
            setCustomPictureUrl(finalPictureUrl);

            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error('Error saving profile:', error);
            setMessage({ type: 'error', text: 'Erreur : ' + error.message });
        } finally {
            setIsSaving(false);
        }
    };

    // Helpers
    const addMedia = () => setMedias([...medias, { type: 'linkedin', url: '' }]);
    const removeMedia = (index) => setMedias(medias.filter((_, i) => i !== index));
    const updateMedia = (index, field, value) => {
        const newMedias = [...medias];
        newMedias[index][field] = value;
        setMedias(newMedias);
    };

    const addJobTitle = () => setJobTitles([...jobTitles, '']);
    const removeJobTitle = (index) => setJobTitles(jobTitles.filter((_, i) => i !== index));
    const updateJobTitle = (index, value) => {
        const newTitles = [...jobTitles];
        newTitles[index] = value;
        setJobTitles(newTitles);
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    const previewAuthor = {
        name: `${firstName} ${lastName}`.trim(),
        first_name: firstName,
        last_name: lastName,
        avatar: imagePreview || user?.picture,
        role: role,
        bio: bio,
        hideName: hideName,
        jobPositions: jobTitles.filter(Boolean),
        medias: medias
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8 pl-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Mon Profil d'Auteur
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Personnalisez votre identité sur le blog.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-8">

                        {/* Section: Identité & Photo */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                                Informations de base
                            </h3>

                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                                {/* Photo Upload */}
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                                        <img
                                            src={imagePreview || user?.picture}
                                            alt="Profil"
                                            className="w-full h-full object-cover"
                                        />
                                        {(isSaving || isUploading) && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white dark:border-gray-800"
                                        title="Changer la photo"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>

                                <div className="flex-1 w-full space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre principal</label>
                                        <input
                                            type="text"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            placeholder="ex: Senior Fullstack Developer"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biographie</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                    placeholder="Décrivez votre parcours..."
                                />
                            </div>
                        </div>

                        {/* Section: Job Titles */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                                    Expertises & Mots-clés
                                </h3>
                                <button
                                    type="button"
                                    onClick={addJobTitle}
                                    className="text-xs px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors font-bold flex items-center gap-1"
                                >
                                    <span>+</span> Ajouter
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {jobTitles.map((title, index) => (
                                    <div key={index} className="flex gap-2 group animate-in zoom-in-95 duration-200">
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => updateJobTitle(index, e.target.value)}
                                            placeholder="ex: React, AWS, Docker..."
                                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeJobTitle(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section: Medias */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-pink-600 rounded-full"></span>
                                    Présence en ligne
                                </h3>
                                <button
                                    type="button"
                                    onClick={addMedia}
                                    className="text-xs px-3 py-1.5 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors font-bold flex items-center gap-1"
                                >
                                    <span>+</span> Ajouter
                                </button>
                            </div>

                            <div className="space-y-3">
                                {medias.map((media, index) => (
                                    <div key={index} className="flex gap-3 group animate-in slide-in-from-left-2 duration-200">
                                        <div className="relative">
                                            <select
                                                value={media.type}
                                                onChange={(e) => updateMedia(index, 'type', e.target.value)}
                                                className="h-full pl-4 pr-10 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-pink-500 outline-none appearance-none font-medium text-sm transition-all"
                                            >
                                                {AVAILABLE_MEDIAS.map(m => (
                                                    <option key={m.id} value={m.id}>{m.icon} {m.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        <input
                                            type="url"
                                            value={media.url}
                                            onChange={(e) => updateMedia(index, 'url', e.target.value)}
                                            placeholder="URL du profil..."
                                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-pink-500 outline-none transition-all text-sm"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeMedia(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <input
                                type="checkbox"
                                id="hideName"
                                checked={hideName}
                                onChange={(e) => setHideName(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                            />
                            <label htmlFor="hideName" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                Masquer mon nom réel sur la carte auteur publique
                            </label>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-xl text-sm font-medium animate-in fade-in duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
                                    message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                        'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                disabled={!isDirty || isSaving || isUploading}
                                className={`group relative px-12 py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-95 flex items-center gap-3 overflow-hidden ${isDirty
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 ring-4 ring-indigo-500/10'
                                        : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    {(isSaving || isUploading) ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {isUploading ? 'Chargement image...' : 'Synchronisation...'}
                                        </>
                                    ) : (
                                        <>
                                            <span>Mettre à jour le profil</span>
                                            <svg className={`w-5 h-5 transition-transform duration-300 ${isDirty ? 'group-hover:translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                    <div className="sticky top-8 space-y-6">
                        <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/50">
                            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Mode Édition
                            </h3>
                            <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
                                Les modifications, y compris votre nouvelle photo, sont reflétées en temps réel sur cet aperçu.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 pl-2">Aperçu public</h2>
                            <AuthorCard author={previewAuthor} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function UserProfile() {
    return (
        <KindeAuthProvider>
            <AdminGuard>
                <UserProfileContent />
            </AdminGuard>
        </KindeAuthProvider>
    );
}
