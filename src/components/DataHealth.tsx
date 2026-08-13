'use client';

import React, { useState, useEffect } from 'react';
import { getDataValidationReport, type ValidationResult } from '@/src/lib/dataValidator';
import { performDataSync, type SyncProgress } from '@/src/lib/dataSync';

interface DataHealthProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export const DataHealth: React.FC<DataHealthProps> = ({ 
  className = '',
  autoRefresh = false,
  refreshInterval = 60000 // 1 minute
}) => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      const data = await getDataValidationReport();
      setReport(data);
      setError(null);
    } catch (err) {
      setError('Failed to load data health report');
      console.error('Failed to load data health report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    
    if (autoRefresh) {
      const interval = setInterval(loadReport, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setSyncProgress(null);

    try {
      const result = await performDataSync((progress) => {
        setSyncProgress(progress);
      });

      if (result.success) {
        await loadReport();
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

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getDataAge = (timestamp: string | null) => {
    if (!timestamp) return null;
    const date = new Date(timestamp).getTime();
    const now = Date.now();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Less than 1 hour';
    if (diffHours < 24) return `${Math.round(diffHours)} hours`;
    return `${Math.round(diffHours / 24)} days`;
  };

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <p className="text-red-600">Failed to load data health report</p>
      </div>
    );
  }

  const { summary, details, syncStatus } = report;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Data Health Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitor offline data availability and sync status
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {isSyncing ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {syncProgress && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex justify-between text-sm text-blue-800 mb-1">
            <span>Syncing {syncProgress.currentStep}...</span>
            <span>{syncProgress.percentage}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress.percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Overall Status */}
      <div className={`mb-6 p-4 rounded-lg border ${
        summary.isValid 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-2xl ${summary.isValid ? '✅' : '❌'}`}></span>
          <h3 className={`font-semibold ${summary.isValid ? 'text-green-800' : 'text-red-800'}`}>
            {summary.isValid ? 'Data is ready for offline use' : 'Data is incomplete for offline use'}
          </h3>
        </div>
        
        {summary.missingData.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-red-700 mb-1">Missing required data:</p>
            <ul className="text-sm text-red-600 list-disc list-inside">
              {summary.missingData.map((item: string) => (
                <li key={item} className="capitalize">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.staleData.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-yellow-700 mb-1">Stale data warnings:</p>
            <ul className="text-sm text-yellow-600 list-disc list-inside">
              {summary.staleData.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.warnings.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-orange-700 mb-1">Warnings:</p>
            <ul className="text-sm text-orange-600 list-disc list-inside">
              {summary.warnings.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sync Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Sync Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Last Sync:</span>
            <span className="ml-2 font-medium">{formatTimestamp(syncStatus.lastSyncTime)}</span>
          </div>
          <div>
            <span className="text-gray-600">Data Age:</span>
            <span className="ml-2 font-medium">{getDataAge(syncStatus.lastSyncTime) || 'Unknown'}</span>
          </div>
          <div>
            <span className="text-gray-600">Initial Sync:</span>
            <span className={`ml-2 font-medium ${syncStatus.initialSyncCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
              {syncStatus.initialSyncCompleted ? 'Completed' : 'Not Completed'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Type Details */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Data Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(details).map(([key, value]: [string, any]) => (
            <div
              key={key}
              className={`p-3 rounded-lg border ${
                value.valid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium capitalize text-gray-800">{key}</span>
                <span className={`text-lg ${value.valid ? '✅' : '❌'}`}></span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{value.count}</span> records
              </div>
              <div className="text-xs text-gray-500 mt-1">{value.message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={loadReport}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          Refresh Report
        </button>
      </div>
    </div>
  );
};

export default DataHealth;