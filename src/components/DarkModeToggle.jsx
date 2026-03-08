import React, { useEffect, useState } from 'react';

export default function DarkModeToggle() {
    // Default to dark
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDark = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <button
            onClick={toggleDark}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-100"
            style={{
                fontFamily: "'Inter', sans-serif",
                border: '2px solid var(--bg-border)',
                color: 'var(--text-secondary)',
                background: 'transparent',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.4)',
                letterSpacing: '1.5px',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--yellow-dark)';
                e.currentTarget.style.color = 'var(--yellow-light)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--bg-border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            aria-label="Toggle dark mode"
        >
            <span style={{ fontSize: '14px' }}>{isDark ? '☀' : '🌙'}</span>
            <span>{isDark ? 'LIGHT' : 'DARK'}</span>
        </button>
    );
}
