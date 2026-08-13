export const PERMISSIONS = {
  users: { view: 'users.view', create: 'users.create', update: 'users.update', delete: 'users.delete' },
  roles: { view: 'roles.view', create: 'roles.create', update: 'roles.update', delete: 'roles.delete', assign: 'roles.assign' },
  products: { view: 'products.view', create: 'products.create', edit: 'products.edit', delete: 'products.delete', recipesManage: 'products.recipes_manage' },
  orders: { view: 'orders.view', create: 'orders.create', edit: 'orders.edit', delete: 'orders.delete', void: 'orders.void', refund: 'orders.refund' },
  inventory: { view: 'inventory.view', create: 'inventory.create', edit: 'inventory.edit', delete: 'inventory.delete', adjust: 'inventory.adjust', approve: 'inventory.approve', transfer: 'inventory.transfer' },
  purchasing: { view: 'purchasing.view', create: 'purchasing.create', edit: 'purchasing.edit', delete: 'purchasing.delete', receive: 'purchasing.receive', pay: 'purchasing.pay' },
  crm: { view: 'crm.view', create: 'crm.create', edit: 'crm.edit', delete: 'crm.delete' },
  promotions: { view: 'promotions.view', create: 'promotions.create', edit: 'promotions.edit', delete: 'promotions.delete' },
  attendance: { view: 'attendance.view', edit: 'attendance.edit', delete: 'attendance.delete' },
  hr: { view: 'hr.view', create: 'hr.create', edit: 'hr.edit', delete: 'hr.delete' },
  payroll: { view: 'payroll.view', create: 'payroll.create', edit: 'payroll.edit', approve: 'payroll.approve' },
  finance: { view: 'finance.view', create: 'finance.create', edit: 'finance.edit', delete: 'finance.delete', approve: 'finance.approve', export: 'finance.export' },
  reports: { view: 'reports.view', export: 'reports.export' },
  settings: { view: 'settings.view', edit: 'settings.edit', reset: 'settings.reset', securityEdit: 'settings.security_edit' },
  outlets: { view: 'outlets.view', create: 'outlets.create', edit: 'outlets.edit', delete: 'outlets.delete' },
  modules: { view: 'modules.view', manage: 'modules.manage' },
  kitchen: { view: 'kitchen.view', manage: 'kitchen.manage' },
  tables: { view: 'tables.view', create: 'tables.create', edit: 'tables.edit', delete: 'tables.delete' },
  backup: { view: 'backup.view', create: 'backup.create', restore: 'backup.restore', delete: 'backup.delete' },
  audit: { view: 'audit.view' },
  printing: { use: 'printing.use', manage: 'printing.manage' },
  approvals: { view: 'approvals.view', create: 'approvals.create', edit: 'approvals.edit', delete: 'approvals.delete', approve: 'approvals.approve' },
  events: { view: 'events.view', create: 'events.create', edit: 'events.edit', delete: 'events.delete', close: 'events.close', manageStock: 'events.manage_stock', manageCosts: 'events.manage_costs' },
} as const;

type PermissionGroup = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
type ValueOfUnion<T> = T extends unknown ? T[keyof T] : never;
export type PermissionName = ValueOfUnion<PermissionGroup>;

export const ALL_PERMISSIONS = Object.values(PERMISSIONS)
  .flatMap((group) => Object.values(group)) as PermissionName[];

const MANAGEMENT_DENIED = new Set<PermissionName>([
  ...Object.values(PERMISSIONS.roles),
  PERMISSIONS.users.delete,
  PERMISSIONS.modules.manage,
  PERMISSIONS.settings.securityEdit,
  PERMISSIONS.orders.void,
  PERMISSIONS.orders.refund,
  PERMISSIONS.backup.restore,
  PERMISSIONS.backup.delete,
  PERMISSIONS.events.close,
]);

export const DEFAULT_ROLE_PERMISSIONS: Record<'admin' | 'owner' | 'management' | 'cashier', PermissionName[]> = {
  admin: [...ALL_PERMISSIONS],
  owner: [...ALL_PERMISSIONS],
  management: ALL_PERMISSIONS.filter(
    (permission) => !permission.endsWith('.approve') && !MANAGEMENT_DENIED.has(permission),
  ),
  cashier: [
    PERMISSIONS.products.view,
    PERMISSIONS.orders.view,
    PERMISSIONS.orders.create,
    PERMISSIONS.orders.edit,
    PERMISSIONS.tables.view,
    PERMISSIONS.tables.edit,
    PERMISSIONS.printing.use,
    PERMISSIONS.reports.view,
    PERMISSIONS.events.view,
  ],
};

const PERMISSION_SET = new Set<string>(ALL_PERMISSIONS);

export function isPermissionName(value: string): value is PermissionName {
  return PERMISSION_SET.has(value);
}
