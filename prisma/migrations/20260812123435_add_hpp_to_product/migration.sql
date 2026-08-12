-- AlterTable
ALTER TABLE "products" ADD COLUMN     "hpp" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
