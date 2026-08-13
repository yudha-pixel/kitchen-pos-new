import type { Profile, Role } from '@prisma/client';
import type { AuthenticatedUser } from '../../src/types/auth';

type PublicProfile = Pick<Profile, 'id' | 'username' | 'full_name' | 'role_id'> & {
  role: Pick<Role, 'name'>;
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
  };
}
