'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon: Icon, title, message, action }: EmptyStateProps) => (
  <div className="flex h-64 flex-col items-center justify-center text-center text-ink-muted">
    <Icon className="mb-4 h-16 w-16" aria-hidden="true" />
    <p className="text-lg font-medium text-ink-secondary">{title}</p>
    {message && <p className="mt-1 text-sm">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
