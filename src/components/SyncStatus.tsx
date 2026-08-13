'use client';

import React, { useState, useEffect } from 'react';
import { getDataSyncStatus, performDataSync, type DataSyncStatus, type SyncProgress } from '@/src/lib/dataSync';

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ className = '', showDetails = false }) => {
  const [syncStatus, setSyncStatus] = useState<DataSyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await getDataSyncStatus();
      setSyncStatus(status);
      setError(null);
    } catch (err) {
      setError('Failed to load sync status');
      console.error('Failed to load sync status:', err);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setSyncProgress(null);

    try {
      const result = await performDataSync((progress) => {
        setSyncProgress(progress);
      });

      if (result.success) {
        await loadSyncStatus();
      } else {
        setError(result.error || 'Sync failed');
      }
    } catch (err) {
      setError('Sync failed');
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!syncStatus) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${syncStatus.initialSyncCompleted ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <h3 className="font-semibold text-gray-800">Data Sync Status</h3>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {syncProgress && (
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Syncing {syncProgress.currentStep}...</span>
            <span>{syncProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress.percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Last Sync:</span>
          <span className="font-medium text-gray-800">{formatLastSync(syncStatus.lastSyncTime)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Initial Sync:</span>
          <span className={`font-medium ${syncStatus.initialSyncCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
            {syncStatus.initialSyncCompleted ? 'Completed' : 'Not Completed'}
          </span>
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2 text-sm">Data Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Products:</span>
                <span className="font-medium">{syncStatus.dataTypes.products.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categories:</span>
                <span className="font-medium">{syncStatus.dataTypes.categories.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modifiers:</span>
                <span className="font-medium">{syncStatus.dataTypes.modifiers.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tables:</span>
                <span className="font-medium">{syncStatus.dataTypes.tables.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outlets:</span>
                <span className="font-medium">{syncStatus.dataTypes.outlets.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ingredients:</span>
                <span className="font-medium">{syncStatus.dataTypes.ingredients.count}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncStatus;