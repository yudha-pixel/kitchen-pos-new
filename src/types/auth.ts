import type { PermissionName } from '@/src/config/permissions';

export interface AuthenticatedUser {
  id: string;
  username: string;
  full_name: string;
  role_id: string;
  role: string;
  permissions: PermissionName[];
}
