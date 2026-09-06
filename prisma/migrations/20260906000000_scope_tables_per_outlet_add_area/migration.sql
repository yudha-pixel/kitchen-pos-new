-- DropIndex
DROP INDEX "tables_table_number_key";

-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "area" TEXT;

-- CreateIndex
CREATE INDEX "tables_area_idx" ON "tables"("area");

-- CreateIndex
CREATE UNIQUE INDEX "tables_outlet_id_table_number_key" ON "tables"("outlet_id", "table_number");

