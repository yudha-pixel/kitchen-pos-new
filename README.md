# Kitchen POS System

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-local-green?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

A modern, offline-first restaurant Point of Sale built with Next.js, TypeScript, PostgreSQL, Express, and Prisma. It is designed to run on a local network so multiple tablets and POS stations can share one database.

## Overview

The POS supports dine-in, takeaway, and delivery order workflows with table management, product modifiers, split bills, table merging, and offline resilience. Data is stored in a local PostgreSQL database through an Express REST API. The browser caches data in IndexedDB so orders can still be taken when the network is unavailable.

The system features capability-based authorization (RBAC migration completed), 11 integrated modules, and comprehensive inventory management with 8 sub-routes including purchase orders, quotations, goods received notes, and supplier payments.

## Features

### Core POS
- Dine-in, takeaway, and delivery order entry.
- Table number assignment, table merge, and split bill.
- Category-based product modifiers.
- Admin product editing.
- Receipt-optimized print layout.
- Multi-cashier support with capability-based authorization.
- Self-order payment support with guest methods (cashier, QRIS, transfer).
- Kitchen Display System (KDS) with real-time order management.

### Inventory Management
- Ingredient stock tracking with unit and min stock alerts.
- Recipe-based ingredient consumption on order creation.
- Stock adjustment logging with audit trail.
- Stock approval workflows and quick stock requests.
- Stock transfers between warehouses.
- Stock write-offs and automation rules.
- Ingredient categories and mapping.

### Purchase
- Supplier management with comprehensive profiles.
- Purchase Requisition (PR) workflow.
- Quotation Requests and Supplier Quotations.
- Purchase Order (PO) creation and tracking.
- Goods Received Notes (GRN) with stock updates.
- Supplier invoices and payment tracking.
- Complete audit trail for all procurement activities.

### HR & CRM
- Employee attendance with selfie verification.
- HR management and payroll data.
- Customer relationship management (CRM).
- Customer profiles and loyalty tracking.

### Finance & Reporting
- Invoice scanning with OCR support.
- Petty cash management and tracking.
- Comprehensive sales and operational reports.
- Discount analysis and reporting.
- Shift management and financial summaries.

### Security & Infrastructure
- JWT-based authentication with capability-based authorization.
- Webhook signature verification for payment gateways (Midtrans, Xendit).
- Rate limiting on sensitive endpoints (login, payments).
- HTTP security headers via Helmet.
- Configurable CORS policies for production.
- Audit logging for all critical operations.

### Offline-first
- IndexedDB cache via Dexie.js.
- Automatic sync to PostgreSQL when online.
- Sync queue for orders created offline.
- UUID primary keys for idempotent offline sync.

### Backend
- Local Express API bound to `0.0.0.0` for LAN access.
- JWT-based authentication with permission middleware.
- Prisma ORM with PostgreSQL migrations and seeding.
- 43 API route files organized by module.
- Capability-based access control via PERMISSIONS system.

## Tech Stack

- **Frontend:** Next.js 16.2.10 App Router, React 19.2.4, TypeScript 5, Tailwind CSS v4.
- **State:** Zustand, React Context.
- **UI Components:** @base-ui/react, lucide-react, recharts.
- **Drag & Drop:** @dnd-kit/core, @dnd-kit/sortable.
- **Offline Cache:** Dexie.js / IndexedDB.
- **Backend:** Express.js 5.2.1, Prisma 5.22.0, PostgreSQL.
- **Auth:** JWT (`jsonwebtoken`), `bcrypt`.
- **Validation:** Zod 4.4.3.
- **Build/Runtime:** Node.js 20+, npm, tsx 4.23.1.
- **Testing:** Vitest 4.1.10, Supertest 7.2.2, Playwright 1.62.1.

## Project Structure

