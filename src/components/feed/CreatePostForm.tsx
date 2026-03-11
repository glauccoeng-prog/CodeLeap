/**
 * CreatePostForm Component
 *
 * Form for creating new posts with title, content, and optional image attachment.
 * Uses react-hook-form + zod for validation. Supports [img:URL] embedding.
 * Matches the "What's on your mind?" Figma design section.
 */
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ImagePlus, X } from 'lucide-react';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

type FormValues = z.infer<typeof schema>;

export function CreatePostForm() {
  const { username } = useAuth();
  const { mutate: createPost, isPending } = useCreatePost();
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = (data: FormValues) => {
    if (!username) return;
    // Append image tag if provided
    const content = imageUrl.trim() ? `${data.content}\n[img:${imageUrl.trim()}]` : data.content;
    createPost(
      { username, title: data.title, content },
      {
        onSuccess: () => {
          reset();
          setImageUrl('');
          setShowImageInput(false);
        },
      }
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-label="Create a new post"
      className="bg-white border border-[#999] rounded-2xl p-6 mb-6"
    >
      <h2 className="text-heading font-bold text-[#111827] mb-6">What&apos;s on your mind?</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          id="post-title"
          label="Title"
          placeholder="Hello world!"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          id="post-content"
          label="Content"
          placeholder="Content here"
          error={errors.content?.message}
          {...register('content')}
        />

        {/* Image attachment */}
        {showImageInput ? (
          <div className="flex items-center gap-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL (https://...)"
              className="flex-1 px-3 py-1.5 text-body border border-[#777] rounded-lg bg-white placeholder:text-[#ccc] focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => {
                setShowImageInput(false);
                setImageUrl('');
              }}
              className="p-1.5 text-[#999] hover:text-danger transition-colors"
              aria-label="Remove image"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowImageInput(true)}
            className="flex items-center gap-1.5 text-body text-[#999] hover:text-primary transition-colors self-start"
          >
            <ImagePlus size={16} />
            <span>Add image</span>
          </button>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isValid}
            isLoading={isPending}
            size="sm"
            className="w-30 h-8"
          >
            Create
          </Button>
        </div>
      </form>
    </motion.section>
  );
}
