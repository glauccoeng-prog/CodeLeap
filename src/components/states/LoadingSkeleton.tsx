/**
 * LoadingSkeleton Component
 *
 * Renders placeholder skeleton cards while posts are being fetched.
 * Mimics the PostCard layout with animated pulse effects.
 * Default: 3 skeleton cards.
 */
import { Skeleton } from '@/components/ui/Skeleton';
function PostSkeleton() {
  return (
    <div
      className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden"
      aria-hidden="true"
    >
      {/* Skeleton header */}
      <div className="bg-primary/15 px-6 py-6">
        <Skeleton className="h-7 w-2/3 rounded-md" />
      </div>
      {/* Skeleton body */}
      <div className="px-6 py-6">
        <div className="flex justify-between mb-4">
          <Skeleton className="h-5 w-28 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <Skeleton className="h-4 w-full rounded-md mb-2" />
        <Skeleton className="h-4 w-5/6 rounded-md mb-2" />
        <Skeleton className="h-4 w-4/6 rounded-md" />
      </div>
    </div>
  );
}

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-6" aria-label="Loading posts">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
