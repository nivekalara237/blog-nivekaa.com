import React from 'react';
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

export default function KindeAuthProvider({ children }) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return (
        <KindeProvider
            clientId={import.meta.env.PUBLIC_KINDE_CLIENT_ID}
            domain={import.meta.env.PUBLIC_KINDE_DOMAIN}
            logoutUri={origin}
            redirectUri={origin}
        >
            {children}
        </KindeProvider>
    );
}
