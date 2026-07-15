'use client';

import { useState } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { Modal } from '@/src/components/ui/Modal';
import { Badge } from '@/src/components/ui/Badge';
import { Users, CheckCircle, UserRound, CalendarClock, Sparkles, LucideIcon } from 'lucide-react';

type TableStatus = 'available' | 'occupied' | 'reserved' | 'dirty';

interface Table {
  id: string;
  nomor_meja: string;
  kapasitas: number;
  status: TableStatus;
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
    { id: '1', nomor_meja: 'Meja 1', kapasitas: 4, status: 'available' },
    { id: '2', nomor_meja: 'Meja 2', kapasitas: 4, status: 'available' },
    { id: '3', nomor_meja: 'Meja 3', kapasitas: 6, status: 'occupied' },
    { id: '4', nomor_meja: 'Meja 4', kapasitas: 2, status: 'available' },
    { id: '5', nomor_meja: 'Meja 5', kapasitas: 8, status: 'reserved' },
    { id: '6', nomor_meja: 'Meja 6', kapasitas: 4, status: 'available' },
    { id: '7', nomor_meja: 'Meja 7', kapasitas: 4, status: 'occupied' },
    { id: '8', nomor_meja: 'Meja 8', kapasitas: 6, status: 'available' },
    { id: '9', nomor_meja: 'Meja 9', kapasitas: 10, status: 'available' },
    { id: '10', nomor_meja: 'Meja 10', kapasitas: 4, status: 'reserved' },
    { id: '11', nomor_meja: 'Meja 11', kapasitas: 2, status: 'available' },
    { id: '12', nomor_meja: 'Meja 12', kapasitas: 4, status: 'available' },
  ]);
  const [activeTable, setActiveTable] = useState<Table | null>(null);

  const setStatus = (tableId: string, status: TableStatus) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status } : t)));
    setActiveTable(null);
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
              return (
                <button
                  key={table.id}
                  onClick={() => setActiveTable(table)}
                  aria-label={`${table.nomor_meja}, ${label}, kapasitas ${table.kapasitas} orang. Ubah status`}
                  className={`rounded-xl border-2 p-5 text-left transition-all duration-150 hover:shadow-md active:scale-[0.98] ${card}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-xl font-bold">{table.nomor_meja}</div>
                    <div className="flex items-center gap-1 text-sm opacity-90">
                      <Users className="h-4 w-4" aria-hidden="true" />
                      <span className="tnum">{table.kapasitas} orang</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-surface/60 px-3 py-1 text-xs font-semibold">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="mt-8 rounded-lg border border-info/30 bg-info-soft p-4">
            <h3 className="mb-1 font-semibold text-info">Petunjuk</h3>
            <p className="text-sm text-info">
              Ketuk meja lalu pilih status baru: Tersedia, Terisi, Reservasi, atau Kotor.
            </p>
          </div>
        </main>
      </div>

      {/* Status picker */}
      <Modal
        isOpen={activeTable !== null}
        onClose={() => setActiveTable(null)}
        title={activeTable ? `Ubah status ${activeTable.nomor_meja}` : 'Ubah status'}
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
                    : 'border-line text-ink-secondary hover:bg-surface-alt'
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
    </div>
  );
}
