import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { SELF_ORDER_PAYMENT_METHODS } from '../../src/features/self-order/paymentMethods';
import { resolveSelfOrderPaymentInstructions } from '../../src/features/self-order/paymentMethods';

const router = Router();

const SELF_ORDER_PAYMENT_METHOD_IDS = Object.keys(SELF_ORDER_PAYMENT_METHODS);

function validateSelfOrderSettings(data: any, current: any): string | null {
  const methods = data.selforder_payment_methods ?? current?.selforder_payment_methods ?? ['cashier'];
  const instructions = resolveSelfOrderPaymentInstructions(
    data.selforder_payment_instructions ?? current?.selforder_payment_instructions
  );

  if (!Array.isArray(methods)) return 'selforder_payment_methods must be an array of method ids';
  if (methods.length === 0) return 'At least one self-order payment method must be enabled';
  const unknown = methods.filter((id: unknown) => typeof id !== 'string' || !SELF_ORDER_PAYMENT_METHOD_IDS.includes(id as string));
  if (unknown.length) return `Unknown payment method id(s): ${unknown.join(', ')}. Allowed: ${SELF_ORDER_PAYMENT_METHOD_IDS.join(', ')}`;
  for (const id of ['qris', 'transfer'] as const) {
    if (methods.includes(id) && !instructions[id]?.instructions) {
      return `${id.toUpperCase()} instructions are required when the method is enabled`;
    }
  }
  const imageUrl = instructions.qris?.image_url;
  if (imageUrl) {
    try {
      if (new URL(imageUrl).protocol !== 'https:') return 'QRIS image URL must use HTTPS';
    } catch {
      return 'QRIS image URL must be a valid HTTPS URL';
    }
  }
  if (data.selforder_routing !== undefined && !['review', 'auto'].includes(data.selforder_routing)) {
    return "selforder_routing must be 'review' or 'auto'";
  }
  return null;
}