```
kitchen-pos-new/
├── app/                    # Next.js App Router pages (44 routes)
│   ├── login/page.tsx
│   ├── apps/page.tsx       # App launcher
│   ├── pos/                # Point of Sale module
│   ├── kitchen/            # Kitchen Display System
│   ├── inventory/          # Inventory management (8 sub-routes)
│   ├── inventory-suppliers/ # Purchase module (Data Supplier)
│   ├── crm/                # Customer Relationship Management
│   ├── promotions/         # Promotions & vouchers
│   ├── attendance/         # Employee attendance
│   ├── hr/                 # HR & Payroll
│   ├── finance/            # Finance & OCR
│   ├── reports/            # Analytics & reports
│   ├── settings/           # System settings
│   └── layout.tsx
├── src/
│   ├── components/         # Shared UI components
│   │   ├── layout/         # Header, Sidebar, TopNavigation, UserProfileMenu, CompanyBrand, LiveClock
│   │   └── profile/        # User profile components
│   ├── features/pos/       # POS-specific components
│   ├── context/            # Auth context, Company context
│   ├── hooks/              # Data fetching and sync hooks
│   ├── lib/                # API client, IndexedDB schema, seed data
│   ├── store/              # Zustand stores
│   ├── config/             # Navigation registry, permissions
│   └── types/              # TypeScript interfaces
├── server/                 # Express + Prisma backend
│   ├── index.ts
│   ├── app.ts              # Express app configuration
│   ├── routes/             # 43 API route files
│   ├── middleware/         # Auth, permissions, rate limiting
│   ├── lib/                # Prisma client, utilities
│   └── __tests__/          # 47 test files (414 tests)
├── prisma/                 # Prisma schema and migrations
│   ├── schema.prisma
│   └── migrations/         # Database migrations
├── docs/                   # Documentation
│   ├── knowledge/          # Domain knowledge base
│   └── handover/           # Session handovers
├── README.md
├── HANDOVER.md
├── CLAUDE.md
├── AGENTS.md
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
   CORS_ORIGIN="http://localhost:3000"
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
   npm run db:permissions
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

The API is organized into modules with capability-based authorization. Key endpoints include:

### Authentication
|| Method | Path                     | Description                     |
|| ------ | ------------------------ | ------------------------------- |
|| POST   | `/auth/login`            | Login and receive JWT           |
|| POST   | `/auth/register`         | Register a new user (admin)   |
|| GET    | `/auth/me`               | Current user profile            |
|| GET    | `/auth/permissions`      | Current user permissions        |

### Health
|| Method | Path                     | Description                     |
|| ------ | ------------------------ | ------------------------------- |
|| GET    | `/health`                | API health check                |

### Core Modules
- **Products & Orders**: `/api/categories`, `/api/products`, `/api/orders`, `/api/modifiers`
- **Inventory**: `/api/ingredients`, `/api/recipes`, `/api/stock-requests`, `/api/stock-transfers`, `/api/stock-write-offs`, `/api/warehouses`
- **Purchase**: `/api/suppliers`, `/api/purchase-requisitions`, `/api/quotation-requests`, `/api/quotations`, `/api/purchase-orders`, `/api/goods-received-notes`, `/api/invoices`, `/api/supplier-payments`
- **Payments**: `/api/payments`, `/api/self-order/*`, `/api/webhooks/payment`
- **HR & CRM**: `/api/customers`, `/api/hr/employees`, `/api/attendance`
- **Finance**: `/api/petty-cash`, `/api/ocr`, `/api/reports`
- **Settings**: `/api/settings`, `/api/company`, `/api/users`, `/api/roles`, `/api/outlets`, `/api/tables`, `/api/vouchers`
- **Operations**: `/api/kitchen`, `/api/backup`, `/api/audit`, `/api/notifications`, `/api/split-bill`

**Note**: The API uses capability-based authorization via the PERMISSIONS system. Most endpoints require specific permissions and JWT authentication.

## Scripts

|| Script                | Description                               |
|| --------------------- | ----------------------------------------- |
|| `npm run dev`         | Start frontend and API concurrently       |
|| `npm run api:dev`     | Start API with hot reload (tsx)           |
|| `npm run api:start`   | Start API for production                  |
|| `npm run db:migrate`  | Run Prisma migrate dev                    |
|| `npm run db:seed`     | Seed the database                         |
|| `npm run db:permissions` | Seed permissions and roles            |
|| `npm run db:generate` | Generate Prisma client                    |
|| `npm run build`       | Build the Next.js frontend                |
|| `npm run lint`        | Run ESLint                                |
|| `npx tsc --noEmit`    | Type-check the project                    |
|| `npm test`            | Run test suite (414 tests)                |

## Testing Guide

The project includes a comprehensive test suite covering business logic, security, and integration tests.

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test server/__tests__/orders.restore.test.ts
```

### Test Coverage

The test suite consists of **47 test files** with **414 total tests** (409 passing, 5 failing). Tests cover:

- **Authentication & Authorization**: JWT token validation, capability-based access control, permission middleware
- **Inventory Management**: Stock consumption, restoration, adjustment logging, transfers, write-offs
- **Payment Security**: Amount validation, status updates, webhook verification, self-order payments
- **Supplier Management**: CRUD operations, purchase order flow, stock updates, quotations, invoices
- **Infrastructure**: Security headers, rate limiting, CORS configuration
- **HR & CRM**: Employee management, attendance tracking, customer relationships
- **Finance**: Petty cash, OCR invoice scanning, reporting
- **Settings**: Company configuration, user management, role-based access

## Roadmap

Detailed planning documents are in the `docs/knowledge/` folder:

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
4. Run `npm run db:permissions` to seed permissions and roles
5. Run `npm run dev` to start development servers

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
   
   # Seed permissions
   npm run db:permissions
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

8. **Capability-Based Authorization**:
   - All business routes require specific permissions
   - Permission checks are enforced at middleware level
   - Audit logging tracks permission denials

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m 'feat: add your feature'`.
4. Push and open a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, open an issue in the GitHub repository or contact the development team.
