/**
 * LoginModal Component
 *
 * Handles user authentication with two modes:
 *  1. Firebase mode (when configured): Email/password login + registration + Google OAuth
 *     - Password strength validation with visual indicators (8+ chars, uppercase, lowercase, number, special)
 *  2. Simple mode (fallback): Username-only login stored in localStorage
 *
 * Matches Figma design screen 29005-138.
 */
'use client';
import { motion } from 'framer-motion';
import { useAuth, isFirebaseConfigured } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

import { useState } from 'react';
function friendlyAuthError(err: unknown): string {
  const code = err instanceof Error && 'code' in err ? (err as { code: string }).code : '';
  const map: Record<string, string> = {
    'auth/invalid-credential':
      'No account found with these credentials. Please check your email and password.',
    'auth/user-not-found': 'No account found with this email. Would you like to register instead?',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
    'auth/weak-password':
      'Password is too weak. Use at least 8 characters with uppercase, lowercase, number, and symbol.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in cancelled. You closed the popup.',
    'auth/popup-blocked': 'Pop-up blocked by your browser. Please allow pop-ups and try again.',
  };
  return (
    map[code] || (err instanceof Error ? err.message : 'Something went wrong. Please try again.')
  );
}

/** Password strength rules: all must pass for a password to be considered strong */
const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /\d/.test(p), label: 'One number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
] as const;

/** Returns true if the password satisfies all strength rules */
function isPasswordStrong(password: string) {
  return PASSWORD_RULES.every((r) => r.test(password));
}

// ─── Screen 29005-19: "Welcome to CodeLeap network!" ───────────────────────────
export function LoginModal() {
  const [value, setValue] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginSimple, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();

  const firebaseReady = isFirebaseConfigured();
  const passwordValid = isRegister ? isPasswordStrong(password) : password.length >= 6;
  const isValid = firebaseReady
    ? email.trim().length > 0 && passwordValid && (!isRegister || value.trim().length > 0)
    : value.trim().length > 0;

  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().length > 0) loginSimple(value.trim());
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      if (isRegister) {
        await registerWithEmail(email.trim(), password, value.trim());
        toast.success('Account created!');
      } else {
        await loginWithEmail(email.trim(), password);
        toast.success('Welcome back!');
      }
    } catch (err: unknown) {
      toast.error(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      toast.error(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-125 bg-white border border-[#ccc] rounded-2xl overflow-hidden"
      >
        {firebaseReady ? (
          <form onSubmit={handleEmailSubmit} className="p-6 flex flex-col gap-4">
            <h1 className="text-heading font-bold text-black">Welcome to CodeLeap network!</h1>

            {isRegister && (
              <Input
                id="display-name"
                label="Display name"
                placeholder="John doe"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoComplete="name"
              />
            )}

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="email"
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder={isRegister ? 'Strong password' : 'Your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />

            {/* Password strength indicators (only on register) */}
            {isRegister && password.length > 0 && (
              <ul className="flex flex-col gap-1 -mt-2">
                {PASSWORD_RULES.map((rule) => {
                  const pass = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={`text-caption flex items-center gap-1.5 ${
                        pass ? 'text-success' : 'text-[#999]'
                      }`}
                    >
                      <span>{pass ? '✓' : '○'}</span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-body text-primary hover:underline"
              >
                {isRegister
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Register"}
              </button>
              <Button
                type="submit"
                disabled={!isValid}
                isLoading={loading}
                size="sm"
                className="w-28 h-8"
              >
                {isRegister ? 'REGISTER' : 'ENTER'}
              </Button>
            </div>

            <div className="relative flex items-center my-1">
              <div className="flex-1 border-t border-[#ddd]" />
              <span className="px-3 text-[13px] text-[#999]">or</span>
              <div className="flex-1 border-t border-[#ddd]" />
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full h-10"
              onClick={handleGoogle}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Continue with Google
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSimpleSubmit} className="p-6 flex flex-col gap-4">
            <h1 className="text-heading font-bold text-black">Welcome to CodeLeap network!</h1>

            <Input
              id="username"
              label="Please enter your username"
              placeholder="John doe"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              autoComplete="off"
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!isValid}
                variant="primary"
                size="sm"
                className="w-28 h-8"
              >
                ENTER
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
