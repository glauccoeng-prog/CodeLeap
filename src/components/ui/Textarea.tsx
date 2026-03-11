/**
 * Textarea Component
 *
 * Reusable textarea with optional label and error message display.
 * Fixed at 3 rows with no resize. Same styling as Input component.
 * Built with forwardRef for react-hook-form integration.
 */
'use client';
import { cn } from '@/lib/utils';

import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-label font-normal text-[#111827]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={3}
        className={cn(
          'w-full px-3 py-2 text-body rounded-lg resize-none',
          'border border-[#777] bg-white text-[#111827]',
          'placeholder:text-[#ccc]',
          'focus:outline-none focus:border-primary',
          'transition-colors duration-150',
          error && 'border-danger focus:border-danger',
          className
        )}
        {...props}
      />
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
