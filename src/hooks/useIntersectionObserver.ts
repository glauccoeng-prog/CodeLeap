'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Returns a ref to attach to a sentinel element.
 * Calls `callback` whenever that element enters the viewport.
 */
export function useIntersectionObserver(
  callback: () => void,
  enabled = true
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);
  // Keep callback stable via a ref to avoid re-creating the observer
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) callbackRef.current();
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
}
