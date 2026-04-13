import React from 'react';
import KindeAuthProvider from '../KindeAuthProvider';
import AdminGuard from './AdminGuard';
import NotesApp from '../notes/NotesApp';

export default function AuthenticatedNotesApp({ lang }) {
    return (
        <KindeAuthProvider>
            <AdminGuard>
                <div className="h-full w-full -m-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative">
                    <NotesApp lang={lang} isAdmin={true} />
                </div>
            </AdminGuard>
        </KindeAuthProvider>
    );
}
