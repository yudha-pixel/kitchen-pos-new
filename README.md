# Kitchen POS System

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-local-green?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

A modern, offline-first restaurant Point of Sale built with Next.js, TypeScript, PostgreSQL, Express, and Prisma. It is designed to run on a local network so multiple tablets and POS stations can share one database.

## Overview

The POS supports dine-in, takeaway, and delivery order workflows with table management, product modifiers, split bills, table merging, and offline resilience. Data is stored in a local PostgreSQL database through an Express REST API. The browser caches data in IndexedDB so orders can still be taken when the network is unavailable.

## Features

### Core POS
- Dine-in, takeaway, and delivery order entry.
- Table number assignment, table merge, and split bill.
- Category-based product modifiers.
- Admin product editing.
- Receipt-optimized print layout.
- Multi-cashier support with role-based login.

### Inventory Management
- Ingredient stock tracking with unit and min stock alerts.
- Recipe-based ingredient consumption on order creation.
- Stock adjustment logging with audit trail.
- Supplier management and purchase order tracking.
- Automatic stock updates on purchase order receipt.

### Security & Infrastructure
- JWT-based authentication with role-based access control (admin/cashier).
- Webhook signature verification for payment gateways (Midtrans, Xendit).
- Rate limiting on sensitive endpoints (login, payments).
- HTTP security headers via Helmet.
- Configurable CORS policies for production.

### Offline-first
- IndexedDB cache via Dexie.js.
- Automatic sync to PostgreSQL when online.
- Sync queue for orders created offline.

### Backend
- Local Express API bound to `0.0.0.0` for LAN access.
- JWT-based authentication.
- Prisma ORM with PostgreSQL migrations and seeding.
- UUID primary keys for idempotent offline sync.

## Tech Stack

- **Frontend:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS v4.
- **State:** Zustand, React Context.
- **Offline Cache:** Dexie.js / IndexedDB.
- **Backend:** Express.js, Prisma, PostgreSQL.
- **Auth:** JWT (`jsonwebtoken`), `bcrypt`.
- **Build/Runtime:** Node.js 20+, npm, tsx.

## Project Structure

```
kitchen-pos-new/
├── app/                    # Next.js App Router pages
│   ├── login/page.tsx
│   ├── pos/page.tsx
│   └── layout.tsx
├── src/
│   ├── components/         # Shared UI components
│   ├── features/pos/       # POS-specific components
│   ├── context/            # Auth context
│   ├── hooks/              # Data fetching and sync hooks
│   ├── lib/                # API client, IndexedDB schema, seed data
│   ├── store/              # Zustand stores
│   └── types/              # TypeScript interfaces
├── server/                 # Express + Prisma backend
│   ├── index.ts
│   ├── routes/
│   ├── middleware/
│   ├── lib/prisma.ts
│   └── prisma/
├── prisma/                 # Prisma schema and migrations
├── knowledge/              # Domain and architecture knowledge base
├── README.md
├── HANDOVER.md
├── DEPLOYMENT.md
└── .env / .env.local
```

## Prerequisites

- Node.js 20+
- npm, yarn, or pnpm
- PostgreSQL 14+ installed locally
- A PostgreSQL user and an empty database named `kitchen_pos`

## Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd kitchen-pos-new
   npm install
   ```

2. Create a `.env` file in the project root:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/kitchen_pos?schema=public"
   JWT_SECRET="change-this-in-production"
   PORT=3001
   API_HOST=0.0.0.0
   ```

3. Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
   For LAN access from other devices, use the server's IP, for example `http://192.168.1.10:3001`.

4. Create the database and apply migrations:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
   This starts the Next.js frontend on port 3000 and the Express API on port 3001.

6. Open `http://localhost:3000` and log in with:
   - **Username:** `admin`
   - **Password:** `admin`

## Usage

1. Select a category from the sidebar.
2. Tap products to add them to the cart.
3. Choose modifiers when prompted.
4. Enter a table number or select an order type.
5. Tap Pay and select a payment method: Cash, QRIS, or Debit.
6. Print or save the receipt.

