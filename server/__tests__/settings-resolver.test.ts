import { describe, expect, it } from 'vitest';

import {
  ACCENT_RGB,
  appearanceSettingsEqual,
  getAppearanceStyleVariables,
  DEFAULT_APPEARANCE_SETTINGS,
  normalizeAppearanceSettings,
  pickAppearanceSettings,
  toAppearanceSettingsPatch,
  validateAppearanceSettingsPatch,
} from '../../src/features/settings/settings-resolver';

describe('Organization appearance settings contract', () => {
  it('normalizes persisted settings into the UI vocabulary', () => {
    expect(normalizeAppearanceSettings({
      primary_color: 'rose',
      theme_mode: 'dark',
      card_style: 'square',
      layout_density: 'compact',
      card_view: 'list',
      cart_position: 'floating-drawer',
    })).toEqual({
      accentColor: 'rose',
      colorMode: 'dark',
      cardStyle: 'square',
      density: 'compact',
      cardViewMode: 'list',
      cartPlacement: 'bottom',
    });
  });

  it('uses one consistent fallback for malformed or missing settings', () => {
    expect(normalizeAppearanceSettings({
      primary_color: 'chartreuse',
      theme_mode: 'system',
      card_style: 'pill',
      layout_density: 'dense',
      card_view: 'tiles',
      cart_position: 'left',
    })).toEqual(DEFAULT_APPEARANCE_SETTINGS);
    expect(normalizeAppearanceSettings({})).toEqual(DEFAULT_APPEARANCE_SETTINGS);
  });

  it('returns a valid safe record when legacy persisted values are malformed', () => {
    expect(pickAppearanceSettings({ theme_mode: 'system', primary_color: 'chartreuse' })).toEqual({
      primary_color: 'blue',
      theme_mode: 'light',
      card_style: 'rounded',
      layout_density: 'spacious',
      card_view: 'grid',
      cart_position: 'right-sidebar',
    });
  });

  it('maps the UI vocabulary back to the persisted API vocabulary', () => {
    expect(toAppearanceSettingsPatch({
      accentColor: 'emerald',
      colorMode: 'dark',
      cardStyle: 'rounded',
      density: 'comfortable',
      cardViewMode: 'card',
      cartPlacement: 'right',
    })).toEqual({
      primary_color: 'emerald',
      theme_mode: 'dark',
      card_style: 'rounded',
      layout_density: 'spacious',
      card_view: 'grid',
      cart_position: 'right-sidebar',
    });
  });

  it('rejects unsupported values at the API boundary', () => {
    expect(validateAppearanceSettingsPatch({ theme_mode: 'system' })).toBe(
      "theme_mode must be one of: light, dark"
    );
    expect(validateAppearanceSettingsPatch({ primary_color: 'rose' })).toBeNull();
    expect(validateAppearanceSettingsPatch({ unrelated: 'value' })).toBeNull();
  });

  it('provides an RGB token for every supported accent', () => {
    for (const accent of ['violet', 'blue', 'emerald', 'amber', 'rose', 'slate'] as const) {
      expect(ACCENT_RGB[accent]).toMatch(/^\d+ \d+ \d+$/);
    }
  });

  it('derives the same CSS variables used by the document and draft preview', () => {
    expect(getAppearanceStyleVariables({
      accentColor: 'amber',
      colorMode: 'dark',
      cardStyle: 'square',
      density: 'compact',
      cardViewMode: 'list',
      cartPlacement: 'bottom',
    })).toEqual({
      '--primary-rgb': '245 158 11',
      '--on-primary': '#111827',
      '--card-radius': '0rem',
      '--layout-spacing': '0.5rem',
      '--control-height': '2.5rem',
      '--page-padding': '1rem',
      '--section-gap': '0.75rem',
    });
  });

  it('detects whether an organization draft differs from the saved settings', () => {
    expect(appearanceSettingsEqual(DEFAULT_APPEARANCE_SETTINGS, DEFAULT_APPEARANCE_SETTINGS)).toBe(true);
    expect(appearanceSettingsEqual(DEFAULT_APPEARANCE_SETTINGS, {
      ...DEFAULT_APPEARANCE_SETTINGS,
      colorMode: 'dark',
    })).toBe(false);
  });
});
