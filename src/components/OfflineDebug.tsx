'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/src/lib/db';
import * as offlineAuth from '@/src/lib/offlineAuth';
import { ChevronDown, ChevronUp, Bug } from 'lucide-react';

export const OfflineDebug: React.FC = () => {
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [isDbOpen, setIsDbOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const loadDebugInfo = async () => {
    try {
      // Check if database is open
      setIsDbOpen(db.isOpen());

      // Get database info
      const tables = {
        products: await db.products.count(),
        categories: await db.categories.count(),
        orders: await db.orders.count(),
        users: await db.users.count(),
        sync_status: await db.sync_status.count(),
      };

      // Get users
      const allUsers = await db.users.toArray();

      // Get sync status
      const status = await db.sync_status.get('global-sync-status');

      // Get storage info
      if (typeof navigator !== 'undefined' && 'storage' in navigator) {
        try {
          const estimate = await navigator.storage.estimate();
          setStorageInfo({
            usage: estimate.usage ? (estimate.usage / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown',
            quota: estimate.quota ? (estimate.quota / 1024 / 1024 / 1024).toFixed(2) + ' GB' : 'Unknown',
          });
        } catch (e) {
          console.warn('Could not get storage estimate');
        }
      }

      setDbInfo(tables);
      setUsers(allUsers);
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to load debug info:', error);
      setDbInfo({ error: String(error) });
    }
  };

  useEffect(() => {
    loadDebugInfo();
    // Set up interval to refresh debug info
    const interval = setInterval(loadDebugInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const clearAllData = async () => {
    if (confirm('Are you sure you want to clear all IndexedDB data?')) {
      try {
        await db.delete();
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear database:', error);
      }
    }
  };

  const testOfflineAuth = async () => {
    const available = await offlineAuth.isOfflineAuthAvailable();
    alert(`Offline auth available: ${available}`);
  };

  const requestPersistence = async () => {
    try {
      if (typeof navigator !== 'undefined' && 'storage' in navigator && 'persist' in navigator.storage) {
        const isPersistent = await navigator.storage.persist();
        const persisted = await navigator.storage.persisted();
        alert(`Storage persist: ${isPersistent ? 'granted' : 'denied'} | Storage persisted: ${persisted ? 'yes' : 'no'}`);
      } else {
        alert('Storage persistence API not available');
      }
    } catch (error) {
      alert('Error requesting persistence: ' + String(error));
    }
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-gray-900/95 border border-gray-700/80 px-3.5 py-2 text-xs font-semibold text-white shadow-2xl hover:bg-gray-800 transition-all cursor-pointer"
      >
        <span className={`h-2 w-2 rounded-full ${isDbOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        <Bug className="h-3.5 w-3.5 text-blue-400" />
        <span>Offline Debug</span>
        <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/95 text-white p-4 rounded-xl shadow-2xl border border-gray-700/80 max-w-md max-h-96 overflow-auto z-50 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
        <h3 className="font-bold text-sm flex items-center gap-2 text-gray-100">
          <span className={`h-2 w-2 rounded-full ${isDbOpen ? 'bg-green-400' : 'bg-red-400'}`} />
          Offline Debug
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={loadDebugInfo}
            className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded transition-colors text-white font-medium cursor-pointer"
          >
            Refresh
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            title="Collapse panel"
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 p-1 rounded transition-colors cursor-pointer"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {dbInfo && (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-300">DB Status:</span>
            <span className={isDbOpen ? 'text-green-400' : 'text-red-400'}>
              {isDbOpen ? 'Open' : 'Closed'}
            </span>
          </div>

          {storageInfo && (
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-300">Storage:</span>
              <span className="text-gray-400">{storageInfo.usage} / {storageInfo.quota}</span>
            </div>
          )}

          <div className="font-semibold text-gray-300">Database Tables:</div>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(dbInfo).map(([table, count]) => (
              <div key={table} className="flex justify-between">
                <span className="text-gray-400">{table}:</span>
                <span className={count === 0 ? 'text-red-400' : 'text-green-400'}>{String(count)}</span>
              </div>
            ))}
          </div>

          {users.length > 0 && (
            <div className="mt-3">
              <div className="font-semibold text-gray-300">Cached Users:</div>
              {users.map((user) => (
                <div key={user.id} className="text-gray-400">
                  {user.username} ({user.role})
                </div>
              ))}
            </div>
          )}

          {syncStatus && (
            <div className="mt-3">
              <div className="font-semibold text-gray-300">Sync Status:</div>
              <div className="text-gray-400">
                Last Sync: {syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleString() : 'Never'}
              </div>
              <div className="text-gray-400">
                Initial Sync: {syncStatus.initialSyncCompleted ? '✅' : '❌'}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-800 flex gap-2 flex-wrap">
            <button
              onClick={testOfflineAuth}
              className="text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded transition-colors text-white font-medium cursor-pointer"
            >
              Test Auth
            </button>
            <button
              onClick={requestPersistence}
              className="text-xs bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded transition-colors text-white font-medium cursor-pointer"
            >
              Persist
            </button>
            <button
              onClick={clearAllData}
              className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded transition-colors text-white font-medium cursor-pointer"
            >
              Clear DB
            </button>
          </div>
        </div>
      )}
    </div>
  );
};