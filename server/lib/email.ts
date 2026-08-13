import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';

export interface SmtpConfig {
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_user?: string | null;
  smtp_pass?: string | null;
  smtp_from_email?: string | null;
  smtp_from_name?: string | null;
  smtp_secure?: boolean | null;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  templateCode?: string;
}

// Retrieve SMTP Configuration from Database AppSettings or Environment Variables
export async function getSmtpConfig(): Promise<SmtpConfig> {
  try {
    const settings = await prisma.appSettings.findFirst({
      select: {
        smtp_host: true,
        smtp_port: true,
        smtp_user: true,
        smtp_pass: true,
        smtp_from_email: true,
        smtp_from_name: true,
        smtp_secure: true,
      },
    });

    return {
      smtp_host: settings?.smtp_host || process.env.SMTP_HOST || '',
      smtp_port: settings?.smtp_port || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587),
      smtp_user: settings?.smtp_user || process.env.SMTP_USER || '',
      smtp_pass: settings?.smtp_pass || process.env.SMTP_PASS || '',
      smtp_from_email: settings?.smtp_from_email || process.env.SMTP_FROM_EMAIL || 'noreply@kitchenpos.com',
      smtp_from_name: settings?.smtp_from_name || process.env.SMTP_FROM_NAME || 'Kitchen POS',
      smtp_secure: settings?.smtp_secure ?? (process.env.SMTP_SECURE === 'true'),
    };
  } catch (error) {
    console.error('Failed to load SMTP config from DB:', error);
    return {
      smtp_host: process.env.SMTP_HOST || '',
      smtp_port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      smtp_user: process.env.SMTP_USER || '',
      smtp_pass: process.env.SMTP_PASS || '',
      smtp_from_email: process.env.SMTP_FROM_EMAIL || 'noreply@kitchenpos.com',
      smtp_from_name: process.env.SMTP_FROM_NAME || 'Kitchen POS',
      smtp_secure: process.env.SMTP_SECURE === 'true',
    };
  }
}

// Create Nodemailer Transporter
export async function getTransporter(customConfig?: SmtpConfig) {
  const config = customConfig || (await getSmtpConfig());

  if (!config.smtp_host) {
    return null;
  }

  const port = config.smtp_port || 587;
  const isSecure = config.smtp_secure ?? (port === 465);

  return nodemailer.createTransport({
    host: config.smtp_host,
    port: port,
    secure: isSecure,
    auth: (config.smtp_user && config.smtp_pass) ? {
      user: config.smtp_user,
      pass: config.smtp_pass,
    } : undefined,
    tls: {
      rejectUnauthorized: false, // Prevents self-signed cert issues
    },
  });
}

// Verify SMTP Connection Credentials
export async function verifySmtpConnection(config: SmtpConfig): Promise<{ success: boolean; message: string }> {
  if (!config.smtp_host) {
    return { success: false, message: 'SMTP Host belum diisi' };
  }

  try {
    const transporter = await getTransporter(config);
    if (!transporter) {
      return { success: false, message: 'Gagal inisialisasi server SMTP' };
    }

    await transporter.verify();
    return { success: true, message: 'Koneksi server SMTP berhasil diverifikasi' };
  } catch (err: any) {
    console.error('SMTP verification error:', err);
    return { success: false, message: err.message || 'Gagal terhubung ke server SMTP' };
  }
}

