'use client';

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Check,
  LayoutGrid,
  List,
  Maximize2,
  Palette,
  ShoppingCart,
  Sparkles,
  Sun,
} from 'lucide-react';

import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { useToast } from '@/src/components/ui/Toast';
import { useTheme } from '@/src/context/ThemeContext';
import { API_BASE_URL } from '@/src/config/runtime';
import {
  ACCENT_RGB,
  appearanceSettingsEqual,
  type AccentColor,
  type AppVisualSettings,
  type CardViewMode,
  type CartPlacement,
  type ColorMode,
  type Density,
  getAppearanceStyleVariables,
  normalizeAppearanceSettings,
  toAppearanceSettingsPatch,
} from '@/src/features/settings/settings-resolver';
import { getToken } from '@/src/lib/api';

type PreviewTab = 'pos' | 'erp';
type PreviewStyle = CSSProperties & Record<`--${string}`, string>;

const ACCENT_OPTIONS: Array<{ value: AccentColor; label: string }> = [
  { value: 'violet', label: 'Violet' },
  { value: 'blue', label: 'Blue' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'amber', label: 'Amber' },
  { value: 'rose', label: 'Rose' },
  { value: 'slate', label: 'Slate' },
];

interface SettingRowProps {
  icon: ReactNode;
  label: string;
  description: string;
  children: ReactNode;
}

function SettingRow({ icon, label, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 text-ink-muted" aria-hidden="true">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-ink">{label}</p>
          <p className="text-pretty text-xs text-ink-secondary">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">{children}</div>
    </div>
  );
}

function OrganizationBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-info-soft px-2 py-1 text-[11px] font-semibold text-info">
      <Check className="size-3" aria-hidden="true" />
      Organization
    </span>
  );
}

