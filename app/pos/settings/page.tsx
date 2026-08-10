'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sun,
  Moon,
  Palette,
  Maximize2,
  Minimize2,
  LayoutGrid,
  List,
  Sidebar as SidebarIcon,
  PanelBottom,
  Building2,
  Store,
  Monitor,
  Smartphone,
  Users,
  Settings as SettingsIcon,
  HelpCircle,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  X,
  ShoppingCart,
  Plus,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

import {
  AppVisualSettings,
  ColorMode,
  AccentColor,
  Density,
  CardViewMode,
  CartPlacement,
  ReceiptIdentity,
  resolveEffectiveSettings,
  getSourceLabel,
  DEFAULT_ORG_SETTINGS,
} from '@/src/features/settings/settings-resolver';
import { useToast } from '@/src/components/ui/Toast';

const MODULE_SETTINGS_LINKS = [
  { id: 'org', label: 'Organization', description: 'Global defaults & policy', icon: Building2, active: false },
  { id: 'outlets', label: 'Outlets', description: 'Outlet configuration', icon: Store, active: false },
  { id: 'stations', label: 'Kitchen Stations', description: 'Stations & printers', icon: Monitor, active: false },
  { id: 'terminals', label: 'POS Terminals', description: 'Devices & sessions', icon: Smartphone, active: false },
  { id: 'users', label: 'Users & Devices', description: 'Access & preferences', icon: Users, active: false },
  { id: 'appearance', label: 'Appearance', description: 'Theme & visual settings', icon: Palette, active: true },
  { id: 'integrations', label: 'Integrations', description: 'Third-party & APIs', icon: SettingsIcon, active: false },
];

