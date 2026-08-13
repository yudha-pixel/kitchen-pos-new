'use client';

import React from 'react';
import { useOfflineDetection, getOfflineModeDescription, getOfflineModeSeverity } from '@/src/hooks/useOfflineDetection';
import { useSyncManager } from '@/src/hooks/useSyncManager';

interface OfflineBannerProps {
  className?: string;
  showSyncInfo?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ 
  className = '',
  showSyncInfo = true 
}) => {
  const { mode, isOffline, lastCheckTime, checkServerStatus } = useOfflineDetection();
  const { pendingTransactions, syncInProgress, triggerManualSync } = useSyncManager();

  if (!isOffline) {
    return null;
  }

  const severity = getOfflineModeSeverity(mode);
  const description = getOfflineModeDescription(mode);

  const getBannerColor = () => {
    switch (severity) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'network-offline':
        return '📡';
      case 'server-offline':
        return '🖥️';
      default:
        return '⚠️';
    }
  };

  const formatLastCheck = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return 'Over an hour ago';
  };

  return (
    <div className={`${getBannerColor()} border-b px-4 py-3 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-2xl">{getIcon()}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">
                {mode === 'network-offline' ? 'You are offline' : 'Server unreachable'}
              </h3>
              <p className="text-xs opacity-90 mb-2">{description}</p>
              
              {showSyncInfo && (
                <div className="flex items-center gap-4 text-xs">
                  {pendingTransactions > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Pending changes:</span>
                      <span className="font-semibold">{pendingTransactions}</span>
                    </div>
                  )}
                  
                  {lastCheckTime && (
                    <div className="flex items-center gap-1">
                      <span className="opacity-75">Last check:</span>
                      <span>{formatLastCheck(lastCheckTime)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {pendingTransactions > 0 && !syncInProgress && (
              <button
                onClick={triggerManualSync}
                className="px-3 py-1.5 bg-white/50 hover:bg-white/70 rounded-md text-xs font-medium transition-colors"
              >
                Sync Now
              </button>
            )}
            
            <button
              onClick={checkServerStatus}
              disabled={syncInProgress}
              className="px-3 py-1.5 bg-white/50 hover:bg-white/70 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
            >
              {syncInProgress ? 'Checking...' : 'Retry Connection'}
            </button>
          </div>
        </div>

        {syncInProgress && (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
              <span>Attempting to sync and reconnect...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;