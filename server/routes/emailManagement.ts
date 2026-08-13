import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';
import { sendEmail } from '../lib/email';

const router = Router();

// Default templates seed data
const DEFAULT_EMAIL_TEMPLATES = [
  {
    code: 'reset_password',
    name: 'Reset Password Akun Pengguna',
    description: 'Template email otomatis ketika administrator mereset kata sandi akun pengguna kasir/staff.',
    subject: '[Kitchen POS] Reset Password Akun {{username}}',
    variables: ['user_name', 'username', 'email', 'temp_password', 'store_name'],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Password - Kitchen POS</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #2563eb; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;">{{store_name}}</h1>
    </div>
    <div style="padding: 32px; color: #1f2937;">
      <h2 style="font-size: 18px; font-weight: 600; margin-top: 0;">Halo, {{user_name}} 👋</h2>
      <p>Kata sandi baru Anda telah berhasil direset oleh Administrator sistem:</p>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
        <span style="font-size: 14px; color: #4b5563;">Kata Sandi Sementara:</span>
        <h2 style="font-size: 24px; font-weight: 800; color: #1f2937; letter-spacing: 2px; margin: 8px 0;">{{temp_password}}</h2>
      </div>
      <p style="font-size: 13px; color: #6b7280;">Segera masuk ke aplikasi dan ubah kata sandi Anda di menu Pengaturan Profil untuk menjaga keamanan akun Anda.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 20px 0;">
      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
        Email otomatis ini dikirim oleh Sistem Kitchen POS. Harap tidak membalas email ini.
      </p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    code: 'low_stock_warning',
    name: 'Peringatan Stok Bahan Baku Rendah',
    description: 'Template email pemberitahuan ke Manajer saat stok menu/bahan baku mendekati batas minimum.',
    subject: '[Peringatan Stok] Bahan Baku {{item_name}} Mendekati Batas Minimum',
    variables: ['item_name', 'current_stock', 'min_stock', 'unit', 'store_name'],
    body_html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; background-color: #f9fafb; padding: 30px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e5e7eb;">
    <h2 style="color: #dc2626; margin-top: 0;">⚠️ Peringatan Stok Rendah</h2>
    <p>Perhatian! Stok untuk item berikut telah mencapai batas minimum:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Item / Bahan:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{item_name}}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Stok Saat Ini:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: #dc2626; font-weight: bold;">{{current_stock}} {{unit}}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Batas Minimum:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{min_stock}} {{unit}}</td></tr>
    </table>
    <p style="font-size: 13px; color: #6b7280;">Segera lakukan pembelian stok baru ke supplier melalui menu Purchase Requisition.</p>
  </div>
</body>
</html>`,
  },
  {
    code: 'shift_report',
    name: 'Ringkasan Laporan Sesi Kasir (Shift Closing)',
    description: 'Template email ringkasan omzet dan kasir setelah penutupan shift.',
    subject: '[Laporan Shift] Penutupan Sesi Kasir {{cashier_name}} - {{shift_date}}',
    variables: ['cashier_name', 'outlet_name', 'shift_date', 'total_sales', 'cash_total', 'qris_total', 'store_name'],
    body_html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; background-color: #f9fafb; padding: 30px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e5e7eb;">
    <h2 style="color: #2563eb; margin-top: 0;">📊 Laporan Penutupan Shift Kasir</h2>
    <p>Berikut ringkasan hasil transaksi penutupan shift kasir:</p>
    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Kasir:</strong> {{cashier_name}}</p>
      <p style="margin: 4px 0;"><strong>Outlet:</strong> {{outlet_name}}</p>
      <p style="margin: 4px 0;"><strong>Tanggal:</strong> {{shift_date}}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;">
      <h3 style="margin: 4px 0; color: #16a34a;">Total Omzet: {{total_sales}}</h3>
    </div>
  </div>
</body>
</html>`,
  },
];

// Helper to ensure default templates exist
async function ensureDefaultTemplates() {
  for (const t of DEFAULT_EMAIL_TEMPLATES) {
    const existing = await prisma.emailTemplate.findUnique({ where: { code: t.code } });
    if (!existing) {
      await prisma.emailTemplate.create({
        data: {
          code: t.code,
          name: t.name,
          description: t.description,
          subject: t.subject,
          body_html: t.body_html,
          variables: t.variables,
          is_active: true,
        },
      });
    }
  }
}

// ---------------- EMAIL TEMPLATES ROUTES ----------------

