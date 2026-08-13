import type { PermissionName } from '@/src/config/permissions';
import { PERMISSIONS } from '@/src/config/permissions';

/**
 * Offline permission system
 * Defines which features require online mode and which can work offline
 */

export interface OfflinePermissionConfig {
  // Features that require online mode
  onlineOnlyFeatures: PermissionName[];
  
  // Features that can work offline
  offlineCapableFeatures: PermissionName[];
  
  // Admin routes that require online mode
  onlineOnlyRoutes: string[];
  
  // Routes that can work offline
  offlineCapableRoutes: string[];
}

const DEFAULT_CONFIG: OfflinePermissionConfig = {
  // Features that require server connection
  onlineOnlyFeatures: [
    PERMISSIONS.users.view,
    PERMISSIONS.users.create,
    PERMISSIONS.users.update,
    PERMISSIONS.users.delete,
    PERMISSIONS.roles.view,
    PERMISSIONS.roles.create,
    PERMISSIONS.roles.update,
    PERMISSIONS.roles.delete,
    PERMISSIONS.roles.assign,
    PERMISSIONS.products.recipesManage,
    PERMISSIONS.inventory.view,
    PERMISSIONS.inventory.create,
    PERMISSIONS.inventory.edit,
    PERMISSIONS.inventory.delete,
    PERMISSIONS.inventory.adjust,
    PERMISSIONS.inventory.approve,
    PERMISSIONS.inventory.transfer,
    PERMISSIONS.purchasing.view,
    PERMISSIONS.purchasing.create,
    PERMISSIONS.purchasing.edit,
    PERMISSIONS.purchasing.delete,
    PERMISSIONS.purchasing.receive,
    PERMISSIONS.purchasing.pay,
    PERMISSIONS.crm.view,
    PERMISSIONS.crm.create,
    PERMISSIONS.crm.edit,
    PERMISSIONS.crm.delete,
    PERMISSIONS.promotions.view,
    PERMISSIONS.promotions.create,
    PERMISSIONS.promotions.edit,
    PERMISSIONS.promotions.delete,
    PERMISSIONS.attendance.view,
    PERMISSIONS.attendance.edit,
    PERMISSIONS.attendance.delete,
    PERMISSIONS.hr.view,
    PERMISSIONS.hr.create,
    PERMISSIONS.hr.edit,
    PERMISSIONS.hr.delete,
    PERMISSIONS.payroll.view,
    PERMISSIONS.payroll.create,
    PERMISSIONS.payroll.edit,
    PERMISSIONS.payroll.approve,
    PERMISSIONS.finance.view,
    PERMISSIONS.finance.create,
    PERMISSIONS.finance.edit,
    PERMISSIONS.finance.delete,
    PERMISSIONS.finance.approve,
    PERMISSIONS.finance.export,
    PERMISSIONS.reports.view,
    PERMISSIONS.reports.export,
    PERMISSIONS.settings.view,
    PERMISSIONS.settings.edit,
    PERMISSIONS.settings.reset,
    PERMISSIONS.settings.securityEdit,
    PERMISSIONS.outlets.view,
    PERMISSIONS.outlets.create,
    PERMISSIONS.outlets.edit,
    PERMISSIONS.outlets.delete,
    PERMISSIONS.modules.view,
    PERMISSIONS.modules.manage,
    PERMISSIONS.tables.create,
    PERMISSIONS.tables.delete,
    PERMISSIONS.reservations.view,
    PERMISSIONS.reservations.create,
    PERMISSIONS.reservations.edit,
    PERMISSIONS.reservations.delete,
    PERMISSIONS.reservations.confirm,
    PERMISSIONS.reservations.cancel,
    PERMISSIONS.backup.view,
    PERMISSIONS.backup.create,
    PERMISSIONS.backup.restore,
    PERMISSIONS.backup.delete,
    PERMISSIONS.audit.view,
    PERMISSIONS.printing.manage,
    PERMISSIONS.approvals.view,
    PERMISSIONS.approvals.create,
    PERMISSIONS.approvals.edit,
    PERMISSIONS.approvals.delete,
    PERMISSIONS.approvals.approve,
  ],
  
  // Core POS features that can work offline
  offlineCapableFeatures: [
    PERMISSIONS.products.view,
    PERMISSIONS.orders.view,
    PERMISSIONS.orders.create,
    PERMISSIONS.orders.edit,
    PERMISSIONS.tables.view,
    PERMISSIONS.tables.edit,
    PERMISSIONS.kitchen.view,
    PERMISSIONS.kitchen.manage,
    PERMISSIONS.printing.use,
    PERMISSIONS.reports.view,
  ],
  
  // Admin routes that require online mode
  onlineOnlyRoutes: [
    '/admin',
    '/admin/users',
    '/admin/roles',
    '/admin/permissions',
    '/admin/reports',
    '/admin/settings',
    '/admin/integrations',
    '/admin/analytics',
    '/inventory',
    '/admin/suppliers',
    '/admin/ingredients',
    '/admin/recipes',
    '/admin/vouchers',
    '/admin/members',
    '/admin/promotions',
    '/admin/expenses',
    '/admin/employees',
    '/admin/attendance',
    '/admin/shifts',
    '/admin/outlets',
    '/admin/printers',
    '/admin/tables',
  ],
  
  // Routes that can work offline
  offlineCapableRoutes: [
    '/pos',
    '/pos/meja',
    '/kitchen',
  ],
};

