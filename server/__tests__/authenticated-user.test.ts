import { describe, expect, it } from 'vitest';
import { serializeAuthenticatedUser } from '../lib/authenticatedUser';

describe('serializeAuthenticatedUser', () => {
  it('returns the complete public session identity without exposing profile internals', () => {
    const result = serializeAuthenticatedUser(
      {
        id: '2d5f94e7-b53c-43ca-9db5-c037cb46eeea',
        username: 'admin',
        full_name: 'System Administrator',
        role_id: 'af6e65d6-7d7d-4df0-8989-5faad9a04dbd',
        role: { name: 'admin' },
      },
      ['users.view', 'settings.view'],
    );

    expect(result).toEqual({
      id: '2d5f94e7-b53c-43ca-9db5-c037cb46eeea',
      username: 'admin',
      full_name: 'System Administrator',
      role_id: 'af6e65d6-7d7d-4df0-8989-5faad9a04dbd',
      role: 'admin',
      permissions: ['users.view', 'settings.view'],
    });
  });
});