Use the cart panel controls for split bills and table merging.

## Offline Behavior

- When the API is reachable, reads and writes go to PostgreSQL.
- If the API becomes unreachable, the app writes orders to IndexedDB and queues them for sync.
- When connectivity returns, the Sync Manager pushes queued orders to PostgreSQL.
- All queued records use client-generated UUIDs to prevent duplicates.

## API Endpoints

Base URL: `http://localhost:3001`

### Authentication
| Method | Path                     | Description                     |
| ------ | ------------------------ | ------------------------------- |
| POST   | `/auth/login`            | Login and receive JWT           |
| POST   | `/auth/register`         | Register a new user (admin)   |
| GET    | `/auth/me`               | Current user profile            |

### Products & Orders
| Method | Path                     | Description                     |
| ------ | ------------------------ | ------------------------------- |
| GET    | `/health`                | API health check                |
| GET    | `/categories`            | List categories                 |
| GET    | `/products`              | List products                   |
| PATCH  | `/products/:id`          | Update a product                |
| GET    | `/modifiers`             | List modifiers                  |
| GET    | `/orders`                | List orders                     |
| POST   | `/orders`                | Create an order with items      |
| GET    | `/orders/:id/items`      | Get order items                 |
| PATCH  | `/orders/:id/status`     | Update order status             |
| POST   | `/orders/merge-table`    | Merge orders from two tables    |
| POST   | `/void-logs`             | Record voided items             |

### Inventory & Suppliers
| Method | Path                     | Description                     |
| ------ | ------------------------ | ------------------------------- |
| GET    | `/ingredients`           | List ingredients                |
| POST   | `/ingredients`           | Create ingredient (admin)      |
| PUT    | `/ingredients/:id`       | Update ingredient (admin)      |
| DELETE | `/ingredients/:id`       | Delete ingredient (admin)      |
| GET    | `/recipes`               | List recipes                   |
| GET    | `/suppliers`             | List suppliers                  |
| POST   | `/suppliers`             | Create supplier (admin)         |
| PUT    | `/suppliers/:id`         | Update supplier (admin)         |
| DELETE | `/suppliers/:id`         | Delete supplier (admin)         |
| POST   | `/suppliers/:id/purchase-orders` | Create purchase order (admin) |
| PATCH  | `/suppliers/:id/purchase-orders/:poId/receive` | Receive PO (admin) |

### Payments
| Method | Path                     | Description                     |
| ------ | ------------------------ | ------------------------------- |
| POST   | `/payments`              | Create payment (auth)           |
| PATCH  | `/payments/:id/status`   | Update payment status (auth)    |
| POST   | `/webhooks/payment`      | Payment webhook (signature verified) |

## Scripts

| Script                | Description                               |
| --------------------- | ----------------------------------------- |
| `npm run dev`         | Start frontend and API concurrently       |
| `npm run api:dev`     | Start API with hot reload (tsx)           |
| `npm run api:start`   | Start API for production                  |
| `npm run db:migrate`  | Run Prisma migrate dev                    |
| `npm run db:seed`     | Seed the database                         |
| `npm run db:generate` | Generate Prisma client                    |
| `npm run build`       | Build the Next.js frontend                |
| `npm run lint`        | Run ESLint                                |
| `npx tsc --noEmit`    | Type-check the project                    |
| `npm test`            | Run test suite (63 tests)                 |

## Testing Guide

