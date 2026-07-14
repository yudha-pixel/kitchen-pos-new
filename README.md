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

| Method | Path                     | Description                     |
| ------ | ------------------------ | ------------------------------- |
| POST   | `/auth/login`            | Login and receive JWT           |
| POST   | `/auth/register`         | Register a new user (admin)   |
| GET    | `/auth/me`               | Current user profile            |
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

## Roadmap

Detailed planning documents are in the `knowledge/` folder:

- `01-current-tech-stack.md` — Deep dive into the current stack.
- `02-pos-domain-and-kitchen-workflows.md` — Dine-in, takeaway, delivery, KDS, printers.
- `03-inventory-procurement-and-ocr.md` — Inventory, purchase orders, vendor bills, OCR.
- `04-reporting-financials-shifts.md` — Reports, P&L, open/close shifts.
- `05-staff-crm-communications.md` — Staff, payroll, CRM, email, WhatsApp.
- `06-security-backup-testing-training.md` — Security, backups, tests, training.
- `07-odoo-alternative-and-roadmap.md` — Odoo comparison and phased roadmap.

## Testing

A test suite is not implemented yet. Planned coverage includes:

- Unit tests for pricing and business logic.
- Integration tests for the Express API.
- End-to-end tests with Playwright.
- Offline/online sync tests.

## Deployment

For local or self-hosted deployment:

1. Set production environment variables.
2. Run `npm run build` to build the frontend.
3. Run `npm run api:start` to start the API.
4. Place both behind a reverse proxy or use the LAN IP.

For LAN multi-device access, set `NEXT_PUBLIC_API_URL` to the API host's IP before building.

## Security Notes

- Change `JWT_SECRET` to a strong random value in production.
- Do not commit `.env` or `.env.local`.
- Keep PostgreSQL behind the firewall; do not expose port 5432 to the internet.
- Use HTTPS when exposing the API outside the LAN.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m 'feat: add your feature'`.
4. Push and open a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, open an issue in the GitHub repository or contact the development team.
