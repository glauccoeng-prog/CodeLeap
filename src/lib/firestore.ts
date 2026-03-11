/**
 * Firestore Service Layer
 *
 * All Firestore read/write operations for social interactions (likes,
 * comments, reposts, views). Uses a single root collection `posts_meta`
 * with subcollections for each interaction type.
 *
 * Collection structure:
 *   posts_meta/{postId}          → { likeCount, commentCount, repostCount, viewCount }
 *   posts_meta/{postId}/likes/{userId}      → { likedAt }
 *   posts_meta/{postId}/reposts/{userId}    → { repostedAt }
 *   posts_meta/{postId}/comments/{commentId} → { userId, username, text, createdAt }
 *   posts_meta/{postId}/views/{userId}      → { viewedAt }
 */
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  query,
  orderBy,
  where,
  limit as firestoreLimit,
  onSnapshot,
  writeBatch,
  increment,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── User Registry ──────────────────────────────────────────────────────────────

/** Register or update a user profile in Firestore (called on login) */
export async function registerUser(uid: string, username: string): Promise<void> {
  const ref = doc(db!, 'users', uid);
  await setDoc(ref, { username, updatedAt: serverTimestamp() }, { merge: true });
}

/** Look up a user's uid by their username */
export async function getUserIdByUsername(username: string): Promise<string | null> {
  const q = query(collection(db!, 'users'), where('username', '==', username), firestoreLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].id;
}

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface PostMeta {
  likeCount: number;
  commentCount: number;
  repostCount: number;
  viewCount: number;
}

export interface CommentData {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

const DEFAULT_META: PostMeta = {
  likeCount: 0,
  commentCount: 0,
  repostCount: 0,
  viewCount: 0,
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function metaRef(postId: number) {
  return doc(db!, 'posts_meta', String(postId));
}

function likeRef(postId: number, userId: string) {
  return doc(db!, 'posts_meta', String(postId), 'likes', userId);
}

function repostRef(postId: number, userId: string) {
  return doc(db!, 'posts_meta', String(postId), 'reposts', userId);
}

function viewRef(postId: number, userId: string) {
  return doc(db!, 'posts_meta', String(postId), 'views', userId);
}

function commentsCol(postId: number) {
  return collection(db!, 'posts_meta', String(postId), 'comments');
}

// ─── Ensure meta document exists ────────────────────────────────────────────────

async function ensureMeta(postId: number) {
  const ref = metaRef(postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, DEFAULT_META);
  }
}

// ─── Realtime listener ──────────────────────────────────────────────────────────

/** Subscribe to real-time updates of a post's metadata counters */
export function onPostMeta(postId: number, callback: (meta: PostMeta) => void): Unsubscribe {
  const ref = metaRef(postId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({
        likeCount: data.likeCount ?? 0,
        commentCount: data.commentCount ?? 0,
        repostCount: data.repostCount ?? 0,
        viewCount: data.viewCount ?? 0,
      });
    } else {
      callback(DEFAULT_META);
    }
  });
}

/** Subscribe to real-time updates of a post's comments list */
export function onPostComments(
  postId: number,
  callback: (comments: CommentData[]) => void
): Unsubscribe {
  const q = query(commentsCol(postId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const comments: CommentData[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        username: data.username,
        text: data.text,
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      };
    });
    callback(comments);
  });
}

// ─── Like ───────────────────────────────────────────────────────────────────────

export async function hasLiked(postId: number, userId: string): Promise<boolean> {
  const snap = await getDoc(likeRef(postId, userId));
  return snap.exists();
}

export async function addLike(postId: number, userId: string): Promise<void> {
  await ensureMeta(postId);
  const ref = likeRef(postId, userId);
  const existing = await getDoc(ref);
  if (existing.exists()) return; // already liked

  const batch = writeBatch(db!);
  batch.set(ref, { likedAt: serverTimestamp() });
  batch.update(metaRef(postId), { likeCount: increment(1) });
  await batch.commit();
}

// ─── Repost ─────────────────────────────────────────────────────────────────────

