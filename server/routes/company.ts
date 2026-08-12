import { Router, type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';
import { buildObjectKey, deleteObject, putObject, streamObjectTo } from '../lib/storage';
import {
  detectCompanyLogoMimeType,
  serializeCompany,
  serializeCompanyIdentity,
  validateCompanyPatch,
} from '../lib/company';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1 } });

function receiveCompanyLogo(req: Request, res: Response, next: NextFunction) {
  upload.single('logo')(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'Ukuran logo maksimum 2 MB.' });
      return;
    }
    if (error) {
      res.status(400).json({ error: 'Berkas logo tidak dapat diproses.' });
      return;
    }
    next();
  });
}

async function getCompany() {
  return prisma.company.findFirst({ orderBy: { created_at: 'asc' } });
}

router.get('/identity', authMiddleware, async (_req, res) => {
  const company = await getCompany();
  if (!company) return res.status(503).json({ error: 'Konfigurasi perusahaan belum tersedia.' });
  res.json(serializeCompanyIdentity(company));
});

router.get('/config', authMiddleware, async (_req, res) => {
  const company = await getCompany();
  if (!company) return res.status(503).json({ error: 'Konfigurasi perusahaan belum tersedia.' });
  res.json({
    timezone: company.timezone,
    currency: company.currency,
    tax_rate: company.tax_rate,
    service_charge: company.service_charge,
  });
});

router.get('/logo', async (_req, res) => {
  const company = await getCompany();
  if (!company?.logo_path || !company.logo_mime_type) return res.status(404).json({ error: 'Logo perusahaan belum tersedia.' });
  const served = await streamObjectTo(res, company.logo_path, company.logo_mime_type);
  if (!served) res.status(404).json({ error: 'Logo perusahaan belum tersedia.' });
});

router.get('/', authMiddleware, requirePermission(PERMISSIONS.settings.view), async (_req, res) => {
  const company = await getCompany();
  if (!company) return res.status(503).json({ error: 'Konfigurasi perusahaan belum tersedia.' });
  res.json(serializeCompany(company));
});

router.put('/', authMiddleware, requirePermission(PERMISSIONS.settings.edit), async (req, res) => {
  const validation = validateCompanyPatch(req.body ?? {});
  if ('error' in validation) return res.status(400).json({ error: validation.error });
  const company = await getCompany();
  if (!company) return res.status(503).json({ error: 'Konfigurasi perusahaan belum tersedia.' });
  const updated = await prisma.company.update({ where: { id: company.id }, data: validation.data });
  res.json(serializeCompany(updated));
});

router.post('/logo', authMiddleware, requirePermission(PERMISSIONS.settings.edit), receiveCompanyLogo, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Pilih berkas logo untuk diunggah.' });
  const detectedMime = detectCompanyLogoMimeType(req.file.buffer);
  if (!detectedMime || detectedMime !== req.file.mimetype) {
    return res.status(400).json({ error: 'Logo harus berupa PNG, JPEG, atau WebP yang valid.' });
  }
  const company = await getCompany();
  if (!company) return res.status(503).json({ error: 'Konfigurasi perusahaan belum tersedia.' });
  const extension = detectedMime === 'image/png' ? 'png' : detectedMime === 'image/jpeg' ? 'jpg' : 'webp';
  const key = buildObjectKey('company', extension);
  await putObject(key, req.file.buffer, detectedMime);
  try {
    const updated = await prisma.company.update({
      where: { id: company.id },
      data: { logo_path: key, logo_mime_type: detectedMime },
    });
    if (company.logo_path) await deleteObject(company.logo_path);
    res.json(serializeCompany(updated));
  } catch (error) {
    await deleteObject(key);
    throw error;
  }
});

router.delete('/logo', authMiddleware, requirePermission(PERMISSIONS.settings.edit), async (_req, res) => {
  const company = await getCompany();
  if (!company) return res.status(503).json({ error: 'Konfigurasi perusahaan belum tersedia.' });
  const updated = await prisma.company.update({ where: { id: company.id }, data: { logo_path: null, logo_mime_type: null } });
  if (company.logo_path) await deleteObject(company.logo_path);
  res.json(serializeCompany(updated));
});

export default router;
