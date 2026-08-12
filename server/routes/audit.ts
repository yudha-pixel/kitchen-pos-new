import express, { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = express.Router();

// Audit logging middleware
export const auditLogger = (action: string, entity_type: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      // Log after response is sent
      setImmediate(async () => {
        try {
          const userId = (req as any).user?.id;
          const ipAddress = req.ip || req.socket.remoteAddress;
          const userAgent = req.get('user-agent');

          await prisma.auditLog.create({
            data: {
              user_id: userId,
              action,
              entity_type,
              entity_id: req.params.id || (req.body as any).id,
              old_value: (req.body as any).old_value || null,
              new_value: req.body,
              ip_address: ipAddress,
              user_agent: userAgent,
              description: `${action} ${entity_type}`,
            },
          });
        } catch (error) {
          console.error('Error creating audit log:', error);
        }
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// GET /audit - Get all audit logs
router.get('/', authMiddleware, requirePermission(PERMISSIONS.audit.view), async (req: Request, res: Response) => {
  try {
    const { user_id, action, entity_type, limit = 100, offset = 0 } = req.query;

    const where: any = {};
    if (user_id) where.user_id = user_id;
    if (action) where.action = action;
    if (entity_type) where.entity_type = entity_type;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.auditLog.count({ where });

    res.json({
      logs,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// GET /audit/:id - Get specific audit log
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.audit.view), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const log = await prisma.auditLog.findUnique({
      where: { id: id as string },
    });

    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// GET /audit/stats - Get audit statistics
router.get('/stats/summary', authMiddleware, requirePermission(PERMISSIONS.audit.view), async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const totalLogs = await prisma.auditLog.count({
      where: { created_at: { gte: startDate } },
    });

    const logsByAction = await prisma.auditLog.groupBy({
      by: ['action'],
      where: { created_at: { gte: startDate } },
      _count: { action: true },
    });

    const logsByEntityType = await prisma.auditLog.groupBy({
      by: ['entity_type'],
      where: { created_at: { gte: startDate } },
      _count: { entity_type: true },
    });

    const logsByUser = await prisma.auditLog.groupBy({
      by: ['user_id'],
      where: { created_at: { gte: startDate } },
      _count: { user_id: true },
      orderBy: { _count: { user_id: 'desc' } },
      take: 10,
    });

    res.json({
      totalLogs,
      logsByAction,
      logsByEntityType,
      topUsers: logsByUser,
    });
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    res.status(500).json({ error: 'Failed to fetch audit statistics' });
  }
});

export default router;
