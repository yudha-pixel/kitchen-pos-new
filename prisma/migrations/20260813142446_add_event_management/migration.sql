/*
  Warnings:

  - A unique constraint covering the columns `[order_number]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "petty_cash_ingredient_id_idx";

-- DropIndex
DROP INDEX "petty_cash_shift_id_idx";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "event_id" UUID,
ADD COLUMN     "order_number" TEXT;

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "event_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "description" TEXT,
    "total_budget" DOUBLE PRECISION,
    "actual_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actual_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),
    "closed_by" UUID,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_stocks" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "quantity_allocated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity_used" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity_returned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity_damaged" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_operational_costs" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "receipt_url" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_operational_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_stock_transfers" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "transfer_number" TEXT NOT NULL,
    "from_warehouse_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requested_by" UUID NOT NULL,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_stock_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_stock_transfer_items" (
    "id" UUID NOT NULL,
    "transfer_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_stock_transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_event_code_key" ON "events"("event_code");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_start_date_idx" ON "events"("start_date");

-- CreateIndex
CREATE INDEX "events_event_code_idx" ON "events"("event_code");

-- CreateIndex
CREATE INDEX "event_stocks_event_id_idx" ON "event_stocks"("event_id");

-- CreateIndex
CREATE INDEX "event_stocks_ingredient_id_idx" ON "event_stocks"("ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_stocks_event_id_ingredient_id_key" ON "event_stocks"("event_id", "ingredient_id");

-- CreateIndex
CREATE INDEX "event_operational_costs_event_id_idx" ON "event_operational_costs"("event_id");

-- CreateIndex
CREATE INDEX "event_operational_costs_category_idx" ON "event_operational_costs"("category");

-- CreateIndex
CREATE UNIQUE INDEX "event_stock_transfers_transfer_number_key" ON "event_stock_transfers"("transfer_number");

-- CreateIndex
CREATE INDEX "event_stock_transfers_event_id_idx" ON "event_stock_transfers"("event_id");

-- CreateIndex
CREATE INDEX "event_stock_transfers_status_idx" ON "event_stock_transfers"("status");

-- CreateIndex
CREATE INDEX "event_stock_transfers_transfer_number_idx" ON "event_stock_transfers"("transfer_number");

-- CreateIndex
CREATE INDEX "event_stock_transfer_items_transfer_id_idx" ON "event_stock_transfer_items"("transfer_id");

-- CreateIndex
CREATE INDEX "event_stock_transfer_items_ingredient_id_idx" ON "event_stock_transfer_items"("ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_event_id_idx" ON "orders"("event_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_stocks" ADD CONSTRAINT "event_stocks_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_stocks" ADD CONSTRAINT "event_stocks_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_operational_costs" ADD CONSTRAINT "event_operational_costs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_stock_transfers" ADD CONSTRAINT "event_stock_transfers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_stock_transfer_items" ADD CONSTRAINT "event_stock_transfer_items_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "event_stock_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_stock_transfer_items" ADD CONSTRAINT "event_stock_transfer_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
