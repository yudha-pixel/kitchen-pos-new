-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "category_id" UUID;

-- CreateTable
CREATE TABLE "ingredient_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredient_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ingredients_category_id_idx" ON "ingredients"("category_id");

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ingredient_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
