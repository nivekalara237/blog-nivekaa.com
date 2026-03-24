import React, {useEffect, useMemo, useRef} from 'react';
import {KindeProvider, useKindeAuth} from "@kinde-oss/kinde-auth-react";

const CallbackHandler = () => {
    const { isAuthenticated, isLoading } = useKindeAuth();

    const isLoginCallback = useRef(
        typeof window !== "undefined" && new URLSearchParams(window.location.search).has("code")
    );

    useEffect(() => {
        if (isLoading) return;

        if (isLoginCallback) {
            if (isAuthenticated) {
                window.location.href = "/admin/dash";
            }
        } else {
            window.location.href = "/";
        }
    }, [isAuthenticated, isLoading]);

    return <p>Authentification...</p>;
}

const LogoutHandler = () => {
    useEffect(() => {
        window.location.href = "/";
    }, []);
    return <p>Déconnexion...</p>;
}

export default function KindeAuthProvider({ children } = {}) {

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const isAdminRoutes = currentPath.includes("/admin");
  const isCallbackRoutes = currentPath.includes("/kinde-callback");
  const isLogoutRoute = currentPath.includes("/kinde-logout");


  if (!isAdminRoutes && !isCallbackRoutes) {
    return <>
      {children}
    </>;
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return (
    <KindeProvider
      clientId={import.meta.env.PUBLIC_KINDE_CLIENT_ID}
      domain={import.meta.env.PUBLIC_KINDE_DOMAIN}
      logoutUri={`${origin}/kinde-logout`}
      redirectUri={`${origin}/kinde-callback`}
      callbacks={{
        onSuccess: (user, state, context) => {},
        onError: (user, state, context) => {},
        onEvent: (user, state, context) => {}
      }}
    >
        {isCallbackRoutes && <CallbackHandler />}
        {isLogoutRoute && <LogoutHandler />}
        {!isCallbackRoutes && !isLogoutRoute && children}
    </KindeProvider>
  );
}
