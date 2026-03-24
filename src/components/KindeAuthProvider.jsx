import React, {useEffect, useMemo, useRef} from 'react';
import {KindeProvider, useKindeAuth} from "@kinde-oss/kinde-auth-react";

const CallbackHandler = () => {
    const { isAuthenticated, isLoading } = useKindeAuth();

    const isLoginCallback = useRef(
        typeof window !== 'undefined' && new URLSearchParams(window.location.search).has("code")
    );

    useEffect(() => {
        if (isLoading) return;

        if (isLoginCallback.current) {
            if (isAuthenticated) {
                window.location.href = "/admin/dash";
            }
        } else {
            window.location.href = "/";
        }
    }, [isAuthenticated, isLoading]);

    return <p>Authentification...</p>;
}
/*
const CallbackHandler = () => {
    const { isAuthenticated, isLoading } = useKindeAuth();

    useEffect(() => {
        if (isLoading) return ;
        const params = new URLSearchParams(window.location.search);
        const isLoginCallback = params.has("code");
        if (!isLoading && isAuthenticated && isLoginCallback) {
            window.location.href = "/admin/dash";
        } else if (!isLoginCallback) {
            window.location.href = "/";
        }
    }, [isAuthenticated, isLoading]);

    return <p>Authenticating...</p>;
}*/

const LogoutHandler = () => {
    useEffect(() => {
        window.location.href = "/";
    }, []);
    return <p>Déconnexion...</p>;
}

export default function KindeAuthProvider({ children } = {}) {

  const config = useMemo(()=>({timeoutMinutes: 10}));

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
  // const redirectUri = import.meta.env.PUBLIC_KINDE_REDIRECT_URI || `${origin}/admin/dash`;
  return (
    <KindeProvider
      clientId={import.meta.env.PUBLIC_KINDE_CLIENT_ID}
      domain={import.meta.env.PUBLIC_KINDE_DOMAIN}
      logoutUri={`${origin}/kinde-logout`}
      redirectUri={`${origin}/kinde-callback`}
      activityTimeout={config}
      callbacks={{
        onSuccess: (user, state, context) => {
          // console.log("onSuccess", user, state, context);
          if (user) {
            console.log("User is logged in", state);
          }
        },
        onError: (user, state, context) => {
          // console.log("onError", user, state, context)
        },
        onEvent: (user, state, context) => {
          // console.log("onEvent", user, state, context)
        }
      }}
    >
      {/*isCallbackRoutes ? <CallbackHandler /> : children*/}
        {isCallbackRoutes && <CallbackHandler />}
        {isLogoutRoute && <LogoutHandler />}
        {!isCallbackRoutes && !isLogoutRoute && children}
    </KindeProvider>
  );
}