// GET /api/settings - Get app settings
router.get('/', authMiddleware, requirePermission('settings.view'), async (req, res) => {
  try {
    // Get the first settings record (there should only be one)
    let settings = await prisma.appSettings.findFirst();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          // UI Settings
          primary_color: 'blue',
          theme_mode: 'light',
          card_style: 'rounded',
          layout_density: 'spacious',
          card_view: 'grid',
          cart_position: 'right-sidebar',
        },
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings - Update app settings
router.put('/', authMiddleware, requirePermission('settings.edit'), async (req, res) => {
  try {
    const data = req.body;

    // Get the first settings record
    let settings = await prisma.appSettings.findFirst();
    const validationError = validateSelfOrderSettings(data, settings);
    if (validationError) return res.status(400).json({ error: validationError });
    
    if (settings) {
      // Update existing settings - only update fields that are provided
      const updateData: any = {};
      
      // UI Settings
      if (data.primary_color !== undefined) updateData.primary_color = data.primary_color;
      if (data.theme_mode !== undefined) updateData.theme_mode = data.theme_mode;
      if (data.card_style !== undefined) updateData.card_style = data.card_style;
      if (data.layout_density !== undefined) updateData.layout_density = data.layout_density;
      if (data.card_view !== undefined) updateData.card_view = data.card_view;
      if (data.cart_position !== undefined) updateData.cart_position = data.cart_position;
      
      // Store Settings
      if (data.store_name !== undefined) updateData.store_name = data.store_name;
      if (data.store_phone !== undefined) updateData.store_phone = data.store_phone;
      if (data.store_email !== undefined) updateData.store_email = data.store_email;
      if (data.store_address !== undefined) updateData.store_address = data.store_address;
      if (data.web_base_url !== undefined) updateData.web_base_url = data.web_base_url;
      if (data.timezone !== undefined) updateData.timezone = data.timezone;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.tax_rate !== undefined) updateData.tax_rate = data.tax_rate;
      if (data.service_charge !== undefined) updateData.service_charge = data.service_charge;
      
      // Receipt Settings
      if (data.receipt_header !== undefined) updateData.receipt_header = data.receipt_header;
      if (data.receipt_footer !== undefined) updateData.receipt_footer = data.receipt_footer;
      if (data.show_logo !== undefined) updateData.show_logo = data.show_logo;
      if (data.show_table_number !== undefined) updateData.show_table_number = data.show_table_number;
      if (data.show_cashier_name !== undefined) updateData.show_cashier_name = data.show_cashier_name;
      if (data.printer_type !== undefined) updateData.printer_type = data.printer_type;
      if (data.paper_width !== undefined) updateData.paper_width = data.paper_width;
      
      // Shift Settings
      if (data.default_cash_float !== undefined) updateData.default_cash_float = data.default_cash_float;
      if (data.require_cash_float !== undefined) updateData.require_cash_float = data.require_cash_float;
      if (data.require_reconciliation !== undefined) updateData.require_reconciliation = data.require_reconciliation;
      if (data.show_cash_comparison !== undefined) updateData.show_cash_comparison = data.show_cash_comparison;
      if (data.auto_report !== undefined) updateData.auto_report = data.auto_report;
      
      // Inventory Settings
      if (data.min_stock_menu !== undefined) updateData.min_stock_menu = data.min_stock_menu;
      if (data.min_stock_ingredient !== undefined) updateData.min_stock_ingredient = data.min_stock_ingredient;
      if (data.notify_low_stock !== undefined) updateData.notify_low_stock = data.notify_low_stock;
      if (data.show_pos_warning !== undefined) updateData.show_pos_warning = data.show_pos_warning;
      if (data.email_manager !== undefined) updateData.email_manager = data.email_manager;
      
      // Security Settings
      if (data.manager_pin !== undefined) updateData.manager_pin = data.manager_pin;
      if (data.require_pin_void !== undefined) updateData.require_pin_void = data.require_pin_void;
      if (data.require_pin_refund !== undefined) updateData.require_pin_refund = data.require_pin_refund;
      if (data.require_pin_discount !== undefined) updateData.require_pin_discount = data.require_pin_discount;
      if (data.require_pin_delete !== undefined) updateData.require_pin_delete = data.require_pin_delete;
      if (data.backup_frequency !== undefined) updateData.backup_frequency = data.backup_frequency;
      if (data.default_login_redirect !== undefined) {
        if (typeof data.default_login_redirect !== 'string' || !data.default_login_redirect.startsWith('/')) {
          return res.status(400).json({ error: 'default_login_redirect must be a valid internal route starting with /' });
        }
        updateData.default_login_redirect = data.default_login_redirect;
      }
      
      // Kitchen Settings
      if (data.main_course_route !== undefined) updateData.main_course_route = data.main_course_route;
      if (data.beverage_route !== undefined) updateData.beverage_route = data.beverage_route;
      if (data.dessert_route !== undefined) updateData.dessert_route = data.dessert_route;
      if (data.sound_notification !== undefined) updateData.sound_notification = data.sound_notification;
      if (data.auto_refresh !== undefined) updateData.auto_refresh = data.auto_refresh;
      if (data.show_estimation !== undefined) updateData.show_estimation = data.show_estimation;
      
      // Table Settings
      if (data.indoor_count !== undefined) updateData.indoor_count = data.indoor_count;
      if (data.outdoor_count !== undefined) updateData.outdoor_count = data.outdoor_count;
      if (data.vip_count !== undefined) updateData.vip_count = data.vip_count;
      if (data.qr_auto_generate !== undefined) updateData.qr_auto_generate = data.qr_auto_generate;
      if (data.areas !== undefined) updateData.areas = data.areas;
      
      // User Settings
      if (data.admin_count !== undefined) updateData.admin_count = data.admin_count;
      if (data.cashier_count !== undefined) updateData.cashier_count = data.cashier_count;
      if (data.waiter_count !== undefined) updateData.waiter_count = data.waiter_count;
      if (data.require_2fa !== undefined) updateData.require_2fa = data.require_2fa;

      // Self-Order Settings — store ids only, and only ones we actually know about.
      // An unknown id here would silently disappear at render time; rejecting it at
      // the boundary makes the misconfiguration visible instead.
      if (data.selforder_payment_methods !== undefined) {
        updateData.selforder_payment_methods = data.selforder_payment_methods;
      }

      if (data.selforder_payment_instructions !== undefined) {
        updateData.selforder_payment_instructions = resolveSelfOrderPaymentInstructions(data.selforder_payment_instructions);
      }

      if (data.selforder_routing !== undefined) {
        updateData.selforder_routing = data.selforder_routing;
      }

      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      // Create new settings with provided data or defaults
      settings = await prisma.appSettings.create({
        data: {
          // UI Settings
          primary_color: data.primary_color || 'blue',
          theme_mode: data.theme_mode || 'light',
          card_style: data.card_style || 'rounded',
          layout_density: data.layout_density || 'spacious',
          card_view: data.card_view || 'grid',
          cart_position: data.cart_position || 'right-sidebar',
          
          // Store Settings
          store_name: data.store_name || 'Kitchen POS Restaurant',
          store_phone: data.store_phone || '+62 21 1234 5678',
          store_email: data.store_email || 'info@kitchenpos.com',
          store_address: data.store_address || 'Jl. Contoh No. 123, Jakarta Selatan',
          web_base_url: data.web_base_url || 'http://localhost:3000',
          timezone: data.timezone || 'Asia/Jakarta',
          currency: data.currency || 'IDR',
          tax_rate: data.tax_rate || 10,
          service_charge: data.service_charge || 0,
          
          // Receipt Settings
          receipt_header: data.receipt_header || 'TERIMA KASIH',
          receipt_footer: data.receipt_footer || 'Silakan datang kembali',
          show_logo: data.show_logo !== undefined ? data.show_logo : true,
          show_table_number: data.show_table_number !== undefined ? data.show_table_number : true,
          show_cashier_name: data.show_cashier_name !== undefined ? data.show_cashier_name : true,
          printer_type: data.printer_type || 'bluetooth',
          paper_width: data.paper_width || '80',
          
          // Shift Settings
          default_cash_float: data.default_cash_float || 500000,
          require_cash_float: data.require_cash_float || 'yes',
          require_reconciliation: data.require_reconciliation !== undefined ? data.require_reconciliation : true,
          show_cash_comparison: data.show_cash_comparison !== undefined ? data.show_cash_comparison : true,
          auto_report: data.auto_report !== undefined ? data.auto_report : true,
          
          // Inventory Settings
          min_stock_menu: data.min_stock_menu || 5,
          min_stock_ingredient: data.min_stock_ingredient || 10,
          notify_low_stock: data.notify_low_stock !== undefined ? data.notify_low_stock : true,
          show_pos_warning: data.show_pos_warning !== undefined ? data.show_pos_warning : true,
          email_manager: data.email_manager !== undefined ? data.email_manager : true,
          
          // Security Settings
          manager_pin: data.manager_pin || '1234',
          require_pin_void: data.require_pin_void !== undefined ? data.require_pin_void : true,
          require_pin_refund: data.require_pin_refund !== undefined ? data.require_pin_refund : true,
          require_pin_discount: data.require_pin_discount !== undefined ? data.require_pin_discount : true,
          require_pin_delete: data.require_pin_delete !== undefined ? data.require_pin_delete : true,
          backup_frequency: data.backup_frequency || 'daily',
          default_login_redirect: data.default_login_redirect || '/apps',
          
          // Kitchen Settings
          main_course_route: data.main_course_route || 'KDS Display 1',
          beverage_route: data.beverage_route || 'Bar Station',
          dessert_route: data.dessert_route || 'KDS Display 1',
          sound_notification: data.sound_notification !== undefined ? data.sound_notification : true,
          auto_refresh: data.auto_refresh !== undefined ? data.auto_refresh : true,
          show_estimation: data.show_estimation !== undefined ? data.show_estimation : true,
          
          // Table Settings
          indoor_count: data.indoor_count || 10,
          outdoor_count: data.outdoor_count || 8,
          vip_count: data.vip_count || 4,
          qr_auto_generate: data.qr_auto_generate !== undefined ? data.qr_auto_generate : true,
          areas: data.areas || JSON.stringify([
            { id: '1', name: 'Indoor', description: 'Area dalam restoran', count: 10 },
            { id: '2', name: 'Outdoor', description: 'Area luar restoran', count: 8 },
            { id: '3', name: 'VIP', description: 'Area VIP khusus', count: 4 },
          ]),
          
          // User Settings
          admin_count: data.admin_count || 1,
          cashier_count: data.cashier_count || 2,
          waiter_count: data.waiter_count || 3,
          require_2fa: data.require_2fa !== undefined ? data.require_2fa : false,
          selforder_payment_methods: data.selforder_payment_methods ?? ['cashier'],
          selforder_payment_instructions: resolveSelfOrderPaymentInstructions(data.selforder_payment_instructions) as any,
          selforder_routing: data.selforder_routing ?? 'review',
        },
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Reset settings to defaults
router.post('/reset', authMiddleware, requirePermission('settings.edit'), async (req, res) => {
  try {
    // Delete existing settings
    await prisma.appSettings.deleteMany();
    
    // Create default settings
    const settings = await prisma.appSettings.create({
      data: {
        // UI Settings
        primary_color: 'blue',
        theme_mode: 'light',
        card_style: 'rounded',
        layout_density: 'spacious',
        card_view: 'grid',
        cart_position: 'right-sidebar',
        
        // Store Settings
        store_name: 'Kitchen POS Restaurant',
        store_phone: '+62 21 1234 5678',
        store_email: 'info@kitchenpos.com',
        store_address: 'Jl. Contoh No. 123, Jakarta Selatan',
        web_base_url: 'http://localhost:3000',
        timezone: 'Asia/Jakarta',
        currency: 'IDR',
        tax_rate: 10,
        service_charge: 0,
        
        // Receipt Settings
        receipt_header: 'TERIMA KASIH',
        receipt_footer: 'Silakan datang kembali',
        show_logo: true,
        show_table_number: true,
        show_cashier_name: true,
        printer_type: 'bluetooth',
        paper_width: '80',
        
        // Shift Settings
        default_cash_float: 500000,
        require_cash_float: 'yes',
        require_reconciliation: true,
        show_cash_comparison: true,
        auto_report: true,
        
        // Table Settings
        indoor_count: 10,
        outdoor_count: 5,
        vip_count: 3,
        qr_auto_generate: true,
        areas: [],
        
        // User Settings
        admin_count: 1,
        cashier_count: 2,
        waiter_count: 3,
        require_2fa: false,
        
        // Inventory Settings
        min_stock_menu: 5,
        min_stock_ingredient: 10,
        notify_low_stock: true,
        show_pos_warning: true,
        email_manager: true,
        
        // Security Settings
        manager_pin: '1234',
        require_pin_void: true,
        require_pin_refund: true,
        require_pin_discount: true,
        require_pin_delete: true,
        backup_frequency: 'daily',
        
        // Kitchen Settings
        main_course_route: 'KDS Display 1',
        beverage_route: 'Bar Station',
        dessert_route: 'KDS Display 1',
        sound_notification: true,
        auto_refresh: true,
        show_estimation: true,
      },
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

export default router;