// Send Generic Email & Log Entry to EmailLog Table
export async function sendEmail(options: SendEmailOptions, customConfig?: SmtpConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = customConfig || (await getSmtpConfig());
  const transporter = await getTransporter(config);

  if (!transporter) {
    console.warn('[EMAIL SIMULATION] SMTP not configured. Logged email to console & database log.');
    
    // Log simulated email in DB
    try {
      await prisma.emailLog.create({
        data: {
          recipient: options.to,
          subject: options.subject,
          template_code: options.templateCode || null,
          status: 'SIMULATED',
          message_id: `simulated-${Date.now()}`,
          error_message: 'Server SMTP belum dikonfigurasi. Email disimulasikan di log.',
        },
      });
    } catch (e) {
      console.error('Failed to save EmailLog simulation:', e);
    }

    return { 
      success: true, 
      messageId: `simulated-${Date.now()}`,
    };
  }

  const fromName = config.smtp_from_name || 'Kitchen POS';
  const fromEmail = config.smtp_from_email || 'noreply@kitchenpos.com';

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>?/gm, ''),
    });

    console.log(`[EMAIL SENT] ID: ${info.messageId} to ${options.to}`);

    // Log success entry in database
    await prisma.emailLog.create({
      data: {
        recipient: options.to,
        subject: options.subject,
        template_code: options.templateCode || null,
        status: 'SENT',
        message_id: info.messageId,
      },
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('Error sending email via SMTP:', err);

    // Log failed attempt in database
    try {
      await prisma.emailLog.create({
        data: {
          recipient: options.to,
          subject: options.subject,
          template_code: options.templateCode || null,
          status: 'FAILED',
          error_message: err.message || 'Gagal mengirim email via SMTP',
        },
      });
    } catch (e) {
      console.error('Failed to log failed email attempt:', e);
    }

    return { success: false, error: err.message || 'Gagal mengirim email via SMTP' };
  }
}

// Compile template string by replacing {{variable_name}}
export function compileTemplate(templateText: string, variables: Record<string, any>): string {
  let result = templateText;
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(variables[key] ?? ''));
  });
  return result;
}

// Renders and Sends Password Reset Email (Checks EmailTemplate in DB or uses default)
export async function sendPasswordResetEmail(user: { id: string; username: string; email: string; full_name?: string | null }, tempPassword?: string) {
  const recipientName = user.full_name || user.username;
  const storeName = 'Kitchen POS Restaurant System';

  // Try to load template from database
  let template = await prisma.emailTemplate.findUnique({
    where: { code: 'reset_password' },
  }).catch(() => null);

  if (template && template.is_active) {
    const variables = {
      user_name: recipientName,
      username: user.username,
      email: user.email,
      temp_password: tempPassword || '',
      store_name: storeName,
    };

    const subject = compileTemplate(template.subject, variables);
    const html = compileTemplate(template.body_html, variables);

    return sendEmail({
      to: user.email,
      subject,
      html,
      templateCode: 'reset_password',
    });
  }

  // Fallback system default HTML template
  const resetContentHtml = tempPassword ? `
    <p>Kata sandi baru Anda telah direset oleh Administrator sistem:</p>
    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
      <span style="font-size: 14px; color: #4b5563;">Kata Sandi Sementara:</span>
      <h2 style="font-size: 24px; font-weight: 800; color: #1f2937; letter-spacing: 2px; margin: 8px 0;">${tempPassword}</h2>
    </div>
    <p style="font-size: 13px; color: #6b7280;">Segera masuk ke aplikasi dan ubah kata sandi Anda di menu Pengaturan Profil untuk keamanan akun.</p>
  ` : `
    <p>Kami menerima permintaan untuk mereset kata sandi akun Kitchen POS Anda.</p>
    <p>Silakan gunakan kata sandi baru untuk masuk ke aplikasi.</p>
  `;

  const defaultHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Password - Kitchen POS</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="background-color: #2563eb; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;">${storeName}</h1>
        </div>
        <div style="padding: 32px; color: #1f2937;">
          <h2 style="font-size: 18px; font-weight: 600; margin-top: 0;">Halo, ${recipientName} 👋</h2>
          ${resetContentHtml}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 20px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
            Email otomatis ini dikirim oleh Sistem Kitchen POS. Harap tidak membalas email ini.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `[Kitchen POS] Reset Password Akun ${user.username}`,
    html: defaultHtml,
    templateCode: 'reset_password',
  });
}
