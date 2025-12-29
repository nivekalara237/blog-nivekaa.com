import React from 'react';
import KindeAuthProvider from '../KindeAuthProvider';
import AdminGuard from './AdminGuard';
import AdminSidebar from './AdminSidebar';

export default function AdminShell({ children }) {
    return (
        <KindeAuthProvider>
            <AdminGuard>
                <div className="flex min-h-screen w-full">
                    <AdminSidebar />
                    <main className="flex-grow p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </AdminGuard>
        </KindeAuthProvider>
    );
}
