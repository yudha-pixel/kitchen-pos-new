/*
  Warnings:

  - You are about to drop the column `product_id` on the `modifiers` table. All the data in the column will be lost.
  - Added the required column `modifier_group_id` to the `modifiers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "modifiers" DROP CONSTRAINT "modifiers_product_id_fkey";

-- DropIndex
DROP INDEX "modifiers_product_id_idx";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "color" TEXT;

-- AlterTable
ALTER TABLE "modifiers" DROP COLUMN "product_id",
ADD COLUMN     "modifier_group_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "modifier_groups" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "max_selections" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modifier_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_modifier_groups" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "modifier_group_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_modifier_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_modifier_groups_product_id_idx" ON "product_modifier_groups"("product_id");

-- CreateIndex
CREATE INDEX "product_modifier_groups_modifier_group_id_idx" ON "product_modifier_groups"("modifier_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_modifier_groups_product_id_modifier_group_id_key" ON "product_modifier_groups"("product_id", "modifier_group_id");

-- CreateIndex
CREATE INDEX "modifiers_modifier_group_id_idx" ON "modifiers"("modifier_group_id");

-- AddForeignKey
ALTER TABLE "product_modifier_groups" ADD CONSTRAINT "product_modifier_groups_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_modifier_groups" ADD CONSTRAINT "product_modifier_groups_modifier_group_id_fkey" FOREIGN KEY ("modifier_group_id") REFERENCES "modifier_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifiers" ADD CONSTRAINT "modifiers_modifier_group_id_fkey" FOREIGN KEY ("modifier_group_id") REFERENCES "modifier_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
