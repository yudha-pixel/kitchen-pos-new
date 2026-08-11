'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Sun,
  Palette,
  Maximize2,
  LayoutGrid,
  List,
  HelpCircle,
  ExternalLink,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';

import {
  AppVisualSettings,
  ColorMode,
  AccentColor,
  Density,
  CartPlacement,
  resolveEffectiveSettings,
  getSourceLabel,
  DEFAULT_ORG_SETTINGS,
} from '@/src/features/settings/settings-resolver';
import { useToast } from '@/src/components/ui/Toast';
import { useTheme } from '@/src/context/ThemeContext';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';

// Maps the DB's AppSettings shape (server/routes/settings.ts) onto the
// visual-settings shape this page's precedence UI works with. The two use
// slightly different value vocabularies (e.g. 'spacious' vs 'comfortable'),
// so values outside what AppVisualSettings supports collapse to a default.
function settingsToVisual(settings: {
  primary_color: string;
  theme_mode: string;
  layout_density: string;
  card_view: string;
  cart_position: string;
}): AppVisualSettings {
  const accentColor: AccentColor = (['violet', 'blue', 'emerald', 'amber'] as const).includes(
    settings.primary_color as AccentColor
  )
    ? (settings.primary_color as AccentColor)
    : 'blue';
  return {
    colorMode: settings.theme_mode === 'dark' ? 'dark' : 'light',
    accentColor,
    density: settings.layout_density === 'compact' ? 'compact' : 'comfortable',
    cardViewMode: settings.card_view === 'list' ? 'list' : 'card',
    cartPlacement: settings.cart_position === 'floating-drawer' ? 'bottom' : 'right',
    receiptIdentity: DEFAULT_ORG_SETTINGS.receiptIdentity,
  };
}

function visualToSettingsPatch(v: AppVisualSettings) {
  return {
    primary_color: v.accentColor,
    theme_mode: v.colorMode,
    layout_density: v.density === 'compact' ? 'compact' : 'spacious',
    card_view: v.cardViewMode === 'list' ? 'list' : 'grid',
    cart_position: v.cartPlacement === 'bottom' ? 'floating-drawer' : 'right-sidebar',
  };
}

