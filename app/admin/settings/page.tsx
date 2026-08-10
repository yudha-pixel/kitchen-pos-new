'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/src/components/layout/Header';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { getToken } from '@/src/lib/api';
import { useConfigStore } from '@/src/store/useConfigStore';
import { API_BASE_URL } from '@/src/config/runtime';
import { Modal } from '@/src/components/ui/Modal';
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

const defaultTableSettings = {
  indoor_count: 10,
  outdoor_count: 8,
  vip_count: 4,
  qr_auto_generate: true,
  areas: [
    { id: '1', name: 'Indoor', description: 'Area dalam restoran', count: 10 },
    { id: '2', name: 'Outdoor', description: 'Area luar restoran', count: 8 },
    { id: '3', name: 'VIP', description: 'Area VIP khusus', count: 4 },
  ],
};

const defaultUserSettings = {
  admin_count: 1,
  cashier_count: 2,
  waiter_count: 3,
  require_2fa: false,
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { updateFromSettings: updateConfig } = useConfigStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('store');
  const [saving, setSaving] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  
  // Store settings state
  const [storeSettings, setStoreSettings] = useState(defaultStoreSettings);
  const [receiptSettings, setReceiptSettings] = useState(defaultReceiptSettings);
  const [shiftSettings, setShiftSettings] = useState(defaultShiftSettings);
  const [inventorySettings, setInventorySettings] = useState(defaultInventorySettings);
  const [securitySettings, setSecuritySettings] = useState(defaultSecuritySettings);
  const [kitchenSettings, setKitchenSettings] = useState(defaultKitchenSettings);
  const [tableSettings, setTableSettings] = useState(defaultTableSettings);
  const [userSettings, setUserSettings] = useState(defaultUserSettings);

  // Load settings from API on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/settings`, {
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

      setTableSettings({
        indoor_count: settings.indoor_count || defaultTableSettings.indoor_count,
        outdoor_count: settings.outdoor_count || defaultTableSettings.outdoor_count,
        vip_count: settings.vip_count || defaultTableSettings.vip_count,
        qr_auto_generate: settings.qr_auto_generate !== undefined ? settings.qr_auto_generate : defaultTableSettings.qr_auto_generate,
        areas: settings.areas || defaultTableSettings.areas,
      });

      setUserSettings({
        admin_count: settings.admin_count || defaultUserSettings.admin_count,
        cashier_count: settings.cashier_count || defaultUserSettings.cashier_count,
        waiter_count: settings.waiter_count || defaultUserSettings.waiter_count,
        require_2fa: settings.require_2fa !== undefined ? settings.require_2fa : defaultUserSettings.require_2fa,
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
        ...tableSettings,
        ...userSettings,
      };

      const response = await fetch(`${API_BASE_URL}/settings`, {
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
    setResetting(true);
    setResetError('');
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/settings/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset settings');
      }

      await loadSettings();
      setResetDialogOpen(false);
      toast('success', 'Pengaturan direset ke nilai default');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      setResetError('Gagal mereset pengaturan. Silakan coba lagi.');
    } finally {
      setResetting(false);
    }
  };

  const closeResetDialog = () => {
    if (resetting) return;
    setResetDialogOpen(false);
    setResetError('');
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
              {activeTab === 'tables' && (
                <TableAreaSettings 
                  settings={tableSettings} 
                  onChange={setTableSettings} 
                />
              )}
              {activeTab === 'users' && (
                <UserAccessSettings 
                  settings={userSettings} 
                  onChange={setUserSettings} 
                />
              )}
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
                  toast={toast}
                />
              )}
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end gap-3">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={() => {
                  setResetError('');
                  setResetDialogOpen(true);
                }}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
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

      <Modal
        isOpen={resetDialogOpen}
        onClose={closeResetDialog}
        title="Reset semua pengaturan?"
        role="alertdialog"
        descriptionId="reset-settings-description"
        closeOnBackdrop={false}
        showCloseButton={false}
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeResetDialog} disabled={resetting}>
              Batal
            </Button>
            <Button type="button" variant="danger" loading={resetting} onClick={handleReset}>
              Reset pengaturan
            </Button>
          </>
        }
      >
        <p id="reset-settings-description" className="text-pretty text-sm text-ink-secondary">
          Semua pengaturan sistem akan dikembalikan ke nilai default. Tindakan ini tidak dapat dibatalkan.
        </p>
        {resetError && (
          <p role="alert" className="mt-3 text-sm font-medium text-danger">
            {resetError}
          </p>
        )}
      </Modal>
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
interface TableSettingsProps {
  settings: typeof defaultTableSettings;
  onChange: (settings: typeof defaultTableSettings) => void;
}

