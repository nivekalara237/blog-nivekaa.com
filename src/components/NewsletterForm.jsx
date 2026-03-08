import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://cloudnive-api.nivekaa.com';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [honeypot, setHoneypot] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Honeypot check (should be empty)
        if (honeypot) {
            console.warn('Bot detected');
            return;
        }

        if (!email || !email.includes('@')) {
            setStatus('error');
            setMessage('Veuillez entrer une adresse email valide.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, honeypot }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Inscription réussie ! Vérifiez votre email.');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Une erreur est survenue.');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            setStatus('error');
            setMessage('Erreur de connexion. Réessayez plus tard.');
        }
    };

    return (
        <div className="max-w-md mx-auto mb-16 relative z-10">
            <form onSubmit={handleSubmit}>
                <div
                    className="relative flex items-center w-full rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 p-1.5 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
                >
                    {/* Email Icon */}
                    <div className="grid place-items-center h-full w-12 text-gray-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>

                    {/* Email Input */}
                    <input
                        className="peer h-full w-full outline-none text-sm text-gray-700 dark:text-gray-200 bg-transparent pr-2 placeholder-gray-400"
                        type="email"
                        id="newsletter-email"
                        name="email"
                        placeholder="Entrez votre adresse email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === 'loading'}
                        required
                    />

                    {/* Honeypot - Hidden from users, visible to bots */}
                    <input
                        type="text"
                        name="website"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="flex items-center justify-center px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                        ) : (
                            'Rejoindre'
                        )}
                    </button>
                </div>
            </form>

            {/* Status Message */}
            {message && (
                <p className={`mt-3 text-sm text-center ${status === 'success'
                        ? 'text-green-600 dark:text-green-400'
                        : status === 'error'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-400'
                    }`}>
                    {message}
                </p>
            )}

            {/* Default helper text */}
            {!message && (
                <p className="mt-3 text-xs text-center text-gray-400 dark:text-gray-500">
                    Rejoignez 10,000+ développeurs. Désinscription à tout moment.
                </p>
            )}
        </div>
    );
}
