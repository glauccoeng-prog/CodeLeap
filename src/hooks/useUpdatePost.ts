/**
 * useUpdatePost Hook
 *
 * Wraps the PATCH /careers/:id/ API call in a TanStack Query mutation.
 * On success, invalidates the 'posts' query to refresh the feed
 * and shows a success toast notification.
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { UpdatePostPayload } from '@/types/api';

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePostPayload }) =>
      api.updatePost(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update post. Please try again.');
    },
  });
}
