-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "category" TEXT,
ADD COLUMN     "pic_mobile" TEXT,
ADD COLUMN     "pic_name" TEXT;

-- CreateIndex
CREATE INDEX "suppliers_category_idx" ON "suppliers"("category");