export default function AppearanceSettingsPage() {
  const { toast } = useToast();
  const { settings, loading, refreshSettings } = useTheme();
  const savedSettings = useMemo(() => normalizeAppearanceSettings(settings), [settings]);
  const [draftOverride, setDraftOverride] = useState<AppVisualSettings | null>(null);
  const [previewTab, setPreviewTab] = useState<PreviewTab>('pos');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const draft = draftOverride ?? savedSettings;
  const isDirty = !appearanceSettingsEqual(draft, savedSettings);
  const previewStyle = getAppearanceStyleVariables(draft) as PreviewStyle;

  const updateDraft = <K extends keyof AppVisualSettings>(key: K, value: AppVisualSettings[K]) => {
    setDraftOverride((current) => ({ ...(current ?? savedSettings), [key]: value }));
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
        body: JSON.stringify(toAppearanceSettingsPatch(draft)),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Gagal menyimpan pengaturan');
      }
      await refreshSettings();
      setDraftOverride(null);
      setShowConfirmDialog(false);
      toast('success', 'Pengaturan tampilan organisasi berhasil disimpan.');
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Gagal menyimpan pengaturan tampilan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveShell title="Pengaturan Tampilan">
      <div className="flex min-h-full flex-col gap-6 xl:flex-row">
        <section className="min-w-0 flex-1" aria-labelledby="appearance-page-heading">
          <div className="mx-auto w-full max-w-4xl">
            <header className="mb-6">
              <h1 id="appearance-page-heading" className="text-balance text-2xl font-bold text-ink">Appearance &amp; Theme</h1>
              <p className="mt-1 text-pretty text-sm text-ink-secondary">
                Atur tampilan organisasi untuk seluruh aplikasi POS dan ERP.
              </p>
            </header>

            <section className="appearance-card mb-6 flex items-start gap-3 border border-primary/20 bg-primary-soft p-4">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-ink">Organization appearance</h2>
                <p className="text-pretty text-xs text-ink-secondary">
                  Changes in this form affect only the preview until you save. Saved color, theme, and density apply across the application.
                </p>
              </div>
            </section>

            <section className="appearance-card overflow-hidden border border-line bg-surface shadow-xs" aria-labelledby="visual-settings-heading">
              <div className="border-b border-line p-5">
                <h2 id="visual-settings-heading" className="text-sm font-semibold text-ink">Visual settings</h2>
              </div>

              <div className="divide-y divide-line">
                <SettingRow icon={<Sun className="size-5" />} label="Color mode" description="Choose light or dark mode for the application.">
                  <label className="sr-only" htmlFor="appearance-color-mode">Color mode</label>
                  <select
                    id="appearance-color-mode"
                    value={draft.colorMode}
                    onChange={(event) => updateDraft('colorMode', event.target.value as ColorMode)}
                    className="appearance-card appearance-control border border-line-strong bg-surface-alt px-3 text-sm font-medium text-ink focus:border-primary focus:outline-none"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                  <OrganizationBadge />
                </SettingRow>

                <SettingRow icon={<Palette className="size-5" />} label="Accent color" description="Set the primary brand color for actions and active states.">
                  <span
                    className="size-4 rounded-full border border-line"
                    style={{ backgroundColor: `rgb(${ACCENT_RGB[draft.accentColor]})` }}
                    aria-hidden="true"
                  />
                  <label className="sr-only" htmlFor="appearance-accent-color">Accent color</label>
                  <select
                    id="appearance-accent-color"
                    value={draft.accentColor}
                    onChange={(event) => updateDraft('accentColor', event.target.value as AccentColor)}
                    className="appearance-card appearance-control border border-line-strong bg-surface-alt px-3 text-sm font-medium text-ink focus:border-primary focus:outline-none"
                  >
                    {ACCENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <OrganizationBadge />
                </SettingRow>

                <SettingRow icon={<Maximize2 className="size-5" />} label="Density" description="Adjust shared page spacing and control density.">
                  <label className="sr-only" htmlFor="appearance-density">Interface density</label>
                  <select
                    id="appearance-density"
                    value={draft.density}
                    onChange={(event) => updateDraft('density', event.target.value as Density)}
                    className="appearance-card appearance-control border border-line-strong bg-surface-alt px-3 text-sm font-medium text-ink focus:border-primary focus:outline-none"
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                  </select>
                  <OrganizationBadge />
                </SettingRow>

                <SettingRow icon={<LayoutGrid className="size-5" />} label="Card / list view" description="Choose the default product presentation on the POS screen.">
                  <div className="appearance-card flex border border-line-strong bg-surface-alt p-1" role="group" aria-label="POS product view">
                    {([
                      ['card', 'Card', LayoutGrid],
                      ['list', 'List', List],
                      ['minimalist', 'Minimal', Sparkles],
                    ] as const).map(([value, label, Icon]) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={draft.cardViewMode === value}
                        onClick={() => updateDraft('cardViewMode', value as CardViewMode)}
                        className={`appearance-card flex min-h-11 items-center gap-1.5 px-3 text-xs font-medium transition-colors ${
                          draft.cardViewMode === value
                            ? 'bg-surface text-primary shadow-xs'
                            : 'text-ink-secondary hover:text-ink'
                        }`}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <OrganizationBadge />
                </SettingRow>

                <SettingRow icon={<ShoppingCart className="size-5" />} label="Cart placement" description="Choose the cart position on the POS screen.">
                  <label className="sr-only" htmlFor="appearance-cart-placement">POS cart placement</label>
                  <select
                    id="appearance-cart-placement"
                    value={draft.cartPlacement}
                    onChange={(event) => updateDraft('cartPlacement', event.target.value as CartPlacement)}
                    className="appearance-card appearance-control border border-line-strong bg-surface-alt px-3 text-sm font-medium text-ink focus:border-primary focus:outline-none"
                  >
                    <option value="right">Right side</option>
                    <option value="bottom">Bottom drawer</option>
                  </select>
                  <OrganizationBadge />
                </SettingRow>
              </div>
            </section>
          </div>
        </section>

        <aside className="appearance-card w-full shrink-0 border border-line bg-surface p-5 xl:sticky xl:top-0 xl:w-96 xl:self-start" aria-labelledby="appearance-preview-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="appearance-preview-heading" className="text-sm font-semibold text-ink">Draft preview</h2>
            <div className="appearance-card flex border border-line-strong bg-surface-alt p-1" role="tablist" aria-label="Appearance preview type">
              {(['pos', 'erp'] as const).map((tab) => (
                <button
                  key={tab}
                  id={`preview-tab-${tab}`}
                  type="button"
                  role="tab"
                  aria-selected={previewTab === tab}
                  aria-controls={`preview-panel-${tab}`}
                  onClick={() => setPreviewTab(tab)}
                  className={`appearance-card min-h-11 px-3 text-xs font-medium transition-colors ${
                    previewTab === tab ? 'bg-surface text-primary shadow-xs' : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div
            className="appearance-preview appearance-card overflow-hidden border border-line bg-surface-alt text-ink"
            data-color-mode={draft.colorMode}
            data-density={draft.density}
            data-card-style={draft.cardStyle}
            style={previewStyle}
          >
            <div
              id="preview-panel-pos"
              role="tabpanel"
              aria-labelledby="preview-tab-pos"
              hidden={previewTab !== 'pos'}
              className="p-[var(--layout-spacing)]"
            >
                <div className="appearance-card mb-[var(--layout-spacing)] flex items-center justify-between bg-primary p-3 text-on-primary">
                  <span className="text-xs font-bold">Kitchen POS</span>
                  <span className="rounded-full bg-primary-hover px-2 py-0.5 text-[10px] tabular-nums">2</span>
                </div>
                <div className={draft.cartPlacement === 'right' ? 'grid grid-cols-[1fr_7rem] gap-[var(--layout-spacing)]' : 'space-y-[var(--layout-spacing)]'}>
                  <div className={draft.cardViewMode === 'card' ? 'grid grid-cols-2 gap-[var(--layout-spacing)]' : 'space-y-[var(--layout-spacing)]'}>
                    {['Nasi Goreng', 'Es Jeruk'].map((item, index) => (
                      <div key={item} className="appearance-card border border-line bg-surface p-[var(--layout-spacing)]">
                        {draft.cardViewMode !== 'minimalist' && <div className="mb-2 h-8 rounded bg-primary-soft" />}
                        <p className="text-[11px] font-medium text-ink">{item}</p>
                        <p className="mt-1 text-[10px] font-semibold text-primary tabular-nums">Rp {index === 0 ? '38.000' : '12.000'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="appearance-card border border-line bg-surface p-[var(--layout-spacing)]">
                    <p className="text-[10px] text-ink-secondary">Subtotal</p>
                    <p className="mt-1 text-xs font-bold text-ink tabular-nums">Rp 50.000</p>
                    <button type="button" className="appearance-card mt-3 min-h-11 w-full bg-primary px-2 text-[10px] font-semibold text-on-primary">
                      Checkout
                    </button>
                  </div>
                </div>
            </div>
            <div
              id="preview-panel-erp"
              role="tabpanel"
              aria-labelledby="preview-tab-erp"
              hidden={previewTab !== 'erp'}
              className="space-y-[var(--layout-spacing)] p-[var(--layout-spacing)]"
            >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">Dashboard stats</span>
                  <span className="appearance-card bg-primary-soft px-2 py-1 text-[10px] font-semibold text-primary">Today</span>
                </div>
                <div className="grid grid-cols-2 gap-[var(--layout-spacing)]">
                  {[
                    ['Sales', 'Rp 125M'],
                    ['Orders', '1.250'],
                  ].map(([label, value]) => (
                    <div key={label} className="appearance-card border border-line bg-surface p-[var(--layout-spacing)]">
                      <span className="block text-[10px] text-ink-muted">{label}</span>
                      <span className="font-bold text-ink tabular-nums">{value}</span>
                      <span className="mt-1 block text-[10px] text-success">+12.5%</span>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={loading || !isDirty || saving}
              onClick={() => setDraftOverride(null)}
            >
              Discard draft
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={loading || !isDirty}
              onClick={() => setShowConfirmDialog(true)}
            >
              Save changes
            </Button>
          </div>
          <p className="mt-2 text-pretty text-xs text-ink-muted" role="status" aria-live="polite">
            {loading ? 'Loading saved appearance…' : isDirty ? 'Draft changes are not applied yet.' : 'Appearance is up to date.'}
          </p>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Apply organization appearance?"
        message="These settings will become the saved appearance for POS and ERP users across the organization."
        confirmLabel="Save changes"
        cancelLabel="Cancel"
        loading={saving}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </ResponsiveShell>
  );
}
