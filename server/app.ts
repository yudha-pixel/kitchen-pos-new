import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import printRoutes from './routes/print';
import selfOrderRoutes from './routes/selfOrder';
import outletRoutes from './routes/outlets';
import paymentRoutes from './routes/payments';
import settingsRoutes from './routes/settings';
import ingredientRoutes from './routes/ingredients';
import recipeRoutes from './routes/recipes';
import supplierRoutes from './routes/suppliers';
import customerRoutes from './routes/customers';
import voucherRoutes from './routes/vouchers';
import hrRoutes from './routes/hr';
import attendanceRoutes from './routes/attendance';
import tableRoutes from './routes/tables';
import splitBillRoutes from './routes/splitBill';
import userRoutes from './routes/users';
import roleRoutes from './routes/roles';
import warehouseRoutes from './routes/warehouses';
import stockTransferRoutes from './routes/stockTransfers';
import stockRequestRoutes from './routes/stockRequests';
import stockWriteOffRoutes from './routes/stockWriteOffs';
import notificationRoutes from './routes/notifications';
import quotationRequestRoutes from './routes/quotationRequests';
import quotationRoutes from './routes/quotations';
import purchaseOrderRoutes from './routes/purchaseOrders';
import goodsReceivedNoteRoutes from './routes/goodsReceivedNotes';
import invoiceRoutes from './routes/invoices';
import supplierPaymentRoutes from './routes/supplierPayments';
import approvalWorkflowRoutes from './routes/approvalWorkflows';
import ocrRoutes from './routes/ocr';
import kitchenRoutes from './routes/kitchen';
import backupRoutes from './routes/backup';
import auditRoutes from './routes/audit';

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Add it to .env before starting the API.');
  process.exit(1);
}

// Warn if using default/weak JWT_SECRET in production
const weakSecrets = ['change-this-in-production', 'secret', 'password', 'jwt-secret', 'your-super-secret-jwt-key-change-in-production-min-32-chars'];
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && weakSecrets.includes(process.env.JWT_SECRET)) {
  console.error('FATAL: JWT_SECRET is using a default/weak value in production. This is a security risk.');
  console.error('Please set a strong, random JWT_SECRET in your environment variables.');
  console.error('Generate one with: openssl rand -base64 32');
  process.exit(1);
}

if (isProduction && process.env.JWT_SECRET.length < 32) {
  console.warn('WARNING: JWT_SECRET is less than 32 characters. Consider using a longer secret for better security.');
}

export const app = express();

// Apply Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow for certain cross-origin resources
}));

// CORS_ORIGIN: comma-separated list of allowed origins (e.g. "http://localhost:3000,http://192.168.1.10:3000").
// In production, CORS_ORIGIN must be set to specific origins.
// In development, if unset, allows all origins (LAN default for multi-device POS stations).
const corsOrigins = process.env.CORS_ORIGIN?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && !corsOrigins?.length) {
  console.warn('WARNING: CORS_ORIGIN is not set in production. This may allow unauthorized cross-origin requests.');
}

app.use(cors(corsOrigins?.length ? { origin: corsOrigins } : undefined));

// Rate limiting for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased limit for testing
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Raw body parser for webhook signature verification (Xendit requires raw body)
app.use(express.json({ limit: '10mb', verify: (req: any, _res, buf) => {
  req.rawBody = buf;
} }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply rate limiters to routes
app.use('/auth/login', authLimiter); // Stricter limit for login endpoint
app.use('/auth', authRoutes);
app.use(productRoutes);
app.use(orderRoutes);
app.use(printRoutes);
app.use('/self-order', selfOrderRoutes);
app.use('/outlets', outletRoutes);
app.use(generalLimiter, paymentRoutes); // Apply to payment endpoints
app.use('/settings', settingsRoutes);
app.use('/ingredients', ingredientRoutes);
app.use('/recipes', recipeRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/customers', customerRoutes);
app.use('/vouchers', voucherRoutes);
app.use('/hr', hrRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/tables', tableRoutes);
app.use('/split-bill', splitBillRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/warehouses', warehouseRoutes);
app.use('/stock-transfers', stockTransferRoutes);
app.use('/stock-requests', stockRequestRoutes);
app.use('/stock-write-offs', stockWriteOffRoutes);
app.use('/notifications', notificationRoutes);
app.use('/quotation-requests', quotationRequestRoutes);
app.use('/quotations', quotationRoutes);
app.use('/purchase-orders', purchaseOrderRoutes);
app.use('/goods-received-notes', goodsReceivedNoteRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/supplier-payments', supplierPaymentRoutes);
app.use('/approval-workflows', approvalWorkflowRoutes);
app.use('/ocr', ocrRoutes);
app.use('/kitchen', kitchenRoutes);
app.use('/backup', backupRoutes);
app.use('/audit', auditRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    });
    return;
  }

  // Prisma known errors
  if (err && typeof err === 'object' && 'code' in err) {
    const prismaErr = err as { code: string };
    if (prismaErr.code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
    if (prismaErr.code === 'P2002') {
      res.status(409).json({ error: 'Duplicate value for a unique field' });
      return;
    }
    if (prismaErr.code === 'P2003') {
      res.status(400).json({ error: 'Related record not found' });
      return;
    }
    if (prismaErr.code === 'P2023') {
      res.status(400).json({ error: 'Invalid parameter format' });
      return;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token expired' });
    return;
  }

  // Log error with structured format
  const logData = {
    timestamp: new Date().toISOString(),
    error: err.message,
    name: err.name,
    stack: isProduction ? undefined : err.stack,
  };
  console.error(JSON.stringify(logData));

  // Generic error response
  res.status(500).json({
    error: 'Internal server error',
    ...(isProduction ? {} : { message: err.message }),
  });
});
