/**
 * useNotifications Hook
 *
 * Subscribes to real-time notifications for the current user from Firestore.
 * Provides unread count, notification list, and actions to mark as read.
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  onNotifications,
  markNotificationRead as fsMarkRead,
  markAllNotificationsRead as fsMarkAllRead,
  type NotificationData,
} from '@/lib/firestore';

export function useNotifications() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const firestoreReady = isFirebaseConfigured() && !!uid;

  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    if (!firestoreReady || !uid) return;
    const unsub = onNotifications(uid, setNotifications);
    return () => unsub();
  }, [uid, firestoreReady]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!uid) return;
      await fsMarkRead(uid, notificationId);
    },
    [uid]
  );

  const markAllRead = useCallback(async () => {
    if (!uid) return;
    await fsMarkAllRead(uid);
  }, [uid]);

  return { notifications, unreadCount, markRead, markAllRead };
}
