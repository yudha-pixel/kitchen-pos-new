# Restaurant POS Domain and Kitchen Workflows

This document describes the restaurant business domain the Kitchen POS must support, from the dining room to the kitchen pass.

## 1. Order Channels

A restaurant POS must handle three primary order channels, each with distinct data and workflow needs.

### Dine-in
- A customer is seated at a table.
- The waiter records the table number, guest count, and optionally the guest name.
- Orders are sent to the kitchen, usually after the whole table has ordered.
- Payment happens at the end of the meal, but some venues take a deposit first.
- Table state must be tracked: `available`, `occupied`, `reserved`, `dirty`, `merged`.

### Takeaway / Pickup
- No table is involved.
- A customer name, phone number, and pickup time are usually captured.
- Orders should be prioritized by promised pickup time.
- Receipts are printed at the counter; kitchen tickets are printed immediately.

### Delivery
- Requires a delivery address, customer contact, and delivery partner assignment.
- Orders may come from internal channels or aggregators (Grab, FoodPanda, Go-Jek, etc.).
- Statuses: `pending`, `preparing`, `ready`, `out_for_delivery`, `delivered`.

## 2. Table Management

Table management is the backbone of dine-in service.

### Floor plan model
- A `Floor` has many `Table`s.
- Each table has: `id`, `name/number`, `capacity`, `shape`, `coordinates`, `status`, `current_order_id`.
- Status flow: `available -> occupied -> billed -> dirty -> available`.

### Operations
- **Seat**: mark a table as occupied and attach a guest count.
- **Transfer**: move an open order from one table to another.
- **Merge**: combine two occupied tables into one bill (already implemented in this project).
- **Split**: separate a bill into multiple payments or groups (already implemented).
- **Reservation**: hold a table for a future time slot.

### Waiter workflow
1. Select order type (`Dine-in`).
2. Choose a table from the floor plan or list.
3. Add items and modifiers.
4. Send to kitchen or hold until fired.
5. Add more courses during the meal.
6. Process payment and close the table.

## 3. Kitchen Order Tickets (KOT) and Kitchen Display Systems (KDS)

### KOT printing
- A KOT is a simplified ticket printed in the kitchen, showing only items, modifiers, quantity, table/order number, and special instructions.
- KOTs can be printed automatically when an order is confirmed, or on demand (fire).
- Per-station routing means hot station sees grill items, cold station sees salads, bar station sees drinks.
- Content should be large, high-contrast, and cut automatically after printing.

### Kitchen Display System (KDS)
- A KDS is a tablet or TV screen in the kitchen that shows live tickets.
- Each ticket shows order number, order type, table, elapsed time, and items.
- Item statuses: `pending`, `fired`, `in_progress`, `completed`, `voided`, `served`.
- Color-coded urgency timers (green, amber, red) help chefs prioritize.
- Tickets can be bumped, recalled, or reprinted.

### Hold / fire courses
- Some dishes are held until the server fires them (e.g., steaks after starters).
- The POS must support `hold_until_fired` items.
- When fired, the item moves from `held` to `fired` and prints/KDS updates.

## 4. Multi-Printer Configuration

Restaurants often use several printers:

| Printer | Purpose | Typical location | Paper width |
| --- | --- | --- | --- |
| Receipt printer | Customer receipt, bill, settlement | Counter | 58/80 mm thermal |
| Kitchen printer 1 | Hot station | Kitchen hot line | 80 mm thermal |
| Kitchen printer 2 | Cold station | Kitchen cold line | 80 mm thermal |
| Bar printer | Beverages | Bar | 58/80 mm thermal |
| Label printer | Packaging labels | Takeaway station | 40x30 mm labels |

### Routing rules
- Products and modifiers map to a `default_prep_station`.
- Each station maps to a printer by IP address, USB device, or Bluetooth name.
- A single order can produce multiple KOTs per station.
- Receipts always route to the configured receipt printer.

### ESC/POS notes
- Thermal receipt/kitchen printers typically understand ESC/POS commands.
- In a web app, printing can be done via:
  - Browser `window.print()` with a styled receipt HTML for receipts.
  - WebUSB/WebSerial to a directly connected printer (Chrome only).
  - A local helper service/bridge that receives HTTP requests and forwards ESC/POS bytes to the printer.
  - For network printers, sending raw ESC/POS to a printer's IP:9100 port.

## 5. Order Status and Lifecycle

A robust order lifecycle keeps front-of-house, kitchen, and customers aligned.

```
Pending -> Sent/KOT printed -> In Progress -> Completed -> Served -> Paid/Closed
```

- `pending`: order created but not yet sent to kitchen.
- `sent`: order/KOT sent to kitchen.
- `in_progress`: kitchen acknowledges preparation.
- `ready`: kitchen marks item ready.
- `served`: runner serves the item.
- `paid`: payment processed.
- `closed`: order archived.

## 6. Modifiers and Special Requests

- Modifiers are add-ons or substitutions attached to a product (e.g., extra cheese, no onion, large size).
- Modifiers can be free or have an extra price.
- Special requests are free-text notes on an item or order (e.g., "less spicy").
- Allergen flags should be visible on KOT/KDS.

## 7. Void and Refund Flows

- **Item void**: remove an item from a sent order, require a reason.
- **Order void**: cancel an entire order, require manager authorization.
- **Refund**: return money to customer; requires payment reversal record.
- Each void/refund should write an `OrderVoidLog` for audit and reporting.

## 8. Order Types in Data Model

Suggested fields for each order:

- `order_type`: `dine_in`, `takeaway`, `delivery`.
- `table_id`, `table_number` (dine-in).
- `customer_name`, `customer_phone` (takeaway/delivery).
- `delivery_address`, `delivery_partner`, `estimated_delivery_time` (delivery).
- `guest_count` (dine-in).
- `status` and `payment_status`.

## 9. Key Integration Points

- POS -> KDS/KOT: send order events.
- POS -> Inventory: deduct stock on order completion.
- POS -> Payments: record cash/card/QRIS transactions.
- POS -> Reporting: feed every order event into reports.
- POS -> WhatsApp/Email: send order status to customers.
