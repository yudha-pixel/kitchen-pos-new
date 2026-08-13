-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "sku" TEXT;

-- CreateIndex
CREATE INDEX "ingredients_sku_idx" ON "ingredients"("sku");

-- CreateIndex
CREATE INDEX "ingredients_barcode_idx" ON "ingredients"("barcode");
