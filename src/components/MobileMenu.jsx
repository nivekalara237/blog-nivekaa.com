import React, { useState, useEffect } from 'react';

const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Notes', href: '/notes' },
    { label: 'Articles', href: '/articles' },
    { label: 'Catégories', href: '/categories' },
    { label: 'Contact', href: '/contact' },
];

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleToggle = () => {
            console.log('MobileMenu: Toggle event received');
            setIsOpen(prev => !prev);
        };
        window.addEventListener('toggle-mobile-menu', handleToggle);
        return () => window.removeEventListener('toggle-mobile-menu', handleToggle);
    }, []);

    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                    onClick={closeMenu}
                />
            )}

            {/* Slide-in panel */}
            <div
                className={`fixed top-0 right-0 h-full w-72 z-50 transform transition-transform duration-200 md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{
                    background: 'var(--bg-surface)',
                    borderLeft: '3px solid var(--green-dark)',
                    boxShadow: '-6px 0 0 rgba(35,114,39,0.2)',
                }}
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <span
                            className="text-sm font-black uppercase tracking-widest"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--yellow-dark)' }}
                        >
                            MENU
                        </span>
                        <button
                            onClick={closeMenu}
                            className="p-1.5"
                            type='button'
                            style={{
                                border: '2px solid var(--bg-border)',
                                color: 'var(--text-secondary)',
                                background: 'transparent',
                            }}
                            aria-label="Close menu"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '2px', background: 'var(--bg-border)', marginBottom: '24px' }} />

                    {/* Links */}
                    <nav className="flex flex-col gap-2">
                        {navLinks.map(({ label, href }) => (
                            <a
                                key={href}
                                href={href}
                                onClick={closeMenu}
                                className="px-4 py-3 font-bold uppercase tracking-widest text-sm no-underline transition-all duration-100"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: 'var(--text-secondary)',
                                    border: '2px solid var(--bg-border)',
                                    letterSpacing: '1.5px',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = 'var(--yellow-light)';
                                    e.currentTarget.style.borderColor = 'var(--green-dark)';
                                    e.currentTarget.style.background = 'rgba(35,114,39,0.15)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                    e.currentTarget.style.borderColor = 'var(--bg-border)';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                ▸ {label}
                            </a>
                        ))}
                    </nav>

                    {/* Footer tag */}
                    <div className="mt-8" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--text-dim)' }}>
                        // Cloud & Infrastructure
                    </div>
                </div>
            </div>
        </>
    );
}
