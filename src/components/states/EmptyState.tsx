/**
 * EmptyState Component
 *
 * Displayed when there are no posts in the feed.
 * Shows a friendly message encouraging the user to create the first post.
 */
import { MessageCircle } from 'lucide-react';
export function EmptyState() {
  return (
    <div role="status" className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
        <MessageCircle size={32} className="text-primary" aria-hidden="true" />
      </div>
      <h3 className="text-subheading font-bold text-[#111827] mb-2">No posts yet</h3>
      <p className="text-body text-[#9ca3af]">Be the first to share something!</p>
    </div>
  );
}
