'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active shadow-md font-semibold',
  secondary: 'bg-surface text-ink border-2 border-line-strong hover:bg-surface-alt hover:text-ink active:bg-surface-active shadow-md font-semibold',
  ghost: 'bg-surface-alt text-ink border-2 border-line hover:bg-surface hover:text-ink active:bg-surface-active font-semibold',
  danger: 'bg-danger text-white hover:bg-red-700 active:bg-red-800 shadow-md font-semibold',
  success: 'bg-success text-white hover:bg-green-800 active:bg-green-900 shadow-md font-semibold',
};

// All sizes keep a >=44px hit target (touch-target-size)
const sizes: Record<Size, string> = {
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
  icon: 'min-h-11 min-w-11 p-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
