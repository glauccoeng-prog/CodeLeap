/**
 * Input Component
 *
 * Reusable text input with optional label and error message display.
 * Styled with border-[#777] and placeholder-[#ccc] to match Figma designs.
 * Built with forwardRef for react-hook-form integration.
 */
'use client';
import { cn } from '@/lib/utils';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-label font-normal text-[#111827]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full px-3 py-1.5 text-body rounded-lg',
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
Input.displayName = 'Input';
