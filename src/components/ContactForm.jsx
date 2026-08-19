import React, { useState, useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://cloudnive-api.nivekaa.com';

const translations = {
    en: {
        nameLabel: 'Name',
        namePlaceholder: 'Your name',
        emailLabel: 'Email',
        emailPlaceholder: 'your@email.com',
        messageLabel: 'Message',
        messagePlaceholder: 'Your message...',
        submitLoading: 'Sending...',
        submitIdle: 'Send Message',
        errCaptcha: 'Please validate the captcha.',
        errFields: 'All fields are required.',
        successMsg: 'Message sent successfully!',
        errMsg: 'An error occurred.',
        errConn: 'Connection error. Please try again later.',
    },
    fr: {
        nameLabel: 'Nom',
        namePlaceholder: 'Votre nom',
        emailLabel: 'Email',
        emailPlaceholder: 'votre@email.com',
        messageLabel: 'Message',
        messagePlaceholder: 'Votre message...',
        submitLoading: 'Envoi en cours...',
        submitIdle: 'Envoyer le message',
        errCaptcha: 'Veuillez valider le captcha.',
        errFields: 'Tous les champs sont obligatoires.',
        successMsg: 'Message envoyé avec succès !',
        errMsg: 'Une erreur est survenue.',
        errConn: 'Erreur de connexion. Veuillez réessayer plus tard.',
    }
};

export default function ContactForm({ lang = 'en' }) {
    const t = translations[lang] || translations.en;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        website: '', // honeypot
        'cf-turnstile-response': ''
    });

    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [feedback, setFeedback] = useState('');
    
    const turnstileContainerRef = useRef(null);
    const turnstileWidgetIdRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const checkAndRenderTurnstile = () => {
            if (window.turnstile && turnstileContainerRef.current && !turnstileWidgetIdRef.current) {
                try {
                    turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
                        sitekey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY,
                        callback: (token) => {
                            setFormData(prev => ({ ...prev, 'cf-turnstile-response': token }));
                        }
                    });
                    return true;
                } catch (error) {
                    console.error("Turnstile render error", error);
                    return false;
                }
            }
            return false;
        };

        // Try to render immediately if already loaded
        if (!checkAndRenderTurnstile()) {
            // Otherwise wait for the script to load
            const interval = setInterval(() => {
                if (checkAndRenderTurnstile()) {
                    clearInterval(interval);
                }
            }, 100);

            return () => clearInterval(interval);
        }
    }, [isMounted]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Honeypot check
        if (formData.website) {
            console.warn('Bot detected');
            return;
        }

        if (!formData['cf-turnstile-response']) {
            setStatus('error');
            setFeedback(t.errCaptcha);
            return;
        }

        if (!formData.name || !formData.email || !formData.message) {
            setStatus('error');
            setFeedback(t.errFields);
            return;
        }

        setStatus('loading');
        setFeedback('');

        try {
            const response = await fetch(`${API_BASE_URL}/contact/incoming-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setFeedback(data.message || t.successMsg);
                setFormData({ name: '', email: '', message: '', website: '', 'cf-turnstile-response': '' });

                // Reset Turnstile if available
                if (window.turnstile && turnstileWidgetIdRef.current !== null) {
                    window.turnstile.reset(turnstileWidgetIdRef.current);
                }
            } else {
                setStatus('error');
                setFeedback(data.error || t.errMsg);
            }
        } catch (error) {
            setStatus('error');
            setFeedback(t.errConn);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="pixel-box p-8 md:p-10 space-y-6" style={{ background: 'var(--bg-panel)' }}>
            {/* Honeypot */}
            <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
            />

            <div>
                <label htmlFor="name" className="block text-sm font-bold mb-2 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--green-light)' }}>
                    {t.nameLabel}
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--bg-border)] focus:border-[var(--green-light)] focus:ring-0 outline-none transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    placeholder={t.namePlaceholder}
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-bold mb-2 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--green-light)' }}>
                    {t.emailLabel}
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--bg-border)] focus:border-[var(--green-light)] focus:ring-0 outline-none transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    placeholder={t.emailPlaceholder}
                />
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-bold mb-2 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--green-light)' }}>
                    {t.messageLabel}
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--bg-border)] focus:border-[var(--green-light)] focus:ring-0 outline-none transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif", resize: 'vertical' }}
                    placeholder={t.messagePlaceholder}
                ></textarea>
            </div>

            {/* Turnstile Widget explicit container */}
            {isMounted && (
                <div 
                    ref={turnstileContainerRef}
                    style={{ marginBottom: '1rem' }}
                ></div>
            )}

            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 rounded-md font-semibold transition-all duration-200"
                style={{
                    fontFamily: "'Inter', sans-serif",
                    background: 'var(--green-dark)',
                    color: 'var(--bg-deep)',
                    border: '1px solid var(--green-dark)',
                    opacity: status === 'loading' ? 0.7 : 1,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                }}
            >
                {status === 'loading' ? t.submitLoading : t.submitIdle}
            </button>

            {feedback && (
                <div
                    className="mt-4 px-4 py-3 rounded-md text-center text-sm font-medium"
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        color: status === 'success' ? 'var(--green-dark)' : '#EF4444',
                        border: `1px solid ${status === 'success' ? 'var(--bg-border)' : 'rgba(239,68,68,0.35)'}`,
                        background: status === 'success' ? 'var(--bg-panel)' : 'rgba(239,68,68,0.1)',
                    }}
                >
                    {status === 'success' ? '✓ ' : '✗ '}{feedback}
                </div>
            )}
        </form>
    );
}
