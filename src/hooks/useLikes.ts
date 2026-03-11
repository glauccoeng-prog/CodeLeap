/**
 * useLikes Hook
 *
 * Manages the like system for posts using localStorage persistence.
 * Once a user likes a post, it cannot be undone (similar to Instagram/Twitter).
 *
 * Storage keys:
 *  - codeleap_likes: Set of post IDs the current user has liked
 *  - codeleap_likes_count: Map of postId → total like count
 */
'use client';

import { useState, useEffect, useCallback } from 'react';

// localStorage keys for persisting likes data across sessions
const LIKES_KEY = 'codeleap_likes';
const COUNTS_KEY = 'codeleap_likes_count';

/** Reads the set of liked post IDs from localStorage (SSR-safe) */
function readLikes(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    return raw ? new Set<number>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Persists the set of liked post IDs to localStorage */
function writeLikes(likes: Set<number>) {
  localStorage.setItem(LIKES_KEY, JSON.stringify([...likes]));
}

/** Reads the like count map { postId: count } from localStorage (SSR-safe) */
function readCounts(): Record<number, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Persists the like count map to localStorage */
function writeCounts(counts: Record<number, number>) {
  localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
}

/**
 * React hook that provides like functionality.
 *
 * @returns addLike - Adds a permanent like to a post (cannot be reverted)
 * @returns isLiked - Checks if the current user already liked a post
 * @returns getLikeCount - Returns the total like count for a post
 */
export function useLikes() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    const likes = readLikes();
    const counts = readCounts();
    Promise.resolve().then(() => {
      setLikedPosts(likes);
      setLikeCounts(counts);
    });
  }, []);

  /** Like a post permanently. If already liked, the action is ignored. */
  const addLike = useCallback((postId: number) => {
    setLikedPosts((prev) => {
      // Already liked — do nothing (cannot un-like, like Instagram/Twitter)
      if (prev.has(postId)) return prev;

      const next = new Set(prev);
      next.add(postId);
      writeLikes(next);

      setLikeCounts((prevCounts) => {
        const current = prevCounts[postId] ?? 0;
        const updated = { ...prevCounts, [postId]: current + 1 };
        writeCounts(updated);
        return updated;
      });

      return next;
    });
  }, []);

  const isLiked = useCallback((postId: number) => likedPosts.has(postId), [likedPosts]);

  const getLikeCount = useCallback((postId: number) => likeCounts[postId] ?? 0, [likeCounts]);

  return { addLike, isLiked, getLikeCount };
}
