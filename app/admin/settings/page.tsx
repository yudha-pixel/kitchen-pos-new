'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/src/components/layout/Header';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
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

// Default settings values
const defaultStoreSettings = {
  storeName: 'Kitchen POS Restaurant',
  storePhone: '+62 21 1234 5678',
  storeEmail: 'info@kitchenpos.com',
  storeAddress: 'Jl. Contoh No. 123, Jakarta Selatan',
  timezone: 'Asia/Jakarta',
  currency: 'IDR',
  taxRate: 10,
  serviceCharge: 0,
};

const defaultReceiptSettings = {
  receiptHeader: 'TERIMA KASIH',
  receiptFooter: 'Silakan datang kembali',
  showLogo: true,
  showTableNumber: true,
  showCashierName: true,
  printerType: 'bluetooth',
  paperWidth: '80',
};

const defaultShiftSettings = {
  defaultCashFloat: 500000,
  requireCashFloat: 'yes',
  requireReconciliation: true,
  showCashComparison: true,
  autoReport: true,
};

const defaultInventorySettings = {
  minStockMenu: 5,
  minStockIngredient: 10,
  notifyLowStock: true,
  showPosWarning: true,
  emailManager: true,
};

const defaultSecuritySettings = {
  managerPin: '1234',
  requirePinVoid: true,
  requirePinRefund: true,
  requirePinDiscount: true,
  requirePinDelete: true,
  backupFrequency: 'daily',
};

