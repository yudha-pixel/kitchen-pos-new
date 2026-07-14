import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';

const app = express();
const PORT = Number(process.env.PORT || 3001);
const API_HOST = process.env.API_HOST || '0.0.0.0';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use(productRoutes);
app.use(orderRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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
