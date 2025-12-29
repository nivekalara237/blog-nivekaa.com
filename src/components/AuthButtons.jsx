import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import KindeAuthProvider from './KindeAuthProvider';

function AuthButtonsContent() {
    const { login, logout, isAuthenticated, user, isLoading } = useKindeAuth();

    if (isLoading) return <div className="w-10 h-10 animate-pulse bg-gray-200 rounded-full" />;

    return (
        <div className="flex items-center gap-3">
            {isAuthenticated ? (
                <>
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                            {user?.given_name}
                        </span>
                        <a href="/admin/profile" className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline">
                            Mon Profil
                        </a>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                        title="Se déconnecter"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </>
            ) : (
                <button
                    onClick={() => login({
                        authUrlParams: {
                            connection_id: "" // Forcing use of default settings
                        }
                    })}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all text-sm font-medium shadow-md hover:shadow-lg active:scale-95"
                >
                    Connexion
                </button>
            )}
        </div>
    );
}

export default function AuthButtons() {
    return (
        <KindeAuthProvider>
            <AuthButtonsContent />
        </KindeAuthProvider>
    );
}
