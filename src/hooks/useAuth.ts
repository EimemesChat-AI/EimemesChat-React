import { useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';

export function useAuth() {
  const { setCurrentUser, setAuthReady } = useApp();

  useEffect(() => {
    // Catch Google redirect result when returning from auth
    getRedirectResult(auth).catch(() => {});

    const unsub = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return unsub;
  }, [setCurrentUser, setAuthReady]);
}
