import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import KindeAuthProvider from '../KindeAuthProvider';
import { kindeApi } from '../../lib/kinde-api';
import { mapKindeUserToAuthor } from '../../utils/user-mapper';

function AdminSidebarContent() {
    const { logout, user, isAuthenticated, isLoading: authLoading } = useKindeAuth();
    const [author, setAuthor] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const fullData = await kindeApi.getUserDetails(user.id);
                setAuthor(mapKindeUserToAuthor(fullData));
            } catch (error) {
                console.warn('Sidebar profile fetch failed:', error);
                setAuthor(mapKindeUserToAuthor(user));
            } finally {
                setIsLoading(false);
            }
        };

        if (!authLoading && user) {
            fetchProfile();
        } else if (!authLoading && !user) {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    const [isDark, setIsDark] = React.useState(true);

    React.useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDark(false);
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

    const menuItems = [
        { label: 'Tableau de bord', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', href: '/admin/dash' },
        { label: 'Créer un article', icon: 'M12 4v16m8-8H4', href: '/admin/create' },
        { label: 'Espace Notes', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', href: '/admin/notes-v2' },
        { label: 'Mon Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', href: '/admin/profile' },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <a href="/admin/dash" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
                    <span className="font-bold text-gray-900 dark:text-gray-100">CloudNive Admin</span>
                </a>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                        </svg>
                        {item.label}
                    </a>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                {!isLoading && isAuthenticated && (
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <img
                            src={author?.avatar || user?.picture}
                            alt=""
                            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {`${author?.first_name || user?.given_name || ''} ${author?.last_name || user?.family_name || ''}`.trim()}
                            </p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">
                                {author?.role || 'Editeur'}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate uppercase tracking-wider font-semibold">Editeur</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                        onClick={toggleDark}
                        className="flex flex-col items-center justify-center gap-1 p-2 text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 transition-all"
                    >
                        <span className="text-lg">{isDark ? '☀' : '🌙'}</span>
                        {isDark ? 'CLAIR' : 'SOMBRE'}
                    </button>
                    <a
                        href={typeof window !== 'undefined' ? window.location.origin : '/'}
                        className="flex flex-col items-center justify-center gap-1 p-2 text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        BLOG
                    </a>
                </div>

                <button
                    onClick={() => logout({ allSessions: true, redirectUrl: window.location.origin + "/kinde-logout" })}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}

export default function AdminSidebar() {
    return (
        <KindeAuthProvider>
            <AdminSidebarContent />
        </KindeAuthProvider>
    );
}
