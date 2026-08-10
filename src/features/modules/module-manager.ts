export type ModuleHealth = 'healthy' | 'update_available' | 'issue_detected';
export type MigrationStatus = 'up_to_date' | 'pending';

export interface InternalModule {
  id: string;
  name: string;
  technicalName: string;
  version: string;
  compatibility: string;
  dependencies: { name: string; constraint: string }[];
  health: ModuleHealth;
  enabled: boolean;
  permissions: string[];
  settingsScope: string;
  migrationsStatus: MigrationStatus;
  installedOn: string;
  description: string;
}

export const INTERNAL_MODULES: InternalModule[] = [
  {
    id: 'pos_core',
    name: 'Point of Sale',
    technicalName: 'pos_core',
    version: '3.18.0',
    compatibility: '>= 3.16.0',
    dependencies: [
      { name: 'base_core', constraint: '>= 3.16.0' },
      { name: 'inventory_core', constraint: '>= 3.15.0' },
    ],
    health: 'healthy',
    enabled: true,
    permissions: ['pos.checkout', 'pos.refund', 'pos.void'],
    settingsScope: 'Per outlet',
    migrationsStatus: 'up_to_date',
    installedOn: '9 Aug 2026 10:21',
    description: 'Core point of sale checkout, order management, and cashier billing.',
  },
  {
    id: 'kds_core',
    name: 'Kitchen Display',
    technicalName: 'kds_core',
    version: '3.18.0',
    compatibility: '>= 3.16.0 < 4.0.0',
    dependencies: [
      { name: 'base_core', constraint: '>= 3.16.0' },
      { name: 'pos_core', constraint: '>= 3.16.0' },
      { name: 'inventory_core', constraint: '>= 3.15.0' },
    ],
    health: 'healthy',
    enabled: true,
    permissions: ['kds.view', 'kds.manage', 'kds.print', 'bus.subscribe'],
    settingsScope: 'Per outlet',
    migrationsStatus: 'up_to_date',
    installedOn: '9 Aug 2026 10:21',
    description: 'Kitchen Display System for order management and kitchen workflow.',
  },
  {
    id: 'inventory_core',
    name: 'Inventory',
    technicalName: 'inventory_core',
    version: '3.17.2',
    compatibility: '>= 3.15.0',
    dependencies: [{ name: 'base_core', constraint: '>= 3.15.0' }],
    health: 'update_available',
    enabled: true,
    permissions: ['inventory.view', 'inventory.adjust', 'inventory.approve'],
    settingsScope: 'Per outlet',
    migrationsStatus: 'up_to_date',
    installedOn: '5 Aug 2026 14:10',
    description: 'Raw material inventory tracking, recipe mapping, and stock write-offs.',
  },
  {
    id: 'crm_core',
    name: 'CRM',
    technicalName: 'crm_core',
    version: '3.16.1',
    compatibility: '>= 3.14.0',
    dependencies: [{ name: 'base_core', constraint: '>= 3.14.0' }],
    health: 'healthy',
    enabled: true,
    permissions: ['crm.view', 'crm.manage', 'crm.points'],
    settingsScope: 'Organization global',
    migrationsStatus: 'up_to_date',
    installedOn: '1 Aug 2026 09:00',
    description: 'Customer relationship management, member points, and loyalty tracking.',
  },
  {
    id: 'attendance_core',
    name: 'Attendance',
    technicalName: 'attendance_core',
    version: '3.16.0',
    compatibility: '>= 3.14.0',
    dependencies: [{ name: 'hr_core', constraint: '>= 3.14.0' }],
    health: 'issue_detected',
    enabled: true,
    permissions: ['attendance.checkin', 'attendance.view', 'attendance.approve'],
    settingsScope: 'Per outlet',
    migrationsStatus: 'up_to_date',
    installedOn: '1 Aug 2026 09:00',
    description: 'Selfie attendance logging, location verification, and shift schedules.',
  },
  {
    id: 'finance_core',
    name: 'Finance & Expense',
    technicalName: 'finance_core',
    version: '3.15.0',
    compatibility: '>= 3.14.0',
    dependencies: [{ name: 'base_core', constraint: '>= 3.14.0' }],
    health: 'healthy',
    enabled: true,
    permissions: ['finance.view', 'finance.ocr', 'finance.export'],
    settingsScope: 'Organization global',
    migrationsStatus: 'up_to_date',
    installedOn: '25 Jul 2026 11:30',
    description: 'Expense logging, invoice receipt scanning (OCR), and CSV export.',
  },
  {
    id: 'reporting_core',
    name: 'Reporting',
    technicalName: 'reporting_core',
    version: '3.14.2',
    compatibility: '>= 3.13.0',
    dependencies: [{ name: 'base_core', constraint: '>= 3.13.0' }],
    health: 'healthy',
    enabled: true,
    permissions: ['reports.view', 'reports.export'],
    settingsScope: 'Organization global',
    migrationsStatus: 'up_to_date',
    installedOn: '20 Jul 2026 16:45',
    description: 'Sales revenue reports, discount breakdown, and outlet performance metrics.',
  },
  {
    id: 'purchase_core',
    name: 'Purchase',
    technicalName: 'purchase_core',
    version: '3.13.1',
    compatibility: '>= 3.12.0',
    dependencies: [
      { name: 'inventory_core', constraint: '>= 3.15.0' },
      { name: 'suppliers_core', constraint: '>= 3.12.0' },
    ],
    health: 'healthy',
    enabled: true,
    permissions: ['purchase.view', 'purchase.create', 'purchase.receive'],
    settingsScope: 'Per outlet',
    migrationsStatus: 'up_to_date',
    installedOn: '15 Jul 2026 10:00',
    description: 'Purchase orders, supplier receipt stock adjustments, and replenishment.',
  },
];

