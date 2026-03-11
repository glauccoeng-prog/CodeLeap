/**
 * AppHeader Component
 *
 * Sticky header bar displaying "CodeLeap Network" branding and a logout button.
 * When the user clicks logout, a confirmation modal appears ("Leaving so soon?").
 * Matches Figma design screen 29005-216.
 */
'use client';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

import { useState } from 'react';
export function AppHeader() {
  const { username, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogout(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-primary">
        <div className="max-w-200 mx-auto px-6 h-20 flex items-center justify-between">
          <span className="text-heading font-bold text-white">CodeLeap Network</span>

          {username && (
            <button
              onClick={() => setShowLogout(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/70 text-sm font-medium hover:text-white hover:bg-white/15 transition-colors duration-150"
              aria-label="Log out"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {/* Logout confirmation modal */}
      <Modal isOpen={showLogout} onClose={() => setShowLogout(false)}>
        <div className="p-6">
          <h2 className="text-heading font-bold text-black mb-2">Leaving so soon?</h2>
          <p className="text-label text-[#777] mb-8">
            You&apos;re about to sign out of CodeLeap Network. Any unsaved changes will be lost.
          </p>
          <div className="flex justify-end gap-4">
            <Button
              variant="secondary"
              size="sm"
              className="w-30 h-8"
              onClick={() => setShowLogout(false)}
            >
              Stay
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="w-30 h-8"
              onClick={() => void handleLogout()}
            >
              Sign out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
