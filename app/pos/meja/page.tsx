'use client';

import { useState } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { Modal } from '@/src/components/ui/Modal';
import { Badge } from '@/src/components/ui/Badge';
import { CheckCircle, UserRound, CalendarClock, Sparkles, LucideIcon, ShoppingCart, QrCode, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import WaiterOrderModal from '@/src/components/pos/WaiterOrderModal';
import { useConfigStore } from '@/src/store/useConfigStore';
import { useTables, type Table, type TableStatus } from '@/src/hooks/useTables';

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
  const { tables, loading, error, refetch, updateTableStatus } = useTables();
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<Table | null>(null);
  const [waiterOrderModalOpen, setWaiterOrderModalOpen] = useState(false);
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const getWebBaseUrl = useConfigStore((state) => state.getWebBaseUrl);

  const setStatus = async (tableId: string, status: TableStatus) => {
    setSavingStatus(true);
    setStatusError(null);
    const ok = await updateTableStatus(tableId, status);
    setSavingStatus(false);
    if (ok) {
      setActiveTable(null);
    } else {
      setStatusError('Status meja gagal disimpan. Periksa koneksi lalu coba lagi.');
    }
  };

  const handleOpenWaiterOrder = (table: Table) => {
    setSelectedTableForOrder(table);
    setWaiterOrderModalOpen(true);
  };

  const handleOpenQRCode = (table: Table) => {
    setSelectedTableForQR(table);
    setQrModalOpen(true);
  };

  const getQRCodeURL = (tableId: string, tableNumber: string) => {
    const baseUrl = getWebBaseUrl();
    return `${baseUrl}/order/${tableId}?table=${encodeURIComponent(tableNumber)}`;
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
            <p className="mt-1 text-ink-muted">Kelola status meja dan QR Code pemesanan</p>
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
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Memuat meja">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-xl border-2 border-line bg-surface-alt" />
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger-soft p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-danger">Daftar meja gagal dimuat</h3>
                  <p className="mt-1 text-sm text-danger">{error}</p>
                  <button
                    onClick={refetch}
                    className="mt-3 flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary/90"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Coba lagi
                  </button>
                </div>
              </div>
            </div>
          ) : tables.length === 0 ? (
            <div className="rounded-lg border border-line bg-surface-alt p-6 text-center">
              <p className="font-medium text-ink">Belum ada meja terdaftar</p>
              <p className="mt-1 text-sm text-ink-muted">
                Tambahkan meja lebih dulu agar status dan QR Code pemesanan dapat digunakan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {tables.map((table) => {
                const { label, Icon, card } = statusConfig[table.status];
                const canOrder = table.status === 'available' || table.status === 'occupied';
                return (
                  <div
                    key={table.id}
                    className={`rounded-xl border-2 p-4 text-left transition-all duration-150 hover:shadow-md ${card}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => {
                          setStatusError(null);
                          setActiveTable(table);
                        }}
                        className="flex w-full flex-col items-center gap-2 rounded-lg py-1 transition-colors hover:bg-surface/40"
                        aria-label={`Ubah status ${table.table_number}, saat ini ${label}`}
                      >
                        <span className="text-xl font-bold">{table.table_number}</span>
                        <span className="flex items-center gap-1 rounded-full bg-surface/60 px-3 py-1 text-xs font-semibold">
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          {label}
                        </span>
                      </button>
                      {table.hasActiveOrders && (
                        <span className="text-xs font-medium opacity-90">Ada pesanan aktif</span>
                      )}
                      <div className="mt-1 flex w-full gap-2">
                        {canOrder && (
                          <button
                            onClick={() => handleOpenWaiterOrder(table)}
                            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-on-primary transition-colors hover:bg-primary/90"
                          >
                            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                            Pesan
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenQRCode(table)}
                          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-surface-alt px-3 text-xs font-medium text-ink transition-colors hover:bg-surface"
                          aria-label={`QR Code ${table.table_number}`}
                        >
                          <QrCode className="h-4 w-4" aria-hidden="true" />
                          QR
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
          {statusError && (
            <p role="alert" className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
              {statusError}
            </p>
          )}
          {statusOrder.map((status) => {
            const { label, Icon } = statusConfig[status];
            const isCurrent = activeTable?.status === status;
            return (
              <button
                key={status}
                onClick={() => activeTable && setStatus(activeTable.id, status)}
                disabled={savingStatus}
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
                value={getQRCodeURL(selectedTableForQR.id, selectedTableForQR.table_number)}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-ink-muted mb-1">URL Pemesanan:</p>
              <p className="text-xs font-mono bg-surface-alt px-2 py-1 rounded break-all">
                {getQRCodeURL(selectedTableForQR.id, selectedTableForQR.table_number)}
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
