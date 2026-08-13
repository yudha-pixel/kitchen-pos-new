import { db, type OfflineUser } from './db';
import type { AuthenticatedUser } from '@/src/types/auth';
import * as api from './api';

export interface OfflineAuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  isOffline?: boolean;
}

/**
 * Simple hash function for offline credential storage
 * Note: This is NOT cryptographically secure, but provides basic obfuscation
 * for local storage. Real security requires server-side validation.
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Cache user credentials locally for offline authentication
 */
export async function cacheUserCredentials(user: AuthenticatedUser, password: string): Promise<void> {
  try {
    console.log('🔐 Caching user credentials for offline use...');
    
    const passwordHash = await hashPassword(password);
    
    const offlineUser: OfflineUser = {
      id: user.id,
      username: user.username,
      password_hash: passwordHash,
      role_id: user.role_id || user.role,
      role: user.role as 'admin' | 'cashier',
      permissions: user.permissions as any,
      full_name: user.full_name || undefined,
      last_sync: new Date().toISOString(),
    };

    // Store in IndexedDB
    await db.users.put(offlineUser);
    
    // Verify the data was stored
    const storedUser = await db.users.get(user.id);
    if (storedUser) {
      console.log('✅ User credentials cached successfully for offline use');
    } else {
      console.error('❌ Failed to verify stored user credentials');
    }
  } catch (error) {
    console.error('❌ Failed to cache user credentials:', error);
    throw error;
  }
}

/**
 * Authenticate user offline using cached credentials
 */
export async function authenticateOffline(username: string, password: string): Promise<OfflineAuthResult> {
  try {
    // Check if users table exists and has data
    const userCount = await db.users.count();
    if (userCount === 0) {
      return {
        success: false,
        error: 'No cached credentials found. Please login online first.',
        isOffline: true,
      };
    }

    const cleanUsername = username.trim();
    const offlineUser = await db.users.where('username').equalsIgnoreCase(cleanUsername).first() 
                     || await db.users.where('username').equals(cleanUsername).first();
    
    if (!offlineUser) {
      return {
        success: false,
        error: 'User not found in offline cache.',
        isOffline: true,
      };
    }

    // Verify password
    const passwordHash = await hashPassword(password);
    if (passwordHash !== offlineUser.password_hash) {
      return {
        success: false,
        error: 'Invalid password.',
        isOffline: true,
      };
    }

    // Return authenticated user
    const authenticatedUser: AuthenticatedUser = {
      id: offlineUser.id || '',
      username: offlineUser.username,
      role_id: offlineUser.role_id || offlineUser.role || '',
      role: offlineUser.role as 'admin' | 'cashier',
      permissions: offlineUser.permissions as any,
      full_name: offlineUser.full_name || '',
    };

    return {
      success: true,
      user: authenticatedUser,
      isOffline: true,
    };
  } catch (error) {
    console.error('Offline authentication failed:', error);
    return {
      success: false,
      error: 'Offline authentication failed.',
      isOffline: true,
    };
  }
}

/**
 * Check if offline authentication is available
 */
export async function isOfflineAuthAvailable(): Promise<boolean> {
  try {
    console.log('🔍 Checking offline auth availability...');
    const userCount = await db.users.count();
    console.log(`👥 Found ${userCount} cached users`);
    return userCount > 0;
  } catch (error) {
    console.error('❌ Failed to check offline auth availability:', error);
    return false;
  }
}

/**
 * Clear cached user credentials (for logout or security)
 */
export async function clearOfflineCredentials(): Promise<void> {
  try {
    await db.users.clear();
    console.log('Offline credentials cleared');
  } catch (error) {
    console.error('Failed to clear offline credentials:', error);
    throw error;
  }
}

/**
 * Update cached user permissions (call after online login)
 */
export async function updateOfflineUserPermissions(user: AuthenticatedUser): Promise<void> {
  try {
    const existingUser = await db.users.where('id').equals(user.id).first();
    
    if (existingUser) {
      await db.users.update(user.id, {
        permissions: user.permissions as any,
        role: user.role as 'admin' | 'cashier',
        full_name: user.full_name || undefined,
        last_sync: new Date().toISOString(),
      });
      console.log('User permissions updated in offline cache');
    }
  } catch (error) {
    console.error('Failed to update offline user permissions:', error);
    throw error;
  }
}

/**
 * Get cached user data without authentication
 */
export async function getCachedUser(userId: string): Promise<OfflineUser | undefined> {
  try {
    return await db.users.where('id').equals(userId).first();
  } catch (error) {
    console.error('Failed to get cached user:', error);
    return undefined;
  }
}

/**
 * Sync all users from server to local cache
 */
export async function syncUsersFromServer(): Promise<void> {
  try {
    // This would need an API endpoint to fetch all users
    // For now, we'll rely on individual user caching during login
    console.log('User sync from server - implement API endpoint for bulk user fetch');
  } catch (error) {
    console.error('Failed to sync users from server:', error);
    throw error;
  }
}