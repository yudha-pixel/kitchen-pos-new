# Inventory, Procurement, and OCR for Vendor Bills

This document explains how inventory tracking, purchasing, and bill scanning fit into a complete restaurant POS.

## 1. Inventory Management for Restaurants

### Core inventory entities
- **Ingredient / Stock Item**: raw materials such as rice, oil, chicken, napkins.
- **Product**: sellable menu item composed of ingredients via a recipe / Bill of Materials (BOM).
- **Recipe / BOM**: defines how many units of each ingredient are consumed to make one product.
- **Unit of Measure (UoM)**: each ingredient may use kg, liter, piece, gram, ml, pack.
- **Stock Movement**: records every increase (purchase, adjustment) or decrease (sale, waste, transfer).
- **Warehouse / Location**: dry store, chiller, freezer, bar, etc.

### Inventory workflow
1. Create ingredients and define units and par levels.
2. Build recipes for each product (e.g., 1 Burger = 150g beef patty + 1 bun + 30g lettuce).
3. When an order is paid, the system deducts the recipe quantities from stock.
4. Low-stock alerts trigger when an item falls below its reorder point.
5. Purchase orders are raised to replenish stock.
6. Physical stock counts are compared against theoretical stock and adjusted.

### Stock movement types
- `purchase`: stock received from supplier.
- `sale`: stock consumed by order.
- `waste`: spoiled or expired stock.
- `adjustment`: stock count correction.
- `transfer`: movement between locations.
- `return`: stock returned to supplier.

### Food cost control
- Theoretical usage = recipe quantity x quantity sold.
- Actual usage = beginning stock + purchases - ending stock - waste.
- Variance = actual usage - theoretical usage.
- Food cost percentage = ingredient cost / menu price.

## 2. Purchase Management

### Purchase entities
- **Vendor / Supplier**: name, contact, address, payment terms, tax ID.
- **Purchase Order (PO)**: a request sent to a vendor for goods.
- **Purchase Bill / Invoice**: the vendor's document received after delivery.
- **Goods Receipt**: record that items arrived and in what quantity.
- **Payment**: record payment to the vendor.

### Purchase workflow
1. Low-stock alert or manual request creates a PO draft.
2. Manager reviews and approves the PO.
3. PO is sent to the supplier (email, WhatsApp, print).
4. Supplier delivers goods.
5. Staff create a goods receipt matching the PO.
6. Vendor bill arrives and is matched to the receipt.
7. Bill is approved and posted to accounts payable.
8. Payment is scheduled and recorded.

### Three-way matching
- Compare PO quantity/price, goods receipt, and vendor bill.
- Only approve payment when all three match within tolerance.

## 3. OCR for Vendor Bill Scanning

OCR (Optical Character Recognition) turns a scanned or photographed vendor bill into structured data, removing manual data entry.

### Common OCR providers and approaches

| Service | Best for | Integration style |
| --- | --- | --- |
| Amazon Textract AnalyzeExpense | Invoices, receipts, line items | AWS SDK or REST API |
| Azure Document Intelligence | Prebuilt invoice/receipt model | REST API, JS SDK |
| Google Document AI | Invoices, receipts, custom parsers | REST API, client libraries |
| Tesseract.js | Free on-device OCR for simple text | Browser or Node.js |
| ReceiptConverter / Mindee | Specialized receipt/bill APIs | REST API |

### Fields to extract from a vendor bill
- Vendor name, address, tax ID, phone.
- Bill number, bill date, due date.
- PO number (if referenced).
- Line items: product/ingredient name, quantity, unit, unit price, total price.
- Subtotal, tax, discount, shipping, total amount.
- Payment terms.

### OCR workflow
1. User uploads a photo or PDF of the bill from the POS/admin app.
2. Backend forwards the image to the OCR service or runs local OCR.
3. OCR returns raw text and structured fields.
4. Backend maps extracted fields to purchase bill fields.
5. User reviews and corrects the draft bill.
6. Backend matches line items to existing ingredients or creates new ones.
7. Goods receipt is linked and stock is updated.
8. The bill is posted to accounts payable.

### Implementation options
- **Cloud OCR**: higher accuracy, supports messy layouts, requires internet and API cost.
- **Local OCR (Tesseract)**: works offline, lower accuracy on complex invoices, good for simple thermal receipts.
- **Hybrid**: use cloud when online, fall back to manual entry when offline.

## 4. Expense Management

### Daily expenses
- Petty cash outflows: taxi fares, minor repairs, cleaning supplies.
- Each expense has category, amount, date, staff member, notes, and optionally a receipt image.
- Daily closing report summarizes sales, expenses, and expected cash.

### General expenses
- Larger operational expenses: rent, utilities, salaries, marketing.
- Can be scheduled (recurring) or one-time.
- Should support vendor selection, tax treatment, and payment status.

## 5. Suggested Data Model Additions

```prisma
model Ingredient {
  id            String   @id @default(uuid())
  name          String
  unit          String
  stock_quantity Float   @default(0)
  reorder_point Float   @default(0)
  cost_per_unit Float   @default(0)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
}

model Recipe {
  id         String   @id @default(uuid())
  product_id String
  product    Product  @relation(fields: [product_id], references: [id])
  ingredient_id String
  ingredient Ingredient @relation(fields: [ingredient_id], references: [id])
  quantity   Float
}

model StockMovement {
  id            String   @id @default(uuid())
  ingredient_id String
  type          String   // purchase, sale, waste, adjustment
  quantity      Float
  notes         String?
  created_at    DateTime @default(now())
}

model Vendor {
  id           String   @id @default(uuid())
  name         String
  contact_name String?
  phone        String?
  email        String?
  address      String?
  tax_id       String?
  created_at   DateTime @default(now())
}

model PurchaseOrder {
  id          String   @id @default(uuid())
  vendor_id   String
  status      String   // draft, sent, received, billed
  total       Float
  created_at  DateTime @default(now())
  items       PurchaseOrderItem[]
}

model PurchaseOrderItem {
  id            String @id @default(uuid())
  purchase_order_id String
  ingredient_id String
  quantity      Float
  unit_price    Float
}

model VendorBill {
  id              String @id @default(uuid())
  vendor_id       String
  bill_number     String
  bill_date       DateTime
  total           Float
  items           VendorBillItem[]
  created_at      DateTime @default(now())
}

model VendorBillItem {
  id            String @id @default(uuid())
  vendor_bill_id String
  ingredient_id String?
  description   String
  quantity      Float
  unit_price    Float
  total         Float
}

model Expense {
  id          String   @id @default(uuid())
  category    String
  amount      Float
  date        DateTime @default(now())
  notes       String?
  receipt_url String?
  created_by  String?
}
```

## 6. Offline Considerations

- Stock deductions should happen when an order is paid/sent to kitchen (configurable).
- If offline, stock changes can be queued in the same `sync_queue` mechanism used for orders.
- Purchase orders and bills are usually created in the back office while online, so offline support is less critical here.
