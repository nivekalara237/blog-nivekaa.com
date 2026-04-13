import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import KindeAuthProvider from '../KindeAuthProvider';
import AdminGuard from './AdminGuard';
import NotesApp from '../notes-v2/NotesApp';

function NotesV2WithUser({ lang }) {
    const { user } = useKindeAuth();
    return <NotesApp lang={lang} isAdmin={true} user={user} />;
}

export default function AuthenticatedNotesAppV2({ lang }) {
    return (
        <KindeAuthProvider>
            <AdminGuard>
                <NotesV2WithUser lang={lang} />
            </AdminGuard>
        </KindeAuthProvider>
    );
}
