/*
  Warnings:

  - You are about to drop the `sync_queue` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "sync_queue";
