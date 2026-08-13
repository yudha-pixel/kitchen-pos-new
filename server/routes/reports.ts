import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

/**
 * Get sales data aggregated by period (daily)
 * Returns breakdown with net sales, tax, and service charge for internal reporting
 */
router.get('/reports/sales', authMiddleware, requirePermission(PERMISSIONS.reports.view), async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['completed', 'paid'] },
        created_at: { gte: cutoffDate },
      },
      include: {
        outlet: true,
      },
    });
    
    // Get company settings for tax and service charge rates
    const company = await prisma.company.findFirst();
    const taxRate = company?.tax_rate || 10;
    const serviceChargeRate = company?.service_charge || 0;
    
    const groupedData = new Map<string, { total: number; netSales: number; taxAmount: number; serviceChargeAmount: number }>();
    
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      
      // Reverse calculation to extract components from final price
      const divisor = 1 + (taxRate / 100) + (serviceChargeRate / 100);
      const netSales = order.total_amount / divisor;
      const taxAmount = netSales * (taxRate / 100);
      const serviceChargeAmount = netSales * (serviceChargeRate / 100);
      
      const current = groupedData.get(date) || { total: 0, netSales: 0, taxAmount: 0, serviceChargeAmount: 0 };
      groupedData.set(date, {
        total: current.total + order.total_amount,
        netSales: current.netSales + Math.round(netSales),
        taxAmount: current.taxAmount + Math.round(taxAmount),
        serviceChargeAmount: current.serviceChargeAmount + Math.round(serviceChargeAmount),
      });
    });
    
    const result = Array.from(groupedData.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    res.json(result);
  } catch (error) {
    console.error('Failed to get sales data:', error);
    res.status(500).json({ error: 'Failed to get sales data' });
  }
});

/**
 * Get expenses data aggregated by period (daily)
 */
router.get('/reports/expenses', authMiddleware, requirePermission(PERMISSIONS.reports.view), async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Use petty cash data as operational expenses
    const pettyCashExpenses = await prisma.pettyCash.findMany({
      where: {
        expense_date: { gte: cutoffDate },
      },
    });
    
    const groupedData = new Map<string, number>();
    
    pettyCashExpenses.forEach(expense => {
      const date = new Date(expense.expense_date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const currentTotal = groupedData.get(date) || 0;
      groupedData.set(date, currentTotal + expense.amount);
    });
    
    const result = Array.from(groupedData.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    res.json(result);
  } catch (error) {
    console.error('Failed to get expenses data:', error);
    res.status(500).json({ error: 'Failed to get expenses data' });
  }
});

/**
 * Get payment method summary for a period
 */
router.get('/reports/payment-methods', authMiddleware, requirePermission(PERMISSIONS.reports.view), async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['completed', 'paid'] },
        created_at: { gte: cutoffDate },
      },
    });
    
    const summary = new Map<string, { count: number; total: number }>();
    let grandTotal = 0;
    
    orders.forEach(order => {
      const method = order.payment_method || 'unknown';
      const current = summary.get(method) || { count: 0, total: 0 };
      summary.set(method, {
        count: current.count + 1,
        total: current.total + order.total_amount,
      });
      grandTotal += order.total_amount;
    });
    
    const result = Array.from(summary.entries())
      .map(([method, data]) => ({
        method,
        count: data.count,
        total: data.total,
        percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
    
    res.json(result);
  } catch (error) {
    console.error('Failed to get payment method summary:', error);
    res.status(500).json({ error: 'Failed to get payment method summary' });
  }
});

/**
 * Get best selling products for a period
 */
router.get('/reports/best-products', authMiddleware, requirePermission(PERMISSIONS.reports.view), async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['completed', 'paid'] },
        created_at: { gte: cutoffDate },
      },
      include: {
        items: true,
      },
    });
    
    const productStats = new Map<string, { product_name: string; quantity: number; revenue: number }>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const current = productStats.get(item.product_id || '') || {
          product_name: `Product ${item.product_id}`,
          quantity: 0,
          revenue: 0,
        };
        productStats.set(item.product_id || '', {
          product_name: current.product_name,
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (item.price_at_time * item.quantity),
        });
      });
    });
    
    // Fetch product names
    const productIds = Array.from(productStats.keys());
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    
    const productMap = new Map(products.map(p => [p.id, p.name]));
    
    const result = Array.from(productStats.entries())
      .map(([product_id, data]) => ({
        product_id,
        product_name: productMap.get(product_id) || data.product_name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
    
    res.json(result);
  } catch (error) {
    console.error('Failed to get best selling products:', error);
    res.status(500).json({ error: 'Failed to get best selling products' });
  }
});

