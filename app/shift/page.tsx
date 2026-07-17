'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { Clock, DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, ArrowLeft, Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ShiftData {
  isOpen: boolean;
  cashierId: string | null;
  cashierName: string | null;
  openedAt: string | null;
  startingCash: number;
  totalSales: number;
  totalExpenses: number;
  closedAt: string | null;
  endingCash: number | null;
  variance: number | null;
}

interface Transaction {
  id: string;
  time: string;
  orderId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
  modifiers: { name: string; price: number }[];
  status: 'completed' | 'pending' | 'cancelled';
}

const mockTransactions: Transaction[] = [
  { id: '1', time: '09:15', orderId: 'ORD-001', menuName: 'Nasi Goreng Spesial', quantity: 2, unitPrice: 20000, modifiers: [{ name: 'Extra Telur', price: 5000 }], status: 'completed' },
  { id: '2', time: '09:30', orderId: 'ORD-002', menuName: 'Mie Ayam Bakso', quantity: 1, unitPrice: 60000, modifiers: [{ name: 'Pedas', price: 2000 }], status: 'completed' },
  { id: '3', time: '10:00', orderId: 'ORD-003', menuName: 'Ayam Bakar Madu', quantity: 1, unitPrice: 28000, modifiers: [], status: 'completed' },
  { id: '4', time: '10:45', orderId: 'ORD-004', menuName: 'Sate Ayam', quantity: 3, unitPrice: 20000, modifiers: [{ name: 'Bumbu Kacang', price: 3000 }, { name: 'Extra Sate', price: 15000 }], status: 'completed' },
  { id: '5', time: '11:20', orderId: 'ORD-005', menuName: 'Es Teh Manis', quantity: 2, unitPrice: 15000, modifiers: [{ name: 'Less Sugar', price: 0 }], status: 'pending' },
];

const SHIFT_STORAGE_KEY = 'kitchen_pos_shift';

