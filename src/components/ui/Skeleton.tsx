/**
 * Skeleton Component
 *
 * Simple pulsing placeholder used for loading states.
 * Accepts className for custom width/height styling.
 */
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded', className)} aria-hidden="true" />;
}