The project includes a comprehensive test suite covering business logic, security, and integration tests.

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test server/__tests__/orders.restore.test.ts
```

### Test Files

| Test File | Description | Tests |
|-----------|-------------|-------|
| `orders.restore.test.ts` | Order void/cancel and stock restoration | 9 |
| `orders.stock.test.ts` | Ingredient stock validation on orders | 6 |
| `payments.security.test.ts` | Payment endpoint security & auth | 8 |
| `inventory.security.test.ts` | Inventory CRUD & stock adjustment security | 12 |
| `webhook.security.test.ts` | Webhook signature verification (Midtrans/Xendit) | 8 |
| `infrastructure.security.test.ts` | Helmet headers, rate limiting, CORS | 8 |
| `suppliers.test.ts` | Supplier & purchase order integration | 12 |

**Total: 63 tests**

### Test Coverage

- **Authentication & Authorization**: JWT token validation, role-based access control
- **Inventory Management**: Stock consumption, restoration, adjustment logging
- **Payment Security**: Amount validation, status updates, webhook verification
- **Supplier Management**: CRUD operations, purchase order flow, stock updates
- **Infrastructure**: Security headers, rate limiting, CORS configuration

## Roadmap

Detailed planning documents are in the `knowledge/` folder:

- `01-current-tech-stack.md` — Deep dive into the current stack.
- `02-pos-domain-and-kitchen-workflows.md` — Dine-in, takeaway, delivery, KDS, printers.
- `03-inventory-procurement-and-ocr.md` — Inventory, purchase orders, vendor bills, OCR.
- `04-reporting-financials-shifts.md` — Reports, P&L, open/close shifts.
- `05-staff-crm-communications.md` — Staff, payroll, CRM, email, WhatsApp.
- `06-security-backup-testing-training.md` — Security, backups, tests, training.
- `07-odoo-alternative-and-roadmap.md` — Odoo comparison and phased roadmap.

## Deployment

### Local Development

1. Copy `.env.example` to `.env` and configure environment variables
2. Run `npm run db:migrate` to apply database migrations
3. Run `npm run db:seed` to seed initial data
4. Run `npm run dev` to start development servers

### Production Deployment

1. **Environment Configuration**:
   ```bash
   # Copy and configure environment file
   cp .env.example .env
   
   # Generate strong JWT_SECRET
   openssl rand -base64 32
   
   # Set NODE_ENV to production
   export NODE_ENV=production
   ```

2. **Database Setup**:
   ```bash
   # Apply migrations
   npm run db:migrate
   
   # Generate Prisma client
   npm run db:generate
   ```

3. **Build & Start**:
   ```bash
   # Build Next.js frontend
   npm run build
   
   # Start API server
   npm run api:start
   ```

4. **Reverse Proxy** (recommended):
   - Place behind Nginx or similar reverse proxy
   - Configure SSL/TLS certificates
   - Set up proper CORS origins in `CORS_ORIGIN` environment variable

### Security Notes

**Critical Security Configuration:**

1. **JWT_SECRET**:
   - Must be a strong, random string (minimum 32 characters)
   - Generate with: `openssl rand -base64 32`
   - Never use default values in production
   - Application will refuse to start with weak secrets in production mode

2. **Environment Variables**:
   - Use `.env.example` as a template
   - Never commit `.env` or `.env.local` to version control
   - Required variables: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`

3. **CORS Configuration**:
   - In production, `CORS_ORIGIN` must be set to specific allowed origins
   - Format: comma-separated list (e.g., `https://yourdomain.com,https://app.yourdomain.com`)
   - If unset in production, a warning will be logged

4. **Database Security**:
   - Keep PostgreSQL behind firewall
   - Do not expose port 5432 to the internet
   - Use strong database passwords
   - Enable SSL for database connections in production

5. **Payment Gateway Security**:
   - Webhook signatures are verified for Midtrans (SHA512) and Xendit (HMAC-SHA256)
   - Configure `WEBHOOK_SECRET` for signature verification
   - Never expose server keys in client-side code

6. **Rate Limiting**:
   - Login endpoint: 100 requests per 15 minutes (configurable)
   - Payment endpoints: 100 requests per 15 minutes
   - Rate limiting is disabled in test environment

7. **HTTP Security Headers**:
   - Helmet middleware applied globally
   - Content Security Policy configured
   - X-Frame-Options, X-Content-Type-Options, HSTS enabled

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m 'feat: add your feature'`.
4. Push and open a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, open an issue in the GitHub repository or contact the development team.
