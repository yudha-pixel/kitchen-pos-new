'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/src/components/layout/Header';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { getToken } from '@/src/lib/api';
import { useConfigStore } from '@/src/store/useConfigStore';
import { 
  Store, 
  Printer, 
  Clock, 
  LayoutGrid, 
  Users, 
  ChefHat, 
  Package, 
  Shield,
  Save,
  RefreshCw
} from 'lucide-react';

type SettingsTab = 'store' | 'receipt' | 'shift' | 'tables' | 'users' | 'kitchen' | 'inventory' | 'security';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Default settings values
const defaultStoreSettings = {
  store_name: 'Kitchen POS Restaurant',
  store_phone: '+62 21 1234 5678',
  store_email: 'info@kitchenpos.com',
  store_address: 'Jl. Contoh No. 123, Jakarta Selatan',
  web_base_url: 'http://localhost:3000',
  timezone: 'Asia/Jakarta',
  currency: 'IDR',
  tax_rate: 10,
  service_charge: 0,
};

const defaultReceiptSettings = {
  receipt_header: 'TERIMA KASIH',
  receipt_footer: 'Silakan datang kembali',
  show_logo: true,
  show_table_number: true,
  show_cashier_name: true,
  printer_type: 'bluetooth',
  paper_width: '80',
};

const defaultShiftSettings = {
  default_cash_float: 500000,
  require_cash_float: 'yes',
  require_reconciliation: true,
  show_cash_comparison: true,
  auto_report: true,
};

const defaultInventorySettings = {
  min_stock_menu: 5,
  min_stock_ingredient: 10,
  notify_low_stock: true,
  show_pos_warning: true,
  email_manager: true,
};

const defaultSecuritySettings = {
  manager_pin: '1234',
  require_pin_void: true,
  require_pin_refund: true,
  require_pin_discount: true,
  require_pin_delete: true,
  backup_frequency: 'daily',
};

