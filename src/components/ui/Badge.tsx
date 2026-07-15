'use client';

import { ReactNode } from 'react';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

const tones: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface-alt text-ink-secondary',
  primary: 'bg-primary-soft text-primary',
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

export const Badge = ({ tone = 'neutral', children, className = '' }: BadgeProps) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
  >
    {children}
  </span>
);