export default function AppearanceSettingsPage() {
  const { toast } = useToast();
  const { settings, refreshSettings } = useTheme();

  // Organization baseline mirrors the real, currently-saved app settings.
  const [orgSettings, setOrgSettings] = useState<AppVisualSettings>(DEFAULT_ORG_SETTINGS);
  const [outletOverrides, setOutletOverrides] = useState<Partial<AppVisualSettings>>({});
  const [userPreferences, setUserPreferences] = useState<Partial<AppVisualSettings>>({});

  useEffect(() => {
    if (settings) {
      setOrgSettings(settingsToVisual(settings));
    }
  }, [settings]);

  const [previewTab, setPreviewTab] = useState<'pos' | 'erp'>('pos');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Effective resolved settings
  const resolved = useMemo(
    () => resolveEffectiveSettings(orgSettings, outletOverrides, userPreferences),
    [orgSettings, outletOverrides, userPreferences]
  );

  const handleUpdateOutletOverride = <K extends keyof AppVisualSettings>(key: K, val: AppVisualSettings[K]) => {
    setOutletOverrides((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetToInherited = (key: keyof AppVisualSettings) => {
    setOutletOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setUserPreferences((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    toast('info', `Pengaturan ${key} dikembalikan ke nilai warisan (inherited).`);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(
          visualToSettingsPatch({
            colorMode: resolved.colorMode.value,
            accentColor: resolved.accentColor.value,
            density: resolved.density.value,
            cardViewMode: resolved.cardViewMode.value,
            cartPlacement: resolved.cartPlacement.value,
            receiptIdentity: resolved.receiptIdentity.value,
          })
        ),
      });
      if (!response.ok) throw new Error('Gagal menyimpan pengaturan');
      await refreshSettings();
      setOutletOverrides({});
      setUserPreferences({});
      setShowConfirmModal(false);
      toast('success', 'Pengaturan tampilan berhasil disimpan.');
    } catch {
      toast('error', 'Gagal menyimpan pengaturan tampilan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveShell title="Pengaturan Tampilan">
      <div className="-m-4 flex min-h-[calc(100%+2rem)] w-[calc(100%+2rem)] flex-col sm:-m-6 sm:min-h-[calc(100%+3rem)] sm:w-[calc(100%+3rem)] lg:flex-row">
        {/* Center Main Workspace */}
        <main className="flex-1 min-w-0 overflow-y-auto p-6 sm:p-8">
          <div className="mx-auto w-full max-w-4xl">
            {/* Header Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-ink tracking-tight">Appearance & Theme</h1>
              <p className="mt-1 text-sm text-ink-secondary">
                Manage visual settings for POS and ERP across your organization.
              </p>
            </div>

            {/* Precedence Banner */}
            <div className="mb-6 flex items-center justify-between rounded-xl border border-primary/20 bg-primary-soft p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-ink">
                    Organization default &rarr; Outlet override &rarr; User / device preference
                  </span>
                  <p className="text-xs text-ink-secondary">
                    Settings follow this precedence. Lower levels can override higher levels.
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-xs font-medium text-primary shadow-2xs hover:bg-surface-alt">
                <span>Learn more</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            {/* Visual Settings Rows */}
            <div className="rounded-xl border border-line bg-surface shadow-2xs">
              <div className="border-b border-line p-5">
                <h2 className="text-sm font-semibold text-ink">Visual Settings</h2>
              </div>

              <div className="divide-y divide-line">
                {/* Row 1: Color mode */}
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <Sun className="mt-0.5 h-5 w-5 text-ink-muted" />
                    <div>
                      <span className="block text-xs font-semibold text-ink">Color mode</span>
                      <span className="text-xs text-ink-secondary">Choose light or dark mode</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={resolved.colorMode.value}
                      onChange={(e) => handleUpdateOutletOverride('colorMode', e.target.value as ColorMode)}
                      className="rounded-lg border border-line-strong bg-surface-alt px-3 py-1.5 text-xs font-medium text-ink focus:border-primary focus:bg-surface focus:outline-none"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>

                    <div className="text-right">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          resolved.colorMode.source === 'outlet'
                            ? 'bg-success-soft text-success'
                            : 'bg-info-soft text-info'
                        }`}
                      >
                        {resolved.colorMode.source === 'outlet' ? 'Outlet' : 'Organization'}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-ink-muted">
                        {getSourceLabel(resolved.colorMode.source, 'Outlet Pusat')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleResetToInherited('colorMode')}
                      disabled={!resolved.colorMode.isOverridden}
                      className="rounded-lg border border-line-strong px-2.5 py-1 text-[11px] font-medium text-ink-secondary hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Reset to inherited
                    </button>
                  </div>
                </div>

                {/* Row 2: Accent color */}
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <Palette className="mt-0.5 h-5 w-5 text-ink-muted" />
                    <div>
                      <span className="block text-xs font-semibold text-ink">Accent color</span>
                      <span className="text-xs text-ink-secondary">Primary brand accent</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 rounded-full bg-primary" />
                      <select
                        value={resolved.accentColor.value}
                        onChange={(e) => handleUpdateOutletOverride('accentColor', e.target.value as AccentColor)}
                        className="rounded-lg border border-line-strong bg-surface-alt px-3 py-1.5 text-xs font-medium text-ink focus:border-primary focus:bg-surface focus:outline-none"
                      >
                        <option value="violet">Violet</option>
                        <option value="blue">Blue</option>
                        <option value="emerald">Emerald</option>
                        <option value="amber">Amber</option>
                      </select>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          resolved.accentColor.source === 'outlet'
                            ? 'bg-success-soft text-success'
                            : 'bg-info-soft text-info'
                        }`}
                      >
                        {resolved.accentColor.source === 'outlet' ? 'Outlet' : 'Organization'}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-ink-muted">
                        {getSourceLabel(resolved.accentColor.source, 'Outlet Pusat')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleResetToInherited('accentColor')}
                      disabled={!resolved.accentColor.isOverridden}
                      className="rounded-lg border border-line-strong px-2.5 py-1 text-[11px] font-medium text-ink-secondary hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Reset to inherited
                    </button>
                  </div>
                </div>

                {/* Row 3: Density */}
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <Maximize2 className="mt-0.5 h-5 w-5 text-ink-muted" />
                    <div>
                      <span className="block text-xs font-semibold text-ink">Density</span>
                      <span className="text-xs text-ink-secondary">Adjust interface density</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={resolved.density.value}
                      onChange={(e) => handleUpdateOutletOverride('density', e.target.value as Density)}
                      className="rounded-lg border border-line-strong bg-surface-alt px-3 py-1.5 text-xs font-medium text-ink focus:border-primary focus:bg-surface focus:outline-none"
                    >
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                    </select>

                    <div className="text-right">
                      <span className="inline-block rounded-md bg-info-soft px-2 py-0.5 text-[10px] font-semibold uppercase text-info">
                        {resolved.density.source === 'outlet' ? 'Outlet' : 'Organization'}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-ink-muted">
                        {getSourceLabel(resolved.density.source)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleResetToInherited('density')}
                      disabled={!resolved.density.isOverridden}
                      className="rounded-lg border border-line-strong px-2.5 py-1 text-[11px] font-medium text-ink-secondary hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Reset to inherited
                    </button>
                  </div>
                </div>

                {/* Row 4: Card / list view */}
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <LayoutGrid className="mt-0.5 h-5 w-5 text-ink-muted" />
                    <div>
                      <span className="block text-xs font-semibold text-ink">Card / list view</span>
                      <span className="text-xs text-ink-secondary">Default view for lists</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex rounded-lg border border-line-strong bg-surface-alt p-0.5">
                      <button
                        onClick={() => handleUpdateOutletOverride('cardViewMode', 'card')}
                        className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          resolved.cardViewMode.value === 'card'
                            ? 'bg-surface text-primary shadow-2xs'
                            : 'text-ink-secondary hover:text-ink'
                        }`}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        <span>Card</span>
                      </button>
                      <button
                        onClick={() => handleUpdateOutletOverride('cardViewMode', 'list')}
                        className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          resolved.cardViewMode.value === 'list'
                            ? 'bg-surface text-primary shadow-2xs'
                            : 'text-ink-secondary hover:text-ink'
                        }`}
                      >
                        <List className="h-3.5 w-3.5" />
                        <span>List</span>
                      </button>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          resolved.cardViewMode.source === 'outlet'
                            ? 'bg-success-soft text-success'
                            : 'bg-info-soft text-info'
                        }`}
                      >
                        {resolved.cardViewMode.source === 'outlet' ? 'Outlet' : 'Organization'}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-ink-muted">
                        {getSourceLabel(resolved.cardViewMode.source, 'Outlet Pusat')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleResetToInherited('cardViewMode')}
                      disabled={!resolved.cardViewMode.isOverridden}
                      className="rounded-lg border border-line-strong px-2.5 py-1 text-[11px] font-medium text-ink-secondary hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Reset to inherited
                    </button>
                  </div>
                </div>

                {/* Row 5: Cart placement */}
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <ShoppingCart className="mt-0.5 h-5 w-5 text-ink-muted" />
                    <div>
                      <span className="block text-xs font-semibold text-ink">Cart placement</span>
                      <span className="text-xs text-ink-secondary">Select cart position</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={resolved.cartPlacement.value}
                      onChange={(e) => handleUpdateOutletOverride('cartPlacement', e.target.value as CartPlacement)}
                      className="rounded-lg border border-line-strong bg-surface-alt px-3 py-1.5 text-xs font-medium text-ink focus:border-primary focus:bg-surface focus:outline-none"
                    >
                      <option value="right">Right side</option>
                      <option value="bottom">Bottom drawer</option>
                    </select>

                    <div className="text-right">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          resolved.cartPlacement.source === 'outlet'
                            ? 'bg-success-soft text-success'
                            : 'bg-info-soft text-info'
                        }`}
                      >
                        {resolved.cartPlacement.source === 'outlet' ? 'Outlet' : 'Organization'}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-ink-muted">
                        {getSourceLabel(resolved.cartPlacement.source, 'Outlet Pusat')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleResetToInherited('cartPlacement')}
                      disabled={!resolved.cartPlacement.isOverridden}
                      className="rounded-lg border border-line-strong px-2.5 py-1 text-[11px] font-medium text-ink-secondary hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Reset to inherited
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Live Preview Panel */}
        <aside className="flex w-full shrink-0 flex-col justify-between overflow-y-auto border-line border-t p-6 lg:w-96 lg:border-t-0 lg:border-l">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Preview</h3>
              <div className="flex rounded-lg border border-line-strong bg-surface-alt p-0.5 text-xs font-medium">
                <button
                  onClick={() => setPreviewTab('pos')}
                  className={`rounded-md px-3 py-1 transition-colors ${
                    previewTab === 'pos' ? 'bg-surface font-semibold text-primary shadow-2xs' : 'text-ink-secondary'
                  }`}
                >
                  POS Preview
                </button>
                <button
                  onClick={() => setPreviewTab('erp')}
                  className={`rounded-md px-3 py-1 transition-colors ${
                    previewTab === 'erp' ? 'bg-surface font-semibold text-primary shadow-2xs' : 'text-ink-secondary'
                  }`}
                >
                  ERP Preview
                </button>
              </div>
            </div>

            {/* Simulated POS / ERP Live Screen Mockup */}
            {previewTab === 'pos' ? (
              <div className="overflow-hidden rounded-xl border border-line bg-surface-alt shadow-xs">
                <div className="flex items-center justify-between bg-primary p-3 text-on-primary">
                  <span className="text-xs font-bold">Kitchen POS</span>
                  <span className="rounded-full bg-primary-hover px-1.5 py-0.5 text-[10px]">2</span>
                </div>
                <div className="flex gap-2 border-b border-line bg-surface p-3 text-[11px] font-medium text-ink-secondary">
                  <span className="border-b-2 border-primary pb-0.5 text-primary">Dine In</span>
                  <span>Take Away</span>
                  <span>Delivery</span>
                </div>
                <div className="space-y-2 p-3 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-ink-secondary">
                    <span>Table 12</span>
                    <span>Add Customer +</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-line bg-surface p-2">
                    <span>Nasi Goreng Kampung</span>
                    <span className="font-semibold text-ink">Rp 38.000</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-line bg-surface p-2">
                    <span>Es Jeruk</span>
                    <span className="font-semibold text-ink">Rp 12.000</span>
                  </div>
                  <div className="flex justify-between pt-2 text-xs font-bold text-ink">
                    <span>Subtotal</span>
                    <span>Rp 50.000</span>
                  </div>
                  <button className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-on-primary hover:bg-primary-hover">
                    Checkout (2 items)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-line bg-surface-alt p-4">
                <span className="text-xs font-bold text-ink">Dashboard Stats</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-line bg-surface p-3">
                    <span className="block text-[10px] text-ink-muted">Sales</span>
                    <span className="font-bold text-ink">Rp 125M</span>
                    <span className="mt-1 block text-[10px] text-success">+12.5%</span>
                  </div>
                  <div className="rounded-lg border border-line bg-surface p-3">
                    <span className="block text-[10px] text-ink-muted">Orders</span>
                    <span className="font-bold text-ink">1.250</span>
                    <span className="mt-1 block text-[10px] text-success">+8.1%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2 border-line border-t pt-6">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary-hover"
            >
              Save changes
            </button>
          </div>
        </aside>
      </div>

      {/* Application-Owned Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-ink">Apply appearance changes?</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
                  You are about to save these appearance settings. They will apply across the app until changed
                  again.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-line-strong px-4 py-2 text-xs font-semibold text-ink-secondary hover:bg-surface-alt"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={saving}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ResponsiveShell>
  );
}
