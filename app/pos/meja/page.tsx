'use client';

import { useState } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { Modal } from '@/src/components/ui/Modal';
import { Badge } from '@/src/components/ui/Badge';
import { Users, CheckCircle, UserRound, CalendarClock, Sparkles, LucideIcon, ShoppingCart, QrCode, Download, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import WaiterOrderModal from '@/src/components/pos/WaiterOrderModal';
import { useConfigStore } from '@/src/store/useConfigStore';

type TableStatus = 'available' | 'occupied' | 'reserved' | 'dirty';

interface Table {
  id: string;
  table_number: string;
  qr_code: string | null;
  is_active: boolean;
  outlet_id: string | null;
  created_at: string;
  updated_at: string;
  outlet: {
    id: string;
    name: string;
    code: string;
  } | null;
  status: TableStatus;
  capacity?: number; // Optional for display purposes
}

// Status model per knowledge/02: available -> occupied -> billed -> dirty -> available
const statusConfig: Record<
  TableStatus,
  { label: string; Icon: LucideIcon; card: string; badgeTone: 'success' | 'danger' | 'warning' | 'info' }
> = {
  available: {
    label: 'Tersedia',
    Icon: CheckCircle,
    card: 'border-green-600/40 bg-success-soft text-success',
    badgeTone: 'success',
  },
  occupied: {
    label: 'Terisi',
    Icon: UserRound,
    card: 'border-red-600/40 bg-danger-soft text-danger',
    badgeTone: 'danger',
  },
  reserved: {
    label: 'Reservasi',
    Icon: CalendarClock,
    card: 'border-amber-600/40 bg-warning-soft text-warning',
    badgeTone: 'warning',
  },
  dirty: {
    label: 'Kotor',
    Icon: Sparkles,
    card: 'border-sky-600/40 bg-info-soft text-info',
    badgeTone: 'info',
  },
};

const statusOrder: TableStatus[] = ['available', 'occupied', 'reserved', 'dirty'];

export default function TableManagementPage() {
  const [tables, setTables] = useState<Table[]>([
    { id: 'c9e0936a-9599-4ec4-aa14-3f5023e1be6b', table_number: 'Meja 1', qr_code: null, is_active: true, outlet_id: null, created_at: '2026-08-07T11:43:51.962Z', updated_at: '2026-08-07T11:43:51.962Z', outlet: null, status: 'available', capacity: 4 },
    { id: '6d27b093-4349-4c79-a8e9-c354dd3aa6da', table_number: 'Meja 2', qr_code: null, is_active: true, outlet_id: null, created_at: '2026-08-07T11:43:51.982Z', updated_at: '2026-08-07T11:43:51.982Z', outlet: null, status: 'available', capacity: 4 },
    { id: '705d1321-9f34-4182-9d06-1223f4da7e37', table_number: 'Meja 3', qr_code: null, is_active: true, outlet_id: null, created_at: '2026-08-07T11:43:51.991Z', updated_at: '2026-08-07T11:43:51.991Z', outlet: null, status: 'occupied', capacity: 6 },
    { id: 'a6563062-d502-4861-877d-bfceda529cc3', table_number: 'Meja 4', qr_code: null, is_active: true, outlet_id: null, created_at: '2026-08-07T11:43:51.996Z', updated_at: '2026-08-07T11:43:51.996Z', outlet: null, status: 'available', capacity: 2 },
    { id: 'be6c07ca-b2bd-4baa-8086-9c092cb8f924', table_number: 'Meja 5', qr_code: null, is_active: true, outlet_id: null, created_at: '2026-08-07T11:43:52.001Z', updated_at: '2026-08-07T11:43:52.001Z', outlet: null, status: 'reserved', capacity: 8 },
    { id: '0a1100e2-c405-4104-81a4-b00cfe9615a6', table_number: 'Meja 6', qr_code: null, is_active: true, outlet_id: null, created_at: '2026-08-07T11:43:52.008Z', updated_at: '2026-08-07T11:43:52.008Z', outlet: null, status: 'available', capacity: 4 },
    { id: '9d9c2463-edf4-4087-8115-ce7a1f0bfb03', table_number: 'Meja 7', qr_code: null, is_active: true, outlet_id: null, created_at: '2026-08-07T11:43:52.011Z', updated_at: '2026-08-07T11:43:52.011Z', outlet: null, status: 'occupied', capacity: 4 },
  ]);
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<Table | null>(null);
  const [waiterOrderModalOpen, setWaiterOrderModalOpen] = useState(false);
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const getWebBaseUrl = useConfigStore((state) => state.getWebBaseUrl);

  const setStatus = (tableId: string, status: TableStatus) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status } : t)));
  };

  const handleOpenWaiterOrder = (table: Table) => {
    setSelectedTableForOrder(table);
    setWaiterOrderModalOpen(true);
  };

  const handleOpenQRCode = (table: Table) => {
    setSelectedTableForQR(table);
    setQrModalOpen(true);
  };

  const getQRCodeURL = (tableId: string) => {
    const baseUrl = getWebBaseUrl();
    return `${baseUrl}/order/${tableId}`;
  };

  const downloadQRCode = () => {
    if (!selectedTableForQR) return;
    
    const svgElement = document.getElementById(`qr-svg-${selectedTableForQR.id}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `qr-meja-${selectedTableForQR.table_number.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Header title="Manajemen Meja" />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">Manajemen Meja</h1>
            <p className="mt-1 text-ink-muted">Kelola status dan kapasitas meja restoran</p>
          </div>

          {/* Legend */}
          <div className="mb-6 flex flex-wrap gap-3">
            {statusOrder.map((status) => {
              const { label, Icon, badgeTone } = statusConfig[status];
              return (
                <Badge key={status} tone={badgeTone}>
                  <Icon className="h-3 w-3" aria-hidden="true" /> {label}
                </Badge>
              );
            })}
          </div>

          {/* Table Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {tables.map((table) => {
              const { label, Icon, card } = statusConfig[table.status];
              const canOrder = table.status === 'available' || table.status === 'occupied';
              return (
                <div
                  key={table.id}
                  className={`rounded-xl border-2 p-5 text-left transition-all duration-150 hover:shadow-md ${card}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-xl font-bold">{table.table_number}</div>
                    <div className="flex items-center gap-1 text-sm opacity-90">
                      <Users className="h-4 w-4" aria-hidden="true" />
                      <span className="tnum">{table.capacity} orang</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-surface/60 px-3 py-1 text-xs font-semibold">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {label}
                    </div>
                    <div className="mt-2 flex gap-2">
                      {canOrder && (
                        <button
                          onClick={() => handleOpenWaiterOrder(table)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/90 hover:text-white transition-colors"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Pesan
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenQRCode(table)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-surface-alt border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-surface hover:text-ink transition-colors"
                        title="Generate QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                        QR
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="mt-8 rounded-lg border border-info/30 bg-info-soft p-4">
            <h3 className="mb-1 font-semibold text-info">Petunjuk</h3>
            <p className="text-sm text-info">
              Ketuk meja lalu pilih status baru: Tersedia, Terisi, Reservasi, atau Kotor. Gunakan tombol "Pesan" untuk memesan menu pada meja yang tersedia atau terisi.
            </p>
          </div>
        </main>
      </div>

      {/* Status picker */}
      <Modal
        isOpen={activeTable !== null}
        onClose={() => setActiveTable(null)}
        title={activeTable ? `Ubah status ${activeTable.table_number}` : 'Ubah status'}
        size="sm"
      >
        <div className="space-y-2">
          {statusOrder.map((status) => {
            const { label, Icon } = statusConfig[status];
            const isCurrent = activeTable?.status === status;
            return (
              <button
                key={status}
                onClick={() => activeTable && setStatus(activeTable.id, status)}
                aria-pressed={isCurrent}
                className={`flex min-h-12 w-full items-center gap-3 rounded-lg border px-4 text-left transition-colors ${
                  isCurrent
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line text-ink-secondary hover:bg-surface-alt hover:text-ink'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="flex-1 font-medium">{label}</span>
                {isCurrent && <span className="text-xs font-semibold uppercase">Saat ini</span>}
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Waiter Order Modal */}
      {selectedTableForOrder && (
        <WaiterOrderModal
          isOpen={waiterOrderModalOpen}
          onClose={() => {
            setWaiterOrderModalOpen(false);
            setSelectedTableForOrder(null);
          }}
          tableNumber={selectedTableForOrder.table_number}
        />
      )}

      {/* QR Code Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setSelectedTableForQR(null);
        }}
        title={selectedTableForQR ? `QR Code ${selectedTableForQR.table_number}` : 'QR Code'}
        size="sm"
      >
        {selectedTableForQR && (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-lg border-2 border-line p-4 bg-white">
              <QRCodeSVG
                id={`qr-svg-${selectedTableForQR.id}`}
                value={getQRCodeURL(selectedTableForQR.id)}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-ink-muted mb-1">URL Pemesanan:</p>
              <p className="text-xs font-mono bg-surface-alt px-2 py-1 rounded break-all">
                {getQRCodeURL(selectedTableForQR.id)}
              </p>
            </div>
            <button
              onClick={downloadQRCode}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 hover:text-white transition-colors"
            >
              <Download className="h-4 w-4" />
              Download QR Code
            </button>
            <p className="text-xs text-ink-muted text-center">
              Scan QR Code ini untuk memesan menu di meja ini
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
