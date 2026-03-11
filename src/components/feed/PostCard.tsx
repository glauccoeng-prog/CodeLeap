/**
 * PostCard Component
 *
 * Renders a single post in the feed with full social interactions:
 *  - Header with title + edit/delete icons (owner only)
 *  - Body with @mention highlighting and [img:URL] media parsing
 *  - Action bar: Like (permanent), Comment (toggle), Repost (toggle), View (auto-counted)
 *  - Expandable comments section with add/delete functionality
 *  - Auto-tracks view count via IntersectionObserver (Twitter-style)
 */
'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, MessageCircle, Send, Trash2, Repeat2, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePostInteractions } from '@/hooks/usePostInteractions';
import { formatTimeAgo } from '@/lib/utils';
import { EditPostModal } from '@/components/modals/EditPostModal';
import { DeletePostModal } from '@/components/modals/DeletePostModal';
import { MentionInput } from '@/components/feed/MentionInput';
import type { Post } from '@/types/api';

/**
 * Render @mentions as highlighted, clickable spans within text content.
 * Splits text on @word boundaries and wraps matches in styled spans.
 */
function renderWithMentions(text: string) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} className="text-primary font-bold cursor-pointer hover:underline">
        {part}
      </span>
    ) : (
      part
    )
  );
}

/**
 * Extract [img:URL] tags from post content.
 * Returns the cleaned text (without tags) and an array of image URLs.
 * This allows users to embed images in posts via a simple tag syntax.
 */
function parseContent(content: string) {
  const imgRegex = /\[img:(https?:\/\/[^\]]+)\]/g;
  const images: string[] = [];
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    images.push(match[1]);
  }
  const text = content.replace(imgRegex, '').trim();
  return { text, images };
}

// ─── Post Card ──────────────────────────────────────────────────────────────────
interface PostCardProps {
  post: Post;
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const { username } = useAuth();
  const {
    likeCount,
    commentCount,
    repostCount,
    viewCount,
    liked,
    reposted,
    comments,
    addLike,
    toggleRepost,
    recordView,
    addComment,
    deleteComment,
  } = usePostInteractions(post);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isOwner = username === post.username;
  const { text: contentText, images: contentImages } = parseContent(post.content);

  // Auto-count view when post appears on screen (like Twitter)
  const cardRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!username) return;
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          recordView();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [username, post.id, recordView]);

  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);

  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (!username || !commentText.trim()) return;
    addComment(commentText.trim(), mentionedUsers);
    setCommentText('');
    setMentionedUsers([]);
  };

  return (
    <>
      <motion.article
        ref={cardRef}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
        className="bg-white border border-[#999] rounded-2xl overflow-hidden"
      >
        {/* ── Card Header ── */}
        <div className="bg-primary px-6 h-17.5 flex items-center justify-between gap-4">
          <h3 className="text-heading font-bold text-white truncate flex-1 min-w-0">
            {post.title}
          </h3>

          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setDeleteOpen(true)}
                className="p-1 hover:opacity-80 transition-opacity duration-150"
                aria-label={`Delete post: ${post.title}`}
              >
                <Image
                  src="/icon/ic_baseline-delete-forever.svg"
                  alt=""
                  width={32}
                  height={30}
                  aria-hidden="true"
                />
              </button>
              <button
                onClick={() => setEditOpen(true)}
                className="p-1 hover:opacity-80 transition-opacity duration-150"
                aria-label={`Edit post: ${post.title}`}
              >
                <Image
                  src="/icon/bx_bx-edit.svg"
                  alt=""
                  width={32}
                  height={30}
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </div>

        {/* ── Card Body ── */}
        <div className="px-6 py-6">
          {/* Meta row */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <span className="text-subheading font-bold text-[#777]">@{post.username}</span>
            <time dateTime={post.created_datetime} className="text-subheading text-[#777]">
              {formatTimeAgo(post.created_datetime)}
            </time>
          </div>

          {/* Content with @mention highlighting */}
          {contentText && (
            <p className="text-subheading text-black leading-relaxed whitespace-pre-wrap wrap-break-word">
              {renderWithMentions(contentText)}
            </p>
          )}

          {/* Attached images */}
          {contentImages.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {contentImages.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt="Post attachment"
                  className="rounded-lg max-h-80 w-auto object-contain"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          {/* ── Actions row ── */}
          <div className="flex items-center gap-5 mt-5">
            <button
              onClick={() => addLike()}
              className={[
                'flex items-center gap-1.5 text-body transition-all duration-150',
                liked ? 'text-pink-500 cursor-default' : 'text-[#999] hover:text-pink-400',
              ].join(' ')}
              aria-label={liked ? 'Liked' : 'Like post'}
              aria-pressed={liked}
            >
              <Heart
                size={18}
                aria-hidden="true"
                className={liked ? 'fill-pink-500 text-pink-500' : ''}
                style={liked ? { animation: 'heartPulse 0.3s ease' } : {}}
              />
              <span>{likeCount > 0 ? likeCount : 'Like'}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-body text-[#999] hover:text-primary transition-colors duration-150"
            >
              <MessageCircle size={18} aria-hidden="true" />
              <span>
                {commentCount > 0
                  ? `${commentCount} comment${commentCount > 1 ? 's' : ''}`
                  : 'Comment'}
              </span>
            </button>

            <button
              onClick={() => toggleRepost()}
              className={[
                'flex items-center gap-1.5 text-body transition-colors duration-150',
                reposted ? 'text-success' : 'text-[#999] hover:text-success',
              ].join(' ')}
              aria-label={reposted ? 'Undo repost' : 'Repost'}
              aria-pressed={reposted}
            >
              <Repeat2 size={18} aria-hidden="true" />
              <span>{repostCount > 0 ? repostCount : 'Repost'}</span>
            </button>

            <div
              className="flex items-center gap-1.5 text-body text-[#999]"
              aria-label="View count"
            >
              <Eye size={18} aria-hidden="true" />
              <span>{viewCount > 0 ? viewCount : 'View'}</span>
            </div>
          </div>

          {/* ── Comments section ── */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
              {/* Comment list */}
              {comments.length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2 group">
                      <div className="flex-1 bg-[#f5f5f5] rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-body font-bold text-[#777]">@{c.username}</span>
                          <span className="text-caption text-[#999]">
                            {formatTimeAgo(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-body text-black">{renderWithMentions(c.text)}</p>
                      </div>
                      {c.username === username && (
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="self-center opacity-0 group-hover:opacity-100 text-[#999] hover:text-danger transition-all duration-150 p-1"
                          aria-label="Delete comment"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <MentionInput
                  value={commentText}
                  onChange={setCommentText}
                  onMentionsChange={setMentionedUsers}
                  placeholder="Write a comment... Type @ to mention"
                  className="w-full px-3 py-2 text-body rounded-lg border border-[#777] bg-white placeholder:text-[#ccc] focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send comment"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.article>

      {/* Modals */}
      <EditPostModal post={post} isOpen={editOpen} onClose={() => setEditOpen(false)} />
      <DeletePostModal postId={post.id} isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </>
  );
}
