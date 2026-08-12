-- AlterTable
ALTER TABLE "purchase_requisition_items" ADD COLUMN     "supplier_id" UUID;

-- CreateIndex
CREATE INDEX "purchase_requisition_items_supplier_id_idx" ON "purchase_requisition_items"("supplier_id");
