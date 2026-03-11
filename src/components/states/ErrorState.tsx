/**
 * ErrorState Component
 *
 * Displayed when fetching posts fails. Shows an error icon,
 * a "Something went wrong" message, and an optional retry button.
 */
'use client';
import { Button } from '@/components/ui/Button';

import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  onRetry?: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle size={32} className="text-danger" aria-hidden="true" />
      </div>
      <h3 className="text-subheading font-bold text-[#111827] mb-2">Something went wrong</h3>
      <p className="text-body text-[#9ca3af] mb-6">Failed to load posts. Please try again.</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary" size="sm">
          Try again
        </Button>
      )}
    </div>
  );
}
