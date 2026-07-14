import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import printRoutes from './routes/print';

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Add it to .env before starting the API.');
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT || 3001);
const API_HOST = process.env.API_HOST || '0.0.0.0';

// CORS_ORIGIN: comma-separated list of allowed origins (e.g. "http://localhost:3000,http://192.168.1.10:3000").
// Unset = allow all origins (LAN default for multi-device POS stations).
const corsOrigins = process.env.CORS_ORIGIN?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors(corsOrigins?.length ? { origin: corsOrigins } : undefined));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use(productRoutes);
app.use(orderRoutes);
app.use(printRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Duplicate value for a unique field' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ error: 'Related record not found' });
      return;
    }
  }

  console.error('API error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, API_HOST, () => {
  console.log(`🚀 Kitchen POS API running at http://${API_HOST}:${PORT}`);
});

const gracefulShutdown = async () => {
  console.log('Shutting down API...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
