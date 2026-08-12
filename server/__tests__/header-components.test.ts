import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { LiveClock, formatHeaderDate, formatHeaderTime } from '../../src/components/layout/LiveClock';
import {
  UserProfileMenu,
  formatRoleLabel,
  getProfileInitials,
} from '../../src/components/layout/UserProfileMenu';
import type { AuthenticatedUser } from '../../src/types/auth';

const user: AuthenticatedUser = {
  id: '2d5f94e7-b53c-43ca-9db5-c037cb46eeea',
  username: 'admin',
  full_name: 'System Administrator',
  role_id: 'af6e65d6-7d7d-4df0-8989-5faad9a04dbd',
  role: 'store_manager',
  permissions: ['users.view'],
};

describe('LiveClock', () => {
  it('formats device-local Indonesian time with seconds and a compact date', () => {
    const localDate = new Date(2026, 7, 12, 9, 5, 7);

    expect(formatHeaderTime(localDate)).toBe('09.05.07');
    expect(formatHeaderDate(localDate)).toBe('Rab, 12 Agu');
  });

  it('renders a stable placeholder before client hydration', () => {
    const markup = renderToStaticMarkup(createElement(LiveClock));

    expect(markup).toContain('--.--.--');
    expect(markup).toContain('aria-hidden="true"');
  });
});

describe('UserProfileMenu', () => {
  it('derives concise initials and a human-readable role label', () => {
    expect(getProfileInitials('System Administrator', 'admin')).toBe('SA');
    expect(getProfileInitials('   ', 'admin')).toBe('AD');
    expect(formatRoleLabel('store_manager')).toBe('Store Manager');
  });

  it('renders an accessible profile trigger with the authenticated identity', () => {
    const markup = renderToStaticMarkup(
      createElement(UserProfileMenu, { user, onLogout: vi.fn() }),
    );

    expect(markup).toContain('aria-label="Buka profil pengguna System Administrator"');
    expect(markup).toContain('System Administrator');
    expect(markup).toContain('SA');
  });
});
