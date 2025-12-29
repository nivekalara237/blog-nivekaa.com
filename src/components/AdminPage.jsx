import React from 'react';
import ArticleEditor from './admin/ArticleEditor.jsx';
import KindeAuthProvider from './KindeAuthProvider';
import AdminGuard from './admin/AdminGuard';

export default function AdminPage({ categories, tags }) {
    return (
        <KindeAuthProvider>
            <AdminGuard>
                <ArticleEditor
                    categories={categories}
                    tags={tags}
                    onSaveSuccess={() => (window.location.href = '/admin/dash')}
                />
            </AdminGuard>
        </KindeAuthProvider>
    );
}
