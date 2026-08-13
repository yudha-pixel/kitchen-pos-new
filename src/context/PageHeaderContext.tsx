'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export interface PageHeaderConfig {
  title?: string;
  onSearch?: (query: string) => void;
  actions?: ReactNode;
}

interface PageHeaderContextValue {
  config: PageHeaderConfig;
  setConfig: (config: PageHeaderConfig) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue | undefined>(undefined);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PageHeaderConfig>({});
  return (
    <PageHeaderContext.Provider value={{ config, setConfig }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeaderContext() {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) throw new Error('usePageHeaderContext must be used within PageHeaderProvider');
  return ctx;
}

// Lets a leaf page (rendered as `children` inside the persistent AppShell)
// register its Header title/search handler without AppShell needing to know
// about every page. Keeps the effect dependency array stable (title is a
// primitive, onSearch is read via ref) so pages can pass an inline arrow
// function without retriggering this on every render.
export function usePageHeader({ title, onSearch, actions }: PageHeaderConfig) {
  const { setConfig } = usePageHeaderContext();
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  useEffect(() => {
    setConfig({
      title,
      onSearch: onSearch ? (query: string) => onSearchRef.current?.(query) : undefined,
      actions,
    });
    return () => setConfig({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, !!onSearch]);
}