export default function ShiftPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [shiftData, setShiftData] = useState<ShiftData>({
    isOpen: false,
    cashierId: null,
    cashierName: null,
    openedAt: null,
    startingCash: 0,
    totalSales: 0,
    totalExpenses: 0,
    closedAt: null,
    endingCash: null,
    variance: null,
  });

  const [startingCashInput, setStartingCashInput] = useState('');
  const [endingCashInput, setEndingCashInput] = useState('');
  const [expenseInput, setExpenseInput] = useState('');
  const [expenseReason, setExpenseReason] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [breakdown, setBreakdown] = useState<Record<string, string>>({
    '100000': '',
    '50000': '',
    '20000': '',
    '10000': '',
    '5000': '',
    '2000': '',
    '1000': '',
  });

  const denominations = [
    { value: 100000, label: '100k' },
    { value: 50000, label: '50k' },
    { value: 20000, label: '20k' },
    { value: 10000, label: '10k' },
    { value: 5000, label: '5k' },
    { value: 2000, label: '2k' },
    { value: 1000, label: '1k' },
  ];

  const calculateBreakdownTotal = () => {
    return denominations.reduce((sum, denom) => {
      const count = parseInt(breakdown[denom.value.toString()] || '0') || 0;
      return sum + (count * denom.value);
    }, 0);
  };

  const handleBreakdownChange = (value: string, denomValue: number) => {
    setBreakdown(prev => ({
      ...prev,
      [denomValue.toString()]: value,
    }));
    // Auto-update endingCashInput
    const newBreakdown = { ...breakdown, [denomValue.toString()]: value };
    const total = denominations.reduce((sum, denom) => {
      const count = parseInt(newBreakdown[denom.value.toString()] || '0') || 0;
      return sum + (count * denom.value);
    }, 0);
    setEndingCashInput(total.toString());
  };

  // Load shift data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SHIFT_STORAGE_KEY);
    if (saved) {
      setShiftData(JSON.parse(saved));
    }
  }, []);

  // Save shift data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(shiftData));
  }, [shiftData]);

  // Calculate total sales dynamically from all transactions
  const calculateTotalSales = () => {
    return mockTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, transaction) => {
        const subtotal = transaction.quantity * transaction.unitPrice;
        const modifierTotal = transaction.modifiers?.reduce((modSum, mod) => modSum + (mod.price || 0), 0) || 0;
        return sum + subtotal + modifierTotal;
      }, 0);
  };

  const handleOpenShift = () => {
    const cash = parseFloat(startingCashInput);
    if (isNaN(cash) || cash < 0) {
      alert('Masukkan jumlah modal awal yang valid');
      return;
    }

    setShiftData({
      ...shiftData,
      isOpen: true,
      cashierId: user?.id || null,
      cashierName: user?.username || null,
      openedAt: new Date().toISOString(),
      startingCash: cash,
      totalSales: 0,
      totalExpenses: 0,
    });
    setStartingCashInput('');
  };

  const handleCloseShift = () => {
    const cash = parseFloat(endingCashInput);
    if (isNaN(cash) || cash < 0) {
      alert('Masukkan jumlah uang tunai akhir yang valid');
      return;
    }

    const expectedCash = shiftData.startingCash + shiftData.totalSales - shiftData.totalExpenses;
    const variance = cash - expectedCash;

    setShiftData({
      ...shiftData,
      isOpen: false,
      closedAt: new Date().toISOString(),
      endingCash: cash,
      variance,
    });
    setEndingCashInput('');
  };

  const handleAddExpense = () => {
    const amount = parseFloat(expenseInput);
    if (isNaN(amount) || amount <= 0) {
      alert('Masukkan jumlah pengeluaran yang valid');
      return;
    }
    if (!expenseReason.trim()) {
      alert('Masukkan alasan pengeluaran');
      return;
    }

    setShiftData({
      ...shiftData,
      totalExpenses: shiftData.totalExpenses + amount,
    });
    setExpenseInput('');
    setExpenseReason('');
    setShowExpenseForm(false);
  };

  const handleResetShift = () => {
    if (confirm('Apakah Anda yakin ingin mereset data shift? Data shift saat ini akan dihapus.')) {
      setShiftData({
        isOpen: false,
        cashierId: null,
        cashierName: null,
        openedAt: null,
        startingCash: 0,
        totalSales: 0,
        totalExpenses: 0,
        closedAt: null,
        endingCash: null,
        variance: null,
      });
    }
  };

  const handlePrint = () => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: auto;
          margin: 0 !important;
        }
        html, body {
          width: 80mm !important;
          margin: 0 !important;
          padding: 0 !important;
          min-width: 80mm !important;
          max-width: 80mm !important;
        }
        #print-receipt-container {
          width: 80mm !important;
          max-width: 80mm !important;
          min-width: 80mm !important;
          margin: 0 auto !important;
          border: 1px solid #000 !important;
          padding: 10px !important;
          box-shadow: none !important;
          page-break-inside: avoid !important;
        }
        #print-receipt-container > * {
          page-break-inside: avoid !important;
        }
        .space-y-2 > div {
          display: flex !important;
          justify-content: space-between !important;
        }
        button, .no-print {
          display: none !important;
        }
        * {
          page-break-inside: avoid !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('shift-summary');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const date = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
      pdf.save(`Laporan_Shift_${date}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal mengunduh PDF. Silakan coba lagi.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Open Shift Form */}
          {!shiftData.isOpen && !shiftData.closedAt && (
            <div className="rounded-lg border-2 border-line bg-surface p-6">
              <h3 className="mb-4 text-lg font-semibold text-ink">Buka Shift Baru</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="startingCash" className="mb-2 block text-sm font-medium text-ink">
                    Modal Awal (Starting Cash)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="startingCash"
                      type="number"
                      value={startingCashInput}
                      onChange={(e) => setStartingCashInput(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border-2 border-line bg-surface-alt px-4 py-3 pl-10 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <Button onClick={handleOpenShift} className="w-full">
                  <Clock className="h-4 w-4" />
                  Buka Shift
                </Button>
              </div>
            </div>
          )}

          {/* Shift In Progress */}
          {shiftData.isOpen && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="rounded-lg border-2 border-line bg-surface p-6">
                <h3 className="mb-4 text-lg font-semibold text-ink">Ringkasan Shift</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-surface-alt p-4">
                    <div className="flex items-center gap-2 text-ink-muted">
                      <DollarSign className="h-4 w-4" />
                      <p className="text-sm">Modal Awal</p>
                    </div>
                    <p className="mt-1 text-xl font-bold text-ink">{formatCurrency(shiftData.startingCash)}</p>
                  </div>
                  <div className="rounded-lg bg-surface-alt p-4">
                    <div className="flex items-center gap-2 text-ink-muted">
                      <TrendingUp className="h-4 w-4" />
                      <p className="text-sm">Total Penjualan</p>
                    </div>
                    <p className="mt-1 text-xl font-bold text-success">{formatCurrency(calculateTotalSales())}</p>
                  </div>
                  <div className="rounded-lg bg-surface-alt p-4">
                    <div className="flex items-center gap-2 text-ink-muted">
                      <TrendingDown className="h-4 w-4" />
                      <p className="text-sm">Total Pengeluaran</p>
                    </div>
                    <p className="mt-1 text-xl font-bold text-danger">{formatCurrency(shiftData.totalExpenses)}</p>
                  </div>
                </div>
              </div>

              {/* Transaction List */}
              <div className="rounded-lg border-2 border-line bg-surface p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-ink">Daftar Transaksi Hari Ini</h3>
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                      {mockTransactions.length} Transaksi
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowTransactions(!showTransactions)}
                  >
                    {showTransactions ? 'Tutup' : 'Lihat Detail'}
                  </Button>
                </div>

                {showTransactions && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-3 border-b border-line pb-2 text-sm font-medium text-ink-muted">
                      <div>Waktu</div>
                      <div>ID Pesanan</div>
                      <div>Total</div>
                      <div>Status</div>
                    </div>
                    {mockTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="grid grid-cols-4 gap-3 rounded-lg bg-surface-alt p-3 text-sm"
                      >
                        <div className="text-ink">{transaction.time}</div>
                        <div className="text-ink font-medium">{transaction.orderId}</div>
                        <div className="text-ink font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format((transaction.quantity * transaction.unitPrice) + (transaction.modifiers?.reduce((sum, mod) => sum + (mod.price || 0), 0) || 0))}</div>
                        <div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              transaction.status === 'completed'
                                ? 'bg-success-soft text-success'
                                : transaction.status === 'pending'
                                ? 'bg-warning-soft text-warning'
                                : 'bg-danger-soft text-danger'
                            }`}
                          >
                            {transaction.status === 'completed'
                              ? 'Selesai'
                              : transaction.status === 'pending'
                              ? 'Pending'
                              : 'Batal'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Expense Form */}
              <div className="rounded-lg border-2 border-line bg-surface p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ink">Catat Pengeluaran</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowExpenseForm(!showExpenseForm)}
                  >
                    {showExpenseForm ? 'Tutup' : 'Tambah Pengeluaran'}
                  </Button>
                </div>
                {showExpenseForm && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="expenseAmount" className="mb-2 block text-sm font-medium text-ink">
                        Jumlah
                      </label>
                      <input
                        id="expenseAmount"
                        type="number"
                        value={expenseInput}
                        onChange={(e) => setExpenseInput(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-lg border-2 border-line bg-surface-alt px-4 py-3 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="expenseReason" className="mb-2 block text-sm font-medium text-ink">
                        Alasan
                      </label>
                      <input
                        id="expenseReason"
                        type="text"
                        value={expenseReason}
                        onChange={(e) => setExpenseReason(e.target.value)}
                        placeholder="Contoh: Beli plastik, Uang kembalian, dll."
                        className="w-full rounded-lg border-2 border-line bg-surface-alt px-4 py-3 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                      />
                    </div>
                    <Button onClick={handleAddExpense} variant="danger">
                      Catat Pengeluaran
                    </Button>
                  </div>
                )}
              </div>

              {/* Close Shift Form */}
              <div className="rounded-lg border-2 border-line bg-surface p-6">
                <h3 className="mb-4 text-lg font-semibold text-ink">Tutup Shift</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="endingCash" className="mb-2 block text-sm font-medium text-ink">
                      Uang Tunai Akhir (Ending Cash)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
                      <input
                        id="endingCash"
                        type="number"
                        value={endingCashInput}
                        onChange={(e) => setEndingCashInput(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-lg border-2 border-line bg-surface-alt px-4 py-3 pl-10 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Breakdown Toggle */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full"
                  >
                    {showBreakdown ? 'Sembunyikan Hitung Pecahan' : 'Hitung Pecahan Uang'}
                  </Button>

                  {/* Breakdown Grid */}
                  {showBreakdown && (
                    <div className="mt-4 rounded-lg border-2 border-line bg-surface-alt p-4">
                      <h4 className="mb-3 text-sm font-medium text-ink">Pecahan Uang</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {denominations.map((denom) => (
                          <div key={denom.value}>
                            <label htmlFor={`breakdown-${denom.value}`} className="mb-1 block text-xs text-ink-muted">
                              {denom.label}
                            </label>
                            <input
                              id={`breakdown-${denom.value}`}
                              type="number"
                              inputMode="numeric"
                              value={breakdown[denom.value.toString()]}
                              onChange={(e) => handleBreakdownChange(e.target.value, denom.value)}
                              placeholder="0"
                              className="w-full rounded-lg border-2 border-line bg-surface px-3 py-2 text-center text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-surface p-3">
                        <span className="text-sm text-ink-muted">Total Pecahan</span>
                        <span className="font-bold text-ink">{formatCurrency(calculateBreakdownTotal())}</span>
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg bg-surface-alt p-4">
                    <p className="text-sm text-ink-muted">Uang yang Diharapkan</p>
                    <p className="text-lg font-bold text-ink">
                      {formatCurrency(shiftData.startingCash + shiftData.totalSales - shiftData.totalExpenses)}
                    </p>
                  </div>
                  <Button onClick={handleCloseShift} variant="danger" className="w-full">
                    <Clock className="h-4 w-4" />
                    Tutup Shift
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Shift Closed Summary - Receipt Style */}
          {shiftData.closedAt && !shiftData.isOpen && (
            <div id="print-receipt-container" className="max-w-2xl mx-auto p-6" style={{ 
              fontFamily: "'Courier New', monospace",
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '20px',
              margin: '20px auto',
              background: 'white'
            }} data-print-container>
              {/* Header Section */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">KITCHEN POS</h1>
                <p className="text-sm text-gray-600">Laporan Tutup Shift</p>
                <div className="mt-2 text-xs text-gray-500">
                  <p>Kasir: {shiftData.cashierName || 'admin'}</p>
                  <p>Buka: {shiftData?.openedAt ? formatDateTime(shiftData.openedAt) : "-"}</p>
                  <p>Tutup: {shiftData?.closedAt ? formatDateTime(shiftData.closedAt) : "-"}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

              {/* Financial Summary - Text Format */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Modal Awal:</span>
                  <span className="font-semibold">{formatCurrency(shiftData.startingCash)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Penjualan:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(calculateTotalSales())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Pengeluaran:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(shiftData.totalExpenses)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Uang Tunai Akhir:</span>
                  <span className="font-semibold">{formatCurrency(shiftData.endingCash || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-2 mt-2">
                  <span>Selisih (Variance):</span>
                  <span className={shiftData.variance === 0 ? 'text-green-600' : (shiftData.variance && shiftData.variance > 0) ? 'text-yellow-600' : 'text-red-600'}>
                    {formatCurrency(shiftData.variance || 0)} {shiftData.variance && shiftData.variance !== 0 && (shiftData.variance > 0 ? '(Kelebihan)' : '(Kekurangan)')}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

              {/* Transaction List - Limited for Single Page */}
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-4 text-center">Daftar Transaksi</h2>
                {mockTransactions
                  .filter(transaction => 
                    transaction.status === 'completed' || 
                    transaction.status === 'pending' || 
                    transaction.status === 'cancelled'
                  )
                  .slice(0, 3) // Limit to 3 transactions for single page
                  .map((transaction, index) => (
                    <div key={transaction.id} className="mb-4">
                      {/* Main Transaction Row */}
                      <div className="text-sm">
                        <span className="font-semibold">{transaction.time}</span>
                        <span className="ml-2">{transaction.quantity} x {transaction.menuName}</span>
                      </div>
                      
                      {/* Price Calculation Detail */}
                      <div className="text-xs text-gray-600 ml-4">
                        ({transaction.quantity} x {formatCurrency(transaction.unitPrice)} = {formatCurrency(transaction.quantity * transaction.unitPrice)})
                      </div>
                      
                      {/* Modifiers */}
                      {transaction.modifiers && transaction.modifiers.length > 0 && (
                        <div className="text-xs text-gray-600 ml-4">
                          {transaction.modifiers.map((mod, modIndex) => (
                            <div key={modIndex}>- {mod.name} ({mod.price > 0 ? formatCurrency(mod.price) : 'Gratis'})</div>
                          ))}
                        </div>
                      )}
                      
                      {/* Total and Status */}
                      <div className="flex justify-between text-sm mt-1 ml-4">
                        <span className={`font-medium ${
                          transaction.status === 'completed' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          Status: {transaction.status === 'completed' ? 'Selesai' :
                   transaction.status === 'pending' ? 'Pending' : 'Batal'}
                        </span>
                        <span className="font-bold">Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format((transaction.quantity * transaction.unitPrice) + (transaction.modifiers?.reduce((sum, mod) => sum + (mod.price || 0), 0) || 0))}</span>
                      </div>
                      
                      {/* Separator between transactions */}
                      {index < Math.min(3, mockTransactions.filter(t => 
                    t.status === 'completed' || 
                    t.status === 'pending' || 
                    t.status === 'cancelled'
                  ).length) - 1 && (
                        <div className="border-b border-dashed border-gray-300 my-3"></div>
                      )}
                    </div>
                  ))}
                {mockTransactions.filter(t => 
                    t.status === 'completed' || 
                    t.status === 'pending' || 
                    t.status === 'cancelled'
                  ).length > 3 && (
                  <div className="text-center text-sm text-gray-600 mt-2">
                    ... dan {mockTransactions.filter(t => 
                    t.status === 'completed' || 
                    t.status === 'pending' || 
                    t.status === 'cancelled'
                  ).length - 3} transaksi lainnya
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6 no-print">
                <Button onClick={handlePrint} variant="secondary" className="flex-1">
                  <Printer className="h-4 w-4" />
                  Cetak
                </Button>
                <Button onClick={handleDownloadPDF} variant="secondary" className="flex-1">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button onClick={handleResetShift} variant="primary" className="flex-1">
                  Mulai Shift Baru
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add print styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    /* Screen styles for receipt container */
    #print-receipt-container {
      width: 100%;
      max-width: 72mm;
      margin: 0 auto;
    }
  `;
  document.head.appendChild(style);
}
