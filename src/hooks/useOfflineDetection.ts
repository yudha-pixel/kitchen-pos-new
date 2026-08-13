import { useState, useEffect, useCallback } from 'react';
import { healthCheck } from '@/src/lib/api';

export type OfflineMode = 'online' | 'network-offline' | 'server-offline';

interface OfflineDetectionState {
  mode: OfflineMode;
  isNetworkOnline: boolean;
  isServerOnline: boolean;
  lastCheckTime: string | null;
}

interface UseOfflineDetectionReturn {
  mode: OfflineMode;
  isOffline: boolean;
  isNetworkOnline: boolean;
  isServerOnline: boolean;
  lastCheckTime: string | null;
  checkServerStatus: () => Promise<void>;
}

const SERVER_CHECK_INTERVAL = 30000; // 30 seconds
const SERVER_CHECK_TIMEOUT = 5000; // 5 seconds

/**
 * Enhanced offline detection hook that distinguishes between network offline
 * and server offline states
 */
export const useOfflineDetection = (): UseOfflineDetectionReturn => {
  const [state, setState] = useState<OfflineDetectionState>({
    mode: 'online',
    isNetworkOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isServerOnline: true,
    lastCheckTime: null,
  });

  /**
   * Check if the API server is reachable
   */
  const checkServerStatus = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SERVER_CHECK_TIMEOUT);

      await healthCheck();
      clearTimeout(timeoutId);

      setState(prev => ({
        ...prev,
        isServerOnline: true,
        mode: prev.isNetworkOnline ? 'online' : 'network-offline',
        lastCheckTime: new Date().toISOString(),
      }));
    } catch (error) {
      console.warn('Server health check failed:', error);
      setState(prev => ({
        ...prev,
        isServerOnline: false,
        mode: 'server-offline',
        lastCheckTime: new Date().toISOString(),
      }));
    }
  }, []);

  /**
   * Handle network online/offline events
   */
  const handleNetworkChange = useCallback(() => {
    const isNetworkOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    setState(prev => ({
      ...prev,
      isNetworkOnline,
      mode: isNetworkOnline ? (prev.isServerOnline ? 'online' : 'server-offline') : 'network-offline',
    }));

    // If network came back online, check server status
    if (isNetworkOnline) {
      checkServerStatus();
    }
  }, [checkServerStatus]);

  useEffect(() => {
    // Set up network event listeners
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    // Initial server check
    checkServerStatus();

    // Periodic server checks
    const intervalId = setInterval(checkServerStatus, SERVER_CHECK_INTERVAL);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      clearInterval(intervalId);
    };
  }, [handleNetworkChange, checkServerStatus]);

  return {
    mode: state.mode,
    isOffline: state.mode !== 'online',
    isNetworkOnline: state.isNetworkOnline,
    isServerOnline: state.isServerOnline,
    lastCheckTime: state.lastCheckTime,
    checkServerStatus,
  };
};

/**
 * Get human-readable offline mode description
 */
export const getOfflineModeDescription = (mode: OfflineMode): string => {
  switch (mode) {
    case 'online':
      return 'System is online and connected to server';
    case 'network-offline':
      return 'Network connection is unavailable. Working in offline mode.';
    case 'server-offline':
      return 'Server is unreachable but network is available. Working in offline mode.';
    default:
      return 'Unknown connection status';
  }
};

/**
 * Get offline mode severity level
 */
export const getOfflineModeSeverity = (mode: OfflineMode): 'info' | 'warning' | 'error' => {
  switch (mode) {
    case 'online':
      return 'info';
    case 'network-offline':
      return 'warning';
    case 'server-offline':
      return 'error';
    default:
      return 'info';
  }
};