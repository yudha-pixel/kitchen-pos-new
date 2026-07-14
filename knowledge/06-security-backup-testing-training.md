# Security, Backup, Testing, Training, and Support

This document covers the non-functional requirements needed before the project can be considered production-ready.

## 1. Roles and Permissions

### Principle of least privilege
- Every user gets the minimum permissions needed for their role.
- Sensitive actions such as voids, refunds, price changes, and payroll require elevated roles.

### Permission model
- Resources: `orders`, `products`, `categories`, `modifiers`, `inventory`, `purchase`, `reports`, `shifts`, `staff`, `settings`.
- Actions: `create`, `read`, `update`, `delete`, `void`, `approve`, `export`, `close`.
- Map roles to a matrix of allowed actions.

### Backend enforcement
- Use middleware to check JWT and role claims.
- Do not rely on UI hiding buttons alone; every sensitive endpoint must verify permission server-side.

### Frontend enforcement
- Hide or disable buttons the user cannot use.
- Show permission errors if backend returns 403.

## 2. Security Checklist

### Application security
- Use strong, random `JWT_SECRET` and rotate it periodically.
- Hash passwords with `bcrypt` (already implemented).
- Validate all input with Zod or a similar schema validator.
- Sanitize user input before rendering to prevent XSS.
- Set Content Security Policy (CSP) headers.
- Use `helmet` middleware on Express for security headers.
- Enable CORS only for trusted origins in production.

### API security
- Rate-limit login endpoints to prevent brute force.
- Use HTTPS in production (self-signed cert acceptable for LAN, LetsEncrypt for public).
- Log authentication failures and suspicious activity.
- Never return stack traces or database details in production error responses.
- Use parameterized queries via Prisma to prevent SQL injection.

### Network security
- Bind the API to `0.0.0.0` only when needed for LAN access.
- Use firewall rules to restrict access to PostgreSQL port 5432.
- Keep the database server behind the LAN; do not expose it to the internet.

### Secret management
- Store secrets in `.env` files, never in source code.
- Add `.env` and `.env.local` to `.gitignore`.
- Use a secrets manager (Doppler, Vault, AWS Secrets Manager) when scaling beyond a single deployment.

## 3. Backup Strategy

### Database backups
- Use `pg_dump` nightly to create compressed SQL dumps.
- Store backups offsite (cloud storage, NAS, external drive).
- Keep a rolling window: daily for 7 days, weekly for 4 weeks, monthly for 12 months.
- Test restore procedures quarterly.

### Write-ahead logging (WAL)
- Enable PostgreSQL WAL archiving for point-in-time recovery.
- This allows restoring to any moment before a failure.

### IndexedDB / offline data
- Provide an export function in the admin panel to download local IndexedDB data as JSON.
- Useful for disaster recovery on devices with unsynced transactions.

### File and image storage
- If product images are stored locally, back up the storage directory.
- If using cloud storage, follow the provider's backup recommendations.

### Backup automation
- Windows Task Scheduler or a cron job on a Linux server.
- Example PostgreSQL backup script:
  ```bash
  pg_dump -h localhost -U postgres -d kitchen_pos -Fc > kitchen_pos_$(date +%Y%m%d_%H%M%S).dump
  ```

## 4. Testing Strategy

### Unit tests
- Test pure functions: pricing, discounts, tax, rounding, food cost calculations.
- Tools: Vitest or Jest.
- Run on every commit in CI.

### Integration tests
- Test API endpoints with an in-memory database or a disposable Docker PostgreSQL container.
- Test auth middleware, order creation, sync queue, inventory deduction.
- Tools: Supertest + Prisma test client.

### End-to-end tests
- Simulate a cashier logging in, taking an order, paying, and closing a shift.
- Tools: Playwright.
- Run against the full stack in a staging environment.

### Offline tests
- Simulate network loss in Playwright.
- Verify orders are queued in IndexedDB and sync when connectivity returns.

### Printer tests
- Print test receipts and KOTs to each configured printer.
- Verify paper width, cut commands, and Chinese/local character encoding.

### Load tests
- Simulate many concurrent orders to verify PostgreSQL and Express performance.
- Tools: k6, Artillery.

### Security tests
- Dependency vulnerability scanning (`npm audit`, Snyk, Dependabot).
- Basic penetration testing or static analysis (Semgrep, SonarQube).

## 5. Staff Training Plan

### Phase 1: Owner/Manager training
- System overview and admin settings.
- Product, category, and modifier setup.
- Inventory, purchase, and vendor management.
- Reports and dashboards.
- User roles and permissions.

### Phase 2: Cashier training
- Login and shift open/close.
- Taking dine-in, takeaway, and delivery orders.
- Applying discounts, modifiers, and notes.
- Splitting and merging bills.
- Processing payments and printing receipts.
- Handling voids and refunds.

### Phase 3: Waiter training
- Table selection and order entry.
- Fire/hold courses.
- Adding special requests.
- Communicating with kitchen via KDS.

### Phase 4: Kitchen training
- Reading KOTs and KDS screens.
- Marking items in progress, ready, and completed.
- 86 items and stock-out communication.

### Training materials
- Video walkthroughs.
- Printed quick-reference cards.
- Sandbox environment for practice.

## 6. Post-Implementation Support

### Support tiers
- **Tier 1**: User questions, password resets, order mistakes.
- **Tier 2**: Bug fixes, data corrections, report issues.
- **Tier 3**: Architecture changes, integrations, scaling.

### Support channels
- In-app help or chat widget.
- Email/ticket system.
- WhatsApp support group for urgent issues.

### Maintenance cadence
- Weekly: review logs, backup status, low-stock alerts.
- Monthly: security updates, dependency updates.
- Quarterly: restore tests, performance review, roadmap planning.

### Documentation
- Maintain README and HANDOVER documents.
- Keep a runbook for common issues (printer offline, sync stuck, login fails).
- Document environment setup for new developers.
