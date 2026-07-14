# Staff Management, CRM, and Communication Integrations

This document covers the people side of the restaurant POS: staff roles, attendance, payroll, customers, and communication channels.

## 1. Staff Management

### Employee record
- Personal info: name, phone, email, address, emergency contact.
- Employment info: role, department, start date, salary basis, employment type.
- Documents: ID, tax forms, contracts.
- Status: active, inactive, terminated.

### Roles and permissions
Common restaurant roles:

| Role | Typical permissions |
| --- | --- |
| Admin/Owner | Full access: settings, users, reports, products, prices, voids |
| Manager | Products, inventory, purchase, reports, void approvals, shift review |
| Cashier | Take orders, process payments, view own shift, close shift |
| Waiter | Take dine-in orders, view assigned tables, fire courses |
| Kitchen staff | View KDS, mark items ready/completed, 86 items |
| Bartender | View bar KDS, prepare drinks |

### Permission system design
- Use resource + action pairs: `orders:create`, `orders:void`, `products:edit`, `reports:view`, `shifts:close:any`.
- Assign roles to users; each role has a list of permissions.
- Check permissions in Express middleware and in UI buttons.

## 2. Employee Attendance

### Clock in / clock out
- Employee records entry and exit times.
- Can be done from the POS tablet, a wall-mounted kiosk, or mobile.
- Location/IP or photo optional for verification.

### Shift scheduling
- Create weekly or monthly schedules.
- Assign employees to shifts (breakfast, lunch, dinner).
- Track planned vs actual hours.
- Handle shift swaps and leave requests.

### Overtime and leave
- Track overtime hours by day/week.
- Leave types: annual, sick, unpaid, public holiday.
- Leave requests require manager approval.

### Attendance model fields
- `employee_id`, `date`, `clock_in`, `clock_out`, `break_duration`, `status` (present, late, absent, on_leave).

## 3. Payroll Setup

### Payroll inputs
- Basic salary or hourly rate.
- Attendance data (days/hours worked).
- Overtime hours and rates.
- Leave deductions.
- Bonuses, commissions, tips.
- Advances and loans.
- Tax and statutory deductions.

### Payroll workflow
1. Select pay period (e.g., monthly or bi-weekly).
2. Import attendance data.
3. Add adjustments (bonus, advance, leave deduction).
4. Calculate gross pay, deductions, and net pay.
5. Generate payslip PDF.
6. Manager review and approval.
7. Mark payment as processed.

### Suggested additions to data model
```prisma
model Employee {
  id            String   @id @default(uuid())
  profile_id    String?
  employee_code String   @unique
  full_name     String
  phone         String?
  email         String?
  role          String
  department    String?
  hire_date     DateTime?
  salary_basis  String   // monthly, hourly
  base_salary   Float?
  hourly_rate   Float?
  status        String   @default("active")
  created_at    DateTime @default(now())
}

model Attendance {
  id            String   @id @default(uuid())
  employee_id   String
  date          DateTime
  clock_in      DateTime?
  clock_out     DateTime?
  break_minutes Int      @default(0)
  status        String   @default("present")
  notes         String?
}

model Payroll {
  id             String   @id @default(uuid())
  employee_id    String
  period_start   DateTime
  period_end     DateTime
  basic_pay      Float
  overtime_pay   Float    @default(0)
  bonus          Float    @default(0)
  deductions     Float    @default(0)
  net_pay        Float
  status         String   @default("draft")
  paid_at        DateTime?
}
```

## 4. Customer Management (CRM)

### Customer record
- Name, phone, email, birthday, address.
- Order history and total lifetime value.
- Preferences and dietary/allergen notes.
- Tags / segments (VIP, regular, new, corporate).

### Loyalty program
- Earn points per spend.
- Redeem points for discounts or free items.
- Tier-based rewards (bronze, silver, gold).

### Marketing use cases
- Send birthday discounts.
- Re-engage customers who have not ordered in 30 days.
- Target VIPs with exclusive offers.
- Track campaign redemption.

## 5. Email Notifications and Integration

### Use cases
- Daily sales summary to management.
- Shift close report to accountant.
- Purchase order confirmation to vendor.
- Payslip delivery to employees.
- Password reset and account creation.

### SMTP setup
- Use a transactional email provider (SendGrid, Mailgun, AWS SES, Brevo/Postmark) or a local SMTP server.
- Store SMTP credentials in environment variables.
- Use a server-side email queue to avoid blocking API responses.

### Implementation tips
- Use HTML email templates with plain-text fallbacks.
- Attach PDF reports or payslips where appropriate.
- Respect unsubscribe rules for marketing emails.

## 6. WhatsApp Integration

### Why WhatsApp?
- High open rates; customers expect order updates on WhatsApp.
- Useful for delivery/takeaway status notifications.
- Can be used for marketing broadcasts (with opt-in).

### WhatsApp Business API options
| Provider | Notes |
| --- | --- |
| Twilio WhatsApp API | Easy REST API, requires Twilio account and Meta approval. |
| 360dialog | Official WhatsApp Business Solution Provider. |
| Meta Cloud API | Direct integration; requires Facebook Business verification. |
| Go4Whatsup / InWizards Odoo apps | Pre-built Odoo connectors. |

### Common message templates
- Order confirmation: "Thanks {name}, your order #{order_id} is confirmed."
- Ready for pickup: "Your order is ready for pickup at {branch}."
- Out for delivery: "Your order is on the way. Rider: {rider_name}."
- Delivery completed: "Your order has been delivered. Enjoy!"
- Reservation reminder: "Reminder: your table for {guests} is reserved at {time}."
- Payment receipt: "Payment received: {amount}. Thank you!"

### Implementation approach
1. Create a backend service that sends messages via the chosen provider.
2. Define message templates and submit them for provider approval.
3. Trigger messages from order status changes or reservation events.
4. Log every message sent for compliance and debugging.
5. Allow customers to opt out of marketing messages.

### Data model additions
```prisma
model Customer {
  id            String   @id @default(uuid())
  name          String
  phone         String?
  email         String?
  birthday      DateTime?
  address       String?
  loyalty_points Int     @default(0)
  tags          String[]
  created_at    DateTime @default(now())
}

model CommunicationLog {
  id          String   @id @default(uuid())
  channel     String   // email, whatsapp, sms
  type        String   // order_update, marketing, receipt
  recipient   String
  status      String   // sent, delivered, failed
  content     String?
  error       String?
  created_at  DateTime @default(now())
}
```

## 7. Privacy and Compliance

- Store customer contact data only with consent.
- Allow customers to request data deletion.
- Encrypt email credentials and WhatsApp API tokens.
- Keep message logs for audit purposes.
