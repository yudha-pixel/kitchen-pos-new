'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface ResponsiveShellProps {
  children: React.ReactNode;
  title?: string;
  onSearch?: (query: string) => void;
}

export function ResponsiveShell({ children, title, onSearch }: ResponsiveShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col bg-surface text-ink overflow-hidden">
      {/* Top Header */}
      <Header
        title={title}
        onSearch={onSearch}
        onToggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)}
      />

      {/* Main Body Area: Sidebar + Main Content Chain */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Sidebar / Mobile Off-Canvas Drawer */}
        <Sidebar
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        {/* Primary Content Container with local overflow scroll */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-surface-alt">
          {children}
        </main>
      </div>
    </div>
  );
}
