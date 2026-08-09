/*
  Warnings:

  - Made the column `full_name` on table `profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "void_reason" TEXT,
ADD COLUMN     "voided_at" TIMESTAMP(3),
ADD COLUMN     "voided_by" UUID;

-- AlterTable
-- First set default value for existing NULL values in full_name
UPDATE "profiles" SET "full_name" = COALESCE("full_name", username) WHERE "full_name" IS NULL;
-- Then make the column NOT NULL
ALTER TABLE "profiles" ALTER COLUMN "full_name" SET NOT NULL;

-- CreateIndex
CREATE INDEX "payment_transactions_voided_by_idx" ON "payment_transactions"("voided_by");

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_voided_by_fkey" FOREIGN KEY ("voided_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