// GET /api/email-templates - List all email templates
router.get('/templates', authMiddleware, requirePermission(PERMISSIONS.settings.view), async (_req: Request, res: Response) => {
  try {
    await ensureDefaultTemplates();
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { created_at: 'asc' },
    });
    res.json(templates);
  } catch (error: any) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ error: 'Gagal mengambil data template email' });
  }
});

// GET /api/email-templates/:id - Get email template detail
router.get('/templates/:id', authMiddleware, requirePermission(PERMISSIONS.settings.view), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await prisma.emailTemplate.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template email tidak ditemukan' });
    }

    res.json(template);
  } catch (error: any) {
    console.error('Error fetching email template:', error);
    res.status(500).json({ error: 'Gagal mengambil detail template email' });
  }
});

// PUT /api/email-templates/:id - Update email template content
router.put('/templates/:id', authMiddleware, requirePermission(PERMISSIONS.settings.edit), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, subject, body_html, body_text, is_active } = req.body;

    const existing = await prisma.emailTemplate.findFirst({
      where: { OR: [{ id }, { code: id }] },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Template email tidak ditemukan' });
    }

    const updated = await prisma.emailTemplate.update({
      where: { id: existing.id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        subject: subject !== undefined ? subject : undefined,
        body_html: body_html !== undefined ? body_html : undefined,
        body_text: body_text !== undefined ? body_text : undefined,
        is_active: is_active !== undefined ? Boolean(is_active) : undefined,
      },
    });

    res.json({
      success: true,
      message: `Template '${updated.name}' berhasil diperbarui`,
      template: updated,
    });
  } catch (error: any) {
    console.error('Error updating email template:', error);
    res.status(500).json({ error: 'Gagal memperbarui template email' });
  }
});

// POST /api/email-templates/:id/reset - Reset email template to system default
router.post('/templates/:id/reset', authMiddleware, requirePermission(PERMISSIONS.settings.edit), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.emailTemplate.findFirst({
      where: { OR: [{ id }, { code: id }] },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Template email tidak ditemukan' });
    }

    const defaultTpl = DEFAULT_EMAIL_TEMPLATES.find((t) => t.code === existing.code);
    if (!defaultTpl) {
      return res.status(400).json({ error: 'Tidak ada nilai default untuk template ini' });
    }

    const resetTpl = await prisma.emailTemplate.update({
      where: { id: existing.id },
      data: {
        subject: defaultTpl.subject,
        body_html: defaultTpl.body_html,
        variables: defaultTpl.variables,
        is_active: true,
      },
    });

    res.json({
      success: true,
      message: `Template '${resetTpl.name}' berhasil direset ke nilai default`,
      template: resetTpl,
    });
  } catch (error: any) {
    console.error('Error resetting email template:', error);
    res.status(500).json({ error: 'Gagal mereset template email' });
  }
});


// ---------------- SENT EMAIL LOGS ROUTES ----------------

// GET /api/email-logs - List sent email logs
router.get('/logs', authMiddleware, requirePermission(PERMISSIONS.settings.view), async (req: Request, res: Response) => {
  try {
    const { status, search, limit = '50' } = req.query;

    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = String(status);
    }
    if (search) {
      whereClause.OR = [
        { recipient: { contains: String(search), mode: 'insensitive' } },
        { subject: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const logs = await prisma.emailLog.findMany({
      where: whereClause,
      orderBy: { sent_at: 'desc' },
      take: parseInt(String(limit), 10) || 50,
    });

    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({ error: 'Gagal mengambil log email terkirim' });
  }
});

// POST /api/email-logs/:id/resend - Resend email from log entry
router.post('/logs/:id/resend', authMiddleware, requirePermission(PERMISSIONS.settings.edit), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const log = await prisma.emailLog.findUnique({ where: { id } });

    if (!log) {
      return res.status(404).json({ error: 'Catatan log email tidak ditemukan' });
    }

    const result = await sendEmail({
      to: log.recipient,
      subject: `[Kirim Ulang] ${log.subject}`,
      html: `<p>Email ini dikirim ulang dari sistem log pada ${new Date().toLocaleString('id-ID')}:</p><hr>${log.subject}`,
      templateCode: log.template_code || undefined,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Gagal mengirim ulang email' });
    }

    res.json({
      success: true,
      message: `Email berhasil dikirim ulang ke ${log.recipient}`,
    });
  } catch (error: any) {
    console.error('Error resending email from log:', error);
    res.status(500).json({ error: error.message || 'Gagal mengirim ulang email' });
  }
});

export default router;
