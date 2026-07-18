'use client';

import { useOfflineStore } from '@/src/store/useOfflineStore';
import { Badge } from './Badge';

export const ConnectionIndicator = () => {
  const { isOnline, pendingTransactions, syncInProgress } = useOfflineStore();

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
