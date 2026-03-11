/**
 * AuthContext
 *
 * Provides authentication state and methods to the entire app.
 * Supports two modes:
 *  1. Firebase Auth (when configured): Google OAuth + Email/Password sign-in/register
 *  2. Simple mode (fallback): Username stored in localStorage, no real auth
 *
 * The context exposes: user, username, isAuthenticated, isLoading,
 * loginWithGoogle, loginWithEmail, registerWithEmail, loginSimple, logout.
 */
'use client';
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

/** Shape of the auth context value provided to consumers */
interface AuthContextValue {
  user: User | null;
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  /** Legacy simple login — sets username in localStorage (fallback when Firebase is not configured) */
  loginSimple: (username: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// localStorage key for persisting the username across page reloads
const STORAGE_KEY = 'codeleap_username';

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [simpleUsername, setSimpleUsername] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });
  const [isLoading, setIsLoading] = useState(() => isFirebaseConfigured());

  const firebaseReady = isFirebaseConfigured();

  // Listen to Firebase auth state
  useEffect(() => {
    if (!firebaseReady || !auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const name = firebaseUser.displayName || firebaseUser.email || 'User';
        setSimpleUsername(name);
        localStorage.setItem(STORAGE_KEY, name);
      } else {
        setSimpleUsername(null);
        localStorage.removeItem(STORAGE_KEY);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseReady]);

  const loginWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Firebase not configured');
    await signInWithPopup(auth, googleProvider);
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (!auth) throw new Error('Firebase not configured');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
    },
    []
  );

  const loginSimple = useCallback((name: string) => {
    const trimmed = name.trim();
    setSimpleUsername(trimmed);
    localStorage.setItem(STORAGE_KEY, trimmed);
  }, []);

  const logout = useCallback(async () => {
    if (firebaseReady && auth) {
      await signOut(auth);
    }
    setUser(null);
    setSimpleUsername(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [firebaseReady]);

  const username = simpleUsername;

  return (
    <AuthContext.Provider
      value={{
        user,
        username,
        isAuthenticated: !!username,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginSimple,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { isFirebaseConfigured };

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
