import type { Profile, Role, Outlet } from '@prisma/client';
import type { AuthenticatedUser } from '../../src/types/auth';

type PublicProfile = Pick<Profile, 'id' | 'username' | 'full_name' | 'role_id' | 'email' | 'phone' | 'outlet_id'> & {
  role: Pick<Role, 'name'>;
  outlet?: Pick<Outlet, 'name'> | null;
};

export function serializeAuthenticatedUser(
  profile: PublicProfile,
  permissions: string[],
): AuthenticatedUser {
  return {
    id: profile.id,
    username: profile.username,
    full_name: profile.full_name,
    role_id: profile.role_id,
    role: profile.role.name,
    permissions: permissions as AuthenticatedUser['permissions'],
    email: profile.email ?? null,
    phone: profile.phone ?? null,
    outlet_id: profile.outlet_id ?? null,
    outlet_name: profile.outlet?.name ?? null,
  };
}