export async function hasReposted(postId: number, userId: string): Promise<boolean> {
  const snap = await getDoc(repostRef(postId, userId));
  return snap.exists();
}

export async function toggleRepost(postId: number, userId: string): Promise<boolean> {
  await ensureMeta(postId);
  const ref = repostRef(postId, userId);
  const existing = await getDoc(ref);

  const batch = writeBatch(db!);
  if (existing.exists()) {
    batch.delete(ref);
    batch.update(metaRef(postId), { repostCount: increment(-1) });
    await batch.commit();
    return false; // now un-reposted
  } else {
    batch.set(ref, { repostedAt: serverTimestamp() });
    batch.update(metaRef(postId), { repostCount: increment(1) });
    await batch.commit();
    return true; // now reposted
  }
}

// ─── View ───────────────────────────────────────────────────────────────────────

export async function recordView(postId: number, userId: string): Promise<void> {
  await ensureMeta(postId);
  const ref = viewRef(postId, userId);
  const existing = await getDoc(ref);
  if (existing.exists()) return; // already viewed

  const batch = writeBatch(db!);
  batch.set(ref, { viewedAt: serverTimestamp() });
  batch.update(metaRef(postId), { viewCount: increment(1) });
  await batch.commit();
}

// ─── Comments ───────────────────────────────────────────────────────────────────

export async function addComment(
  postId: number,
  userId: string,
  username: string,
  text: string
): Promise<void> {
  await ensureMeta(postId);
  const ref = doc(commentsCol(postId));

  const batch = writeBatch(db!);
  batch.set(ref, {
    userId,
    username,
    text,
    createdAt: serverTimestamp(),
  });
  batch.update(metaRef(postId), { commentCount: increment(1) });
  await batch.commit();
}

export async function deleteComment(postId: number, commentId: string): Promise<void> {
  const ref = doc(commentsCol(postId), commentId);
  const batch = writeBatch(db!);
  batch.delete(ref);
  batch.update(metaRef(postId), { commentCount: increment(-1) });
  await batch.commit();
}

// ─── Notifications ──────────────────────────────────────────────────────────────

export type NotificationType = 'like' | 'comment' | 'repost' | 'mention';

export interface NotificationData {
  id: string;
  type: NotificationType;
  fromUsername: string;
  fromUserId: string;
  postId: number;
  postTitle: string;
  read: boolean;
  createdAt: string;
}

function notificationsCol(userId: string) {
  return collection(db!, 'notifications', userId, 'items');
}

/** Create a notification for a user */
export async function createNotification(
  toUserId: string,
  data: {
    type: NotificationType;
    fromUsername: string;
    fromUserId: string;
    postId: number;
    postTitle: string;
  }
): Promise<void> {
  // Don't notify yourself
  if (toUserId === data.fromUserId) return;
  const ref = doc(notificationsCol(toUserId));
  await setDoc(ref, {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/** Subscribe to a user's notifications (latest 30) */
export function onNotifications(
  userId: string,
  callback: (notifications: NotificationData[]) => void
): Unsubscribe {
  const q = query(notificationsCol(userId), orderBy('createdAt', 'desc'), firestoreLimit(30));
  return onSnapshot(q, (snap) => {
    const items: NotificationData[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        type: data.type,
        fromUsername: data.fromUsername,
        fromUserId: data.fromUserId,
        postId: data.postId,
        postTitle: data.postTitle,
        read: data.read ?? false,
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : (data.createdAt ?? ''),
      };
    });
    callback(items);
  });
}

/** Mark a single notification as read */
export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  const ref = doc(notificationsCol(userId), notificationId);
  await updateDoc(ref, { read: true });
}

/** Mark all notifications as read */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  const q = query(notificationsCol(userId), where('read', '==', false));
  return new Promise((resolve) => {
    const unsub = onSnapshot(q, async (snap) => {
      unsub();
      if (snap.empty) {
        resolve();
        return;
      }
      const batch = writeBatch(db!);
      snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
      await batch.commit();
      resolve();
    });
  });
}
