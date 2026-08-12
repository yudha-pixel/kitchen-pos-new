import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req: any, file: any, cb: any) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'ocr');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: any, file: any, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png) and PDF files are allowed'));
  },
});

// POST /ocr/scan - Upload and process image for OCR
router.post('/scan', authMiddleware, requirePermission(PERMISSIONS.finance.create), upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { scan_type = 'receipt' } = req.body;
    const userId = (req as any).user?.id;

    // Create OCR scan record
    const ocrScan = await prisma.ocrScan.create({
      data: {
        scan_type,
        image_url: `/uploads/ocr/${req.file.filename}`,
        status: 'processing',
        user_id: userId,
      },
    });

    // Simulate OCR processing (in production, integrate with Tesseract.js or Google Cloud Vision API)
    // For now, we'll set a placeholder response
    setTimeout(async () => {
      try {
        await prisma.ocrScan.update({
          where: { id: ocrScan.id },
          data: {
            status: 'completed',
            extracted_text: { text: 'OCR processing completed' },
            extracted_data: { items: [], total: 0 },
          },
        });
      } catch (error) {
        console.error('Error updating OCR scan:', error);
      }
    }, 2000);

    res.status(201).json({
      id: ocrScan.id,
      status: ocrScan.status,
      message: 'OCR processing started',
    });
  } catch (error) {
    console.error('Error processing OCR scan:', error);
    res.status(500).json({ error: 'Failed to process OCR scan' });
  }
});

// GET /ocr/scans - Get all OCR scans for current user
router.get('/scans', authMiddleware, requirePermission(PERMISSIONS.finance.view), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { scan_type, status, limit = 50, offset = 0 } = req.query;

    const where: any = { user_id: userId };
    if (scan_type) where.scan_type = scan_type;
    if (status) where.status = status;

    const scans = await prisma.ocrScan.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.ocrScan.count({ where });

    res.json({
      scans,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Error fetching OCR scans:', error);
    res.status(500).json({ error: 'Failed to fetch OCR scans' });
  }
});

// GET /ocr/scans/:id - Get specific OCR scan
router.get('/scans/:id', authMiddleware, requirePermission(PERMISSIONS.finance.view), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const idStr = Array.isArray(id) ? id[0] : id;

    const scan = await prisma.ocrScan.findFirst({
      where: { id: idStr, user_id: userId },
    });

    if (!scan) {
      return res.status(404).json({ error: 'OCR scan not found' });
    }

    res.json(scan);
  } catch (error) {
    console.error('Error fetching OCR scan:', error);
    res.status(500).json({ error: 'Failed to fetch OCR scan' });
  }
});

// DELETE /ocr/scans/:id - Delete OCR scan
router.delete('/scans/:id', authMiddleware, requirePermission(PERMISSIONS.finance.delete), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const idStr = Array.isArray(id) ? id[0] : id;

    const scan = await prisma.ocrScan.findFirst({
      where: { id: idStr, user_id: userId },
    });

    if (!scan) {
      return res.status(404).json({ error: 'OCR scan not found' });
    }

    // Delete the image file
    const imagePath = path.join(process.cwd(), scan.image_url);
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.error('Error deleting image file:', error);
    }

    await prisma.ocrScan.delete({ where: { id: idStr } });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting OCR scan:', error);
    res.status(500).json({ error: 'Failed to delete OCR scan' });
  }
});

export default router;
