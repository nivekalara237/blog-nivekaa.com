import React, { useState, useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://cloudnive-api.nivekaa.com';

export default function ContactForm() {
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
            setFeedback('Veuillez valider le captcha.');
            return;
        }

        if (!formData.name || !formData.email || !formData.message) {
            setStatus('error');
            setFeedback('Tous les champs sont obligatoires.');
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
                setFeedback(data.message || 'Message envoyé avec succès !');
                setFormData({ name: '', email: '', message: '', website: '', 'cf-turnstile-response': '' });

                // Reset Turnstile if available
                if (window.turnstile && turnstileWidgetIdRef.current !== null) {
                    window.turnstile.reset(turnstileWidgetIdRef.current);
                }
            } else {
                setStatus('error');
                setFeedback(data.error || 'Une erreur est survenue.');
            }
        } catch (error) {
            setStatus('error');
            setFeedback('Erreur de connexion. Veuillez réessayer plus tard.');
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
                    Nom
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[var(--bg-deep)] text-[var(--text-primary)] border-2 border-[var(--bg-border)] focus:border-[var(--green-light)] focus:ring-0 outline-none transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    placeholder="Votre nom"
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-bold mb-2 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--green-light)' }}>
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[var(--bg-deep)] text-[var(--text-primary)] border-2 border-[var(--bg-border)] focus:border-[var(--green-light)] focus:ring-0 outline-none transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    placeholder="votre@email.com"
                />
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-bold mb-2 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--green-light)' }}>
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[var(--bg-deep)] text-[var(--text-primary)] border-2 border-[var(--bg-border)] focus:border-[var(--green-light)] focus:ring-0 outline-none transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif", resize: 'vertical' }}
                    placeholder="Votre message..."
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
                className="w-full py-4 font-black uppercase tracking-widest transition-all duration-200"
                style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: 'var(--yellow-dark)',
                    color: '#0A0F0A',
                    border: '2px solid #FFAA00',
                    opacity: status === 'loading' ? 0.7 : 1,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                }}
            >
                {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>

            {feedback && (
                <div
                    className={`mt-4 p-4 text-center font-bold text-sm`}
                    style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: status === 'success' ? 'var(--green-light)' : '#F87171',
                        border: `1px solid ${status === 'success' ? 'var(--green-dark)' : '#B91C1C'}`,
                        background: 'rgba(0,0,0,0.2)'
                    }}
                >
                    {status === 'success' ? '✓ ' : '✗ '} {feedback}
                </div>
            )}
        </form>
    );
}
