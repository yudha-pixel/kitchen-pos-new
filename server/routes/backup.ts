import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);
const router = express.Router();

// POST /backup - Create database backup
router.post('/', authMiddleware, requirePermission(PERMISSIONS.backup.create), async (req: Request, res: Response) => {
  try {
    const { backup_type = 'manual', notes } = req.body;
    const userId = (req as any).user?.id;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `kitchen-pos-backup-${timestamp}.sql`;
    const backupDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupDir, filename);

    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    // Get DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({ error: 'DATABASE_URL not configured' });
    }

    // Parse DATABASE_URL to get connection details
    const url = new URL(databaseUrl);
    const dbName = url.pathname.slice(1);
    const dbHost = url.hostname;
    const dbPort = url.port || '5432';
    const dbUser = url.username;
    const dbPassword = url.password;

    // Set PGPASSWORD environment variable for pg_dump
    process.env.PGPASSWORD = dbPassword;

    // Execute pg_dump command
    const dumpCommand = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F c -f "${filePath}"`;

    try {
      await execAsync(dumpCommand);
    } catch (error) {
      console.error('pg_dump error:', error);
      return res.status(500).json({ error: 'Failed to create database backup' });
    }

    // Get file size
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;

    // Create backup record
    const backup = await prisma.databaseBackup.create({
      data: {
        filename,
        file_path: filePath,
        file_size: BigInt(fileSize),
        backup_type,
        status: 'completed',
        created_by: userId,
        notes,
      },
    });

    // Convert BigInt to number for JSON serialization
    const responseBackup = {
      ...backup,
      file_size: Number(backup.file_size),
    };

    res.status(201).json(responseBackup);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// GET /backup - Get all backups
router.get('/', authMiddleware, requirePermission(PERMISSIONS.backup.view), async (req: Request, res: Response) => {
  try {
    const { backup_type, status, limit = 50, offset = 0 } = req.query;

    const where: any = {};
    if (backup_type) where.backup_type = backup_type;
    if (status) where.status = status;

    const backups = await prisma.databaseBackup.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.databaseBackup.count({ where });

    // Convert BigInt to number for JSON serialization
    const responseBackups = backups.map((backup: { file_size: bigint }) => ({
      ...backup,
      file_size: Number(backup.file_size),
    }));

    res.json({
      backups: responseBackups,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(500).json({ error: 'Failed to fetch backups' });
  }
});

// GET /backup/:id - Get specific backup
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.backup.view), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const backup = await prisma.databaseBackup.findUnique({
      where: { id: id as string },
    });

    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    // Convert BigInt to number for JSON serialization
    const responseBackup = {
      ...backup,
      file_size: Number(backup.file_size),
    };

    res.json(responseBackup);
  } catch (error) {
    console.error('Error fetching backup:', error);
    res.status(500).json({ error: 'Failed to fetch backup' });
  }
});

// POST /backup/:id/restore - Restore from backup
router.post('/:id/restore', authMiddleware, requirePermission(PERMISSIONS.backup.restore), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const backup = await prisma.databaseBackup.findUnique({
      where: { id: id as string },
    });

    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    // Get DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({ error: 'DATABASE_URL not configured' });
    }

    // Parse DATABASE_URL to get connection details
    const url = new URL(databaseUrl);
    const dbName = url.pathname.slice(1);
    const dbHost = url.hostname;
    const dbPort = url.port || '5432';
    const dbUser = url.username;
    const dbPassword = url.password;

    // Set PGPASSWORD environment variable for pg_restore
    process.env.PGPASSWORD = dbPassword;

    // Execute pg_restore command
    const restoreCommand = `pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${backup.file_path}"`;

    try {
      await execAsync(restoreCommand);
    } catch (error) {
      console.error('pg_restore error:', error);
      return res.status(500).json({ error: 'Failed to restore database' });
    }

    res.json({ success: true, message: 'Database restored successfully' });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// DELETE /backup/:id - Delete backup
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.backup.delete), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const backup = await prisma.databaseBackup.findUnique({
      where: { id: id as string },
    });

    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    // Delete the backup file
    try {
      await fs.unlink(backup.file_path);
    } catch (error) {
      console.error('Error deleting backup file:', error);
    }

    await prisma.databaseBackup.delete({ where: { id: id as string } });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

export default router;
