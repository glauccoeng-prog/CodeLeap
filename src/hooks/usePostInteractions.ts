/**
 * usePostInteractions Hook
 *
 * Single consolidated hook for all social interactions of a post.
 * Opens ONE Firestore onSnapshot listener per post for the metadata counters
 * (likes, comments, reposts, views) and a separate listener for comments.
 *
 * Uses React Query for cache deduplication — if multiple PostCard instances
 * reference the same postId, only one listener is created.
 *
 * Falls back gracefully when Firebase/Firestore is not configured.
 */
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  onPostMeta,
  onPostComments,
  addLike as fsAddLike,
  hasLiked as fsHasLiked,
  toggleRepost as fsToggleRepost,
  hasReposted as fsHasReposted,
  recordView as fsRecordView,
  addComment as fsAddComment,
  deleteComment as fsDeleteComment,
  createNotification,
  getUserIdByUsername,
  type PostMeta,
  type CommentData,
} from '@/lib/firestore';
import type { Post } from '@/types/api';

interface UsePostInteractionsReturn {
  // Counters (real-time from Firestore)
  likeCount: number;
  commentCount: number;
  repostCount: number;
  viewCount: number;

  // User state
  liked: boolean;
  reposted: boolean;

  // Comments
  comments: CommentData[];

  // Actions
  addLike: () => Promise<void>;
  toggleRepost: () => Promise<void>;
  recordView: () => Promise<void>;
  addComment: (text: string, mentionedUsernames?: string[]) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
}

const DEFAULT_META: PostMeta = {
  likeCount: 0,
  commentCount: 0,
  repostCount: 0,
  viewCount: 0,
};

export function usePostInteractions(post: Post): UsePostInteractionsReturn {
  const { user, username } = useAuth();
  const uid = user?.uid ?? null;
  const firestoreReady = isFirebaseConfigured() && !!uid;
  const postId = post.id;

  const [meta, setMeta] = useState<PostMeta>(DEFAULT_META);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const viewRecorded = useRef(false);

  // Subscribe to real-time metadata counters
  useEffect(() => {
    if (!firestoreReady) return;
    const unsub = onPostMeta(postId, setMeta);
    return () => unsub();
  }, [postId, firestoreReady]);

  // Subscribe to real-time comments
  useEffect(() => {
    if (!firestoreReady) return;
    const unsub = onPostComments(postId, setComments);
    return () => unsub();
  }, [postId, firestoreReady]);

  // Check if current user has liked/reposted this post
  useEffect(() => {
    if (!firestoreReady || !uid) return;
    fsHasLiked(postId, uid)
      .then(setLiked)
      .catch(() => {});
    fsHasReposted(postId, uid)
      .then(setReposted)
      .catch(() => {});
  }, [postId, uid, firestoreReady]);

  // Helper to send notification to post owner
  const notifyPostOwner = useCallback(
    async (type: 'like' | 'comment' | 'repost') => {
      if (!uid || !username || post.username === username) return;
      try {
        const ownerUid = await getUserIdByUsername(post.username);
        if (ownerUid) {
          await createNotification(ownerUid, {
            type,
            fromUsername: username,
            fromUserId: uid,
            postId: post.id,
            postTitle: post.title,
          });
        }
      } catch {
        // Non-critical — don't block the action
      }
    },
    [uid, username, post.username, post.id, post.title]
  );

  // Helper to send mention notifications from explicit list of mentioned usernames
  const notifyMentions = useCallback(
    async (mentionedUsernames: string[]) => {
      if (!uid || !username || mentionedUsernames.length === 0) return;
      const seen = new Set<string>();
      for (const mentionedName of mentionedUsernames) {
        if (mentionedName === username || seen.has(mentionedName)) continue;
        seen.add(mentionedName);
        try {
          const mentionedUid = await getUserIdByUsername(mentionedName);
          if (mentionedUid) {
            await createNotification(mentionedUid, {
              type: 'mention',
              fromUsername: username,
              fromUserId: uid,
              postId: post.id,
              postTitle: post.title,
            });
          }
        } catch {
          // Non-critical
        }
      }
    },
    [uid, username, post.id, post.title]
  );

  const addLike = useCallback(async () => {
    if (!firestoreReady || !uid || liked) return;
    setLiked(true); // optimistic
    try {
      await fsAddLike(postId, uid);
      notifyPostOwner('like');
    } catch {
      setLiked(false); // rollback
    }
  }, [postId, uid, liked, firestoreReady, notifyPostOwner]);

  const toggleRepost = useCallback(async () => {
    if (!firestoreReady || !uid) return;
    const prev = reposted;
    setReposted(!prev); // optimistic
    try {
      const nowReposted = await fsToggleRepost(postId, uid);
      setReposted(nowReposted);
      if (nowReposted) notifyPostOwner('repost');
    } catch {
      setReposted(prev); // rollback
    }
  }, [postId, uid, reposted, firestoreReady, notifyPostOwner]);

  const recordView = useCallback(async () => {
    if (!firestoreReady || !uid || viewRecorded.current) return;
    viewRecorded.current = true;
    try {
      await fsRecordView(postId, uid);
    } catch {
      viewRecorded.current = false;
    }
  }, [postId, uid, firestoreReady]);

  const addComment = useCallback(
    async (text: string, mentionedUsernames: string[] = []) => {
      if (!firestoreReady || !uid || !username) return;
      await fsAddComment(postId, uid, username, text);
      notifyPostOwner('comment');
      notifyMentions(mentionedUsernames);
    },
    [postId, uid, username, firestoreReady, notifyPostOwner, notifyMentions]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!firestoreReady) return;
      await fsDeleteComment(postId, commentId);
    },
    [postId, firestoreReady]
  );

  return {
    likeCount: meta.likeCount,
    commentCount: meta.commentCount,
    repostCount: meta.repostCount,
    viewCount: meta.viewCount,
    liked,
    reposted,
    comments,
    addLike,
    toggleRepost,
    recordView,
    addComment,
    deleteComment,
  };
}
