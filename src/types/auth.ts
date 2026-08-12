import type { PermissionName } from '@/src/config/permissions';

export interface AuthenticatedUser {
  id: string;
  username: string;
  role_id: string;
  role: string;
  permissions: PermissionName[];
}
