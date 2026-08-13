import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { loadRolePermissions } from '../middleware/permissions';
import { serializeAuthenticatedUser } from '../lib/authenticatedUser';

const router = Router();

const updateProfileSchema = z.object({
  full_name: z.string().min(1, 'Nama lengkap tidak boleh kosong').optional(),
  email: z.string().email('Format email tidak valid').nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Kata sandi saat ini harus diisi'),
  new_password: z.string().min(6, 'Kata sandi baru minimal 6 karakter'),
  confirm_password: z.string().min(6, 'Konfirmasi kata sandi minimal 6 karakter'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru',
  path: ['confirm_password'],
});

const updatePinSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, 'PIN harus berupa 4-6 digit angka').optional().or(z.literal('')),
  enabled: z.boolean(),
});

// PATCH /api/user/profile - Update personal profile information
router.patch('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const body = updateProfileSchema.parse(req.body);

    const updateData: { full_name?: string; email?: string | null; phone?: string | null } = {};
    if (body.full_name !== undefined) updateData.full_name = body.full_name;
    if (body.email !== undefined) updateData.email = body.email === '' ? null : body.email;
    if (body.phone !== undefined) updateData.phone = body.phone === '' ? null : body.phone;

    // Check email uniqueness if email is changing
    if (updateData.email) {
      const existingEmail = await prisma.profile.findFirst({
        where: {
          email: updateData.email,
          NOT: { id: userId },
        },
      });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email sudah digunakan oleh pengguna lain' });
      }
    }

    const updatedUser = await prisma.profile.update({
      where: { id: userId },
      data: updateData,
      include: { role: true, outlet: true },
    });

    const permissions = await loadRolePermissions(updatedUser.role_id);
    const serialized = serializeAuthenticatedUser(updatedUser, permissions);

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      user: serialized,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Data tidak valid' });
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Gagal memperbarui profil' });
  }
});

// POST /api/user/change-password - Change user password
router.post('/change-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const { current_password, new_password } = changePasswordSchema.parse(req.body);

    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Kata sandi saat ini salah' });
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10);
    await prisma.profile.update({
      where: { id: userId },
      data: { password_hash: newPasswordHash },
    });

    res.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Data tidak valid' });
    }
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Gagal mengubah kata sandi' });
  }
});

// POST /api/user/pin - Configure quick access POS PIN
router.post('/pin', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const { pin, enabled } = updatePinSchema.parse(req.body);

    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    const currentPreferences = (user.preferences as Record<string, any>) || {};

    let pinHash = currentPreferences.pos_pin_hash;
    if (enabled && pin) {
      pinHash = await bcrypt.hash(pin, 10);
    } else if (!enabled) {
      pinHash = null;
    }

    const updatedPreferences = {
      ...currentPreferences,
      pos_pin_enabled: enabled,
      pos_pin_hash: pinHash,
    };

    await prisma.profile.update({
      where: { id: userId },
      data: { preferences: updatedPreferences },
    });

    res.json({
      success: true,
      message: 'Pengaturan PIN POS berhasil disimpan',
      enabled,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Data tidak valid' });
    }
    console.error('Error updating PIN:', error);
    res.status(500).json({ error: 'Gagal memperbarui PIN POS' });
  }
});

// POST /api/user/send-reset-password - Trigger password reset email via SMTP for target user
router.post('/send-reset-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { user_id, email } = req.body;

    if (!user_id && !email) {
      return res.status(400).json({ error: 'ID Pengguna atau Email harus diisi' });
    }

    const user = await prisma.profile.findFirst({
      where: user_id ? { id: user_id } : { email: email },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    if (!user.email) {
      return res.status(400).json({ error: `Pengguna ${user.username} belum mendaftarkan email` });
    }

    // Generate random 8-character temporary password
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789#@!';
    let tempPassword = '';
    for (let i = 0; i < 8; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Update password in database
    const newPasswordHash = await bcrypt.hash(tempPassword, 10);
    await prisma.profile.update({
      where: { id: user.id },
      data: { password_hash: newPasswordHash },
    });

    // Send reset email via SMTP service
    const { sendPasswordResetEmail } = await import('../lib/email');
    const emailResult = await sendPasswordResetEmail({
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
    }, tempPassword);

    if (!emailResult.success) {
      return res.status(500).json({ 
        error: `Kata sandi berhasil direset (${tempPassword}), namun email gagal dikirim via SMTP: ${emailResult.error}` 
      });
    }

    res.json({
      success: true,
      message: `Email reset password telah berhasil dikirim ke ${user.email}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Error sending reset password email:', error);
    res.status(500).json({ error: error.message || 'Gagal mengirim email reset password' });
  }
});

export default router;

