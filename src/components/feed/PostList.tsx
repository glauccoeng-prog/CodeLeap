/**
 * PostList Component
 *
 * Renders the scrollable feed of posts with:
 *  - Sort toggle (newest/oldest first)
 *  - Username filter search bar
 *  - Infinite scroll via IntersectionObserver sentinel element
 *  - Loading, error, and empty states
 */
'use client';
import { Loader2, ArrowUpDown, Search, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { usePosts } from '@/hooks/usePosts';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { PostCard } from './PostCard';
import { LoadingSkeleton } from '@/components/states/LoadingSkeleton';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import type { Post } from '@/types/api';

import { useState, useMemo } from 'react';

type SortOrder = 'newest' | 'oldest';

function FilterBar({
  sort,
  onSortChange,
  search,
  onSearchChange,
}: {
  sort: SortOrder;
  onSortChange: (s: SortOrder) => void;
  search: string;
  onSearchChange: (s: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      {/* Sort toggle */}
      <button
        onClick={() => onSortChange(sort === 'newest' ? 'oldest' : 'newest')}
        className="flex items-center gap-1.5 px-3 py-1.5 text-body border border-[#999] rounded-lg bg-white text-[#555] hover:border-primary hover:text-primary transition-colors"
      >
        <ArrowUpDown size={14} />
        <span>{sort === 'newest' ? 'Newest first' : 'Oldest first'}</span>
      </button>

      {/* Username filter */}
      <div className="relative flex-1 min-w-45 max-w-75">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by username..."
          className="w-full pl-8 pr-8 py-1.5 text-body border border-[#999] rounded-lg bg-white placeholder:text-[#ccc] focus:outline-none focus:border-primary transition-colors"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#555]"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Post List ──────────────────────────────────────────────────────────────────
export function PostList() {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePosts();

  const [sort, setSort] = useState<SortOrder>('newest');
  const [search, setSearch] = useState('');

  const sentinelRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, hasNextPage && !isFetchingNextPage);

  const filteredPosts = useMemo(() => {
    let posts: Post[] = data?.pages.flatMap((p) => p.results) ?? [];

    // Filter by username
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      posts = posts.filter((p) => p.username.toLowerCase().includes(q));
    }

    // Sort
    posts = [...posts].sort((a, b) => {
      const da = new Date(a.created_datetime).getTime();
      const db = new Date(b.created_datetime).getTime();
      return sort === 'newest' ? db - da : da - db;
    });

    return posts;
  }, [data, sort, search]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const allPosts = data?.pages.flatMap((p) => p.results) ?? [];
  if (allPosts.length === 0) return <EmptyState />;

  return (
    <div>
      <FilterBar sort={sort} onSortChange={setSort} search={search} onSearchChange={setSearch} />

      {filteredPosts.length === 0 ? (
        <p className="text-center text-body text-[#999] py-8">
          No posts found for &quot;{search}&quot;
        </p>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col gap-6">
            {filteredPosts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Infinite-scroll sentinel */}
      <div ref={sentinelRef} className="h-4 mt-2" aria-hidden="true" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-6" aria-label="Loading more posts">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      )}

      {!hasNextPage && filteredPosts.length > 0 && (
        <p className="text-center text-[13px] text-[#9ca3af] py-6">You&apos;re all caught up! 🎉</p>
      )}
    </div>
  );
}
