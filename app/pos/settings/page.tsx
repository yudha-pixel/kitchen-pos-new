'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Palette, Sun, Moon, Square, Circle, LayoutGrid, List, Minimize2, Maximize2, Sidebar, PanelBottom } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import { useTheme } from '@/src/context/ThemeContext';

const colorOptions = [
  { value: 'blue', label: 'Blue', color: 'bg-blue-600', rgb: '59 130 246' },
  { value: 'emerald', label: 'Emerald', color: 'bg-emerald-600', rgb: '16 185 129' },
  { value: 'violet', label: 'Violet', color: 'bg-violet-600', rgb: '139 92 246' },
  { value: 'amber', label: 'Amber', color: 'bg-amber-600', rgb: '245 158 11' },
  { value: 'rose', label: 'Rose', color: 'bg-rose-600', rgb: '244 63 94' },
  { value: 'slate', label: 'Slate', color: 'bg-slate-600', rgb: '71 85 105' },
];

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

const cardStyleOptions = [
  { value: 'rounded', label: 'Rounded', icon: Circle },
  { value: 'sharp', label: 'Sharp', icon: Square },
];

const layoutDensityOptions = [
  { value: 'compact', label: 'Compact', icon: Minimize2 },
  { value: 'spacious', label: 'Spacious', icon: Maximize2 },
];

const cardViewOptions = [
  { value: 'grid', label: 'Grid', icon: LayoutGrid },
  { value: 'list', label: 'List', icon: List },
  { value: 'minimalist', label: 'Minimalist', icon: Minimize2 },
];

const cartPositionOptions = [
  { value: 'right-sidebar', label: 'Right Sidebar', icon: Sidebar },
  { value: 'floating-drawer', label: 'Floating Drawer', icon: PanelBottom },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const { settings, loading, refreshSettings, forceApplyTheme } = useTheme();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    if (!localSettings) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localSettings),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setLocalSettings(updatedSettings);
        await refreshSettings();
        // Force apply theme immediately after save
        setTimeout(() => forceApplyTheme(), 100);
        toast('success', 'Pengaturan berhasil disimpan');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast('error', 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !localSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Tampilan</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 mb-6">
            Atur style desain visual untuk tampilan aplikasi POS dan Self-Order.
          </p>

          {settings && (
            <div className="space-y-8">
              {/* Primary Color Selection */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Warna Tema Utama</h3>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLocalSettings({ ...localSettings, primary_color: option.value })}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        localSettings.primary_color === option.value
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${option.color} mx-auto mb-2`} />
                      <span className="text-sm text-gray-700">{option.label}</span>
                      {localSettings.primary_color === option.value && (
                        <div className="absolute top-2 right-2">
                          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Mode Selection */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Mode Tema</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setLocalSettings({ ...localSettings, theme_mode: option.value })}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          localSettings.theme_mode === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-700">{option.label}</span>
                        {localSettings.theme_mode === option.value && (
                          <div className="ml-auto">
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Style Selection */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Circle className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Style Kartu Menu</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {cardStyleOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setLocalSettings({ ...localSettings, card_style: option.value })}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          localSettings.card_style === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-700">{option.label}</span>
                        {localSettings.card_style === option.value && (
                          <div className="ml-auto">
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout Density Selection */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Maximize2 className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Kepadatan Tampilan</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {layoutDensityOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setLocalSettings({ ...localSettings, layout_density: option.value })}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          localSettings.layout_density === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-700">{option.label}</span>
                        {localSettings.layout_density === option.value && (
                          <div className="ml-auto">
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card View Selection */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <LayoutGrid className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Gaya Tampilan Menu</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {cardViewOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setLocalSettings({ ...localSettings, card_view: option.value })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          localSettings.card_view === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-700 text-sm">{option.label}</span>
                        {localSettings.card_view === option.value && (
                          <div className="mt-1">
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cart Position Selection */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sidebar className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Posisi Keranjang Belanja</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {cartPositionOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setLocalSettings({ ...localSettings, cart_position: option.value })}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          localSettings.cart_position === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-700">{option.label}</span>
                        {localSettings.cart_position === option.value && (
                          <div className="ml-auto">
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Section */}
              <div className="border-t pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Pratinjau Tampilan</h3>
                </div>
                <div
                  className={`p-6 border-2 border-dashed border-gray-300 ${localSettings.theme_mode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}
                  style={{
                    borderRadius: localSettings.card_style === 'rounded' ? '0.5rem' : '0',
                  }}
                >
                  <div className="space-y-4">
                    {/* Preview Header */}
                    <div
                      className="p-4 text-white"
                      style={{
                        backgroundColor: `rgb(${colorOptions.find(c => c.value === localSettings.primary_color)?.rgb || '59 130 246'})`,
                        borderRadius: localSettings.card_style === 'rounded' ? '0.5rem' : '0',
                      }}
                    >
                      <div className="font-bold text-lg">Kitchen POS</div>
                      <div className="text-sm opacity-90">Menu Preview</div>
                    </div>

                    {/* Preview Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`p-4 border ${localSettings.theme_mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                        style={{
                          borderRadius: localSettings.card_style === 'rounded' ? '0.5rem' : '0',
                        }}
                      >
                        <div className="w-full h-16 mb-2 bg-gray-200" style={{ borderRadius: localSettings.card_style === 'rounded' ? '0.25rem' : '0' }}></div>
                        <div className="font-medium">Nasi Goreng</div>
                        <div className="text-sm opacity-70">Rp 25.000</div>
                      </div>
                      <div
                        className={`p-4 border ${localSettings.theme_mode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                        style={{
                          borderRadius: localSettings.card_style === 'rounded' ? '0.5rem' : '0',
                        }}
                      >
                        <div className="w-full h-16 mb-2 bg-gray-200" style={{ borderRadius: localSettings.card_style === 'rounded' ? '0.25rem' : '0' }}></div>
                        <div className="font-medium">Mie Ayam</div>
                        <div className="text-sm opacity-70">Rp 20.000</div>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <button
                      className="w-full py-3 text-white font-medium"
                      style={{
                        backgroundColor: `rgb(${colorOptions.find(c => c.value === localSettings.primary_color)?.rgb || '59 130 246'})`,
                        borderRadius: localSettings.card_style === 'rounded' ? '0.5rem' : '0',
                      }}
                    >
                      Tambah ke Keranjang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
