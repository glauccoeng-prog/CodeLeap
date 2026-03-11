/**
 * DeletePostModal Component
 *
 * Confirmation modal that appears when the user clicks the delete icon on a post.
 * Shows "Are you sure you want to delete this item?" with Cancel and Delete buttons.
 * Matches Figma design screen 29005-65.
 */
'use client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

import { useDeletePost } from '@/hooks/useDeletePost';
interface DeletePostModalProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function DeletePostModal({ postId, isOpen, onClose }: DeletePostModalProps) {
  const { mutate: deletePost, isPending } = useDeletePost();

  const handleConfirm = () => {
    deletePost(postId, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <div className="p-6">
        <h2 className="text-heading font-bold text-black mb-10">
          Are you sure you want to delete this item?
        </h2>

        <div className="flex justify-end gap-4">
          <Button
            variant="secondary"
            size="sm"
            className="w-30 h-8"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="w-30 h-8"
            onClick={handleConfirm}
            isLoading={isPending}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
