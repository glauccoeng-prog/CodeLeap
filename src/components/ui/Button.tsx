/**
 * Button Component
 *
 * Reusable button with multiple variants (primary, secondary, danger, success, ghost)
 * and sizes (sm, md, lg). Supports a loading spinner state.
 * Built with forwardRef for full ref forwarding support.
 */
'use client';
import { cn } from '@/lib/utils';

// Available style variants and their corresponding Tailwind classes
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-white text-[#111827] border border-[#999] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'bg-danger text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed',
  success:
    'bg-success text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-[#111827] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
};

const sizeClass: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-8 py-2 text-base',
  lg: 'px-10 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', isLoading, className, children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-bold rounded-lg',
        'transition-all duration-150 cursor-pointer',
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
