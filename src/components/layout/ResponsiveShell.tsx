'use client';

import { usePageHeader } from '@/src/context/PageHeaderContext';

interface ResponsiveShellProps {
  children: React.ReactNode;
  title?: string;
  onSearch?: (query: string) => void;
}

// Header + Sidebar now live once in the root layout's AppShell (see
// src/components/layout/AppShell.tsx) so they persist across navigation
// instead of remounting per page. This component is kept only so existing
// call sites (`<ResponsiveShell title="...">`) don't need to change — it
// just registers the page's title/search handler with that shared shell.
export function ResponsiveShell({ children, title, onSearch }: ResponsiveShellProps) {
  usePageHeader({ title, onSearch });
  return <>{children}</>;
}