/**
 * Get orders with global discounts
 */
router.get('/reports/discounts/global', authMiddleware, requirePermission(PERMISSIONS.reports.view), async (req: Request, res: Response) => {
  try {
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    
    const where: any = {
      discount_amount: { gt: 0 },
    };
    
    if (dateFrom) {
      where.created_at = { ...where.created_at, gte: new Date(dateFrom) };
    }
    if (dateTo) {
      where.created_at = { ...where.created_at, lte: new Date(dateTo + 'T23:59:59') };
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        cashier: {
          select: { full_name: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    
    const result = orders.map(order => ({
      id: order.id,
      created_at: order.created_at,
      total_amount: order.total_amount,
      global_discount_amount: order.discount_amount,
      global_discount_type: 'nominal', // Currently only nominal discounts are supported
      global_discount_authorized_by: order.cashier?.full_name || null,
      global_discount_reason: order.notes || null,
      table_number: order.table_number,
      payment_method: order.payment_method,
      order_category: order.table_number ? 'dine-in' : 'takeaway',
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Failed to get global discount orders:', error);
    res.status(500).json({ error: 'Failed to get global discount orders' });
  }
});

/**
 * Get orders with voucher discounts
 */
router.get('/reports/discounts/vouchers', authMiddleware, requirePermission(PERMISSIONS.reports.view), async (req: Request, res: Response) => {
  try {
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    
    const where: any = {};
    
    if (dateFrom) {
      where.created_at = { ...where.created_at, gte: new Date(dateFrom) };
    }
    if (dateTo) {
      where.created_at = { ...where.created_at, lte: new Date(dateTo + 'T23:59:59') };
    }
    
    // Currently voucher tracking is not fully implemented in the schema
    // Return empty array for now
    const result: any[] = [];
    
    res.json(result);
  } catch (error) {
    console.error('Failed to get voucher orders:', error);
    res.status(500).json({ error: 'Failed to get voucher orders' });
  }
});

/**
 * Get free items from orders
 */
router.get('/reports/discounts/free-items', authMiddleware, requirePermission(PERMISSIONS.reports.view), async (req: Request, res: Response) => {
  try {
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    
    const where: any = {};
    
    if (dateFrom) {
      where.created_at = { ...where.created_at, gte: new Date(dateFrom) };
    }
    if (dateTo) {
      where.created_at = { ...where.created_at, lte: new Date(dateTo + 'T23:59:59') };
    }
    
    // Currently free item tracking is not fully implemented in the schema
    // Return empty array for now
    const result: any[] = [];
    
    res.json(result);
  } catch (error) {
    console.error('Failed to get free items:', error);
    res.status(500).json({ error: 'Failed to get free items' });
  }
});

/**
 * Get wastage data (stock write-offs) for reports
 */
router.get('/reports/wastage', authMiddleware, requirePermission(PERMISSIONS.reports.view), async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const stockWriteOffs = await prisma.stockWriteOff.findMany({
      where: {
        status: 'approved',
        requested_at: { gte: cutoffDate },
      },
      include: {
        ingredient: {
          select: {
            unit_price: true,
          },
        },
      },
    });
    
    // Group by ingredient and calculate totals
    const wastageMap = new Map<string, {
      ingredient_name: string;
      total_quantity: number;
      unit: string;
      total_loss: number;
      request_count: number;
    }>();
    
    stockWriteOffs.forEach(writeOff => {
      const key = writeOff.ingredient_name;
      const existing = wastageMap.get(key) || {
        ingredient_name: writeOff.ingredient_name,
        total_quantity: 0,
        unit: writeOff.unit,
        total_loss: 0,
        request_count: 0,
      };
      
      const unitPrice = writeOff.ingredient?.unit_price || 0;
      const loss = writeOff.quantity_written_off * unitPrice;
      
      wastageMap.set(key, {
        ingredient_name: writeOff.ingredient_name,
        total_quantity: existing.total_quantity + writeOff.quantity_written_off,
        unit: writeOff.unit,
        total_loss: existing.total_loss + loss,
        request_count: existing.request_count + 1,
      });
    });
    
    const result = Array.from(wastageMap.values())
      .sort((a, b) => b.total_loss - a.total_loss);
    
    res.json(result);
  } catch (error) {
    console.error('Failed to get wastage data:', error);
    res.status(500).json({ error: 'Failed to get wastage data' });
  }
});

export default router;