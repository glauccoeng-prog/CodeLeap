/**
 * useCreatePost Hook
 *
 * Wraps the POST /careers/ API call in a TanStack Query mutation.
 * On success, invalidates the 'posts' query to refresh the feed
 * and shows a success toast notification.
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { CreatePostPayload } from '@/types/api';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostPayload) => api.createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created successfully!');
    },
    onError: () => {
      toast.error('Failed to create post. Please try again.');
    },
  });
}
