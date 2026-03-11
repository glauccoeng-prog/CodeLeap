/**
 * usePosts Hook
 *
 * Fetches posts from the CodeLeap API with infinite scroll pagination.
 * Uses TanStack Query's useInfiniteQuery to load pages of posts on demand.
 * Each page fetches PAGE_SIZE posts at the corresponding offset.
 */
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Number of posts fetched per page for infinite scroll
const PAGE_SIZE = 10;

export function usePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => api.getPosts(PAGE_SIZE, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length * PAGE_SIZE : undefined,
  });
}
