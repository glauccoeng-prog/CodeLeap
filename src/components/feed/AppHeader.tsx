/**
 * AppHeader Component
 *
 * Sticky header bar displaying "CodeLeap Network" branding,
 * a notification bell with unread badge, and a logout button.
 */
'use client';
import { LogOut, Bell, Heart, MessageCircle, Repeat2, AtSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatTimeAgo } from '@/lib/utils';
import type { NotificationType } from '@/lib/firestore';

import { useState, useRef, useEffect } from 'react';

function notificationIcon(type: NotificationType) {
  switch (type) {
    case 'like':
      return <Heart size={14} className="text-pink-500 fill-pink-500 shrink-0" />;
    case 'comment':
      return <MessageCircle size={14} className="text-primary shrink-0" />;
    case 'repost':
      return <Repeat2 size={14} className="text-green-500 shrink-0" />;
    case 'mention':
      return <AtSign size={14} className="text-primary shrink-0" />;
  }
}

function notificationText(type: NotificationType, fromUsername: string, postTitle: string) {
  const title = postTitle.length > 25 ? postTitle.slice(0, 25) + '...' : postTitle;
  switch (type) {
    case 'like':
      return (
        <>
          <b>@{fromUsername}</b> liked your post &quot;{title}&quot;
        </>
      );
    case 'comment':
      return (
        <>
          <b>@{fromUsername}</b> commented on &quot;{title}&quot;
        </>
      );
    case 'repost':
      return (
        <>
          <b>@{fromUsername}</b> reposted &quot;{title}&quot;
        </>
      );
    case 'mention':
      return (
        <>
          <b>@{fromUsername}</b> mentioned you in &quot;{title}&quot;
        </>
      );
  }
}

export function AppHeader() {
  const { username, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [showLogout, setShowLogout] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    await logout();
    setShowLogout(false);
  };

  // Close notification panel on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-primary">
        <div className="max-w-200 mx-auto px-6 h-20 flex items-center justify-between">
          <span className="text-heading font-bold text-white">CodeLeap Network</span>

          {username && (
            <div className="flex items-center gap-1">
              {/* Notification bell */}
              <div className="relative">
                <button
                  ref={bellRef}
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/70 text-sm font-medium hover:text-white hover:bg-white/15 transition-colors duration-150 relative"
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                  <Bell size={16} aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {showNotifs && (
                  <div
                    ref={panelRef}
                    className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-white rounded-xl shadow-xl border border-[#e5e7eb] overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb]">
                      <span className="text-sm font-bold text-[#333]">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllRead()}
                          className="text-xs text-primary hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="overflow-y-auto max-h-80">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-[#999] text-center py-8">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => {
                              if (!n.read) markRead(n.id);
                              setShowNotifs(false);
                            }}
                            className={[
                              'w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[#f9f9f9] transition-colors border-b border-[#f0f0f0] last:border-0',
                              !n.read ? 'bg-primary/5' : '',
                            ].join(' ')}
                          >
                            <div className="mt-0.5">{notificationIcon(n.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-[#333] leading-relaxed">
                                {notificationText(n.type, n.fromUsername, n.postTitle)}
                              </p>
                              {n.createdAt && (
                                <span className="text-[10px] text-[#999]">
                                  {formatTimeAgo(n.createdAt)}
                                </span>
                              )}
                            </div>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={() => setShowLogout(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/70 text-sm font-medium hover:text-white hover:bg-white/15 transition-colors duration-150"
                aria-label="Log out"
              >
                <LogOut size={16} aria-hidden="true" />
              </button>
            </div>
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
