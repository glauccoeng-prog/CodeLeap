/**
 * useReposts Hook
 *
 * Manages the repost (share) system for posts using localStorage persistence.
 * Users can toggle reposts on/off, and the counter updates accordingly.
 *
 * Storage keys:
 *  - codeleap_reposts: Set of post IDs the current user has reposted
 *  - codeleap_reposts_count: Map of postId → total repost count
 */
'use client';

import { useState, useEffect, useCallback } from 'react';

// localStorage keys for persisting repost data across sessions
const REPOSTS_KEY = 'codeleap_reposts';
const REPOST_COUNTS_KEY = 'codeleap_reposts_count';

/** Reads the set of reposted post IDs from localStorage (SSR-safe) */
function readReposts(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(REPOSTS_KEY);
    return raw ? new Set<number>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Persists the set of reposted post IDs to localStorage */
function writeReposts(reposts: Set<number>) {
  localStorage.setItem(REPOSTS_KEY, JSON.stringify([...reposts]));
}

function readCounts(): Record<number, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(REPOST_COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Persists the repost count map to localStorage */
function writeCounts(counts: Record<number, number>) {
  localStorage.setItem(REPOST_COUNTS_KEY, JSON.stringify(counts));
}

/**
 * React hook that provides repost (share) functionality.
 *
 * @returns toggleRepost - Toggles the repost state for a post (on/off)
 * @returns isReposted - Checks if the current user has reposted a post
 * @returns getRepostCount - Returns the total repost count for a post
 */
export function useReposts() {
  const [repostedPosts, setRepostedPosts] = useState<Set<number>>(new Set());
  const [repostCounts, setRepostCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    const reposts = readReposts();
    const counts = readCounts();
    Promise.resolve().then(() => {
      setRepostedPosts(reposts);
      setRepostCounts(counts);
    });
  }, []);

  /** Toggle repost on/off for a given post. Updates both the state set and count map. */
  const toggleRepost = useCallback((postId: number) => {
    setRepostedPosts((prev) => {
      const next = new Set(prev);
      const wasReposted = next.has(postId);
      if (wasReposted) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      writeReposts(next);

      setRepostCounts((prevCounts) => {
        const current = prevCounts[postId] ?? 0;
        const updated = {
          ...prevCounts,
          [postId]: wasReposted ? Math.max(0, current - 1) : current + 1,
        };
        writeCounts(updated);
        return updated;
      });

      return next;
    });
  }, []);

  const isReposted = useCallback((postId: number) => repostedPosts.has(postId), [repostedPosts]);

  const getRepostCount = useCallback((postId: number) => repostCounts[postId] ?? 0, [repostCounts]);

  return { toggleRepost, isReposted, getRepostCount };
}
