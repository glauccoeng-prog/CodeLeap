/**
 * useViews Hook
 *
 * Tracks post view counts using a Twitter-like approach:
 *  - Views are counted automatically when a post appears on screen
 *    (via IntersectionObserver in PostCard)
 *  - Each session only counts 1 view per post (sessionStorage prevents duplicates)
 *  - Total view counts persist across sessions in localStorage
 *
 * Storage keys:
 *  - codeleap_view_counts (localStorage): Map of postId → total view count
 *  - codeleap_viewed_session (sessionStorage): Set of postIds already viewed this session
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// localStorage key for persistent total view counts
const VIEW_COUNTS_KEY = 'codeleap_view_counts';
// sessionStorage key to prevent duplicate views within the same browser session
const VIEWED_SESSION_KEY = 'codeleap_viewed_session';

/** Reads the total view count map from localStorage (SSR-safe) */
function readCounts(): Record<number, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(VIEW_COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Persists the total view count map to localStorage */
function writeCounts(counts: Record<number, number>) {
  localStorage.setItem(VIEW_COUNTS_KEY, JSON.stringify(counts));
}

/** Reads which posts have been viewed this session from sessionStorage (SSR-safe) */
function readSessionViewed(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(VIEWED_SESSION_KEY);
    return raw ? new Set<number>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Persists the viewed-this-session set to sessionStorage */
function writeSessionViewed(viewed: Set<number>) {
  sessionStorage.setItem(VIEWED_SESSION_KEY, JSON.stringify([...viewed]));
}

/**
 * React hook that tracks post view counts.
 *
 * @returns recordView - Records a view for a post (max 1 per session per post)
 * @returns getViewCount - Returns the total view count for a post
 */
export function useViews() {
  const [viewCounts, setViewCounts] = useState<Record<number, number>>({});
  const viewedThisSession = useRef<Set<number>>(new Set());

  useEffect(() => {
    const counts = readCounts();
    const session = readSessionViewed();
    viewedThisSession.current = session;
    Promise.resolve().then(() => setViewCounts(counts));
  }, []);

  /** Records a single view for a post. Skips if already viewed this session. */
  const recordView = useCallback((postId: number) => {
    // Only count 1 view per post per session (prevents inflation from scrolling)
    if (viewedThisSession.current.has(postId)) return;
    viewedThisSession.current.add(postId);
    writeSessionViewed(viewedThisSession.current);

    setViewCounts((prev) => {
      const current = prev[postId] ?? 0;
      const updated = { ...prev, [postId]: current + 1 };
      writeCounts(updated);
      return updated;
    });
  }, []);

  const getViewCount = useCallback((postId: number) => viewCounts[postId] ?? 0, [viewCounts]);

  return { recordView, getViewCount };
}
