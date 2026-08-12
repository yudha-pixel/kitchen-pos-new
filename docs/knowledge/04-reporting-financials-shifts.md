# Reporting, Financials, and Shift Management

This document defines the reports, financial metrics, and cashier shift workflows needed for a complete restaurant POS.

## 1. Reporting Requirements

A restaurant needs both operational and financial reports. The following categories cover the main needs.

### Sales reports
- Sales summary by date range, order type, payment method.
- Sales by category and product.
- Sales by table, floor, waiter, cashier.
- Sales trend: hourly, daily, weekly, monthly.
- Discounts and refunds summary.

### Inventory reports
- Current stock levels and valuation.
- Stock movement report (purchases, sales, waste, adjustments).
- Low-stock and out-of-stock items.
- Food cost percentage by product and category.
- Theoretical vs actual usage variance.

### Purchase reports
- Purchase orders by status (draft, sent, received, billed).
- Vendor purchase history and total spend.
- Bills due and payment aging.
- Price trend for key ingredients.

### Expense reports
- Daily expenses by category.
- General expenses summary.
- Cash flow summary (sales in - purchases/expenses out).

### Financial reports
- Profit and Loss (P&L) statement.
- Tax summary (VAT/GST collected and paid).
- Revenue reconciliation.
- Cash register balance.

### Staff reports
- Sales per waiter/cashier.
- Shift hours and attendance.
- Payroll summary.
- Tip distribution (if applicable).

### Customer reports
- Customer order history and frequency.
- Average spend per visit.
- Loyalty points balance.

## 2. Key Financial Metrics

### Food cost percentage
```
Food Cost % = (Ingredient Cost / Menu Price) * 100
```
A healthy restaurant typically targets 25-35% food cost.

### Contribution margin
```
Contribution Margin = Menu Price - Ingredient Cost
```
Shows how much each dish contributes toward fixed costs.

### Prime cost
```
Prime Cost = Food Cost + Labor Cost
```
Prime cost should generally stay below 55-65% of revenue.

### Labor cost percentage
```
Labor Cost % = (Total Labor Cost / Total Revenue) * 100
```

### Net profit margin
```
Net Profit Margin = (Net Profit / Total Revenue) * 100
```

### Average ticket size
```
Average Ticket = Total Revenue / Number of Orders
```

### Table turnover
```
Table Turnover = Number of Parties Served / Number of Tables / Time Period
```
Higher turnover means more revenue per seat.

## 3. Open/Close Shift Management

A cashier shift is the financial control unit of a POS day.

### Shift lifecycle
1. **Open shift**: cashier counts the starting cash float, records it, and signs in.
2. **During shift**: all sales and refunds are recorded.
3. **Close shift**: cashier counts the cash drawer, compares actual cash to expected cash, notes variance.
4. **Manager review**: approve or investigate variances.
5. **Handover**: next cashier starts a new float.

### Open shift data
- Cashier ID and name.
- Opening timestamp.
- Starting cash float by denomination.
- POS device/tablet identifier.

### Expected cash calculation
```
Expected Cash = Opening Float + Cash Sales - Cash Refunds - Paid Outs
```

### Close shift data
- Closing timestamp.
- Actual cash counted by denomination.
- Expected cash.
- Variance = Actual - Expected.
- Non-cash payments total (card, QRIS, debit).
- Total sales, refunds, discounts, voids.
- Note/justification for variance.

### Paid-outs / cash out
- Staff may take cash from the drawer for small expenses.
- Each paid-out must be recorded with category, amount, and reason.

## 4. Payment Reconciliation

- Reconcile card/QRIS payments with provider statements.
- Reconcile cash against the shift close report.
- Flag mismatches for manager review.

## 5. Dashboard KPIs

A management dashboard should show at a glance:

- Today’s sales vs yesterday / last week.
- Active tables and open orders.
- Best-selling products.
- Low-stock alerts.
- Open/close shift status per cashier.
- Staff attendance summary.
- Pending purchase orders and bills.
- Top customers and loyalty points issued.

## 6. Suggested Data Model Additions

```prisma
model Shift {
  id              String   @id @default(uuid())
  cashier_id      String
  opened_at       DateTime @default(now())
  closed_at       DateTime?
  opening_float   Float
  expected_cash   Float    @default(0)
  actual_cash     Float?
  variance        Float?
  total_sales     Float    @default(0)
  total_refunds   Float    @default(0)
  total_paid_out  Float    @default(0)
  notes           String?
  status          String   @default("open") // open, closed
}

model PaidOut {
  id         String   @id @default(uuid())
  shift_id   String
  amount     Float
  category   String
  reason     String
  created_at DateTime @default(now())
}

model ReportCache {
  id         String   @id @default(uuid())
  report_type String
  date_range String
  data       Json
  generated_at DateTime @default(now())
}
```

## 7. Implementation Notes

- Reports can be computed with Prisma aggregations, raw SQL, or materialized views for heavy summaries.
- Caching report results improves dashboard load time.
- Scheduled email reports can be sent daily/weekly using a cron job or a serverless function.
- Financial reports should respect the business's fiscal year and tax calendar.
