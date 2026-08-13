'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useOfflineDetection } from '@/src/hooks/useOfflineDetection';
import { routeRequiresOnlineMode, getRouteRestrictionReason } from '@/src/lib/offlinePermissions';

interface OfflineGuardProps {
  children: React.ReactNode;
  currentRoute: string;
  fallbackRoute?: string;
}

export const OfflineGuard: React.FC<OfflineGuardProps> = ({ 
  children, 
  currentRoute,
  fallbackRoute = '/pos'
}) => {
  const router = useRouter();
  const { isOffline } = useOfflineDetection();
  const { user } = useAuth();

  // Check if current route requires online mode
  const requiresOnline = routeRequiresOnlineMode(currentRoute);

  // If offline and route requires online, show restriction message
  if (isOffline && requiresOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">📡</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Offline Mode
          </h2>
          <p className="text-gray-600 mb-6">
            {getRouteRestrictionReason(currentRoute)}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push(fallbackRoute)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Go to POS (Offline Available)
            </button>
            <button
              onClick={() => router.refresh()}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Check Connection
            </button>
          </div>
          {user && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Logged in as <span className="font-medium">{user.username}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If online or route can work offline, render children
  return <>{children}</>;
};

export default OfflineGuard;