'use client';

import React, { useState, createContext, useContext } from 'react';

interface NotebookContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export interface NotebookProps {
  children: React.ReactNode;
  defaultTab?: string;
  className?: string;
}

export function Notebook({ children, defaultTab, className = '' }: NotebookProps) {
  // Collect children tabs metadata
  const pages = React.Children.toArray(children).filter(
    (child): child is React.ReactElement => React.isValidElement(child) && Boolean(child.props.id && child.props.label)
  );

  const initialTab = defaultTab || (pages[0]?.props.id as string) || '';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  return (
    <NotebookContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`w-full space-y-4 ${className}`}>
        {/* Borderless Horizontal Tab Bar */}
        <div className="flex border-b border-line gap-6 text-xs font-bold bg-surface-alt/40 px-4 pt-2 rounded-t-xl">
          {pages.map((page) => {
            const { id, label, icon: Icon } = page.props;
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all duration-150 ${
                  isActive
                    ? 'border-primary text-primary font-black'
                    : 'border-transparent text-ink-muted hover:text-ink hover:border-line-strong'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Page Content */}
        <div className="w-full">
          {pages.map((page) => {
            if (page.props.id !== activeTab) return null;
            return page;
          })}
        </div>
      </div>
    </NotebookContext.Provider>
  );
}

export interface PageProps {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

export function Page({ children, className = '' }: PageProps) {
  return <div className={`w-full animate-in fade-in-50 duration-150 ${className}`}>{children}</div>;
}
