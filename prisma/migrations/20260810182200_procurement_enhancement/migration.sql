/*
  Warnings:

  - You are about to drop the column `created_at` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `ingredient_id` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `received_date` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `approved_at` on the `stock_requests` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `stock_requests` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by_name` on the `stock_requests` table. All the data in the column will be lost.
  - You are about to drop the column `supplier_name` on the `stock_requests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[po_number]` on the table `purchase_orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `po_number` to the `purchase_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `purchase_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `purchase_orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_ingredient_id_fkey";

-- DropIndex
DROP INDEX "purchase_orders_ingredient_id_idx";

-- DropIndex
DROP INDEX "purchase_orders_order_date_idx";

-- DropIndex
DROP INDEX "stock_requests_ingredient_id_idx";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "entity_id" TEXT,
ADD COLUMN     "entity_type" TEXT;

-- AlterTable
ALTER TABLE "purchase_orders" DROP COLUMN "created_at",
DROP COLUMN "ingredient_id",
DROP COLUMN "quantity",
DROP COLUMN "received_date",
DROP COLUMN "total_price",
DROP COLUMN "unit_price",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "acknowledged_at" TIMESTAMP(3),
ADD COLUMN     "expected_delivery" TIMESTAMP(3),
ADD COLUMN     "payment_terms" TEXT,
ADD COLUMN     "po_number" TEXT NOT NULL,
ADD COLUMN     "quotation_id" UUID,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_by" UUID,
ADD COLUMN     "sent_at" TIMESTAMP(3),
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'draft';

-- AlterTable
ALTER TABLE "stock_requests" DROP COLUMN "approved_at",
DROP COLUMN "approved_by",
DROP COLUMN "approved_by_name",
DROP COLUMN "supplier_name",
ADD COLUMN     "approval_level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "finance_approved_at" TIMESTAMP(3),
ADD COLUMN     "finance_id" UUID,
ADD COLUMN     "finance_name" TEXT,
ADD COLUMN     "finance_notes" TEXT,
ADD COLUMN     "manager_approved_at" TIMESTAMP(3),
ADD COLUMN     "manager_id" UUID,
ADD COLUMN     "manager_name" TEXT,
ADD COLUMN     "manager_notes" TEXT,
ADD COLUMN     "rejection_level" INTEGER,
ADD COLUMN     "supervisor_approved_at" TIMESTAMP(3),
ADD COLUMN     "supervisor_id" UUID,
ADD COLUMN     "supervisor_name" TEXT,
ADD COLUMN     "supervisor_notes" TEXT,
ADD COLUMN     "supplier_id" UUID,
ALTER COLUMN "status" SET DEFAULT 'pending_supervisor';

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "payment_terms" TEXT DEFAULT 'net 30',
ADD COLUMN     "tax_id" TEXT;

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "ingredient_name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_requests" (
    "id" UUID NOT NULL,
    "stock_request_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "quotation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" UUID NOT NULL,
    "quotation_request_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "quoted_price" DOUBLE PRECISION NOT NULL,
    "quoted_unit" TEXT NOT NULL,
    "delivery_date" TIMESTAMP(3),
    "payment_terms" TEXT,
    "valid_until" TIMESTAMP(3),
    "notes" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selected_at" TIMESTAMP(3),
    "selected_by" UUID,
    "selected_by_name" TEXT,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_received_notes" (
    "id" UUID NOT NULL,
    "grn_number" TEXT NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "received_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_by" UUID NOT NULL,
    "received_by_name" TEXT NOT NULL,
    "delivery_note" TEXT,
    "quality_checked_by" UUID,
    "quality_checked_at" TIMESTAMP(3),
    "quality_notes" TEXT,

    CONSTRAINT "goods_received_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grn_items" (
    "id" UUID NOT NULL,
    "grn_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "ingredient_name" TEXT NOT NULL,
    "ordered_qty" DOUBLE PRECISION NOT NULL,
    "received_qty" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "quality_status" TEXT NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "batch_number" TEXT,
    "expiry_date" TIMESTAMP(3),
    "stock_updated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "grn_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "grn_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "payment_terms" TEXT,
    "notes" TEXT,
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT NOT NULL,
    "reference_number" TEXT,
    "notes" TEXT,
    "processed_by" UUID,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_workflows" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "role_id" UUID NOT NULL,
    "role_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "approval_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "purchase_order_items_purchase_order_id_idx" ON "purchase_order_items"("purchase_order_id");

-- CreateIndex
CREATE INDEX "purchase_order_items_ingredient_id_idx" ON "purchase_order_items"("ingredient_id");

-- CreateIndex
CREATE INDEX "quotation_requests_status_idx" ON "quotation_requests"("status");

-- CreateIndex
CREATE INDEX "quotation_requests_stock_request_id_idx" ON "quotation_requests"("stock_request_id");

-- CreateIndex
CREATE INDEX "quotations_status_idx" ON "quotations"("status");

-- CreateIndex
CREATE INDEX "quotations_quotation_request_id_idx" ON "quotations"("quotation_request_id");

-- CreateIndex
CREATE INDEX "quotations_supplier_id_idx" ON "quotations"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "goods_received_notes_grn_number_key" ON "goods_received_notes"("grn_number");

-- CreateIndex
CREATE INDEX "goods_received_notes_status_idx" ON "goods_received_notes"("status");

-- CreateIndex
CREATE INDEX "goods_received_notes_grn_number_idx" ON "goods_received_notes"("grn_number");

-- CreateIndex
CREATE INDEX "goods_received_notes_purchase_order_id_idx" ON "goods_received_notes"("purchase_order_id");

-- CreateIndex
CREATE INDEX "grn_items_grn_id_idx" ON "grn_items"("grn_id");

-- CreateIndex
CREATE INDEX "grn_items_ingredient_id_idx" ON "grn_items"("ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_invoice_number_idx" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_supplier_id_idx" ON "invoices"("supplier_id");

-- CreateIndex
CREATE INDEX "invoices_due_date_idx" ON "invoices"("due_date");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "payments_supplier_id_idx" ON "payments"("supplier_id");

-- CreateIndex
CREATE INDEX "payments_payment_date_idx" ON "payments"("payment_date");

-- CreateIndex
CREATE INDEX "approval_workflows_level_idx" ON "approval_workflows"("level");

-- CreateIndex
CREATE INDEX "approval_workflows_role_id_idx" ON "approval_workflows"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_number_key" ON "purchase_orders"("po_number");

-- CreateIndex
CREATE INDEX "purchase_orders_po_number_idx" ON "purchase_orders"("po_number");

-- CreateIndex
CREATE INDEX "stock_requests_approval_level_idx" ON "stock_requests"("approval_level");

-- CreateIndex
CREATE INDEX "stock_requests_requested_by_idx" ON "stock_requests"("requested_by");

-- CreateIndex
CREATE INDEX "suppliers_is_active_idx" ON "suppliers"("is_active");

-- AddForeignKey
ALTER TABLE "stock_requests" ADD CONSTRAINT "stock_requests_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_requests" ADD CONSTRAINT "quotation_requests_stock_request_id_fkey" FOREIGN KEY ("stock_request_id") REFERENCES "stock_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_quotation_request_id_fkey" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_received_notes" ADD CONSTRAINT "goods_received_notes_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_received_notes" ADD CONSTRAINT "goods_received_notes_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grn_items" ADD CONSTRAINT "grn_items_grn_id_fkey" FOREIGN KEY ("grn_id") REFERENCES "goods_received_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grn_items" ADD CONSTRAINT "grn_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_grn_id_fkey" FOREIGN KEY ("grn_id") REFERENCES "goods_received_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
