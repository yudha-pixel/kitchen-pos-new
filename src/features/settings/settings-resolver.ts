export type ColorMode = 'light' | 'dark';
export type AccentColor = 'violet' | 'blue' | 'emerald' | 'amber';
export type Density = 'comfortable' | 'compact';
export type CardViewMode = 'card' | 'list';
export type CartPlacement = 'right' | 'bottom';
export type ReceiptIdentity = 'outlet' | 'organization';

export type SettingSource = 'organization' | 'outlet' | 'user';

export interface AppVisualSettings {
  colorMode: ColorMode;
  accentColor: AccentColor;
  density: Density;
  cardViewMode: CardViewMode;
  cartPlacement: CartPlacement;
  receiptIdentity: ReceiptIdentity;
}

export interface ResolvedSettingItem<T> {
  value: T;
  source: SettingSource;
  inheritedValue: T | null;
  isOverridden: boolean;
}

export type ResolvedAppSettings = {
  [K in keyof AppVisualSettings]: ResolvedSettingItem<AppVisualSettings[K]>;
};

export const DEFAULT_ORG_SETTINGS: AppVisualSettings = {
  colorMode: 'light',
  accentColor: 'violet',
  density: 'comfortable',
  cardViewMode: 'card',
  cartPlacement: 'right',
  receiptIdentity: 'organization',
};

export function resolveEffectiveSettings(
  orgDefaults: Partial<AppVisualSettings> = {},
  outletOverrides: Partial<AppVisualSettings> = {},
  userPreferences: Partial<AppVisualSettings> = {}
): ResolvedAppSettings {
  const keys: (keyof AppVisualSettings)[] = [
    'colorMode',
    'accentColor',
    'density',
    'cardViewMode',
    'cartPlacement',
    'receiptIdentity',
  ];

  const result = {} as ResolvedAppSettings;

  for (const key of keys) {
    const orgValue = orgDefaults[key] ?? DEFAULT_ORG_SETTINGS[key];
    const outletValue = outletOverrides[key];
    const userValue = userPreferences[key];

    let effectiveValue = orgValue;
    let source: SettingSource = 'organization';
    let inheritedValue: AppVisualSettings[typeof key] | null = null;
    let isOverridden = false;

    if (userValue !== undefined && userValue !== null) {
      effectiveValue = userValue;
      source = 'user';
      inheritedValue = outletValue !== undefined && outletValue !== null ? outletValue : orgValue;
      isOverridden = true;
    } else if (outletValue !== undefined && outletValue !== null) {
      effectiveValue = outletValue;
      source = 'outlet';
      inheritedValue = orgValue;
      isOverridden = true;
    } else {
      effectiveValue = orgValue;
      source = 'organization';
      inheritedValue = null;
      isOverridden = false;
    }

    (result as any)[key] = {
      value: effectiveValue,
      source,
      inheritedValue,
      isOverridden,
    };
  }

  return result;
}

export function getSourceLabel(source: SettingSource, outletName?: string): string {
  switch (source) {
    case 'organization':
      return 'Inherited from organization';
    case 'outlet':
      return outletName ? `Override for ${outletName}` : 'Override for outlet';
    case 'user':
      return 'User / device preference';
  }
}
