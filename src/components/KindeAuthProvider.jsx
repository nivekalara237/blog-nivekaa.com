import React from 'react';
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

export default function KindeAuthProvider({ children }) {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  if (!currentPath.includes("/admin/")) {
    return <>
      {children}
    </>;
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectUri = import.meta.env.PUBLIC_KINDE_REDIRECT_URI || `${origin}/admin/dash`;
  return (
    <KindeProvider
      clientId={import.meta.env.PUBLIC_KINDE_CLIENT_ID}
      domain={import.meta.env.PUBLIC_KINDE_DOMAIN}
      logoutUri={origin}
      redirectUri={redirectUri}
    >
      {children}
    </KindeProvider>
  );
}