export default function AppearanceSettingsPage() {
  const { toast } = useToast();

  // Layered settings state
  const [orgSettings] = useState<AppVisualSettings>(DEFAULT_ORG_SETTINGS);
  const [outletOverrides, setOutletOverrides] = useState<Partial<AppVisualSettings>>({
    accentColor: 'violet',
    cardViewMode: 'card',
    cartPlacement: 'right',
  });
  const [userPreferences, setUserPreferences] = useState<Partial<AppVisualSettings>>({});

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
    await new Promise((res) => setTimeout(res, 600));
    setSaving(false);
    setShowConfirmModal(false);
    toast('success', 'Pengaturan tampilan berhasil disimpan.');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Left Sub-Navigation Rail */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <Link href="/apps" className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-violet-600">
            <LayoutGrid className="h-4 w-4 text-violet-600" />
            <span>Kitchen POS</span>
          </Link>
        </div>

        <div className="p-3">
          <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            MODULE SETTINGS
          </span>
          <nav className="mt-2 space-y-1">
            {MODULE_SETTINGS_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <div
                  key={link.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
                    link.active
                      ? 'bg-violet-50 text-violet-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${link.active ? 'text-violet-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="block text-xs">{link.label}</span>
                    <span className="block text-[10px] font-normal text-slate-400">{link.description}</span>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <span>Need help? View documentation</span>
        </div>
      </aside>

      {/* Center Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 bg-slate-50/70">
        <div className="max-w-4xl mx-auto w-full">
          {/* Header Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appearance & Theme</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage visual settings for POS and ERP across your organization.
            </p>
          </div>

          {/* Precedence Banner (Matching Wireframe 03) */}
          <div className="mb-6 rounded-xl border border-violet-200 bg-violet-50/60 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-violet-900">
                  Organization default &rarr; Outlet override &rarr; User / device preference
                </span>
                <p className="text-xs text-violet-700">
                  Settings follow this precedence. Lower levels can override higher levels.
                </p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 shadow-2xs hover:bg-violet-50">
              <span>Learn more</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          {/* Visual Settings Rows (Matching Wireframe 03) */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Visual Settings</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Row 1: Color mode */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Sun className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Color mode</span>
                    <span className="text-xs text-slate-500">Choose light or dark mode</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={resolved.colorMode.value}
                    onChange={(e) => handleUpdateOutletOverride('colorMode', e.target.value as ColorMode)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-violet-500 focus:bg-white focus:outline-hidden"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>

                  <div className="text-right">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      resolved.colorMode.source === 'outlet'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {resolved.colorMode.source === 'outlet' ? 'Outlet' : 'Organization'}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {getSourceLabel(resolved.colorMode.source, 'Outlet Pusat')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleResetToInherited('colorMode')}
                    disabled={!resolved.colorMode.isOverridden}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Reset to inherited
                  </button>
                </div>
              </div>

              {/* Row 2: Accent color */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Palette className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Accent color</span>
                    <span className="text-xs text-slate-500">Primary brand accent</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-violet-600 inline-block" />
                    <select
                      value={resolved.accentColor.value}
                      onChange={(e) => handleUpdateOutletOverride('accentColor', e.target.value as AccentColor)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-violet-500 focus:bg-white focus:outline-hidden"
                    >
                      <option value="violet">Violet</option>
                      <option value="blue">Blue</option>
                      <option value="emerald">Emerald</option>
                      <option value="amber">Amber</option>
                    </select>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      resolved.accentColor.source === 'outlet'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {resolved.accentColor.source === 'outlet' ? 'Outlet' : 'Organization'}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {getSourceLabel(resolved.accentColor.source, 'Outlet Pusat')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleResetToInherited('accentColor')}
                    disabled={!resolved.accentColor.isOverridden}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Reset to inherited
                  </button>
                </div>
              </div>

              {/* Row 3: Density */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Maximize2 className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Density</span>
                    <span className="text-xs text-slate-500">Adjust interface density</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={resolved.density.value}
                    onChange={(e) => handleUpdateOutletOverride('density', e.target.value as Density)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-violet-500 focus:bg-white focus:outline-hidden"
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                  </select>

                  <div className="text-right">
                    <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-800">
                      Organization
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {getSourceLabel(resolved.density.source)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleResetToInherited('density')}
                    disabled={!resolved.density.isOverridden}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Reset to inherited
                  </button>
                </div>
              </div>

              {/* Row 4: Card / list view */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <LayoutGrid className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Card / list view</span>
                    <span className="text-xs text-slate-500">Default view for lists</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                    <button
                      onClick={() => handleUpdateOutletOverride('cardViewMode', 'card')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        resolved.cardViewMode.value === 'card'
                          ? 'bg-white text-violet-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span>Card</span>
                    </button>
                    <button
                      onClick={() => handleUpdateOutletOverride('cardViewMode', 'list')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        resolved.cardViewMode.value === 'list'
                          ? 'bg-white text-violet-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <List className="h-3.5 w-3.5" />
                      <span>List</span>
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                      Outlet
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {getSourceLabel(resolved.cardViewMode.source, 'Outlet Pusat')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleResetToInherited('cardViewMode')}
                    disabled={!resolved.cardViewMode.isOverridden}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Reset to inherited
                  </button>
                </div>
              </div>

              {/* Row 5: Cart placement */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShoppingCart className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Cart placement</span>
                    <span className="text-xs text-slate-500">Select cart position</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={resolved.cartPlacement.value}
                    onChange={(e) => handleUpdateOutletOverride('cartPlacement', e.target.value as CartPlacement)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-violet-500 focus:bg-white focus:outline-hidden"
                  >
                    <option value="right">Right side</option>
                    <option value="bottom">Bottom drawer</option>
                  </select>

                  <div className="text-right">
                    <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                      Outlet
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {getSourceLabel(resolved.cartPlacement.source, 'Outlet Pusat')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleResetToInherited('cartPlacement')}
                    disabled={!resolved.cartPlacement.isOverridden}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Reset to inherited
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right Live Preview Panel (Matching Wireframe 03) */}
      <aside className="w-96 border-l border-slate-200 bg-white p-6 flex flex-col justify-between overflow-y-auto shrink-0">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Preview</h3>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
              <button
                onClick={() => setPreviewTab('pos')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  previewTab === 'pos' ? 'bg-white text-violet-700 shadow-2xs font-semibold' : 'text-slate-500'
                }`}
              >
                POS Preview
              </button>
              <button
                onClick={() => setPreviewTab('erp')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  previewTab === 'erp' ? 'bg-white text-violet-700 shadow-2xs font-semibold' : 'text-slate-500'
                }`}
              >
                ERP Preview
              </button>
            </div>
          </div>

          {/* Simulated POS / ERP Live Screen Mockup */}
          {previewTab === 'pos' ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs">
              <div className="bg-violet-700 p-3 text-white flex items-center justify-between">
                <span className="font-bold text-xs">Kitchen POS</span>
                <span className="text-[10px] bg-violet-800 px-1.5 py-0.5 rounded-full">2</span>
              </div>
              <div className="p-3 bg-white border-b border-slate-100 flex gap-2 text-[11px] font-medium text-slate-500">
                <span className="text-violet-700 border-b-2 border-violet-700 pb-0.5">Dine In</span>
                <span>Take Away</span>
                <span>Delivery</span>
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-500 text-[10px]">
                  <span>Table 12</span>
                  <span>Add Customer +</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg flex justify-between items-center border border-slate-100">
                  <span>Nasi Goreng Kampung</span>
                  <span className="font-semibold text-slate-800">Rp 38.000</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg flex justify-between items-center border border-slate-100">
                  <span>Es Jeruk</span>
                  <span className="font-semibold text-slate-800">Rp 12.000</span>
                </div>
                <div className="pt-2 flex justify-between font-bold text-xs text-slate-900">
                  <span>Subtotal</span>
                  <span>Rp 50.000</span>
                </div>
                <button className="w-full bg-violet-700 text-white py-2 rounded-lg text-xs font-semibold hover:bg-violet-800">
                  Checkout (2 items)
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <span className="text-xs font-bold text-slate-800">Dashboard Stats</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Sales</span>
                  <span className="font-bold text-slate-900">Rp 125M</span>
                  <span className="text-[10px] text-emerald-600 block mt-1">+12.5%</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Orders</span>
                  <span className="font-bold text-slate-900">1.250</span>
                  <span className="text-[10px] text-emerald-600 block mt-1">+8.1%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-6 border-t border-slate-200">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex-1 rounded-xl bg-violet-700 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-violet-800 transition-colors"
          >
            Save changes
          </button>
        </div>
      </aside>

      {/* Application-Owned Confirmation Modal (Matching Wireframe 03) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">Apply appearance changes?</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  You are about to save appearance settings for <strong className="text-slate-800">Outlet Pusat</strong>. These changes will override organization defaults for this outlet and apply to all POS terminals in this outlet.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={saving}
                className="rounded-xl bg-violet-700 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
