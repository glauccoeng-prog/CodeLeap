/**
 * EditPostModal Component
 *
 * Modal form for editing an existing post's title and content.
 * Pre-fills the form with current post data when opened.
 * Uses react-hook-form + zod validation. Green "Save" button.
 * Matches Figma design screen 29005-39.
 */
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdatePost } from '@/hooks/useUpdatePost';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import type { Post } from '@/types/api';

import { useEffect } from 'react';
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

type FormValues = z.infer<typeof schema>;

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export function EditPostModal({ post, isOpen, onClose }: EditPostModalProps) {
  const { mutate: updatePost, isPending } = useUpdatePost();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { title: post.title, content: post.content },
  });

  // Reset the form each time the modal opens so it reflects the latest post data
  useEffect(() => {
    if (isOpen) reset({ title: post.title, content: post.content });
  }, [isOpen, post.title, post.content, reset]);

  const onSubmit = (data: FormValues) => {
    updatePost({ id: post.id, payload: data }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 flex flex-col gap-4">
        <h2 className="text-heading font-bold text-black">Edit item</h2>

        <Input
          label="Title"
          placeholder="Hello world"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Content"
          placeholder="Content here"
          error={errors.content?.message}
          {...register('content')}
        />

        <div className="flex justify-end gap-4 mt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-30 h-8"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            size="sm"
            className="w-30 h-8"
            disabled={!isValid}
            isLoading={isPending}
          >
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
