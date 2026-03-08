import React from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export default function AdminGuard({ children }) {
    const { isAuthenticated, isLoading, login } = useKindeAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-300"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to Kinde login if not authenticated
        login();
        return null;
    }

    return <>{children}</>;
}
