// useAuth.ts — v1.1 — Auto anonymous sign-in; no login gate on app load
import { useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';

export function useAuth() {
  const { setCurrentUser, setAuthReady } = useApp();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) {
        setCurrentUser(user);
        setAuthReady(true);
      } else {
        // No user at all — sign in anonymously (silent, zero UI)
        signInAnonymously(auth).catch(() => {
          // Anonymous sign-in failed (offline?) — still unblock the app
          setAuthReady(true);
        });
      }
    });
    return unsub;
  }, [setCurrentUser, setAuthReady]);
}
