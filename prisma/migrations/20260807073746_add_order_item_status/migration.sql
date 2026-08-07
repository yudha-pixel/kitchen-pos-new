-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "order_items_status_idx" ON "order_items"("status");
