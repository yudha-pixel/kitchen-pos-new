-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'available';

-- CreateIndex
CREATE INDEX "tables_status_idx" ON "tables"("status");