interface Area {
  id: string;
  name: string;
  description: string;
  count: number;
}

function TableAreaSettings({ settings, onChange }: TableSettingsProps) {
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const handleChange = (field: keyof typeof defaultTableSettings, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  const handleEditArea = (area: Area) => {
    setEditingArea(area);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddArea = () => {
    setEditingArea(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleSaveArea = (areaData: Omit<Area, 'id'>) => {
    if (modalMode === 'edit' && editingArea) {
      // Update existing area
      const updatedAreas = settings.areas.map(a => 
        a.id === editingArea.id ? { ...a, ...areaData } : a
      );
      handleChange('areas', updatedAreas);
    } else {
      // Add new area
      const newArea: Area = {
        id: Date.now().toString(),
        ...areaData,
      };
      handleChange('areas', [...settings.areas, newArea]);
    }
    setIsModalOpen(false);
    setEditingArea(null);
  };

  const handleDeleteArea = (areaId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus area ini?')) {
      const updatedAreas = settings.areas.filter(a => a.id !== areaId);
      handleChange('areas', updatedAreas);
    }
  };

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
          {settings.areas.map((area) => (
            <div key={area.id} className="flex items-center justify-between rounded-lg border border-line p-4">
              <div>
                <h4 className="font-medium text-ink">{area.name}</h4>
                <p className="text-sm text-ink-secondary">{area.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-secondary">{area.count} meja</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditArea(area)}
                >
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteArea(area.id)}
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))}

          <Button 
            variant="primary" 
            className="w-full"
            onClick={handleAddArea}
          >
            + Tambah Area Baru
          </Button>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">QR Code Auto-Generation</h3>
        <label className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={settings.qr_auto_generate}
            onChange={(e) => handleChange('qr_auto_generate', e.target.checked)}
            className="h-5 w-5 rounded accent-primary" 
          />
          <span className="text-sm text-ink">Otomatis generate QR code untuk meja baru</span>
        </label>
      </div>

      {/* Area Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-ink">
              {modalMode === 'edit' ? 'Edit Area' : 'Tambah Area Baru'}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="area-name" className="mb-1.5 block text-sm font-medium text-ink">
                  Nama Area
                </label>
                <input
                  id="area-name"
                  type="text"
                  defaultValue={editingArea?.name || ''}
                  className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="area-description" className="mb-1.5 block text-sm font-medium text-ink">
                  Deskripsi
                </label>
                <input
                  id="area-description"
                  type="text"
                  defaultValue={editingArea?.description || ''}
                  className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="area-count" className="mb-1.5 block text-sm font-medium text-ink">
                  Jumlah Meja
                </label>
                <input
                  id="area-count"
                  type="number"
                  defaultValue={editingArea?.count || 0}
                  min="0"
                  className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button 
                variant="primary"
                onClick={() => {
                  const name = (document.getElementById('area-name') as HTMLInputElement).value;
                  const description = (document.getElementById('area-description') as HTMLInputElement).value;
                  const count = parseInt((document.getElementById('area-count') as HTMLInputElement).value) || 0;
                  if (name && description) {
                    handleSaveArea({ name, description, count });
                  }
                }}
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// User & Access Rights Management
interface UserSettingsProps {
  settings: typeof defaultUserSettings;
  onChange: (settings: typeof defaultUserSettings) => void;
}

interface StaffUser {
  id: string;
  username: string;
  full_name?: string;
  email?: string;
  role: { name: string };
  is_active: boolean;
}

interface AccessRights {
  admin: { fullAccess: boolean };
  cashier: { processPayment: boolean; viewReports: boolean; manageShift: boolean; voidItem: boolean };
  waiter: { inputOrder: boolean; viewMenu: boolean; manageTables: boolean };
}

function UserAccessSettings({ settings, onChange }: UserSettingsProps) {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [accessRights, setAccessRights] = useState<AccessRights>({
    admin: { fullAccess: true },
    cashier: { processPayment: true, viewReports: true, manageShift: true, voidItem: false },
    waiter: { inputOrder: true, viewMenu: true, manageTables: true },
  });
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'cashier' as 'admin' | 'cashier' | 'waiter',
    is_active: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        
        // Update counts based on actual data
        const adminCount = data.filter((u: StaffUser) => u.role?.name === 'admin').length;
        const cashierCount = data.filter((u: StaffUser) => u.role?.name === 'cashier').length;
        const waiterCount = data.filter((u: StaffUser) => u.role?.name === 'waiter').length;
        
        onChange({
          ...settings,
          admin_count: adminCount,
          cashier_count: cashierCount,
          waiter_count: waiterCount,
        });
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof defaultUserSettings, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  const handleAddStaff = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      full_name: '',
      email: '',
      role: 'cashier',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleEditStaff = (user: StaffUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role?.name as 'admin' | 'cashier' | 'waiter',
      is_active: user.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSaveStaff = async () => {
    if (!formData.username || (!editingUser && !formData.password)) {
      toast('error', 'Username dan password wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const token = getToken();
      const url = editingUser ? `${API_BASE_URL}/users/${editingUser.id}` : `${API_BASE_URL}/users`;
      const method = editingUser ? 'PUT' : 'POST';

      const payload = editingUser 
        ? { full_name: formData.full_name, email: formData.email, is_active: formData.is_active }
        : { username: formData.username, password: formData.password, full_name: formData.full_name, email: formData.email };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast('success', editingUser ? 'Staf berhasil diperbarui' : 'Staf berhasil ditambahkan');
        await loadUsers();
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        toast('error', error.error || 'Gagal menyimpan staf');
      }
    } catch (error) {
      console.error('Failed to save staff:', error);
      toast('error', 'Gagal menyimpan staf');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAccess = (role: keyof AccessRights, permission: string, value: boolean) => {
    setAccessRights(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: value,
      },
    }));
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'cashier': return 'bg-blue-100 text-blue-800';
      case 'waiter': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-bold text-ink">Manajemen Pengguna & Hak Akses</h2>
        <p className="mb-6 text-sm text-ink-secondary">
          Kelola staf dan konfigurasi hak akses untuk setiap level pengguna.
        </p>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Statistik Pengguna</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-line p-4">
            <div className="text-2xl font-bold text-ink">{settings.admin_count}</div>
            <div className="text-sm text-ink-secondary">Admin</div>
          </div>
          <div className="rounded-lg border border-line p-4">
            <div className="text-2xl font-bold text-ink">{settings.cashier_count}</div>
            <div className="text-sm text-ink-secondary">Kasir</div>
          </div>
          <div className="rounded-lg border border-line p-4">
            <div className="text-2xl font-bold text-ink">{settings.waiter_count}</div>
            <div className="text-sm text-ink-secondary">Waiter</div>
          </div>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Daftar Staf</h3>
          <Button variant="primary" size="sm" onClick={handleAddStaff}>+ Tambah Staf</Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-ink-secondary">Memuat data...</div>
        ) : (
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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-ink-secondary">
                      Belum ada staf terdaftar
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.full_name || user.username}</div>
                        <div className="text-xs text-gray-500">{user.email || '-'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleBadgeColor(user.role?.name)}`}>
                          {user.role?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <Button variant="ghost" size="sm" onClick={() => handleEditStaff(user)}>Edit</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Hak Akses per Role</h3>
        <div className="space-y-4">
          <div className="rounded-lg border border-line p-4">
            <h4 className="mb-3 font-medium text-ink">Admin</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={accessRights.admin.fullAccess}
                  onChange={(e) => handleToggleAccess('admin', 'fullAccess', e.target.checked)}
                  disabled 
                  className="h-4 w-4 rounded accent-primary" 
                />
                <span className="text-ink-secondary">Akses penuh</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={accessRights.waiter.manageTables}
                  onChange={(e) => handleToggleAccess('waiter', 'manageTables', e.target.checked)}
                  className="h-4 w-4 rounded accent-primary" 
                />
                <span className="text-ink-secondary">Kelola meja</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-ink">
              {editingUser ? 'Edit Staf' : 'Tambah Staf Baru'}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="staff-username" className="mb-1.5 block text-sm font-medium text-ink">
                  Username
                </label>
                <input
                  id="staff-username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingUser}
                  className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none disabled:bg-gray-100"
                />
              </div>
              {!editingUser && (
                <div>
                  <label htmlFor="staff-password" className="mb-1.5 block text-sm font-medium text-ink">
                    Password
                  </label>
                  <input
                    id="staff-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label htmlFor="staff-fullname" className="mb-1.5 block text-sm font-medium text-ink">
                  Nama Lengkap
                </label>
                <input
                  id="staff-fullname"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="staff-email" className="mb-1.5 block text-sm font-medium text-ink">
                  Email
                </label>
                <input
                  id="staff-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="staff-role" className="mb-1.5 block text-sm font-medium text-ink">
                  Role
                </label>
                <select
                  id="staff-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'cashier' | 'waiter' })}
                  className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="cashier">Kasir</option>
                  <option value="waiter">Waiter</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="text-sm text-ink">Aktif</span>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line p-4">
            <h4 className="mb-3 font-medium text-ink">Kasir</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={accessRights.cashier.processPayment}
                  onChange={(e) => handleToggleAccess('cashier', 'processPayment', e.target.checked)}
                  className="h-4 w-4 rounded accent-primary" 
                />
                <span className="text-ink-secondary">Proses pembayaran</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={accessRights.cashier.viewReports}
                  onChange={(e) => handleToggleAccess('cashier', 'viewReports', e.target.checked)}
                  className="h-4 w-4 rounded accent-primary" 
                />
                <span className="text-ink-secondary">Lihat laporan</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={accessRights.cashier.manageShift}
                  onChange={(e) => handleToggleAccess('cashier', 'manageShift', e.target.checked)}
                  className="h-4 w-4 rounded accent-primary" 
                />
                <span className="text-ink-secondary">Kelola shift</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={accessRights.cashier.voidItem}
                  onChange={(e) => handleToggleAccess('cashier', 'voidItem', e.target.checked)}
                  className="h-4 w-4 rounded accent-primary" 
                />
                <span className="text-ink-secondary">Void item (perlu PIN)</span>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-line p-4">
            <h4 className="mb-3 font-medium text-ink">Waiter</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={accessRights.waiter.inputOrder}
                  onChange={(e) => handleToggleAccess('waiter', 'inputOrder', e.target.checked)}
                  className="h-4 w-4 rounded accent-primary" 
                />
                <span className="text-ink-secondary">Input pesanan</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={accessRights.waiter.viewMenu}
                  onChange={(e) => handleToggleAccess('waiter', 'viewMenu', e.target.checked)}
                  className="h-4 w-4 rounded accent-primary" 
                />
                <span className="text-ink-secondary">Lihat menu</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button 
                variant="primary"
                loading={isSaving}
                onClick={handleSaveStaff}
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
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
  toast: (type: 'success' | 'error' | 'info', message: string) => void;
}

function SecuritySettings({ settings, onChange, toast }: SecuritySettingsProps) {
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
            <Button 
              variant="primary" 
              className="flex items-center gap-2"
              onClick={async () => {
                try {
                  const token = getToken();
                  const response = await fetch(`${API_BASE_URL}/settings/backup`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });
                  if (response.ok) {
                    toast('success', 'Backup database berhasil');
                  } else {
                    toast('error', 'Gagal melakukan backup');
                  }
                } catch (error) {
                  console.error('Backup failed:', error);
                  toast('error', 'Gagal melakukan backup');
                }
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Backup Sekarang
            </Button>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => {
                toast('info', 'Fitur restore akan segera tersedia');
              }}
            >
              Restore dari Backup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