export function getInternalModules(): InternalModule[] {
  return INTERNAL_MODULES;
}

export function getModuleDependents(technicalName: string): InternalModule[] {
  return INTERNAL_MODULES.filter(
    (m) => m.enabled && m.dependencies.some((d) => d.name === technicalName)
  );
}

export function disableInternalModule(
  technicalName: string,
  confirmRollback: boolean
): { success: boolean; dependents: InternalModule[]; error?: string } {
  const target = INTERNAL_MODULES.find((m) => m.technicalName === technicalName);
  if (!target) {
    return { success: false, dependents: [], error: 'Module not found' };
  }

  const dependents = getModuleDependents(technicalName);
  if (dependents.length > 0 && !confirmRollback) {
    return {
      success: false,
      dependents,
      error: 'Module has active dependents. Rollback confirmation required.',
    };
  }

  target.enabled = false;
  return { success: true, dependents };
}

/**
 * Validates a module manifest against the Phase 3 trusted-plugin contract.
 */
export function validateModuleManifest(mod: Partial<InternalModule>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!mod.id || typeof mod.id !== 'string') errors.push('Missing module id');
  if (!mod.name || typeof mod.name !== 'string') errors.push('Missing module name');
  if (!mod.technicalName || typeof mod.technicalName !== 'string') errors.push('Missing technicalName');
  if (!mod.version || !/^\d+\.\d+\.\d+$/.test(mod.version)) errors.push('Invalid SemVer module version');
  if (!mod.permissions || !Array.isArray(mod.permissions) || mod.permissions.length === 0) {
    errors.push('Module must declare at least one capability/permission');
  }
  if (!mod.settingsScope || !['Organization global', 'Per outlet', 'User preference'].includes(mod.settingsScope)) {
    errors.push('Invalid settingsScope; must be Organization global, Per outlet, or User preference');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Detects cyclic dependencies between registered modules.
 */
export function detectDependencyCycles(modules: InternalModule[]): {
  hasCycle: boolean;
  cyclePath?: string[];
} {
  const modMap = new Map(modules.map((m) => [m.technicalName, m]));
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  function dfs(curr: string): boolean {
    visited.add(curr);
    recStack.add(curr);
    path.push(curr);

    const mod = modMap.get(curr);
    if (mod) {
      for (const dep of mod.dependencies) {
        if (!visited.has(dep.name)) {
          if (dfs(dep.name)) return true;
        } else if (recStack.has(dep.name)) {
          path.push(dep.name);
          return true;
        }
      }
    }

    recStack.delete(curr);
    path.pop();
    return false;
  }

  for (const mod of modules) {
    if (!visited.has(mod.technicalName)) {
      if (dfs(mod.technicalName)) {
        return { hasCycle: true, cyclePath: path };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Computes overall system health summary across trusted internal modules.
 */
export function getSystemHealthOverview(modules: InternalModule[] = INTERNAL_MODULES): {
  status: 'healthy' | 'degraded' | 'critical';
  summary: { total: number; enabled: number; healthy: number; issues: number };
} {
  const total = modules.length;
  const enabled = modules.filter((m) => m.enabled).length;
  const healthy = modules.filter((m) => m.enabled && m.health === 'healthy').length;
  const issues = modules.filter((m) => m.enabled && m.health === 'issue_detected').length;

  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (issues > 0) status = 'degraded';
  if (enabled < total / 2) status = 'critical';

  return {
    status,
    summary: { total, enabled, healthy, issues },
  };
}
