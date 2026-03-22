import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://cloudnive-api.nivekaa.com';

export default function NewsletterForm({ lang = 'en' }) {
    const [email, setEmail] = useState('');
    const [honeypot, setHoneypot] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (honeypot) return; // bot trap
        if (!email || !email.includes('@')) {
            setStatus('error');
            setMessage(lang === 'fr' ? 'Veuillez entrer une adresse email valide.' : 'Please enter a valid email address.');
            return;
        }
        setStatus('loading');
        setMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, honeypot }),
            });
            const data = await response.json();
            if (response.ok) {
                setStatus('success');
                setMessage(data.message || (lang === 'fr' ? 'Inscription réussie ! Vérifiez votre email.' : 'Subscription successful! Check your email.'));
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || (lang === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.'));
            }
        } catch {
            setStatus('error');
            setMessage(lang === 'fr' ? 'Erreur de connexion. Réessayez plus tard.' : 'Connection error. Try again later.');
        }
    };

    return (
        <div id="newsletter" className="w-full">
            {/* Notice badge */}
            <div
                className="inline-flex items-center gap-2 mb-5"
                style={{
                    background: 'rgba(35,114,39,0.12)',
                    border: '2px solid var(--green-dark)',
                    borderLeft: '6px solid var(--green-dark)',
                    padding: '8px 16px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                }}
            >
                <span style={{ color: 'var(--green-light)' }}>📡</span>
                {lang === 'fr' ? 'NEW SIGNAL DETECTED — Rejoins la communauté' : 'NEW SIGNAL DETECTED — Join the community'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* Left: copy */}
                <div>
                    <h2
                        className="m-0 mb-3 leading-tight"
                        style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 900,
                            fontSize: 'clamp(20px, 3vw, 28px)',
                            color: 'var(--text-primary)',
                        }}
                    >
                        {lang === 'fr' ? 'Garde ton ' : 'Keep your '}
                        <span style={{ color: 'var(--yellow-dark)' }}>{lang === 'fr' ? 'niveau MAX' : 'MAX level'}</span>
                        <br />{lang === 'fr' ? 'sur le Cloud & Dev' : 'on Cloud & Dev'}
                    </h2>
                    <p className="m-0 text-sm"
                        style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif", lineHeight: 1.7, fontSize: '14px' }}
                    >
                        {lang === 'fr' 
                            ? "Reçois les nouveaux articles, tips Terraform, guides AWS et retours d'expérience directement dans ta boite mail. Pas de spam. Juste du contenu technique de qualité."
                            : "Get new articles, Terraform tips, AWS guides and experience feedback right in your inbox. No spam. Just high quality technical content."}
                    </p>
                </div>

                {/* Right: form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    {/* Hidden honeypot */}
                    <input
                        type="text"
                        name="website"
                        value={honeypot}
                        onChange={e => setHoneypot(e.target.value)}
                        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                    />

                    <input
                        type="email"
                        id="newsletter-email"
                        name="email"
                        placeholder={lang === 'fr' ? "// ton@email.com" : "// your@email.com"}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={status === 'loading'}
                        required
                        className="w-full outline-none"
                        style={{
                            background: 'var(--bg-deep)',
                            border: '3px solid var(--bg-border)',
                            color: 'var(--text-primary)',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '13px',
                            padding: '12px 16px',
                            boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.25)',
                            transition: 'border-color 0.1s',
                        }}
                        onFocus={e => { e.target.style.borderColor = 'var(--green-light)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--bg-border)'; }}
                    />

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="btn btn--gold w-full justify-center"
                        style={{ fontSize: '13px', opacity: status === 'loading' ? 0.6 : 1 }}
                    >
                        {status === 'loading' ? (
                            <span>⟳ {lang === 'fr' ? 'Envoi...' : 'Sending...'}</span>
                        ) : (
                            <span>▶ SUBSCRIBE — {lang === 'fr' ? 'Rejoindre la guilde' : 'Join the guild'}</span>
                        )}
                    </button>

                    {/* Status message */}
                    {message && (
                        <p
                            className="text-center text-xs m-0"
                            style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                color: status === 'success'
                                    ? 'var(--green-light)'
                                    : status === 'error'
                                        ? '#F87171'
                                        : 'var(--text-secondary)',
                            }}
                        >
                            {status === 'success' ? '✓ ' : '✗ '}{message}
                        </p>
                    )}

                    {!message && (
                        <p
                            className="text-center m-0"
                            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-dim)' }}
                        >
                            // {lang === 'fr' ? 'Désabonnement en 1 clic. Respect garanti.' : '1-click unsubscribe. Respect guaranteed.'}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
