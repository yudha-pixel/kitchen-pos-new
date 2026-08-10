import { describe, expect, it } from 'vitest';

import {
  DEFAULT_ORG_SETTINGS,
  resolveEffectiveSettings,
  getSourceLabel,
} from '../../src/features/settings/settings-resolver';

describe('Settings Precedence Resolver Contract', () => {
  it('falls back to Organization default when no overrides are present', () => {
    const resolved = resolveEffectiveSettings({}, {}, {});

    expect(resolved.colorMode.value).toBe(DEFAULT_ORG_SETTINGS.colorMode);
    expect(resolved.colorMode.source).toBe('organization');
    expect(resolved.colorMode.isOverridden).toBe(false);
    expect(resolved.colorMode.inheritedValue).toBeNull();
  });

  it('overrides Organization default with Outlet override when present', () => {
    const resolved = resolveEffectiveSettings(
      { accentColor: 'violet' },
      { accentColor: 'blue' },
      {}
    );

    expect(resolved.accentColor.value).toBe('blue');
    expect(resolved.accentColor.source).toBe('outlet');
    expect(resolved.accentColor.isOverridden).toBe(true);
    expect(resolved.accentColor.inheritedValue).toBe('violet');
  });

  it('overrides Outlet and Organization with User preference when present', () => {
    const resolved = resolveEffectiveSettings(
      { density: 'comfortable' },
      { density: 'compact' },
      { density: 'comfortable' }
    );

    expect(resolved.density.value).toBe('comfortable');
    expect(resolved.density.source).toBe('user');
    expect(resolved.density.isOverridden).toBe(true);
    expect(resolved.density.inheritedValue).toBe('compact');
  });

  it('formats source labels correctly for organization and outlet', () => {
    expect(getSourceLabel('organization')).toBe('Inherited from organization');
    expect(getSourceLabel('outlet', 'Outlet Pusat')).toBe('Override for Outlet Pusat');
    expect(getSourceLabel('user')).toBe('User / device preference');
  });
});
