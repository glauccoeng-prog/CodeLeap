/**
 * useDeletePost Hook
 *
 * Wraps the DELETE /careers/:id/ API call in a TanStack Query mutation.
 * On success, invalidates the 'posts' query to refresh the feed
 * and shows a success toast notification.
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted.');
    },
    onError: () => {
      toast.error('Failed to delete post. Please try again.');
    },
  });
}