const defaultKitchenSettings = {
  main_course_route: 'KDS Display 1',
  beverage_route: 'Bar Station',
  dessert_route: 'KDS Display 1',
  sound_notification: true,
  auto_refresh: true,
  show_estimation: true,
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { updateFromSettings: updateConfig } = useConfigStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('store');
  const [saving, setSaving] = useState(false);
  
  // Store settings state
  const [storeSettings, setStoreSettings] = useState(defaultStoreSettings);
  const [receiptSettings, setReceiptSettings] = useState(defaultReceiptSettings);
  const [shiftSettings, setShiftSettings] = useState(defaultShiftSettings);
  const [inventorySettings, setInventorySettings] = useState(defaultInventorySettings);
  const [securitySettings, setSecuritySettings] = useState(defaultSecuritySettings);
  const [kitchenSettings, setKitchenSettings] = useState(defaultKitchenSettings);

  // Load settings from API on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const settings = await response.json();
      
      // Map API response to local state
      setStoreSettings({
        store_name: settings.store_name || defaultStoreSettings.store_name,
        store_phone: settings.store_phone || defaultStoreSettings.store_phone,
        store_email: settings.store_email || defaultStoreSettings.store_email,
        store_address: settings.store_address || defaultStoreSettings.store_address,
        web_base_url: settings.web_base_url || defaultStoreSettings.web_base_url,
        timezone: settings.timezone || defaultStoreSettings.timezone,
        currency: settings.currency || defaultStoreSettings.currency,
        tax_rate: settings.tax_rate || defaultStoreSettings.tax_rate,
        service_charge: settings.service_charge || defaultStoreSettings.service_charge,
      });

      setReceiptSettings({
        receipt_header: settings.receipt_header || defaultReceiptSettings.receipt_header,
        receipt_footer: settings.receipt_footer || defaultReceiptSettings.receipt_footer,
        show_logo: settings.show_logo !== undefined ? settings.show_logo : defaultReceiptSettings.show_logo,
        show_table_number: settings.show_table_number !== undefined ? settings.show_table_number : defaultReceiptSettings.show_table_number,
        show_cashier_name: settings.show_cashier_name !== undefined ? settings.show_cashier_name : defaultReceiptSettings.show_cashier_name,
        printer_type: settings.printer_type || defaultReceiptSettings.printer_type,
        paper_width: settings.paper_width || defaultReceiptSettings.paper_width,
      });

      setShiftSettings({
        default_cash_float: settings.default_cash_float || defaultShiftSettings.default_cash_float,
        require_cash_float: settings.require_cash_float || defaultShiftSettings.require_cash_float,
        require_reconciliation: settings.require_reconciliation !== undefined ? settings.require_reconciliation : defaultShiftSettings.require_reconciliation,
        show_cash_comparison: settings.show_cash_comparison !== undefined ? settings.show_cash_comparison : defaultShiftSettings.show_cash_comparison,
        auto_report: settings.auto_report !== undefined ? settings.auto_report : defaultShiftSettings.auto_report,
      });

      setInventorySettings({
        min_stock_menu: settings.min_stock_menu || defaultInventorySettings.min_stock_menu,
        min_stock_ingredient: settings.min_stock_ingredient || defaultInventorySettings.min_stock_ingredient,
        notify_low_stock: settings.notify_low_stock !== undefined ? settings.notify_low_stock : defaultInventorySettings.notify_low_stock,
        show_pos_warning: settings.show_pos_warning !== undefined ? settings.show_pos_warning : defaultInventorySettings.show_pos_warning,
        email_manager: settings.email_manager !== undefined ? settings.email_manager : defaultInventorySettings.email_manager,
      });

      setSecuritySettings({
        manager_pin: settings.manager_pin || defaultSecuritySettings.manager_pin,
        require_pin_void: settings.require_pin_void !== undefined ? settings.require_pin_void : defaultSecuritySettings.require_pin_void,
        require_pin_refund: settings.require_pin_refund !== undefined ? settings.require_pin_refund : defaultSecuritySettings.require_pin_refund,
        require_pin_discount: settings.require_pin_discount !== undefined ? settings.require_pin_discount : defaultSecuritySettings.require_pin_discount,
        require_pin_delete: settings.require_pin_delete !== undefined ? settings.require_pin_delete : defaultSecuritySettings.require_pin_delete,
        backup_frequency: settings.backup_frequency || defaultSecuritySettings.backup_frequency,
      });

      setKitchenSettings({
        main_course_route: settings.main_course_route || defaultKitchenSettings.main_course_route,
        beverage_route: settings.beverage_route || defaultKitchenSettings.beverage_route,
        dessert_route: settings.dessert_route || defaultKitchenSettings.dessert_route,
        sound_notification: settings.sound_notification !== undefined ? settings.sound_notification : defaultKitchenSettings.sound_notification,
        auto_refresh: settings.auto_refresh !== undefined ? settings.auto_refresh : defaultKitchenSettings.auto_refresh,
        show_estimation: settings.show_estimation !== undefined ? settings.show_estimation : defaultKitchenSettings.show_estimation,
      });

      // Sync with global config store
      updateConfig({ taxRate: settings.tax_rate, serviceCharge: settings.service_charge });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const tabs = [
    { id: 'store' as SettingsTab, label: 'Toko & Profil', icon: Store },
    { id: 'receipt' as SettingsTab, label: 'Struk & Cetak', icon: Printer },
    { id: 'shift' as SettingsTab, label: 'Shift & Kasir', icon: Clock },
    { id: 'tables' as SettingsTab, label: 'Meja & Area', icon: LayoutGrid },
    { id: 'users' as SettingsTab, label: 'Pengguna & Akses', icon: Users },
    { id: 'kitchen' as SettingsTab, label: 'Dapur & KDS', icon: ChefHat },
    { id: 'inventory' as SettingsTab, label: 'Inventori & Stok', icon: Package },
    { id: 'security' as SettingsTab, label: 'Keamanan', icon: Shield },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = getToken();
      
      // Combine all settings into one object
      const allSettings = {
        ...storeSettings,
        ...receiptSettings,
        ...shiftSettings,
        ...inventorySettings,
        ...securitySettings,
        ...kitchenSettings,
      };

      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(allSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      // Sync tax, service charge rates, and web base URL with global config store
      updateConfig({ 
        taxRate: storeSettings.tax_rate, 
        serviceCharge: storeSettings.service_charge,
        webBaseUrl: storeSettings.web_base_url 
      });
      
      toast('success', 'Pengaturan berhasil disimpan');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast('error', 'Gagal menyimpan pengaturan');
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 500);
    }
  };

  const handleReset = async () => {
    if (confirm('Apakah Anda yakin ingin mereset semua pengaturan ke nilai default?')) {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/settings/reset`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to reset settings');
        }

        // Reload settings from API
        await loadSettings();
        
        toast('success', 'Pengaturan direset ke nilai default');
      } catch (error) {
        console.error('Failed to reset settings:', error);
        toast('error', 'Gagal mereset pengaturan');
      }
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Header title="Pengaturan Sistem" />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl">
            {/* Tab Navigation */}
            <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-surface text-ink-secondary hover:bg-surface-alt hover:text-ink'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
              {activeTab === 'store' && (
                <StoreProfileSettings 
                  settings={storeSettings} 
                  onChange={setStoreSettings} 
                />
              )}
              {activeTab === 'receipt' && (
                <ReceiptPrintSettings 
                  settings={receiptSettings} 
                  onChange={setReceiptSettings} 
                />
              )}
              {activeTab === 'shift' && (
                <ShiftCashierSettings 
                  settings={shiftSettings} 
                  onChange={setShiftSettings} 
                />
              )}
              {activeTab === 'tables' && <TableAreaSettings />}
              {activeTab === 'users' && <UserAccessSettings />}
              {activeTab === 'kitchen' && (
                <KitchenKDSSettings 
                  settings={kitchenSettings} 
                  onChange={setKitchenSettings} 
                />
              )}
              {activeTab === 'inventory' && (
                <InventoryStockSettings 
                  settings={inventorySettings} 
                  onChange={setInventorySettings} 
                />
              )}
              {activeTab === 'security' && (
                <SecuritySettings 
                  settings={securitySettings} 
                  onChange={setSecuritySettings} 
                />
              )}
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end gap-3">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={handleReset}
              >
                <RefreshCw className="h-4 w-4" />
                Reset Default
              </Button>
              <Button 
                variant="primary" 
                className="flex items-center gap-2"
                onClick={handleSave}
                loading={saving}
              >
                <Save className="h-4 w-4" />
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Store & Business Profile Settings
interface StoreSettingsProps {
  settings: typeof defaultStoreSettings;
  onChange: (settings: typeof defaultStoreSettings) => void;
}

function StoreProfileSettings({ settings, onChange }: StoreSettingsProps) {
  const handleChange = (field: keyof typeof defaultStoreSettings, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-bold text-ink">Pengaturan Toko & Profil Bisnis</h2>
        <p className="mb-6 text-sm text-ink-secondary">
          Konfigurasi informasi dasar restoran dan profil bisnis Anda.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor="store-name" className="mb-1.5 block text-sm font-medium text-ink">
              Nama Restoran
            </label>
            <input
              id="store-name"
              type="text"
              value={settings.store_name}
              onChange={(e) => handleChange('store_name', e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="store-phone" className="mb-1.5 block text-sm font-medium text-ink">
              Nomor Telepon
            </label>
            <input
              id="store-phone"
              type="tel"
              value={settings.store_phone}
              onChange={(e) => handleChange('store_phone', e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="store-email" className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="store-email"
              type="email"
              value={settings.store_email}
              onChange={(e) => handleChange('store_email', e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="store-address" className="mb-1.5 block text-sm font-medium text-ink">
              Alamat
            </label>
            <textarea
              id="store-address"
              rows={3}
              value={settings.store_address}
              onChange={(e) => handleChange('store_address', e.target.value)}
              className="w-full resize-none rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="timezone" className="mb-1.5 block text-sm font-medium text-ink">
              Zona Waktu
            </label>
            <select
              id="timezone"
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            >
              <option value="Asia/Jakarta">WIB (Jakarta)</option>
              <option value="Asia/Makassar">WITA (Makassar)</option>
              <option value="Asia/Jayapura">WIT (Jayapura)</option>
            </select>
          </div>

          <div>
            <label htmlFor="currency" className="mb-1.5 block text-sm font-medium text-ink">
              Mata Uang
            </label>
            <select
              id="currency"
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            >
              <option value="IDR">IDR - Indonesian Rupiah</option>
              <option value="USD">USD - US Dollar</option>
              <option value="SGD">SGD - Singapore Dollar</option>
            </select>
          </div>

          <div>
            <label htmlFor="web-base-url" className="mb-1.5 block text-sm font-medium text-ink">
              Web Base URL
            </label>
            <input
              id="web-base-url"
              type="url"
              value={settings.web_base_url}
              onChange={(e) => handleChange('web_base_url', e.target.value)}
              placeholder="http://192.168.1.36:3000"
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-ink-secondary">
              URL dasar untuk QR code dan akses dari perangkat lain (contoh: http://192.168.1.36:3000)
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Pengaturan Pajak & Biaya</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="tax-rate" className="mb-1.5 block text-sm font-medium text-ink">
              Persentase Pajak/PPN (%)
            </label>
            <input
              id="tax-rate"
              type="number"
              value={settings.tax_rate}
              onChange={(e) => handleChange('tax_rate', Number(e.target.value))}
              min="0"
              max="100"
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="service-charge" className="mb-1.5 block text-sm font-medium text-ink">
              Biaya Layanan (%)
            </label>
            <input
              id="service-charge"
              type="number"
              value={settings.service_charge}
              onChange={(e) => handleChange('service_charge', Number(e.target.value))}
              min="0"
              max="100"
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Receipt & Print Settings
interface ReceiptSettingsProps {
  settings: typeof defaultReceiptSettings;
  onChange: (settings: typeof defaultReceiptSettings) => void;
}

function ReceiptPrintSettings({ settings, onChange }: ReceiptSettingsProps) {
  const handleChange = (field: keyof typeof defaultReceiptSettings, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-bold text-ink">Pengaturan Struk & Cetak</h2>
        <p className="mb-6 text-sm text-ink-secondary">
          Kustomisasi tampilan struk dan konfigurasi printer thermal.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="receipt-header" className="mb-1.5 block text-sm font-medium text-ink">
            Teks Header Struk
          </label>
          <textarea
            id="receipt-header"
            rows={3}
            value={settings.receipt_header}
            onChange={(e) => handleChange('receipt_header', e.target.value)}
            className="w-full resize-none rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="receipt-footer" className="mb-1.5 block text-sm font-medium text-ink">
            Teks Footer Struk
          </label>
          <textarea
            id="receipt-footer"
            rows={3}
            value={settings.receipt_footer}
            onChange={(e) => handleChange('receipt_footer', e.target.value)}
            className="w-full resize-none rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Opsi Tampilan</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.show_logo}
              onChange={(e) => handleChange('show_logo', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Tampilkan logo toko pada struk</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.show_table_number}
              onChange={(e) => handleChange('show_table_number', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Tampilkan nomor meja pada struk</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.show_cashier_name}
              onChange={(e) => handleChange('show_cashier_name', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Tampilkan nama kasir pada struk</span>
          </label>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Koneksi Printer</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="printer-type" className="mb-1.5 block text-sm font-medium text-ink">
              Tipe Printer
            </label>
            <select
              id="printer-type"
              value={settings.printer_type}
              onChange={(e) => handleChange('printer_type', e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            >
              <option value="bluetooth">Bluetooth</option>
              <option value="usb">USB</option>
              <option value="lan">LAN/Network</option>
            </select>
          </div>

          <div>
            <label htmlFor="paper-width" className="mb-1.5 block text-sm font-medium text-ink">
              Lebar Kertas
            </label>
            <select
              id="paper-width"
              value={settings.paper_width}
              onChange={(e) => handleChange('paper_width', e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            >
              <option value="58">58mm</option>
              <option value="80">80mm</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shift & Cashier Management
interface ShiftSettingsProps {
  settings: typeof defaultShiftSettings;
  onChange: (settings: typeof defaultShiftSettings) => void;
}

function ShiftCashierSettings({ settings, onChange }: ShiftSettingsProps) {
  const handleChange = (field: keyof typeof defaultShiftSettings, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-bold text-ink">Manajemen Shift & Kasir</h2>
        <p className="mb-6 text-sm text-ink-secondary">
          Konfigurasi modal awal kas dan rekapitulasi laci kasir.
        </p>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Modal Awal Kas (Cash Float)</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="default-cash-float" className="mb-1.5 block text-sm font-medium text-ink">
              Modal Awal Default (Rp)
            </label>
            <input
              id="default-cash-float"
              type="number"
              value={settings.default_cash_float}
              onChange={(e) => handleChange('default_cash_float', Number(e.target.value))}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="require-cash-float" className="mb-1.5 block text-sm font-medium text-ink">
              Wajib Input Modal Awal
            </label>
            <select
              id="require-cash-float"
              value={settings.require_cash_float}
              onChange={(e) => handleChange('require_cash_float', e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            >
              <option value="yes">Ya</option>
              <option value="no">Tidak</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Rekapitulasi Laci Kasir</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.require_reconciliation}
              onChange={(e) => handleChange('require_reconciliation', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Wajib rekapitulasi di akhir shift</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.show_cash_comparison}
              onChange={(e) => handleChange('show_cash_comparison', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Tampilkan perbandingan uang fisik vs sistem</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.auto_report}
              onChange={(e) => handleChange('auto_report', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Buat laporan otomatis saat tutup shift</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// Table & Area Management
function TableAreaSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-bold text-ink">Manajemen Meja & Area</h2>
        <p className="mb-6 text-sm text-ink-secondary">
          Pengaturan nomor meja dan pengelompokan area restoran.
        </p>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Konfigurasi Area</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-line p-4">
            <div>
              <h4 className="font-medium text-ink">Indoor</h4>
              <p className="text-sm text-ink-secondary">Area dalam restoran</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-secondary">10 meja</span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-line p-4">
            <div>
              <h4 className="font-medium text-ink">Outdoor</h4>
              <p className="text-sm text-ink-secondary">Area luar restoran</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-secondary">8 meja</span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-line p-4">
            <div>
              <h4 className="font-medium text-ink">VIP</h4>
              <p className="text-sm text-ink-secondary">Area VIP khusus</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-secondary">4 meja</span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </div>

          <Button variant="primary" className="w-full">
            + Tambah Area Baru
          </Button>
        </div>
      </div>
    </div>
  );
}

// User & Access Rights Management
function UserAccessSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-bold text-ink">Manajemen Pengguna & Hak Akses</h2>
        <p className="mb-6 text-sm text-ink-secondary">
          Kelola staf dan konfigurasi hak akses untuk setiap level pengguna.
        </p>
      </div>

      <div className="border-t border-line pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Daftar Staf</h3>
          <Button variant="primary" size="sm">+ Tambah Staf</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Admin User</div>
                  <div className="text-xs text-gray-500">admin@kitchenpos.com</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">Admin</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Aktif</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Kasir 1</div>
                  <div className="text-xs text-gray-500">kasir1@kitchenpos.com</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">Kasir</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Aktif</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Waiter 1</div>
                  <div className="text-xs text-gray-500">waiter1@kitchenpos.com</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">Waiter</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Aktif</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Hak Akses per Role</h3>
        <div className="space-y-4">
          <div className="rounded-lg border border-line p-4">
            <h4 className="mb-3 font-medium text-ink">Admin</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked disabled className="h-4 w-4 rounded accent-primary" />
                <span className="text-ink-secondary">Akses penuh</span>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-line p-4">
            <h4 className="mb-3 font-medium text-ink">Kasir</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary" />
                <span className="text-ink-secondary">Proses pembayaran</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary" />
                <span className="text-ink-secondary">Lihat laporan</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary" />
                <span className="text-ink-secondary">Kelola shift</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded accent-primary" />
                <span className="text-ink-secondary">Void item (perlu PIN)</span>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-line p-4">
            <h4 className="mb-3 font-medium text-ink">Waiter</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary" />
                <span className="text-ink-secondary">Input pesanan</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary" />
                <span className="text-ink-secondary">Lihat status pesanan</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Kitchen & KDS Integration
interface KitchenSettingsProps {
  settings: typeof defaultKitchenSettings;
  onChange: (settings: typeof defaultKitchenSettings) => void;
}

function KitchenKDSSettings({ settings, onChange }: KitchenSettingsProps) {
  const handleChange = (field: keyof typeof defaultKitchenSettings, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-bold text-ink">Integrasi Dapur & KDS</h2>
        <p className="mb-6 text-sm text-ink-secondary">
          Konfigurasi routing kategori menu ke layar KDS atau printer dapur.
        </p>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Routing Kategori Menu</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-line p-4">
            <div>
              <h4 className="font-medium text-ink">Makanan Utama</h4>
              <p className="text-sm text-ink-secondary">Main course dishes</p>
            </div>
            <select 
              value={settings.main_course_route}
              onChange={(e) => handleChange('main_course_route', e.target.value)}
              className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option>KDS Display 1</option>
              <option>Printer Dapur 1</option>
              <option>KDS Display 2</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-line p-4">
            <div>
              <h4 className="font-medium text-ink">Minuman</h4>
              <p className="text-sm text-ink-secondary">Beverages</p>
            </div>
            <select 
              value={settings.beverage_route}
              onChange={(e) => handleChange('beverage_route', e.target.value)}
              className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option>Bar Station</option>
              <option>Printer Bar</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-line p-4">
            <div>
              <h4 className="font-medium text-ink">Dessert</h4>
              <p className="text-sm text-ink-secondary">Desserts & sweets</p>
            </div>
            <select 
              value={settings.dessert_route}
              onChange={(e) => handleChange('dessert_route', e.target.value)}
              className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option>KDS Display 1</option>
              <option>Printer Dapur 2</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Pengaturan KDS</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.sound_notification}
              onChange={(e) => handleChange('sound_notification', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Notifikasi suara saat pesanan baru</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.auto_refresh}
              onChange={(e) => handleChange('auto_refresh', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Auto-refresh setiap 30 detik</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.show_estimation}
              onChange={(e) => handleChange('show_estimation', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Tampilkan waktu estimasi selesai</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// Inventory & Stock Alerts
interface InventorySettingsProps {
  settings: typeof defaultInventorySettings;
  onChange: (settings: typeof defaultInventorySettings) => void;
}

function InventoryStockSettings({ settings, onChange }: InventorySettingsProps) {
  const handleChange = (field: keyof typeof defaultInventorySettings, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-bold text-ink">Inventori & Peringatan Stok</h2>
        <p className="mb-6 text-sm text-ink-secondary">
          Pengaturan batas minimum stok untuk notifikasi produk/bahan baku habis.
        </p>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Batas Minimum Stok</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="min-stock-menu" className="mb-1.5 block text-sm font-medium text-ink">
              Batas Minimum Menu (pcs)
            </label>
            <input
              id="min-stock-menu"
              type="number"
              value={settings.min_stock_menu}
              onChange={(e) => handleChange('min_stock_menu', Number(e.target.value))}
              min="0"
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="min-stock-ingredient" className="mb-1.5 block text-sm font-medium text-ink">
              Batas Minimum Bahan Baku (unit)
            </label>
            <input
              id="min-stock-ingredient"
              type="number"
              value={settings.min_stock_ingredient}
              onChange={(e) => handleChange('min_stock_ingredient', Number(e.target.value))}
              min="0"
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Notifikasi Stok</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.notify_low_stock}
              onChange={(e) => handleChange('notify_low_stock', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Notifikasi saat stok di bawah batas minimum</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.show_pos_warning}
              onChange={(e) => handleChange('show_pos_warning', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Tampilkan peringatan di POS saat stok habis</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.email_manager}
              onChange={(e) => handleChange('email_manager', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Kirim email notifikasi ke manajer</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// Security & Authorization
interface SecuritySettingsProps {
  settings: typeof defaultSecuritySettings;
  onChange: (settings: typeof defaultSecuritySettings) => void;
}

function SecuritySettings({ settings, onChange }: SecuritySettingsProps) {
  const handleChange = (field: keyof typeof defaultSecuritySettings, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-bold text-ink">Keamanan & Otorisasi</h2>
        <p className="mb-6 text-sm text-ink-secondary">
          Pengaturan PIN/Password untuk otorisasi tindakan khusus dan backup database.
        </p>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Otorisasi PIN Manajer</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="manager-pin" className="mb-1.5 block text-sm font-medium text-ink">
              PIN Manajer
            </label>
            <input
              id="manager-pin"
              type="password"
              value={settings.manager_pin}
              onChange={(e) => handleChange('manager_pin', e.target.value)}
              maxLength={4}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={settings.require_pin_void}
                onChange={(e) => handleChange('require_pin_void', e.target.checked)}
                className="h-5 w-5 rounded accent-primary" 
              />
              <span className="text-sm text-ink">Wajib PIN untuk void item</span>
            </label>
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={settings.require_pin_refund}
                onChange={(e) => handleChange('require_pin_refund', e.target.checked)}
                className="h-5 w-5 rounded accent-primary" 
              />
              <span className="text-sm text-ink">Wajib PIN untuk refund</span>
            </label>
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={settings.require_pin_discount}
                onChange={(e) => handleChange('require_pin_discount', e.target.checked)}
                className="h-5 w-5 rounded accent-primary" 
              />
              <span className="text-sm text-ink">Wajib PIN untuk diskon khusus</span>
            </label>
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={settings.require_pin_delete}
                onChange={(e) => handleChange('require_pin_delete', e.target.checked)}
                className="h-5 w-5 rounded accent-primary" 
              />
              <span className="text-sm text-ink">Wajib PIN untuk hapus transaksi</span>
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Backup Database</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="backup-frequency" className="mb-1.5 block text-sm font-medium text-ink">
              Frekuensi Backup Otomatis
            </label>
            <select
              id="backup-frequency"
              value={settings.backup_frequency}
              onChange={(e) => handleChange('backup_frequency', e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            >
              <option value="hourly">Setiap Jam</option>
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="manual">Manual Saja</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button variant="primary" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Backup Sekarang
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              Restore dari Backup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