const defaultKitchenSettings = {
  mainCourseRoute: 'KDS Display 1',
  beverageRoute: 'Bar Station',
  dessertRoute: 'KDS Display 1',
  soundNotification: true,
  autoRefresh: true,
  showEstimation: true,
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

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedStore = localStorage.getItem('kitchenpos_store_settings');
        const savedReceipt = localStorage.getItem('kitchenpos_receipt_settings');
        const savedShift = localStorage.getItem('kitchenpos_shift_settings');
        const savedInventory = localStorage.getItem('kitchenpos_inventory_settings');
        const savedSecurity = localStorage.getItem('kitchenpos_security_settings');
        const savedKitchen = localStorage.getItem('kitchenpos_kitchen_settings');

        if (savedStore) {
          const parsed = JSON.parse(savedStore);
          setStoreSettings(parsed);
          // Sync with global config store
          updateConfig({ taxRate: parsed.taxRate, serviceCharge: parsed.serviceCharge });
        }
        if (savedReceipt) setReceiptSettings(JSON.parse(savedReceipt));
        if (savedShift) setShiftSettings(JSON.parse(savedShift));
        if (savedInventory) setInventorySettings(JSON.parse(savedInventory));
        if (savedSecurity) setSecuritySettings(JSON.parse(savedSecurity));
        if (savedKitchen) setKitchenSettings(JSON.parse(savedKitchen));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, [updateConfig]);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Save all settings to localStorage
      localStorage.setItem('kitchenpos_store_settings', JSON.stringify(storeSettings));
      localStorage.setItem('kitchenpos_receipt_settings', JSON.stringify(receiptSettings));
      localStorage.setItem('kitchenpos_shift_settings', JSON.stringify(shiftSettings));
      localStorage.setItem('kitchenpos_inventory_settings', JSON.stringify(inventorySettings));
      localStorage.setItem('kitchenpos_security_settings', JSON.stringify(securitySettings));
      localStorage.setItem('kitchenpos_kitchen_settings', JSON.stringify(kitchenSettings));
      
      // Sync tax and service charge rates with global config store
      updateConfig({ taxRate: storeSettings.taxRate, serviceCharge: storeSettings.serviceCharge });
      
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

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mereset semua pengaturan ke nilai default?')) {
      setStoreSettings(defaultStoreSettings);
      setReceiptSettings(defaultReceiptSettings);
      setShiftSettings(defaultShiftSettings);
      setInventorySettings(defaultInventorySettings);
      setSecuritySettings(defaultSecuritySettings);
      setKitchenSettings(defaultKitchenSettings);
      
      // Clear localStorage
      localStorage.removeItem('kitchenpos_store_settings');
      localStorage.removeItem('kitchenpos_receipt_settings');
      localStorage.removeItem('kitchenpos_shift_settings');
      localStorage.removeItem('kitchenpos_inventory_settings');
      localStorage.removeItem('kitchenpos_security_settings');
      localStorage.removeItem('kitchenpos_kitchen_settings');
      
      toast('success', 'Pengaturan direset ke nilai default');
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
                        : 'bg-surface text-ink-secondary hover:bg-surface-alt'
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
              value={settings.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
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
              value={settings.storePhone}
              onChange={(e) => handleChange('storePhone', e.target.value)}
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
              value={settings.storeEmail}
              onChange={(e) => handleChange('storeEmail', e.target.value)}
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
              value={settings.storeAddress}
              onChange={(e) => handleChange('storeAddress', e.target.value)}
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
              value={settings.taxRate}
              onChange={(e) => handleChange('taxRate', Number(e.target.value))}
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
              value={settings.serviceCharge}
              onChange={(e) => handleChange('serviceCharge', Number(e.target.value))}
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
            value={settings.receiptHeader}
            onChange={(e) => handleChange('receiptHeader', e.target.value)}
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
            value={settings.receiptFooter}
            onChange={(e) => handleChange('receiptFooter', e.target.value)}
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
              checked={settings.showLogo}
              onChange={(e) => handleChange('showLogo', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Tampilkan logo toko pada struk</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.showTableNumber}
              onChange={(e) => handleChange('showTableNumber', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Tampilkan nomor meja pada struk</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.showCashierName}
              onChange={(e) => handleChange('showCashierName', e.target.checked)}
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
              value={settings.printerType}
              onChange={(e) => handleChange('printerType', e.target.value)}
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
              value={settings.paperWidth}
              onChange={(e) => handleChange('paperWidth', e.target.value)}
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
              value={settings.defaultCashFloat}
              onChange={(e) => handleChange('defaultCashFloat', Number(e.target.value))}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="require-cash-float" className="mb-1.5 block text-sm font-medium text-ink">
              Wajib Input Modal Awal
            </label>
            <select
              id="require-cash-float"
              value={settings.requireCashFloat}
              onChange={(e) => handleChange('requireCashFloat', e.target.value)}
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
              checked={settings.requireReconciliation}
              onChange={(e) => handleChange('requireReconciliation', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Wajib rekapitulasi di akhir shift</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.showCashComparison}
              onChange={(e) => handleChange('showCashComparison', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Tampilkan perbandingan uang fisik vs sistem</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.autoReport}
              onChange={(e) => handleChange('autoReport', e.target.checked)}
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
              value={settings.mainCourseRoute}
              onChange={(e) => handleChange('mainCourseRoute', e.target.value)}
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
              value={settings.beverageRoute}
              onChange={(e) => handleChange('beverageRoute', e.target.value)}
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
              value={settings.dessertRoute}
              onChange={(e) => handleChange('dessertRoute', e.target.value)}
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
              checked={settings.soundNotification}
              onChange={(e) => handleChange('soundNotification', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Notifikasi suara saat pesanan baru</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.autoRefresh}
              onChange={(e) => handleChange('autoRefresh', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Auto-refresh setiap 30 detik</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.showEstimation}
              onChange={(e) => handleChange('showEstimation', e.target.checked)}
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
              value={settings.minStockMenu}
              onChange={(e) => handleChange('minStockMenu', Number(e.target.value))}
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
              value={settings.minStockIngredient}
              onChange={(e) => handleChange('minStockIngredient', Number(e.target.value))}
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
              checked={settings.notifyLowStock}
              onChange={(e) => handleChange('notifyLowStock', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Notifikasi saat stok di bawah batas minimum</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.showPosWarning}
              onChange={(e) => handleChange('showPosWarning', e.target.checked)}
              className="h-5 w-5 rounded accent-primary" 
            />
            <span className="text-sm text-ink">Tampilkan peringatan di POS saat stok habis</span>
          </label>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.emailManager}
              onChange={(e) => handleChange('emailManager', e.target.checked)}
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
              value={settings.managerPin}
              onChange={(e) => handleChange('managerPin', e.target.value)}
              maxLength={4}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={settings.requirePinVoid}
                onChange={(e) => handleChange('requirePinVoid', e.target.checked)}
                className="h-5 w-5 rounded accent-primary" 
              />
              <span className="text-sm text-ink">Wajib PIN untuk void item</span>
            </label>
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={settings.requirePinRefund}
                onChange={(e) => handleChange('requirePinRefund', e.target.checked)}
                className="h-5 w-5 rounded accent-primary" 
              />
              <span className="text-sm text-ink">Wajib PIN untuk refund</span>
            </label>
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={settings.requirePinDiscount}
                onChange={(e) => handleChange('requirePinDiscount', e.target.checked)}
                className="h-5 w-5 rounded accent-primary" 
              />
              <span className="text-sm text-ink">Wajib PIN untuk diskon khusus</span>
            </label>
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={settings.requirePinDelete}
                onChange={(e) => handleChange('requirePinDelete', e.target.checked)}
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
              value={settings.backupFrequency}
              onChange={(e) => handleChange('backupFrequency', e.target.value)}
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
