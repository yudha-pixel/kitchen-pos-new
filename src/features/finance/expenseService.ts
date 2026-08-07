/**
 * Finance & Expense Service
 * Handles expense management, OCR simulation, and data operations
 */

export interface Expense {
  id?: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  payment_method: 'cash' | 'transfer' | 'card';
  proof_file?: string;
  proof_file_name?: string;
  supplier_name?: string;
  line_items?: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  created_by?: string;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseCategory {
  id?: string;
  name: string;
  color?: string;
  created_at?: string;
}

export interface OCRResult {
  supplier_name: string;
  date: string;
  total: number;
  line_items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  confidence: number;
}

/**
 * Get all expenses from database
 */
export async function getAllExpenses(): Promise<Expense[]> {
  try {
    const { db } = await import('@/src/lib/db');
    const expenses = await db.expenses.toArray();
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Failed to get expenses:', error);
    return [];
  }
}

/**
 * Add a new expense
 */
export async function addExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>, userId?: string, userName?: string): Promise<string> {
  try {
    const { db } = await import('@/src/lib/db');
    const now = new Date().toISOString();
    const expenseData = {
      ...expense,
      created_by: userId || 'system',
      created_by_name: userName || 'System',
      created_at: now,
      updated_at: now,
    };
    const id = await db.expenses.add(expenseData);
    return id;
  } catch (error) {
    console.error('Failed to add expense:', error);
    throw error;
  }
}

/**
 * Update an existing expense
 */
export async function updateExpense(id: string, expense: Partial<Expense>): Promise<void> {
  try {
    const { db } = await import('@/src/lib/db');
    const expenseData = {
      ...expense,
      updated_at: new Date().toISOString(),
    };
    await db.expenses.update(id, expenseData);
  } catch (error) {
    console.error('Failed to update expense:', error);
    throw error;
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<void> {
  try {
    const { db } = await import('@/src/lib/db');
    await db.expenses.delete(id);
  } catch (error) {
    console.error('Failed to delete expense:', error);
    throw error;
  }
}

/**
 * Calculate total expenses
 */
export async function calculateTotalExpenses(): Promise<number> {
  try {
    const expenses = await getAllExpenses();
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  } catch (error) {
    console.error('Failed to calculate total expenses:', error);
    return 0;
  }
}

/**
 * Get default expense categories
 */
export function getDefaultCategories(): ExpenseCategory[] {
  return [
    { id: '1', name: 'Bahan Baku', color: '#3b82f6' },
    { id: '2', name: 'Gaji Karyawan', color: '#ef4444' },
    { id: '3', name: 'Sewa Tempat', color: '#f59e0b' },
    { id: '4', name: 'Utilitas (Listrik/Air/Internet)', color: '#10b981' },
    { id: '5', name: 'Pemeliharaan', color: '#8b5cf6' },
    { id: '6', name: 'Operasional', color: '#ec4899' },
    { id: '7', name: 'Lainnya', color: '#6b7280' },
  ];
}

/**
 * Simulate OCR processing on uploaded file
 * This is a mock implementation for demo purposes
 */
export async function simulateOCR(file: File): Promise<OCRResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock OCR result based on file name or random
  const mockSuppliers = ['Toko Bahan Masak Jaya', 'PT. Indofood Sukses', 'CV. Berkah Abadi', 'Supplier Fresh Market'];
  const mockItems = [
    { name: 'Beras Premium 5kg', quantity: 10, unit_price: 65000 },
    { name: 'Minyak Goreng 2L', quantity: 5, unit_price: 35000 },
    { name: 'Telur Ayam 1kg', quantity: 8, unit_price: 28000 },
    { name: 'Daging Sapi 1kg', quantity: 3, unit_price: 120000 },
    { name: 'Sayur Bayam 1kg', quantity: 5, unit_price: 8000 },
  ];

  const randomSupplier = mockSuppliers[Math.floor(Math.random() * mockSuppliers.length)];
  const randomDate = new Date().toISOString().split('T')[0];
  
  // Select 2-4 random items
  const numItems = Math.floor(Math.random() * 3) + 2;
  const selectedItems = mockItems.slice(0, numItems).map(item => ({
    ...item,
    total: item.quantity * item.unit_price,
  }));

  const total = selectedItems.reduce((sum, item) => sum + item.total, 0);

  return {
    supplier_name: randomSupplier,
    date: randomDate,
    total,
    line_items: selectedItems,
    confidence: 0.85 + Math.random() * 0.1, // Random confidence between 0.85-0.95
  };
}

/**
 * Export expenses to CSV
 */
export async function exportExpensesToCSV(expenses: Expense[]): Promise<void> {
  try {
    const categories = getDefaultCategories();
    
    let csvContent = 'Laporan Pengeluaran\n';
    csvContent += `Tanggal Export,${new Date().toLocaleString('id-ID')}\n\n`;
    
    csvContent += 'ID,Tanggal,Supplier,Kategori,Deskripsi,Jumlah,Metode Pembayaran,Status\n';
    
    expenses.forEach(expense => {
      const categoryName = categories.find(c => c.name === expense.category)?.name || expense.category;
      csvContent += `${expense.id || ''},${new Date(expense.date).toLocaleDateString('id-ID')},${expense.supplier_name || '-'},${categoryName},${expense.description},${expense.amount},${expense.payment_method}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan_pengeluaran_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export expenses:', error);
    throw error;
  }
}

/**
 * Convert file to base64 string for storage
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
