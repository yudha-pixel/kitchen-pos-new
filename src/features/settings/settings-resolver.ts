export type ColorMode = 'light' | 'dark';
export type AccentColor = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';
export type CardStyle = 'rounded' | 'square';
export type Density = 'comfortable' | 'compact';
export type CardViewMode = 'card' | 'list' | 'minimalist';
export type CartPlacement = 'right' | 'bottom';

export interface AppearanceSettingsRecord {
  primary_color: string;
  theme_mode: string;
  card_style: string;
  layout_density: string;
  card_view: string;
  cart_position: string;
}

export interface AppVisualSettings {
  accentColor: AccentColor;
  colorMode: ColorMode;
  cardStyle: CardStyle;
  density: Density;
  cardViewMode: CardViewMode;
  cartPlacement: CartPlacement;
}

export const DEFAULT_APPEARANCE_RECORD: AppearanceSettingsRecord = {
  primary_color: 'blue',
  theme_mode: 'light',
  card_style: 'rounded',
  layout_density: 'spacious',
  card_view: 'grid',
  cart_position: 'right-sidebar',
};

export const DEFAULT_APPEARANCE_SETTINGS: AppVisualSettings = {
  accentColor: 'blue',
  colorMode: 'light',
  cardStyle: 'rounded',
  density: 'comfortable',
  cardViewMode: 'card',
  cartPlacement: 'right',
};

export const ACCENT_RGB: Record<AccentColor, string> = {
  blue: '59 130 246',
  emerald: '16 185 129',
  violet: '139 92 246',
  amber: '245 158 11',
  rose: '244 63 94',
  slate: '71 85 105',
};

const ALLOWED_VALUES = {
  primary_color: Object.keys(ACCENT_RGB),
  theme_mode: ['light', 'dark'],
  card_style: ['rounded', 'square'],
  layout_density: ['spacious', 'compact'],
  card_view: ['grid', 'list', 'minimalist'],
  cart_position: ['right-sidebar', 'floating-drawer'],
} as const;

export function pickAppearanceSettings(
  settings: Partial<AppearanceSettingsRecord> | null | undefined
): AppearanceSettingsRecord {
  return toAppearanceSettingsPatch(normalizeAppearanceSettings(settings));
}

export function normalizeAppearanceSettings(
  settings: Partial<AppearanceSettingsRecord> | null | undefined
): AppVisualSettings {
  const source = settings ?? {};
  const accentColor = ALLOWED_VALUES.primary_color.includes(source.primary_color ?? '')
    ? source.primary_color as AccentColor
    : DEFAULT_APPEARANCE_SETTINGS.accentColor;

  return {
    accentColor,
    colorMode: source.theme_mode === 'dark' || source.theme_mode === 'light'
      ? source.theme_mode
      : DEFAULT_APPEARANCE_SETTINGS.colorMode,
    cardStyle: source.card_style === 'square' || source.card_style === 'rounded'
      ? source.card_style
      : DEFAULT_APPEARANCE_SETTINGS.cardStyle,
    density: source.layout_density === 'compact'
      ? 'compact'
      : source.layout_density === 'spacious'
        ? 'comfortable'
        : DEFAULT_APPEARANCE_SETTINGS.density,
    cardViewMode: source.card_view === 'list'
      ? 'list'
      : source.card_view === 'minimalist'
        ? 'minimalist'
        : source.card_view === 'grid'
          ? 'card'
          : DEFAULT_APPEARANCE_SETTINGS.cardViewMode,
    cartPlacement: source.cart_position === 'floating-drawer'
      ? 'bottom'
      : source.cart_position === 'right-sidebar'
        ? 'right'
        : DEFAULT_APPEARANCE_SETTINGS.cartPlacement,
  };
}

export function toAppearanceSettingsPatch(settings: AppVisualSettings): AppearanceSettingsRecord {
  return {
    primary_color: settings.accentColor,
    theme_mode: settings.colorMode,
    card_style: settings.cardStyle,
    layout_density: settings.density === 'compact' ? 'compact' : 'spacious',
    card_view: settings.cardViewMode === 'card' ? 'grid' : settings.cardViewMode,
    cart_position: settings.cartPlacement === 'bottom' ? 'floating-drawer' : 'right-sidebar',
  };
}

export function getAppearanceStyleVariables(settings: AppVisualSettings): Record<string, string> {
  return {
    '--primary-rgb': ACCENT_RGB[settings.accentColor],
    '--on-primary': settings.accentColor === 'amber' ? '#111827' : '#ffffff',
    '--card-radius': settings.cardStyle === 'rounded' ? '0.5rem' : '0rem',
    '--layout-spacing': settings.density === 'compact' ? '0.5rem' : '1rem',
    '--control-height': settings.density === 'compact' ? '2.5rem' : '2.75rem',
    '--page-padding': settings.density === 'compact' ? '1rem' : '1.5rem',
    '--section-gap': settings.density === 'compact' ? '0.75rem' : '1.5rem',
  };
}

export function appearanceSettingsEqual(left: AppVisualSettings, right: AppVisualSettings): boolean {
  return Object.keys(left).every(
    (key) => left[key as keyof AppVisualSettings] === right[key as keyof AppVisualSettings]
  );
}

export function validateAppearanceSettingsPatch(data: Record<string, unknown>): string | null {
  for (const [field, allowed] of Object.entries(ALLOWED_VALUES)) {
    const value = data[field];
    if (value !== undefined && (typeof value !== 'string' || !(allowed as readonly string[]).includes(value))) {
      return `${field} must be one of: ${allowed.join(', ')}`;
    }
  }
  return null;
}
