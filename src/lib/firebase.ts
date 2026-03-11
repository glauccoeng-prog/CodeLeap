/**
 * Firebase Configuration
 *
 * Conditionally initializes Firebase only when valid config is provided
 * via environment variables. This allows the app to work without Firebase
 * by falling back to simple username-based auth.
 *
 * Required env vars (all prefixed NEXT_PUBLIC_FIREBASE_):
 *  - API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET,
 *    MESSAGING_SENDER_ID, APP_ID
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Firebase config sourced from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Check if Firebase has valid config */
export function isFirebaseConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return !!key && key !== 'your_api_key_here';
}

// Only initialize Firebase when env vars are properly configured
// This prevents crashes when running without Firebase credentials
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured()) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { auth };
export default app;