class OfflinePermissionManager {
  private config: OfflinePermissionConfig;

  constructor(config: Partial<OfflinePermissionConfig> = {}) {
    this.config = {
      onlineOnlyFeatures: config.onlineOnlyFeatures || DEFAULT_CONFIG.onlineOnlyFeatures,
      offlineCapableFeatures: config.offlineCapableFeatures || DEFAULT_CONFIG.offlineCapableFeatures,
      onlineOnlyRoutes: config.onlineOnlyRoutes || DEFAULT_CONFIG.onlineOnlyRoutes,
      offlineCapableRoutes: config.offlineCapableRoutes || DEFAULT_CONFIG.offlineCapableRoutes,
    };
  }

  /**
   * Check if a specific permission/feature requires online mode
   */
  requiresOnlineMode(permission: PermissionName): boolean {
    return this.config.onlineOnlyFeatures.includes(permission);
  }

  /**
   * Check if a specific permission/feature can work offline
   */
  canWorkOffline(permission: PermissionName): boolean {
    return this.config.offlineCapableFeatures.includes(permission);
  }

  /**
   * Check if a route requires online mode
   */
  routeRequiresOnlineMode(route: string): boolean {
    // Check exact match
    if (this.config.onlineOnlyRoutes.includes(route)) {
      return true;
    }

    // Check if route starts with any online-only route
    return this.config.onlineOnlyRoutes.some(onlineRoute => 
      route.startsWith(onlineRoute)
    );
  }

  /**
   * Check if a route can work offline
   */
  routeCanWorkOffline(route: string): boolean {
    // Check exact match
    if (this.config.offlineCapableRoutes.includes(route)) {
      return true;
    }

    // Check if route starts with any offline-capable route
    return this.config.offlineCapableRoutes.some(offlineRoute => 
      route.startsWith(offlineRoute)
    );
  }

  /**
   * Get all permissions that require online mode
   */
  getOnlineOnlyPermissions(): PermissionName[] {
    return [...this.config.onlineOnlyFeatures];
  }

  /**
   * Get all permissions that can work offline
   */
  getOfflineCapablePermissions(): PermissionName[] {
    return [...this.config.offlineCapableFeatures];
  }

  /**
   * Get all routes that require online mode
   */
  getOnlineOnlyRoutes(): string[] {
    return [...this.config.onlineOnlyRoutes];
  }

  /**
   * Get all routes that can work offline
   */
  getOfflineCapableRoutes(): string[] {
    return [...this.config.offlineCapableRoutes];
  }

  /**
   * Check if user has permission for offline operation
   */
  canUseOffline(userPermissions: PermissionName[], requiredPermission: PermissionName): boolean {
    // User must have the permission
    if (!userPermissions.includes(requiredPermission)) {
      return false;
    }

    // Permission must be capable of working offline
    return this.canWorkOffline(requiredPermission);
  }

  /**
   * Get explanation for why a feature is unavailable offline
   */
  getOfflineRestrictionReason(permission: PermissionName): string {
    if (this.requiresOnlineMode(permission)) {
      return 'This feature requires server connection and is not available in offline mode.';
    }
    return 'This feature is available in offline mode.';
  }

  /**
   * Get explanation for why a route is unavailable offline
   */
  getRouteRestrictionReason(route: string): string {
    if (this.routeRequiresOnlineMode(route)) {
      return 'This page requires server connection and is not available in offline mode.';
    }
    return 'This page is available in offline mode.';
  }
}

// Singleton instance
let permissionManagerInstance: OfflinePermissionManager | null = null;

/**
 * Get the offline permission manager instance
 */
export function getOfflinePermissionManager(): OfflinePermissionManager {
  if (!permissionManagerInstance) {
    permissionManagerInstance = new OfflinePermissionManager();
  }
  return permissionManagerInstance;
}

/**
 * Check if a permission requires online mode
 */
export function requiresOnlineMode(permission: PermissionName): boolean {
  return getOfflinePermissionManager().requiresOnlineMode(permission);
}

/**
 * Check if a permission can work offline
 */
export function canWorkOffline(permission: PermissionName): boolean {
  return getOfflinePermissionManager().canWorkOffline(permission);
}

/**
 * Check if a route requires online mode
 */
export function routeRequiresOnlineMode(route: string): boolean {
  return getOfflinePermissionManager().routeRequiresOnlineMode(route);
}

/**
 * Check if a route can work offline
 */
export function routeCanWorkOffline(route: string): boolean {
  return getOfflinePermissionManager().routeCanWorkOffline(route);
}

/**
 * Check if user can use a feature offline
 */
export function canUseOffline(userPermissions: PermissionName[], requiredPermission: PermissionName): boolean {
  return getOfflinePermissionManager().canUseOffline(userPermissions, requiredPermission);
}

/**
 * Get restriction reason for a permission
 */
export function getOfflineRestrictionReason(permission: PermissionName): string {
  return getOfflinePermissionManager().getOfflineRestrictionReason(permission);
}

/**
 * Get restriction reason for a route
 */
export function getRouteRestrictionReason(route: string): string {
  return getOfflinePermissionManager().getRouteRestrictionReason(route);
}