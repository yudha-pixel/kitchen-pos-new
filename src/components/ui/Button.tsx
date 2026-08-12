'use client';

import { ButtonHTMLAttributes, forwardRef, useCallback, useRef } from 'react';
import { Spinner } from './Spinner';
import { MnemonicBadge } from './MnemonicBadge';
import { useMnemonic } from '@/src/hooks/useMnemonic';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /**
   * Single letter for a Windows-style Alt-mnemonic (e.g. "S" for "Simpan").
   * Assign explicitly per button — not auto-derived — since it must be unique
   * among buttons visible on the same screen. Shows a hint badge while Alt is
   * held; pressing Alt+<letter> clicks the button.
   */
  mnemonic?: string;
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
  ({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, mnemonic, ...props }, ref) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const isDisabled = disabled || loading;
    const handleMnemonicTrigger = useCallback(() => internalRef.current?.click(), []);
    useMnemonic(mnemonic, handleMnemonicTrigger, isDisabled);

    return (
      <button
        ref={(node) => {
          internalRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        disabled={isDisabled}
        aria-keyshortcuts={mnemonic && !isDisabled ? `Alt+${mnemonic.toUpperCase()}` : undefined}
        className={`appearance-card relative inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {mnemonic && !isDisabled && <MnemonicBadge letter={mnemonic} />}
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
