/**
 * useComments Hook
 *
 * Manages a local comment system for posts using localStorage.
 * Each comment has a unique ID, the post it belongs to, the author, text, and timestamp.
 * Comments persist across page reloads but are shared across all users on the same device.
 *
 * Storage key: codeleap_comments (stores all comments for all posts)
 */
'use client';

import { useState, useCallback } from 'react';

/** Shape of a single comment */
export interface Comment {
  id: string;
  postId: number;
  username: string;
  text: string;
  createdAt: string;
}

// localStorage key for all comments across all posts
const COMMENTS_KEY = 'codeleap_comments';

/** Reads all comments from localStorage (SSR-safe) */
function readComments(): Comment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    return raw ? (JSON.parse(raw) as Comment[]) : [];
  } catch {
    return [];
  }
}

/** Writes all comments back to localStorage */
function writeComments(comments: Comment[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

/**
 * React hook that provides comment CRUD for a specific post.
 *
 * @param postId - The ID of the post to manage comments for
 * @returns comments - Array of comments for this post
 * @returns addComment - Adds a new comment
 * @returns deleteComment - Removes a comment by ID
 */
export function useComments(postId: number) {
  const [comments, setComments] = useState<Comment[]>(() =>
    readComments().filter((c) => c.postId === postId)
  );

  /** Adds a new comment to this post and persists to localStorage */
  const addComment = useCallback(
    (username: string, text: string) => {
      const newComment: Comment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        postId,
        username,
        text,
        createdAt: new Date().toISOString(),
      };
      const all = readComments();
      const updated = [...all, newComment];
      writeComments(updated);
      setComments(updated.filter((c) => c.postId === postId));
    },
    [postId]
  );

  /** Deletes a comment by ID and persists the change */
  const deleteComment = useCallback(
    (commentId: string) => {
      const all = readComments();
      const updated = all.filter((c) => c.id !== commentId);
      writeComments(updated);
      setComments(updated.filter((c) => c.postId === postId));
    },
    [postId]
  );

  return { comments, addComment, deleteComment };
}
