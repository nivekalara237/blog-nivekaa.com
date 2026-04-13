import React from 'react';
import ArticleEditor from './admin/ArticleEditor.jsx';
import KindeAuthProvider from './KindeAuthProvider';
import AdminGuard from './admin/AdminGuard';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

// Wrapper to pass auth props without making ArticleEditor strictly dependent on the hook
function AuthenticatedArticleEditor(props) {
    const { user, isLoading } = useKindeAuth();
    return <ArticleEditor {...props} user={user} isLoading={isLoading} />;
}

export default function AdminPage({ categories, tags }) {
    return (
        <KindeAuthProvider>
            <AdminGuard>
                <AuthenticatedArticleEditor
                    categories={categories}
                    tags={tags}
                    onSaveSuccess={() => (window.location.href = '/admin/dash')}
                />
            </AdminGuard>
        </KindeAuthProvider>
    );
}
