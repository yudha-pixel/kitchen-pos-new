'use client';

import { useState, useEffect } from 'react';
import { useOfflineStore } from '@/src/store/useOfflineStore';
import { Badge } from './Badge';

export const ConnectionIndicator = () => {
  // Defer reading online status to avoid SSR hydration mismatch:
  // server has no navigator.onLine and renders a default, while the
  // client reads a potentially different persisted Zustand value.
  const [mounted, setMounted] = useState(false);
  const { isOnline, pendingTransactions, syncInProgress } = useOfflineStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR / first client render, show nothing to avoid mismatch
  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge tone={isOnline ? 'success' : 'danger'}>
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
      {pendingTransactions > 0 && (
        <Badge tone="warning">
          {pendingTransactions} pending
        </Badge>
      )}
      {syncInProgress && (
        <Badge tone="info">
          Syncing...
        </Badge>
      )}
    </div>
  );
};
