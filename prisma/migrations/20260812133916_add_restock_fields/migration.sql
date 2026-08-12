-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "auto_restock_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "restock_quantity" DOUBLE PRECISION NOT NULL DEFAULT 0;
